package com.pension.PIMS.service;

import com.pension.PIMS.data.DaoManager;
import com.pension.PIMS.dtos.category.CategoryRequest;
import com.pension.PIMS.model.Category;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final DaoManager daoManager;

    public CategoryService(DaoManager daoManager) {
        this.daoManager = daoManager;
    }

    public String createCategory(CategoryRequest request) {

        if (request.name() == null || request.name().trim().isEmpty()) {
            throw new IllegalArgumentException ("Category name is required");
        }

        String name = request.name().trim();

        if (daoManager.getCategoryDao().existsByName(name)) {
            throw new IllegalArgumentException("Category already exists");
        }

        try {
            Category cat = new Category();
            cat.setName(name);
            cat.setDescription(request.description());
            cat.setActive(true);

            daoManager.getCategoryDao().save(cat);

            return "Category added successfully.";
        } catch (Exception e) {
            throw new RuntimeException("Category adding failed",e);
        }
    }

    public List<Category> getAllCategories() {
        return daoManager.getCategoryDao().findAll();
    }

    public List<Category> getActiveCategories() {
        return daoManager.getCategoryDao().findAllActive();
    }

    public Category getCategoryById(Long id) {
        return daoManager.getCategoryDao()
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Category not found with id: " + id
                        )
                );
    }

    public String updateCategory(Long id, CategoryRequest request) {
        Category existing = daoManager.getCategoryDao()
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Category not found with id: " + id
                        )
                );

        String newName = request.name().trim();

        if (!existing.getName().equalsIgnoreCase(newName) && daoManager.getCategoryDao().existsByName(newName)) {
            throw new IllegalArgumentException("Category already exists");
        }

        existing.setName(newName);
        existing.setDescription(request.description());

        daoManager.getCategoryDao().update(existing);

        return "Category updated successfully";
    }

    public String deleteCategory(Long id) {
        Category existing = daoManager.getCategoryDao()
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Category not found with id: " + id
                        )
                );

        daoManager.getCategoryDao().delete(existing.getId());

        return "Category deteleted successfully.";
    }
}
