package com.pension.PIMS.dtos.auth;

public record VerifyOtpRequest(
        String username,
        String otp
) {
}
