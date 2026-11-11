package com.pension.PIMS.dtos.auth;

import java.util.Set;

public record AuthResponse(
        String token,
        Long id,
        String username,
        String phone,
        Long pensionPointId,
        Set<String> roles
) {
}
