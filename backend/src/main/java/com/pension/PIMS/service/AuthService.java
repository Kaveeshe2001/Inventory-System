package com.pension.PIMS.service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import com.pension.PIMS.data.DaoManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.pension.PIMS.dtos.auth.AuthRequest;
import com.pension.PIMS.dtos.auth.AuthResponse;
import com.pension.PIMS.dtos.auth.RegisterRequest;
import com.pension.PIMS.dtos.auth.UserResponse;
import com.pension.PIMS.dtos.auth.UserSecurityDetails;
import com.pension.PIMS.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AuthService {
	
	private static final int MAX_FAILED_ATTEMPTS = 5;
	private static final long LOCK_TIME_DURATION_MS = 15 * 60 * 1000L; // 15 minutes
	private static final String DUMMY_HASH = "$2a$12$e8h1P3kIek5nEbm7g/e.m2oA7x9J5wE4N7n9iM7yB2V.hT0F6nK";

	private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

	private final DaoManager daoManager;
	private final PasswordEncoder passEncoder;
	private final JwtService jwtService;
	private final OtpService otpService;

	public AuthService(DaoManager daoManager, PasswordEncoder passEncoder, JwtService jwtService, OtpService otpService) {
		this.daoManager = daoManager;
		this.passEncoder = passEncoder;
		this.jwtService = jwtService;
		this.otpService = otpService;
	}

	public UserResponse register(RegisterRequest request) {
		if (request.username() == null || request.username().isBlank()) {
			throw new IllegalArgumentException("Username is required");
		}
		if (request.password() == null || request.password().isBlank()) {
			throw new IllegalArgumentException("Password is required");
		}
		if (daoManager.getUserDao().existsByUsername(request.username().trim())) {
			throw new IllegalArgumentException("Username already exists");
		}

		try {
			User user = new User();
			user.setUsername(request.username().trim());

			// Sanitize phone for VARCHAR(10)
			String rawPhone = request.phone() != null ? request.phone().replaceAll("[^0-9]", "") : "";
			if (rawPhone.length() > 10) {
				rawPhone = rawPhone.substring(rawPhone.length() - 10);
			} else if (rawPhone.isEmpty()) {
				rawPhone = "0700000000";
			}
			user.setPhone(rawPhone);
			user.setPensionPointId(request.pensionPointId());
			
			// Encrypt password before saving
			user.setPassword(passEncoder.encode(request.password()));

			// Normalize roles
			Set<String> assignedRoles;
			if (request.roles() == null || request.roles().isEmpty()) {
				assignedRoles = Set.of("HO_OFFICER");
			} else {
				assignedRoles = request.roles().stream()
						.map(r -> {
							String upper = r.toUpperCase().replace("ROLE_", "");
							if ("IT_OFFICER".equals(upper)) return "ADMIN";
							if ("DS_OFFICER".equals(upper) || "STAFF".equals(upper)) return "PENSION_POINT_OFFICER";
							if ("STORE_KEEPER".equals(upper)) return "HO_OFFICER";
							return upper;
						})
						.collect(Collectors.toSet());
			}
			user.setRoles(assignedRoles);
			Long userId = daoManager.getUserDao().save(user);
			UserResponse response = new UserResponse();
			response.setId(userId);
			response.setUsername(user.getUsername());
			response.setFullName(request.fullName());
			response.setEmail(request.email());
			response.setPhone(user.getPhone());
			response.setDepartment(request.department());
			response.setPensionPointId(user.getPensionPointId());
			response.setRoles(String.join(",", assignedRoles));
			response.setStatus("ACTIVE");
			response.setCreatedAt(LocalDateTime.now());
			return response;

		} catch (IllegalArgumentException e) {
			throw e;
		} catch (Exception e) {
			logger.error("Error while registering user", e);
			throw new RuntimeException("User registration failed: " + e.getMessage(), e);
		}
	}

	public String login(AuthRequest request) {
		if (request.username() == null || request.username().isBlank() ||
			request.password() == null || request.password().isBlank()) {
			throw new SecurityException("Invalid credentials");
		}

		Optional<UserSecurityDetails> secDetailsOpt =
				daoManager.getUserDao().getSecurityDetails(request.username().trim());

		if (secDetailsOpt.isEmpty()) {
			// Prevent username enumeration timing attack
			passEncoder.matches("dummyInputPassword", DUMMY_HASH);
			throw new SecurityException("Invalid credentials");
		}

		UserSecurityDetails secDetails = secDetailsOpt.get();

		if (!secDetails.isActive()) {
			throw new SecurityException("Account has been suspended");
		}

		if (isAccountLocked(secDetails)) {
			throw new SecurityException(
					"Account is locked due to consecutive failed attempts. Try again in 15 minutes"
			);
		}

		if (!passEncoder.matches(request.password(), secDetails.passwordHash())) {
			handleFailedAttempts(request.username().trim(), secDetails.failedAttempts());
			throw new SecurityException("Invalid credentials");
		}

		String otp = otpService.generateOtp();
		String otpHash = otpService.hashOtp(otp);

		Timestamp expiry = new Timestamp(System.currentTimeMillis() + 5 * 60 * 1000L);

		daoManager.getUserDao().saveOtp(request.username().trim(), otpHash, expiry);

		logger.info("2FA OTP for {}: {}", request.username(), otp);
		System.out.println("OTP: " + otp);

		return "OTP sent successfully";
	}
	
	private boolean isAccountLocked(UserSecurityDetails details) {
		if (details.lockTime() == null) {
			return false;
		}
		long lockTimeMs = details.lockTime().getTime();
		return (lockTimeMs + LOCK_TIME_DURATION_MS) > System.currentTimeMillis();	
	}
	
	public boolean validateToken(String token) {
		return jwtService.validateToken(token);
	}
	
	public UserResponse getUserById(Long id) {
		User user = daoManager.getUserDao().findById(id)
				.orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + id));
		
		UserResponse response = new UserResponse();
		response.setId(user.getId());
		response.setUsername(user.getUsername());
		response.setPhone(user.getPhone());
		response.setPensionPointId(user.getPensionPointId());
		response.setRoles(user.getRoles() != null ? String.join(",", user.getRoles()) : "");
		response.setStatus(user.isActive() ? "ACTIVE" : "INACTIVE");
		response.setFullName(user.getUsername());
		
		return response;
	}

	public List<UserResponse> getAllUsers() {
		return daoManager.getUserDao().findAll().stream().map(user -> {
			UserResponse response = new UserResponse();
			response.setId(user.getId());
			response.setUsername(user.getUsername());
			response.setPhone(user.getPhone());
			response.setPensionPointId(user.getPensionPointId());
			response.setRoles(user.getRoles() != null ? String.join(",", user.getRoles()) : "");
			response.setStatus(user.isActive() ? "ACTIVE" : "INACTIVE");
			response.setFullName(user.getUsername());
			return response;
		}).toList();
	}
	
	private void handleFailedAttempts(String username, int currentAttempts) {
		int newAttempts = currentAttempts + 1;
		
		if (newAttempts >= MAX_FAILED_ATTEMPTS) {
			daoManager.getUserDao().lockUser(username);
		} else {
			daoManager.getUserDao().updateFailedAttempts(username, newAttempts);
		}
	}

	public AuthResponse verifyOtp(String username, String otp) {
		if (username == null || username.isBlank() || otp == null || otp.isBlank()) {
			throw new SecurityException("Username and OTP are required");
		}

		String trimmedUser = username.trim();
		String trimmedOtp = otp.trim();

		Optional<String> otpHash = daoManager.getUserDao().getOtpHash(trimmedUser);

		if (otpHash.isEmpty() || otpHash.get() == null) {
			throw new SecurityException("No OTP requested or OTP has expired");
		}

		Optional<Timestamp> expiry = daoManager.getUserDao().getOtpExpiry(trimmedUser);

		if (expiry.isEmpty() || expiry.get() == null) {
			throw new SecurityException("No OTP requested or OTP has expired");
		}

		if (expiry.get().before(new Timestamp(System.currentTimeMillis()))) {
			daoManager.getUserDao().clearOtp(trimmedUser);
			throw new SecurityException("OTP has expired. Please log in again.");
		}

		// Security Check: Verify that user entered the correct OTP
		if (!otpService.matches(trimmedOtp, otpHash.get())) {
			throw new SecurityException("Invalid OTP");
		}

		// OTP is valid: clear OTP state and reset failed login attempts
		daoManager.getUserDao().clearOtp(trimmedUser);
		daoManager.getUserDao().resetFailedAttempts(trimmedUser);

		User user = daoManager.getUserDao().findByUsername(trimmedUser)
				.orElseThrow(() -> new SecurityException("User not found"));

		String token = jwtService.generateToken(
				user.getUsername(),
				user.getRoles(),
				user.getPensionPointId()
		);
		logger.info("Authentication successful for user: {}", trimmedUser);

		return new AuthResponse(
				token,
				user.getId(),
				user.getUsername(),
				user.getPhone(),
				user.getPensionPointId(),
				user.getRoles()
		);
	}
}
