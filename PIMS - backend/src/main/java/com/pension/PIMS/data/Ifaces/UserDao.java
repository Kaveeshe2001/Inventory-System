package com.pension.PIMS.data.Ifaces;

import com.pension.PIMS.dtos.auth.UserSecurityDetails;
import com.pension.PIMS.model.User;

import java.sql.Timestamp;
import java.util.Optional;

public interface UserDao {
    boolean existsByUsername(String username);

    Long save(User user);

    Optional<UserSecurityDetails> getSecurityDetails(String username);

    void updateFailedAttempts(String username, int attempts);

    void lockUser(String username);

    void resetFailedAttempts(String username);

    Optional<User> findByUsername(String username);

    Optional<User> findById(Long id);

    void saveOtp(String otp, String otpHash, Timestamp expiry);

    Optional<String> getOtpHash(String username);

    Optional<Timestamp> getOtpExpiry(String username);

    void clearOtp(String username);

    interface CategoryDao {
    }
}
