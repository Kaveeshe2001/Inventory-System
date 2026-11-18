package com.pension.PIMS.mapper;

import com.pension.PIMS.dtos.auth.RegisterRequest;
import com.pension.PIMS.dtos.auth.UserResponse;
import com.pension.PIMS.model.User;

public class UserMapper {

	public UserResponse toResponse(User user) {

		String frontendRole = mapRole(user);

		String status = user.isActive()
				? "ACTIVE"
				: "INACTIVE";

		return new UserResponse(
				user.getId(),
				user.getUsername(),
				user.getFullName(),
				user.getEmail(),
				user.getPhone(),
				user.getDepartment(),
				user.getPensionPointId(),
				frontendRole,
				status,
				user.getCreatedAt()
		);
	}

	private String mapRole(User user) {

		if (user.getRoles() == null || user.getRoles().isEmpty()) {
			return "STAFF";
		}

		if (user.getRoles().contains("ADMIN")) {
			return "IT_OFFICER";
		}

		if (user.getRoles().contains("HO_OFFICER")
				|| user.getRoles().contains("HO_ACCOUNTANT")) {

			return "STORE_KEEPER";
		}

		if (user.getRoles().contains("PENSION_POINT_OFFICER")) {
			return "DS_OFFICER";
		}

		if (user.getRoles().contains("INVENTORY_MANAGER")) {
			return "INVENTORY_MANAGER";
		}

		return "STAFF";
	}
}
