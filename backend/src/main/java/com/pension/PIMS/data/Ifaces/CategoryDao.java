package com.pension.PIMS.data.Ifaces;

import com.pension.PIMS.model.Category;

import java.util.List;
import java.util.Optional;

public interface CategoryDao {

    Long save(Category category);

    boolean existsByName(String name);

    Optional<Category> findById(Long id);

    List<Category> findAll();

    List<Category> findAllActive();

    void update(Category category);

    void delete(Long id);

}
