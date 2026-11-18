package com.pension.PIMS.data.dao;

import com.pension.PIMS.data.BaseDao;
import com.pension.PIMS.data.Ifaces.UserDao;
import com.pension.PIMS.dtos.auth.UserSecurityDetails;
import com.pension.PIMS.model.User;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.sql.Types;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Component
public class UserDaoImpl extends BaseDao implements UserDao {

    public UserDaoImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public boolean existsByUsername(String username) {

        String sql = "SELECT COUNT(*) FROM users WHERE username = ?";

        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, username);
        return count != null && count > 0;
    }

    @Override
    public Long save(User user) {
        String sql = "INSERT INTO users (username, phone, password, pension_point_id) VALUES (?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        String rawPhone = user.getPhone() != null ? user.getPhone().replaceAll("[^0-9]", "") : "";
        if (rawPhone.length() > 10) {
            rawPhone = rawPhone.substring(rawPhone.length() - 10);
        } else if (rawPhone.isEmpty()) {
            rawPhone = "0700000000";
        }
        final String sanitizedPhone = rawPhone;

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, user.getUsername());
            ps.setString(2, sanitizedPhone);
            ps.setString(3, user.getPassword());

            if (user.getPensionPointId() != null) {
                ps.setLong(4, user.getPensionPointId());
            } else {
                ps.setNull(4, Types.BIGINT);
            }

            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key == null) {
            throw new IllegalStateException("Failed to obtain generated ID for user insert");
        }
        Long userId = key.longValue();

        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            for (String roleName : user.getRoles()) {
                String roleSql = "SELECT id FROM roles WHERE UPPER(name) = UPPER(?)";
                var roleIds = jdbcTemplate.query(roleSql, (rs, rowNum) -> rs.getLong("id"), roleName);
                Long roleId;
                if (!roleIds.isEmpty()) {
                    roleId = roleIds.get(0);
                } else {
                    var fallbackIds = jdbcTemplate.query("SELECT id FROM roles WHERE name = 'HO_OFFICER'", (rs, rowNum) -> rs.getLong("id"));
                    roleId = fallbackIds.isEmpty() ? null : fallbackIds.get(0);
                }
                if (roleId != null) {
                    jdbcTemplate.update("INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)", userId, roleId);
                }
            }
        }
        return userId;
    }

    @Override
    public Optional<UserSecurityDetails> getSecurityDetails(String username) {
        String sql = "SELECT id, password, failed_attempts, lock_time, is_active FROM users WHERE username = ?";

        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, (rs, rowNum) -> new UserSecurityDetails(
                    rs.getLong("id"),
                    rs.getString("password"),
                    rs.getInt("failed_attempts"),
                    rs.getTimestamp("lock_time"),
                    rs.getBoolean("is_active")
            ), username));
        } catch (EmptyResultDataAccessException e){
            return Optional.empty();
        }
    }

    @Override
    public void updateFailedAttempts(String username, int attempts) {
        String sql = "UPDATE users SET failed_attempts = ? WHERE username = ?";
        jdbcTemplate.update(sql, attempts, username);
    }

    @Override
    public void lockUser(String username) {
        String sql = "UPDATE users SET lock_time = CURRENT_TIMESTAMP, failed_attempts = 5 WHERE username = ?";
        jdbcTemplate.update(sql, username);
    }

    @Override
    public void resetFailedAttempts(String username) {
        String sql = "UPDATE users SET failed_attempts = 0, lock_time = NULL WHERE username = ?";
        jdbcTemplate.update(sql, username);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        String userSql = "SELECT id, phone, username, password, pension_point_id, failed_attempts, is_active FROM users WHERE username = ?";

        try {
            User user = jdbcTemplate.queryForObject(userSql, (rs, rowNum) -> {
                User u = new User();
                u.setId(rs.getLong("id"));
                u.setUsername(rs.getString("username"));
                u.setPhone(rs.getString("phone"));
                u.setPassword(rs.getString("password"));
                if (rs.getObject("pension_point_id") != null) {
                    u.setPensionPointId(
                            rs.getLong("pension_point_id")
                    );
                }
                u.setFailedAttempts(rs.getInt("failed_attempts"));
                u.setActive(rs.getBoolean("is_active"));
                return u;
            }, username);

            if (user != null) {
                user.setRoles(fetchRolesByUserId(user.getId()));
            }
            return Optional.ofNullable(user);

        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public Optional<User> findById(Long id) {
        String userSql = "SELECT id, username, phone, password, pension_point_id, failed_attempts, is_active FROM users WHERE id = ?";

        try {
            User user = jdbcTemplate.queryForObject(userSql, (rs, rowNum) -> {
                User u = new User();
                u.setId(rs.getLong("id"));
                u.setUsername(rs.getString("username"));
                u.setPhone(rs.getString("phone"));
                u.setPassword(rs.getString("password"));
                if (rs.getObject("pension_point_id") != null) {
                    u.setPensionPointId(
                            rs.getLong("pension_point_id")
                    );
                }
                u.setFailedAttempts(rs.getInt("failed_attempts"));
                u.setActive(rs.getBoolean("is_active"));
                return u;
            }, id);

            if (user != null) {
                user.setRoles(fetchRolesByUserId(user.getId()));
            }
            return Optional.ofNullable(user);

        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public List<User> findAll() {
        String userSql = "SELECT id, username, phone, password, pension_point_id, failed_attempts, is_active FROM users ORDER BY id ASC";

        List<User> users = jdbcTemplate.query(userSql, (rs, rowNum) -> {
            User u = new User();
            u.setId(rs.getLong("id"));
            u.setUsername(rs.getString("username"));
            u.setPhone(rs.getString("phone"));
            u.setPassword(rs.getString("password"));
            if (rs.getObject("pension_point_id") != null) {
                u.setPensionPointId(rs.getLong("pension_point_id"));
            }
            u.setFailedAttempts(rs.getInt("failed_attempts"));
            u.setActive(rs.getBoolean("is_active"));
            return u;
        });

        for (User u : users) {
            u.setRoles(fetchRolesByUserId(u.getId()));
        }
        return users;
    }

    private Set<String> fetchRolesByUserId(Long userId) {
        String roleSql = """
            SELECT r.name
            FROM roles r
            JOIN user_roles ur ON r.id = ur.role_id
            WHERE ur.user_id = ?
            """;

        return new HashSet<>(jdbcTemplate.query(roleSql, (rs, rowNum) -> rs.getString("name"), userId));
    }

    @Override
    public void saveOtp(String username, String otpHash, Timestamp expiry) {
        String sql = "UPDATE users SET otp_hash = ?, otp_expiry = ?, otp_attempts = 0 WHERE username = ?";

        jdbcTemplate.update(sql, otpHash, expiry, username);
    }

    @Override
    public Optional<String> getOtpHash(String username) {
        String sql = "SELECT otp_hash FROM users WHERE username = ?";

        try {
            return Optional.ofNullable(
                    jdbcTemplate.queryForObject(sql, String.class, username)
            );
        } catch (EmptyResultDataAccessException ex) {
            return Optional.empty();
        }
    }

    @Override
    public Optional<Timestamp> getOtpExpiry(String username) {
        String sql = "SELECT otp_expiry FROM users WHERE username = ?";

        try {
            return Optional.ofNullable(
                    jdbcTemplate.queryForObject(sql, Timestamp.class, username)
            );
        } catch (EmptyResultDataAccessException ex) {
            return Optional.empty();
        }
    }

    @Override
    public void clearOtp(String username) {
        String sql = "UPDATE users " +
                     "SET otp_hash = NULL, " +
                     "otp_expiry = NULL, " +
                     "otp_attempts = 0 " +
                     "WHERE username = ?";

        jdbcTemplate.update(sql, username);
    }
}
