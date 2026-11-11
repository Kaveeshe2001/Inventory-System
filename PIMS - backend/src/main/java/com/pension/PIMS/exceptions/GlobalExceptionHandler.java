package com.pension.PIMS.exceptions;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
	
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String,Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
		Map<String, String> errors = new HashMap<>();
		for (FieldError error : ex.getBindingResult().getFieldErrors()) {
			errors.put(error.getField(), error.getDefaultMessage());
		}
		
	    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
	    		"timestamp", Instant.now().toString(),
	    		"status", 400,
	    		"error", "Bad Request",
	    		"validationErrors", errors
	    ));
	}
	
	@ExceptionHandler(SecurityException.class)
	public ResponseEntity<Map<String,Object>> handleSecurityException(SecurityException ex) {
		
	    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
	    		"timestamp", Instant.now().toString(),
	    		"status", 401,
	    		"error", "Unauthorized",
	    		"message", ex.getMessage()
	    ));
	}
	
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String,Object>> handleConflict(IllegalArgumentException ex) {
		
	    return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
	    		"timestamp", Instant.now().toString(),
	    		"status", 409,
	    		"error", "Conflict",
	    		"message", ex.getMessage()
	    ));
	}
}
