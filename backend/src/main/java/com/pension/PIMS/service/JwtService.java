package com.pension.PIMS.service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

	@Value("${jwt.secret:GywU/piUMRHV1WbfT0JbBZjdrtHNYZ5WnomKwquKqEg=}")
	private String secret;
	
	@Value("${jwt.expiration-ms:86400000}")
	private long expirationMs;
	
	public String generateToken(String username, Set<String> roles, Long pensionPointId) {
		Map<String, Object> claims = new HashMap<>();
		claims.put("roles", roles);
		claims.put("pensionPointId", pensionPointId);
		return createToken(claims, username);
	}
	
	private String createToken(Map<String, Object> claims, String subject) {
		return Jwts.builder()
				.setClaims(claims)
				.setSubject(subject)
				.setIssuedAt(new Date(System.currentTimeMillis()))
				.setExpiration(new Date(System.currentTimeMillis() + expirationMs))
				.signWith(getSignKey(), SignatureAlgorithm.HS256)
				.compact();
	}
	
	public boolean validateToken(String token) {
		try {
			if (token == null || token.isBlank()) {
				return false;
			}
			Claims claims = Jwts.parserBuilder()
					.setSigningKey(getSignKey())
					.build()
					.parseClaimsJws(token)
					.getBody();
			return claims.getExpiration() == null || !claims.getExpiration().before(new Date());
		} catch (Exception e) {
			return false;
		}
	}
	
	public String extractUsername(String token) {
		return extractClaim(token, Claims::getSubject);
	}

	@SuppressWarnings("unchecked")
	public List<String> extractRoles(String token) {
		return extractClaim(token, claims -> {
			Object rolesObj = claims.get("roles");
			if (rolesObj instanceof List<?> list) {
				return (List<String>) list.stream().map(Object::toString).toList();
			}
			return List.of();
		});
	}
	
	public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
		final Claims claims = Jwts.parserBuilder()
				.setSigningKey(getSignKey())
				.build()
				.parseClaimsJws(token)
				.getBody();
		return claimsResolver.apply(claims);
	}
	
	private Key getSignKey() {
		String cleanSecret = secret != null ? secret.trim() : "";
		byte[] keyBytes;
		try {
			keyBytes = Decoders.BASE64.decode(cleanSecret);
		} catch (Exception e) {
			if (cleanSecret.endsWith("=s")) {
				cleanSecret = cleanSecret.substring(0, cleanSecret.length() - 1);
			}
			try {
				keyBytes = Decoders.BASE64.decode(cleanSecret);
			} catch (Exception ex) {
				keyBytes = cleanSecret.getBytes(StandardCharsets.UTF_8);
			}
		}
		return Keys.hmacShaKeyFor(keyBytes);
	}
}
