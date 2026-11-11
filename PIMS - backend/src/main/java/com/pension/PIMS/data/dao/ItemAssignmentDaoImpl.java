package com.pension.PIMS.data.dao;

import com.pension.PIMS.data.BaseDao;
import com.pension.PIMS.data.Ifaces.ItemAssignmentDao;
import com.pension.PIMS.model.ItemAssignment;
import com.pension.PIMS.model.ItemRequest;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
public class ItemAssignmentDaoImpl extends BaseDao implements ItemAssignmentDao {

    public ItemAssignmentDaoImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public Long save(ItemAssignment assignment) {

        String sql = "INSERT INTO item_assignments (item_id, pension_point_id, assigned_to, status, remarks) VALUES (?, ?, ?, 'ASSIGNED', ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();
        LocalDateTime now = LocalDateTime.now();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, assignment.getItemId());
            ps.setLong(2, assignment.getPensionPointId());
            ps.setLong(3, assignment.getAssignedTo());
            ps.setString(4, assignment.getRemarks());

            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();

        if (key == null) {
            throw new RuntimeException(
                    "Failed to create item assignment"
            );
        }

        return key.longValue();
    }

    @Override
    public Optional<ItemAssignment> findById(Long id) {

        String sql = "SELECT id, item_id, pension_point_id, assigned_to, assigned_at, returned_at, status, remarks FROM item_assignments WHERE id = ?";

        try {

            List<ItemAssignment> results =
                    jdbcTemplate.query(
                            sql,
                            this::mapRow,
                            id
                    );

            return results.stream().findFirst();

        } catch (EmptyResultDataAccessException e) {

            return Optional.empty();
        }
    }

    @Override
    public List<ItemAssignment> findAll() {

        String sql = "SELECT id, item_id, pension_point_id, assigned_to, assigned_at, returned_at, status, remarks FROM item_assignments ORDER BY assigned_at DESC";

        return jdbcTemplate.query(
                sql,
                this::mapRow
        );
    }

    @Override
    public List<ItemAssignment> findActive() {

        String sql = "SELECT " +
                "id, item_id, pension_point_id, assigned_to, assigned_at, returned_at, status, remarks FROM item_assignments " +
                "WHERE status = 'ASSIGNED' ORDER BY assigned_at DESC";

        return jdbcTemplate.query(
                sql,
                this::mapRow
        );
    }

    @Override
    public List<ItemAssignment> findByItemId(Long itemId) {

        String sql = "SELECT " +
                "id, item_id, pension_point_id, assigned_to, assigned_at, returned_at, status, remarks FROM item_assignments " +
                "WHERE item_id = ? ORDER BY assigned_at DESC";

        return jdbcTemplate.query(
                sql,
                this::mapRow,
                itemId
        );
    }

    @Override
    public List<ItemAssignment> findByAssignedTo(Long userId) {

        String sql = "SELECT " +
                "id, item_id, pension_point_id, assigned_to, assigned_at, returned_at, status, remarks FROM item_assignments " +
                "WHERE assigned_to = ? ORDER BY assigned_at DESC";

        return jdbcTemplate.query(
                sql,
                this::mapRow,
                userId
        );
    }

    @Override
    public List<ItemAssignment> findByPensionPointId(Long pensionPointId) {

        String sql = "SELECT " +
                "id, item_id, pension_point_id, assigned_to, assigned_at, returned_at, status, remarks FROM item_assignments " +
                "WHERE pension_point_id = ? ORDER BY assigned_at DESC";

        return jdbcTemplate.query(
                sql,
                this::mapRow,
                pensionPointId
        );
    }

    @Override
    public Optional<ItemAssignment> findActiveByItemId(Long itemId) {

        String sql = "SELECT " +
                "id, item_id, pension_point_id, assigned_to, assigned_at, returned_at, status, remarks FROM item_assignments " +
                "WHERE item_id = ? AND status = 'ASSIGNED' " +
                "LIMIT 1";

        List<ItemAssignment> results =
                jdbcTemplate.query(
                        sql,
                        this::mapRow,
                        itemId
                );

        return results.stream().findFirst();
    }

    @Override
    public void returnItem(Long assignmentId, String remarks) {

        String sql = "UPDATE item_assignments " +
                "SET status = 'RETURNED', returned_at = CURRENT_TIMESTAMP, remarks = ?" +
                "WHERE id = ? AND status = 'ASSIGNED'";

        int rows = jdbcTemplate.update(
                sql,
                remarks,
                assignmentId
        );

        if (rows == 0) {
            throw new RuntimeException(
                    "Assignment not found or item already returned"
            );
        }
    }

    private ItemAssignment mapRow(ResultSet rs, int rowNum) throws SQLException {

        ItemAssignment assignment = new ItemAssignment();

        assignment.setId(rs.getLong("id"));
        assignment.setItemId(rs.getLong("item_id"));
        assignment.setPensionPointId(rs.getLong("pension_point_id"));
        assignment.setAssignedTo(rs.getLong("assigned_to"));

        Timestamp assignedAt = rs.getTimestamp("assigned_at");

        if (assignedAt != null) {
            assignment.setAssignedAt(
                    assignedAt.toLocalDateTime()
            );
        }

        Timestamp returnedAt = rs.getTimestamp("returned_at");

        if (returnedAt != null) {
            assignment.setReturnedAt(
                    returnedAt.toLocalDateTime()
            );
        }

        assignment.setStatus(rs.getString("status"));
        assignment.setRemarks(rs.getString("remarks"));

        return assignment;
    }
}
