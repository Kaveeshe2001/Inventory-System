package com.pension.PIMS.data.dao;

import com.pension.PIMS.data.BaseDao;
import com.pension.PIMS.data.Ifaces.PensionPointDao;
import com.pension.PIMS.model.PensionPoint;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
public class PensionPointDaoImpl extends BaseDao implements PensionPointDao {

    public PensionPointDaoImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public Long save(PensionPoint pensionPoint) {

        String sql = "INSERT INTO pension_points (code, name, address, telephone, email, pension_files, is_active) VALUES (?,?,?,?,?,?, TRUE)";

        Integer files = null;
        if (pensionPoint.getPensionFiles() != null && !pensionPoint.getPensionFiles().isBlank()) {
            try {
                files = Integer.valueOf(pensionPoint.getPensionFiles().trim());
            } catch (NumberFormatException e) {
                files = 0;
            }
        }

        jdbcTemplate.update(
                sql,
                pensionPoint.getCode(),
                pensionPoint.getName(),
                pensionPoint.getAddress(),
                pensionPoint.getTelephone(),
                pensionPoint.getEmail(),
                files
        );

        return jdbcTemplate.queryForObject(
                "SELECT LAST_INSERT_ID()",
                Long.class
        );
    }

    @Override
    public Optional<PensionPoint> findById(Long id) {

        String sql = "SELECT id, code, name, address, telephone, email, pension_files, is_active, created_at, updated_at FROM pension_points WHERE id = ?";

        List<PensionPoint> results =
                jdbcTemplate.query(
                        sql,
                        this::mapRow,
                        id
                );

        return results.stream().findFirst();
    }

    @Override
    public Optional<PensionPoint> findByCode(String code) {

        String sql = "SELECT id, code, name, address, telephone, email, pension_files, is_active, created_at, updated_at FROM pension_points WHERE code = ?";

        List<PensionPoint> results =
                jdbcTemplate.query(
                        sql,
                        this::mapRow,
                        code
                );

        return results.stream().findFirst();
    }

    @Override
    public List<PensionPoint> findAll() {

        String sql = "SELECT id, code, name, address, telephone, email, pension_files, is_active, created_at, updated_at FROM pension_points ORDER BY id DESC";

        return jdbcTemplate.query(
                sql,
                this::mapRow
        );
    }

    @Override
    public List<PensionPoint> findAllActive() {

        String sql = "SELECT id, code, name, address, telephone, email, pension_files, is_active, created_at, updated_at FROM pension_points WHERE is_active = TRUE ORDER BY id DESC";

        return jdbcTemplate.query(
                sql,
                this::mapRow
        );
    }

    @Override
    public boolean existsByCode(String code) {

        String sql = "SELECT COUNT(*) FROM pension_points WHERE code = ?";

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                code
        );

        return count != null && count > 0;
    }

    @Override
    public void update(PensionPoint pensionPoint) {

        String sql = "UPDATE pension_points SET code = ?, name = ?, address = ?, telephone = ?, email = ?, pension_files = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";

        Integer files = null;
        if (pensionPoint.getPensionFiles() != null && !pensionPoint.getPensionFiles().isBlank()) {
            try {
                files = Integer.valueOf(pensionPoint.getPensionFiles().trim());
            } catch (NumberFormatException e) {
                files = 0;
            }
        }

        int rows = jdbcTemplate.update(
                sql,
                pensionPoint.getCode(),
                pensionPoint.getName(),
                pensionPoint.getAddress(),
                pensionPoint.getTelephone(),
                pensionPoint.getEmail(),
                files,
                pensionPoint.getId()
        );

        if (rows == 0) {
            throw new RuntimeException(
                    "Pension point not found"
            );
        }

    }

    @Override
    public void activate(Long id) {

        String sql = "UPDATE pension_points SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?";

        int rows = jdbcTemplate.update(
                sql,
                id
        );

        if (rows == 0) {
            throw new RuntimeException(
                    "Pension point not found"
            );
        }
    }

    @Override
    public void deactivate(Long id) {

        String sql = "UPDATE pension_points SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?";

        int rows = jdbcTemplate.update(
                sql,
                id
        );

        if (rows == 0) {
            throw new RuntimeException(
                    "Pension point not found"
            );
        }
    }

    private PensionPoint mapRow(ResultSet rs, int rowNum) throws SQLException {

        PensionPoint pensionPoint = new PensionPoint();

        pensionPoint.setId(rs.getLong("id"));
        pensionPoint.setCode(rs.getString("code"));
        pensionPoint.setName(rs.getString("name"));
        pensionPoint.setAddress(rs.getString("address"));
        pensionPoint.setTelephone(rs.getString("telephone"));
        pensionPoint.setEmail(rs.getString("email"));
        pensionPoint.setPensionFiles(rs.getString("pension_files"));
        pensionPoint.setActive(rs.getBoolean("is_active"));

        Timestamp createdAt = rs.getTimestamp("created_at");

        if (createdAt != null) {
            pensionPoint.setCreatedAt(
                    createdAt.toLocalDateTime()
            );
        }

        Timestamp updatedAt = rs.getTimestamp("updated_at");

        if (updatedAt != null) {
            pensionPoint.setUpdatedAt(
                    updatedAt.toLocalDateTime()
            );
        }

        return pensionPoint;
    }
}
