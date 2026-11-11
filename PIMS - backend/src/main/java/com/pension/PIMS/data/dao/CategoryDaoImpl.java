package com.pension.PIMS.data.dao;

import com.pension.PIMS.data.BaseDao;
import com.pension.PIMS.data.Ifaces.CategoryDao;
import com.pension.PIMS.model.Category;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
public class CategoryDaoImpl extends BaseDao implements CategoryDao {

    public CategoryDaoImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public boolean existsByName (String name) {

        String sql = "SELECT COUNT(*) FROM category WHERE name = ?";

        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, name);
        return count != null && count > 0;
    }

    @Override
    public Long save (Category category) {

        String sql = "INSERT INTO category (name, description, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        LocalDateTime now = LocalDateTime.now();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, category.getName());
            ps.setString(2, category.getDescription());
            ps.setBoolean(3, category.isActive());
            ps.setTimestamp(4, Timestamp.valueOf(now));
            ps.setTimestamp(5, Timestamp.valueOf(now));

            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key == null) {
            throw new IllegalArgumentException("Failed to obtain generated ID for category insert");
        }
        Long categoryId = key.longValue();

        return categoryId;
    }

    @Override
    public Optional<Category> findById(Long id) {
        String sql = "SELECT id, name, description, is_active, created_at, updated_at FROM category WHERE id = ?";

        try {
            Category category = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {

                Category c = new Category();
                c.setId(rs.getLong("id"));
                c.setName(rs.getString("name"));
                c.setDescription(rs.getString("description"));
                c.setActive(rs.getBoolean("is_active"));
                Timestamp created = rs.getTimestamp("created_at");

                if (created != null) {
                    c.setCreatedAt(
                            created.toLocalDateTime()
                    );
                }

                Timestamp updated = rs.getTimestamp("updated_at");

                if (updated != null) {
                    c.setUpdatedAt(
                            updated.toLocalDateTime()
                    );
                }

                return c;

            }, id);

            return Optional.of(category);

        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public List<Category> findAll() {
        String sql = "SELECT id, name, description, is_active, created_at, updated_at FROM category ORDER BY name";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {

            Category c = new Category();
            c.setId(rs.getLong("id"));
            c.setName(rs.getString("name"));
            c.setDescription(rs.getString("description"));
            c.setActive(rs.getBoolean("is_active"));
            Timestamp created = rs.getTimestamp("created_at");

            if (created != null) {
                c.setCreatedAt(
                        created.toLocalDateTime()
                );
            }

            Timestamp updated = rs.getTimestamp("updated_at");

            if (updated != null) {
                c.setUpdatedAt(
                        updated.toLocalDateTime()
                );
            }

            return c;

        });
    }

    @Override
    public List<Category> findAllActive() {
        String sql = "SELECT id, name, description, is_active, created_at, updated_at FROM category WHERE is_active = TRUE ORDER BY name";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {

            Category c = new Category();
            c.setId(rs.getLong("id"));
            c.setName(rs.getString("name"));
            c.setDescription(rs.getString("description"));
            c.setActive(rs.getBoolean("is_active"));
            Timestamp created = rs.getTimestamp("created_at");

            if (created != null) {
                c.setCreatedAt(
                        created.toLocalDateTime()
                );
            }

            Timestamp updated = rs.getTimestamp("updated_at");

            if (updated != null) {
                c.setUpdatedAt(
                        updated.toLocalDateTime()
                );
            }

            return c;
        });
    }

    @Override
    public void update(Category category) {
        String sql = "UPDATE category SET name = ?, description = ?, is_active = ?, updated_at = ? WHERE id = ?";

        jdbcTemplate.update(
                sql,
                category.getName(),
                category.getDescription(),
                category.isActive(),
                Timestamp.valueOf(LocalDateTime.now()),
                category.getId()
        );
    }

    @Override
    public void delete(Long id) {
        String sql = "DELETE FROM category WHERE id=?";

        jdbcTemplate.update(sql, id);
    }
}
