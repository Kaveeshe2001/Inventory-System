package com.pension.PIMS.model;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.*;

@Entity
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String username;

	@Column(nullable = false)
	private String phone;

	@Column(nullable = false)
	private String password;

	private String fullName;

	@Column(unique = true)
	private String email;

	private String department;

	private Long pensionPointId;

	@Column(nullable = false)
	private int failedAttempts = 0;

	@Column(nullable = false)
	private boolean active = true;

	@Column(nullable = false)
	private LocalDateTime createdAt;

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(
			name = "user_roles",
			joinColumns = @JoinColumn(name = "user_id")
	)
	@Column(name = "role")
	private Set<String> roles = new HashSet<>();

	public User() {
		this.createdAt = LocalDateTime.now();
	}

	public User(Long id, String username, String phone, String password, String fullName, String email, String department, Long pensionPointId, int failedAttempts, boolean active, LocalDateTime createdAt, Set<String> roles) {
		this.id = id;
		this.username = username;
		this.phone = phone;
		this.password = password;
		this.fullName = fullName;
		this.email = email;
		this.department = department;
		this.pensionPointId = pensionPointId;
		this.failedAttempts = failedAttempts;
		this.active = active;
		this.createdAt = createdAt;
		this.roles = roles;
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

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
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

	public int getFailedAttempts() {
		return failedAttempts;
	}

	public void setFailedAttempts(int failedAttempts) {
		this.failedAttempts = failedAttempts;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public Set<String> getRoles() {
		return roles;
	}

	public void setRoles(Set<String> roles) {
		this.roles = roles;
	}
}
