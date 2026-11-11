package com.pension.PIMS.dtos.auth;

import java.sql.Timestamp;

public record UserSecurityDetails (
		Long id,
		String passwordHash,
		int failedAttempts,
		Timestamp lockTime,
		boolean isActive
) {
}