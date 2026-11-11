package com.pension.PIMS.data.dao;

import com.pension.PIMS.data.BaseDao;
import com.pension.PIMS.data.Ifaces.ItemMaintenanceDao;
import com.pension.PIMS.model.ItemMaintanance;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
public class ItemMaintenanceDaoImpl extends BaseDao implements ItemMaintenanceDao {

    public ItemMaintenanceDaoImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public Long save(ItemMaintanance maintenance) {

        String sql = "INSERT INTO item_maintenance " +
                "( item_id, maintenance_type, problem_description, action_taken, service_provider, started_at, cost, status, remarks ) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();
        LocalDateTime now = LocalDateTime.now();

        jdbcTemplate.update(
                sql,
                maintenance.getItemId(),
                maintenance.getMaintenanceType(),
                maintenance.getProblemDescription(),
                maintenance.getActionTaken(),
                maintenance.getServiceProvider(),
                Timestamp.valueOf(maintenance.getStartedAt()),
                maintenance.getCost(),
                maintenance.getStatus(),
                maintenance.getRemarks()
        );

        Long id = jdbcTemplate.queryForObject(
                "SELECT LAST_INSERT_ID()",
                Long.class
        );

        return id;
    }

    @Override
    public Optional<ItemMaintanance> findById(Long id) {

        String sql = "SELECT " +
                "id, item_id, maintenance_type, problem_description, action_taken, service_provider, started_at, completed_at, cost, status, remarks, created_at " +
                "FROM item_maintenance WHERE id = ?";

        List<ItemMaintanance> results =
                jdbcTemplate.query(
                        sql,
                        this::mapRow,
                        id
                );

        return results.stream().findFirst();
    }

    @Override
    public List<ItemMaintanance> findAll() {

        String sql = "SELECT " +
                "id, item_id, maintenance_type, problem_description, action_taken, service_provider, started_at, completed_at, cost, status, remarks, created_at " +
                "FROM item_maintenance ORDER BY id DESC";

        return jdbcTemplate.query(
                sql,
                this::mapRow
        );
    }

    @Override
    public List<ItemMaintanance> findByItemId(Long itemId) {

        String sql = "SELECT " +
                "id, item_id, maintenance_type, problem_description, action_taken, service_provider, started_at, completed_at, cost, status, remarks, created_at " +
                "FROM item_maintenance WHERE item_id = ? ORDER BY id DESC";

        return jdbcTemplate.query(
                sql,
                this::mapRow,
                itemId
        );
    }

    @Override
    public List<ItemMaintanance> findByStatus(String status) {

        String sql = "SELECT " +
                "id, item_id, maintenance_type, problem_description, action_taken, service_provider, started_at, completed_at, cost, status, remarks, created_at " +
                "FROM item_maintenance WHERE status = ? ORDER BY id DESC";

        return jdbcTemplate.query(
                sql,
                this::mapRow,
                status
        );
    }

    @Override
    public void updateStatus(Long id, String status) {

        String sql = "UPDATE item_maintenance SET status = ? WHERE id = ?";

        int rows = jdbcTemplate.update(
                sql,
                status,
                id
        );

        if (rows == 0) {
            throw new RuntimeException(
                    "Maintenance record not found"
            );
        }
    }

    @Override
    public void completeMaintenance(Long id, String itemCode, String actionTaken, String remarks, BigDecimal cost) {

        String sql = "UPDATE item_maintenance " +
                "SET status = 'COMPLETED', item_code = ?, action_taken = ?, remarks = ?, cost = ?, completed_at = CURRENT_TIMESTAMP " +
                "WHERE id = ? AND status IN ('OPEN', 'IN_PROGRESS')";

        int rows = jdbcTemplate.update(
                sql,
                itemCode,
                actionTaken,
                remarks,
                cost,
                id
        );

        if (rows == 0) {
            throw new RuntimeException(
                    "Maintenance record not found or already completed"
            );
        }
    }

    @Override
    public void cancelMaintenance(Long id) {

        String sql = "UPDATE item_maintenance SET status = 'CANCELLED' WHERE id = ? AND status IN ('OPEN', 'IN_PROGRESS')";

        int rows = jdbcTemplate.update(
                sql,
                id
        );

        if (rows == 0) {
            throw new RuntimeException(
                    "Maintenance record cannot be cancelled"
            );
        }
    }

    private ItemMaintanance mapRow(ResultSet rs, int rowNum) throws SQLException {

        ItemMaintanance maintenance = new ItemMaintanance();

        maintenance.setId(rs.getLong("id"));
        maintenance.setItemId(rs.getLong("item_id"));
        maintenance.setMaintenanceType(rs.getString("maintenance_type"));
        maintenance.setProblemDescription(rs.getString("problem_description"));
        maintenance.setActionTaken(rs.getString("action_taken"));
        maintenance.setServiceProvider(rs.getString("service_provider"));

        Timestamp startedAt = rs.getTimestamp("started_at");

        if (startedAt != null) {
            maintenance.setStartedAt(
                    startedAt.toLocalDateTime()
            );
        }

        Timestamp completedAt = rs.getTimestamp("completed_at");

        if (completedAt != null) {
            maintenance.setCompletedAt(
                    completedAt.toLocalDateTime()
            );
        }

        maintenance.setCost(rs.getBigDecimal("cost"));
        maintenance.setStatus(rs.getString("status"));
        maintenance.setRemarks(rs.getString("remarks"));

        Timestamp createdAt = rs.getTimestamp("created_at");

        if (createdAt != null) {
            maintenance.setCreatedAt(
                    createdAt.toLocalDateTime()
            );
        }

        return maintenance;
    }
}
