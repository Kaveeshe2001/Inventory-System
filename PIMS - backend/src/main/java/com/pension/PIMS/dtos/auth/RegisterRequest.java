package com.pension.PIMS.dtos.auth;

import java.util.Set;

public record RegisterRequest (
		String username,
		String fullName,
		String email,
		String phone,
		String password,
		String department,
		Long pensionPointId,
		Set<String> roles
){
}