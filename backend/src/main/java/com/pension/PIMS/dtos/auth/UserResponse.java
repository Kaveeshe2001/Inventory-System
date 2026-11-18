package com.pension.PIMS.dtos.auth;

import java.time.LocalDateTime;
import java.util.Set;

public class UserResponse {
	private Long id;
	private String username;
	private String fullName;
	private String email;
	private String phone;
	private String department;
	private Long pensionPointId;
	private String roles;
	private String status;
	private LocalDateTime createdAt;

	public UserResponse() {
	}

	public UserResponse(Long id, String username, String fullName, String email, String phone, String department, Long pensionPointId, String roles, String status, LocalDateTime createdAt) {
		this.id = id;
		this.username = username;
		this.fullName = fullName;
		this.email = email;
		this.phone = phone;
		this.department = department;
		this.pensionPointId = pensionPointId;
		this.roles = roles;
		this.status = status;
		this.createdAt = createdAt;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getDepartment() {
		return department;
	}

	public void setDepartment(String department) {
		this.department = department;
	}

	public Long getPensionPointId() {
		return pensionPointId;
	}

	public void setPensionPointId(Long pensionPointId) {
		this.pensionPointId = pensionPointId;
	}

	public String getRoles() {
		return roles;
	}

	public void setRoles(String roles) {
		this.roles = roles;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}
