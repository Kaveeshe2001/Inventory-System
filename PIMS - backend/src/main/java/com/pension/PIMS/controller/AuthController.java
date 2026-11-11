package com.pension.PIMS.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.pension.PIMS.dtos.auth.AuthRequest;
import com.pension.PIMS.dtos.auth.AuthResponse;
import com.pension.PIMS.dtos.auth.RegisterRequest;
import com.pension.PIMS.dtos.auth.UserResponse;
import com.pension.PIMS.dtos.auth.VerifyOtpRequest;
import com.pension.PIMS.service.AuthService;

@RestController
@RequestMapping(value = "/auth")
@CrossOrigin(maxAge = 3600)
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		super();
		this.authService = authService;
	}

	@PostMapping("/register")
	public ResponseEntity<Map<String, String>> register(@RequestBody RegisterRequest request) {
		String result = authService.register(request);
		return ResponseEntity.ok(Map.of("message", result, "status", "success"));
	}
	
	@PostMapping("/login")
	public ResponseEntity<Map<String, String>> login(@RequestBody AuthRequest request) {
		String message = authService.login(request);
		return ResponseEntity.ok(Map.of("message", message));
	}

	@PostMapping("/verify-otp")
	public ResponseEntity<AuthResponse> verifyOtp (@RequestBody VerifyOtpRequest request) {
		AuthResponse response = authService.verifyOtp(request.username(), request.otp());
		return ResponseEntity.ok(response);
	}

	@GetMapping("/validate")
	public ResponseEntity<Map<String, Object>> validateToken(@RequestParam("token") String token) {
		boolean isValid = authService.validateToken(token);
		if (!isValid) {
			return ResponseEntity.status(401).body(Map.of("valid", false, "message", "Token is invalid or expired"));
		}
		return ResponseEntity.ok(Map.of("valid", true, "message", "Token is valid"));
	}
	
	@GetMapping("/user/{id}")
	public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
		return ResponseEntity.ok(authService.getUserById(id));
	}
}
