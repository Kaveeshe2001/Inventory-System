package com.pension.PIMS.data.dao;

import com.pension.PIMS.data.BaseDao;
import com.pension.PIMS.data.Ifaces.ItemDao;
import com.pension.PIMS.model.Items;
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
public class ItemsDaoImpl extends BaseDao implements ItemDao {

    public ItemsDaoImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public boolean existsByItemCode(String itemCode) {

        String sql = "SELECT COUNT(*) FROM items WHERE item_code = ?";

        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, itemCode);
        return count != null && count > 0;
    }

    @Override
    public boolean existsBySerialNumber(String serialNumber) {

        String sql = "SELECT COUNT(*) FROM items WHERE serial_number = ?";

        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, serialNumber);
        return count != null && count > 0;
    }

    @Override
    public Long save(Items items) {

        String sql = "INSERT INTO items " +
                "( item_code, name, category_id, brand, model, serial_number, purchase_date, purchase_price, warranty_expiry, item_condition, status, location, description, is_active, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();
        LocalDateTime now = LocalDateTime.now();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, items.getItemCode());
            ps.setString(2, items.getName());
            ps.setLong(3, items.getCategoryId());
            ps.setString(4, items.getBrand());
            ps.setString(5, items.getModel());
            ps.setString(6, items.getSerialNumber());

            ps.setDate(
                    7,
                    items.getPurchaseDate() != null
                    ? Date.valueOf(items.getPurchaseDate())
                            :null
            );

            if (items.getPurchasePrice() != null) {
                ps.setBigDecimal(8, items.getPurchasePrice());
            } else {
                ps.setNull(
                        8,
                        java.sql.Types.DECIMAL
                );
            }

            ps.setDate(
                    9,
                    items.getWarrantyExpiry() != null
                            ? Date.valueOf(items.getWarrantyExpiry())
                            :null
            );

            ps.setString(10, items.getCondition());
            ps.setString(11, items.getStatus());
            ps.setString(12, items.getLocation());
            ps.setString(13, items.getDescription());
            ps.setBoolean(14, items.isActive());

            ps.setTimestamp(15, Timestamp.valueOf(now));
            ps.setTimestamp(16, Timestamp.valueOf(now));

            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key == null) {
            throw new IllegalArgumentException("Failed to obtain generated ID for category insert");
        }

        Long itemId = key.longValue();

        return itemId;
    }

    @Override
    public Optional<Items> findById(Long id) {

        String sql = "SELECT " +
                "id, item_code, name, category_id, brand, model, serial_number, purchase_date, purchase_price, warranty_expiry, " +
                "item_condition, status, location, description, is_active, created_at, updated_at " +
                "FROM items WHERE id = ?";

        try {

            Items items =
                    jdbcTemplate.queryForObject(
                            sql,
                            (rs, rowNum) -> mapItems(rs),
                            id
                    );

            return Optional.of(items);

        } catch (EmptyResultDataAccessException e) {

            return Optional.empty();
        }
    }

    @Override
    public List<Items> findAll() {

        String sql = "SELECT " +
                "id, item_code, name, category_id, brand, model, serial_number, purchase_date, purchase_price, warranty_expiry, " +
                "item_condition, status, location, description, is_active, created_at, updated_at " +
                "FROM items ORDER BY id DESC";

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> mapItems(rs)
        );
    }

    @Override
    public List<Items> findAllActive() {

        String sql = "SELECT " +
                "id, item_code, name, category_id, brand, model, serial_number, purchase_date, purchase_price, warranty_expiry, " +
                "item_condition, status, location, description, is_active, created_at, updated_at " +
                "FROM items WHERE is_active = true ORDER BY id DESC";

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> mapItems(rs)
        );
    }

    @Override
    public List<Items> findByCategoryId(Long categoryId) {

        String sql = "SELECT " +
                "id, item_code, name, category_id, brand, model, serial_number, purchase_date, purchase_price, warranty_expiry, " +
                "item_condition, status, location, description, is_active, created_at, updated_at " +
                "FROM items WHERE category_id = ? ORDER BY id DESC";

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> mapItems(rs),
                categoryId
        );
    }

    @Override
    public void update(Items items) {

        String sql = "UPDATE items " +
                "SET item_code = ?, name = ?, category_id = ?, brand = ?, model = ?, serial_number = ?, purchase_date = ?, purchase_price = ?, warranty_expiry = ?, " +
                "item_condition = ?, status = ?, location = ?, description = ?, updated_at = ? " +
                "WHERE id = ?";

        jdbcTemplate.update(
                sql,
                items.getItemCode(),
                items.getName(),
                items.getCategoryId(),
                items.getBrand(),
                items.getModel(),
                items.getSerialNumber(),
                items.getPurchaseDate(),
                items.getPurchasePrice(),
                items.getWarrantyExpiry(),
                items.getCondition(),
                items.getStatus(),
                items.getLocation(),
                items.getDescription(),
                Timestamp.valueOf(LocalDateTime.now()),
                items.getId()
        );
    }

    @Override
    public void updateStatus(Long itemId, String status) {


        String sql = "UPDATE items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";

        int rows = jdbcTemplate.update(
                sql,
                status,
                itemId
        );

        if (rows == 0) {
            throw new RuntimeException(
                    "Item not found"
            );
        }
    }

    @Override
    public void delete(Long id) {

        String sql = "UPDATE items SET is_active = FALSE, updated_at = ? WHERE id = ?";

        jdbcTemplate.update(
                sql,
                Timestamp.valueOf(LocalDateTime.now()),
                id
        );
    }

    private Items mapItems(ResultSet rs) throws SQLException {

        Items itm = new Items();

        itm.setId(rs.getLong("id"));
        itm.setItemCode(rs.getString("item_code"));
        itm.setName(rs.getString("name"));
        itm.setCategoryId(rs.getLong("category_id"));
        itm.setBrand(rs.getString("brand"));
        itm.setModel(rs.getString("model"));
        itm.setSerialNumber(rs.getString("serial_number"));

        Date purchaseDate = rs.getDate("purchase_date");

        if (purchaseDate != null) {
            itm.setPurchaseDate(
                    purchaseDate.toLocalDate()
            );
        }

        itm.setPurchasePrice(
                rs.getBigDecimal("purchase_price")
        );

        Date warranty = rs.getDate("warranty_expiry");

        if (warranty != null) {
            itm.setWarrantyExpiry(
                    warranty.toLocalDate()
            );
        }

        itm.setCondition(rs.getString("item_condition"));
        itm.setStatus(rs.getString("status"));
        itm.setLocation(rs.getString("location"));
        itm.setDescription(rs.getString("description"));
        itm.setActive(rs.getBoolean("is_active"));

        Timestamp created = rs.getTimestamp("created_at");

        if (created != null) {
            itm.setCreatedAt(
                    created.toLocalDateTime()
            );
        }

        Timestamp updated =
                rs.getTimestamp("updated_at");

        if (updated != null) {
            itm.setUpdatedAt(
                    updated.toLocalDateTime()
            );
        }

        return itm;
    }
}
