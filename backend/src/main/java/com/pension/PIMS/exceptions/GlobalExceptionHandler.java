package com.pension.PIMS.exceptions;

import java.time.Instant;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {
	private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
	
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String,Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
		Map<String, String> errors = new HashMap<>();
		for (FieldError error : ex.getBindingResult().getFieldErrors()) {
			errors.put(error.getField(), error.getDefaultMessage());
		}
		Map<String, Object> body = errorBody(HttpStatus.BAD_REQUEST, "Request validation failed");
		body.put("validationErrors", errors);
		return ResponseEntity.badRequest().body(body);
	}
	
	@ExceptionHandler(SecurityException.class)
	public ResponseEntity<Map<String,Object>> handleSecurityException(SecurityException ex) {
		return errorResponse(HttpStatus.UNAUTHORIZED, ex.getMessage());
	}
	
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String,Object>> handleConflict(IllegalArgumentException ex) {
		String message = ex.getMessage() == null ? "The request contains invalid data" : ex.getMessage();
		String normalizedMessage = message.toLowerCase();
		if (normalizedMessage.contains("not found")) {
			return errorResponse(HttpStatus.NOT_FOUND, message);
		}
		if (normalizedMessage.contains("already") || normalizedMessage.contains("duplicate")) {
			return errorResponse(HttpStatus.CONFLICT, message);
		}
		return errorResponse(HttpStatus.BAD_REQUEST, message);
	}

	@ExceptionHandler({EntityNotFoundException.class, NoResourceFoundException.class})
	public ResponseEntity<Map<String,Object>> handleNotFound(Exception ex) {
		return errorResponse(HttpStatus.NOT_FOUND, ex.getMessage());
	}

	@ExceptionHandler({HttpMessageNotReadableException.class, MissingServletRequestParameterException.class})
	public ResponseEntity<Map<String,Object>> handleBadRequest(Exception ex) {
		return errorResponse(HttpStatus.BAD_REQUEST, "The request is missing or contains invalid data");
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<Map<String,Object>> handleDataConflict(DataIntegrityViolationException ex) {
		return errorResponse(HttpStatus.CONFLICT, "The request conflicts with existing data");
	}

	@ExceptionHandler(RuntimeException.class)
	public ResponseEntity<Map<String,Object>> handleRuntimeException(RuntimeException ex) {
		if (ex.getCause() != null) {
			return handleUnexpectedException(ex);
		}
		String message = ex.getMessage() == null ? "The request could not be completed" : ex.getMessage();
		String normalizedMessage = message.toLowerCase();
		if (normalizedMessage.contains("not found")) {
			return errorResponse(HttpStatus.NOT_FOUND, message);
		}
		if (normalizedMessage.contains("already") || normalizedMessage.contains("duplicate")) {
			return errorResponse(HttpStatus.CONFLICT, message);
		}
		return errorResponse(HttpStatus.BAD_REQUEST, message);
	}

	@ExceptionHandler(ResponseStatusException.class)
	public ResponseEntity<Map<String,Object>> handleResponseStatus(ResponseStatusException ex) {
		HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
		return errorResponse(status, ex.getReason() == null ? status.getReasonPhrase() : ex.getReason());
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<Map<String,Object>> handleAccessDenied(AccessDeniedException ex) {
		return errorResponse(HttpStatus.FORBIDDEN, "You do not have permission to perform this action");
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<Map<String,Object>> handleUnexpectedException(Exception ex) {
		logger.error("Unhandled API exception", ex);
		return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected server error occurred");
	}

	private ResponseEntity<Map<String,Object>> errorResponse(HttpStatus status, String message) {
		return ResponseEntity.status(status).body(errorBody(status, message));
	}

	private Map<String, Object> errorBody(HttpStatus status, String message) {
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("timestamp", Instant.now().toString());
		body.put("status", status.value());
		body.put("error", status.getReasonPhrase());
		body.put("message", message == null || message.isBlank() ? status.getReasonPhrase() : message);
		return body;
	}
}
