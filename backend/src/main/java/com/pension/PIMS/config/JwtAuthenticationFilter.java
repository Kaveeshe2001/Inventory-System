package com.pension.PIMS.config;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.pension.PIMS.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
	private final JwtService jwtService;
	
	public JwtAuthenticationFilter(JwtService jwtService) {
		this.jwtService = jwtService;
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		String path = request.getServletPath();
		return path != null && (path.startsWith("/auth/") || path.equals("/auth"));
	}
	
	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		
		String authHeader = request.getHeader("Authorization");
		
		if (authHeader == null || !authHeader.startsWith("Bearer ")) {
			filterChain.doFilter(request, response);
			return;
		}
		
		String token = authHeader.substring(7).trim();
		
		try {
			if (jwtService.validateToken(token)) {
				String username = jwtService.extractUsername(token);
				
				if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
					List<String> roles = jwtService.extractRoles(token);
					
					List<SimpleGrantedAuthority> authorities = new ArrayList<>();
					if (roles != null) {
						for (String role : roles) {
							if (role != null && !role.isBlank()) {
								String cleanRole = role.trim();
								authorities.add(new SimpleGrantedAuthority(cleanRole));
								if (!cleanRole.startsWith("ROLE_")) {
									authorities.add(new SimpleGrantedAuthority("ROLE_" + cleanRole));
								}
							}
						}
					}
					
					UsernamePasswordAuthenticationToken authToken = 
							new UsernamePasswordAuthenticationToken(username, null, authorities);
					authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
					
					SecurityContextHolder.getContext().setAuthentication(authToken);
				}
			}
		} catch (Exception e) {
			logger.error("Could not authenticate user with token", e);
		}
		
		filterChain.doFilter(request, response);
	}
}
