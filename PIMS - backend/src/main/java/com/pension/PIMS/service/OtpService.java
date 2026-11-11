package com.pension.PIMS.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
public class OtpService {
    private final PasswordEncoder passEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    public OtpService(PasswordEncoder passEncoder) {
        this.passEncoder = passEncoder;
    }

    public String genarateOtp() {
        int otp = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(otp);
    }

    public String generateOtp() {
        return genarateOtp();
    }

    public String hashOtp(String otp) {
        return passEncoder.encode(otp);
    }

    public boolean matches(String otp, String otpHash) {
        if (otp == null || otpHash == null) {
            return false;
        }
        return passEncoder.matches(otp, otpHash);
    }
}
