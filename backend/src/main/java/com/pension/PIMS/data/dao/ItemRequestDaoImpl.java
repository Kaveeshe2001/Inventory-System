package com.pension.PIMS.data.dao;

import com.pension.PIMS.data.BaseDao;
import com.pension.PIMS.data.Ifaces.ItemRequestDao;
import com.pension.PIMS.model.ItemRequest;
import com.pension.PIMS.model.Items;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.*;
import java.util.List;
import java.util.Optional;

@Component
public class ItemRequestDaoImpl extends BaseDao implements ItemRequestDao {

    public ItemRequestDaoImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public Long save(ItemRequest request) {

        String sql = "INSERT INTO item_requests ( item_id, requested_by, pension_point_id, reason, status ) VALUES (?, ?, ?, ?, 'PENDING')";

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, request.getItemId());
            ps.setLong(2, request.getRequestedBy());
            ps.setLong(3, request.getPensionPointId());
            ps.setString(4, request.getReason());

            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key == null) {
            throw new IllegalArgumentException("Failed to obtain generated ID for category insert");
        }

        Long itemRequestId = key.longValue();

        return itemRequestId;
    }

    @Override
    public Optional<ItemRequest> findById(Long id) {

        String sql = "SELECT IR.id, IR.item_id, IR.requested_by, IR.pension_point_id, P.pension_files, IR.reason, IR.status, IR.requested_at, IR.approved_by, IR.approved_at, IR.rejection_reason FROM item_requests IR \n" +
                "LEFT JOIN pension_points P ON P.id = IR.pension_point_id\n" +
                "WHERE IR.id = ?";

        try {

            List<ItemRequest> requests =
                    jdbcTemplate.query(
                            sql,
                            this::mapRow,
                            id
                    );

            return requests.stream().findFirst();

        } catch (EmptyResultDataAccessException e) {

            return Optional.empty();
        }
    }

    @Override
    public List<ItemRequest> findAll() {

        String sql = "SELECT IR.id, IR.item_id, IR.requested_by, IR.pension_point_id, P.pension_files, IR.reason, IR.status, IR.requested_at, IR.approved_by, IR.approved_at, IR.rejection_reason \n" +
                "FROM item_requests IR\n" +
                "LEFT JOIN pension_points P ON P.id = IR.pension_point_id\n" +
                "ORDER BY IR.requested_at DESC";

        return jdbcTemplate.query(
                sql,
                this::mapRow
        );
    }

    @Override
    public List<ItemRequest> findByStatus(String status) {

        String sql = "SELECT IR.id, IR.item_id, IR.requested_by, IR.pension_point_id, P.pension_files, IR.reason, IR.status, IR.requested_at, IR.approved_by, IR.approved_at, IR.rejection_reason \n" +
                "FROM item_requests IR\n" +
                "LEFT JOIN pension_points P ON P.id = IR.pension_point_id\n" +
                "WHERE status = ?\n" +
                "ORDER BY IR.requested_at DESC;";

        return jdbcTemplate.query(
                sql,
                this::mapRow,
                status
        );

    }

    @Override
    public List<ItemRequest> findByRequestedBy(Long userId) {

        String sql = "SELECT IR.id, IR.item_id, IR.requested_by, IR.pension_point_id, P.pension_files, IR.reason, IR.status, IR.requested_at, IR.approved_by, IR.approved_at, IR.rejection_reason \n" +
                "FROM item_requests IR\n" +
                "LEFT JOIN pension_points P ON P.id = IR.pension_point_id\n" +
                "WHERE requested_by = ?\n" +
                "ORDER BY IR.requested_at DESC;";

        return jdbcTemplate.query(
                sql,
                this::mapRow,
                userId
        );
    }

    @Override
    public void approve(Long requestId, Long approvedBy) {

        String sql = "UPDATE item_requests " +
                "SET status = 'APPROVED', approved_by = ?, approved_at = CURRENT_TIMESTAMP, rejection_reason = NULL " +
                "WHERE id = ? AND status = 'PENDING'";

        int rows = jdbcTemplate.update(
                sql,
                approvedBy,
                requestId
        );

        if (rows == 0) {
            throw new RuntimeException(
                    "Request not found or already processed"
            );
        }
    }

    @Override
    public void reject(Long requestId, Long approvedBy, String rejectionReason) {

        String sql = "UPDATE item_requests " +
                "SET status = 'REJECTED', approved_by = ?, approved_at = CURRENT_TIMESTAMP, rejection_reason = ? " +
                "WHERE id = ? AND status = 'PENDING'";

        int rows = jdbcTemplate.update(
                sql,
                approvedBy,
                rejectionReason,
                requestId
        );

        if (rows == 0) {
            throw new RuntimeException(
                    "Request not found or already processed"
            );
        }
    }

    @Override
    public void cancel(Long requestId) {

        String sql = "UPDATE item_requests SET status = 'CANCELLED' WHERE id = ? AND status = 'PENDING'";

        int rows = jdbcTemplate.update(
                sql,
                requestId
        );

        if (rows == 0) {
            throw new RuntimeException(
                    "Request not found or cannot be cancelled"
            );
        }

    }

    private ItemRequest mapRow(ResultSet rs, int rowNum) throws SQLException {

        ItemRequest request = new ItemRequest();

        request.setId(
                rs.getLong("id")
        );

        request.setItemId(
                rs.getLong("item_id")
        );

        request.setRequestedBy(
                rs.getLong("requested_by")
        );

        request.setPensionPointId(
                rs.getLong("pension_point_id")
        );

        request.setPensionFiles(
                rs.getLong("pension_files")
        );

        request.setReason(
                rs.getString("reason")
        );

        request.setStatus(
                rs.getString("status")
        );

        Timestamp requestedAt = rs.getTimestamp("requested_at");

        if (requestedAt != null) {
            request.setRequestedAt(
                    requestedAt.toLocalDateTime()
            );
        }

        long approvedBy = rs.getLong("approved_by");

        if (!rs.wasNull()) {
            request.setApprovedBy(approvedBy);
        }

        Timestamp approvedAt = rs.getTimestamp("approved_at");

        if (approvedAt != null) {
            request.setApprovedAt(
                    approvedAt.toLocalDateTime()
            );
        }

        request.setRejectionReason(
                rs.getString("rejection_reason")
        );

        return request;
    }
}
