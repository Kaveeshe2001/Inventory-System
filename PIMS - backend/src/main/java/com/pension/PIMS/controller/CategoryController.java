package com.pension.PIMS.controller;

import com.pension.PIMS.dtos.category.CategoryRequest;
import com.pension.PIMS.model.Category;
import com.pension.PIMS.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "/category")
@CrossOrigin(maxAge = 3600)
public class CategoryController {
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> createCategory(@RequestBody CategoryRequest request) {
        String result = categoryService.createCategory(request);
        return ResponseEntity.ok(Map.of("Success", result));
    }

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(
                categoryService.getAllCategories()
        );
    }

    @GetMapping("/active")
    public ResponseEntity<List<Category>> getActiveCategories() {
        return ResponseEntity.ok(
                categoryService.getActiveCategories()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategory(@PathVariable Long id) {
        return ResponseEntity.ok(
                categoryService.getCategoryById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateCategory(@PathVariable Long id, @RequestBody CategoryRequest request) {
        String result = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCategory(@PathVariable Long id) {
        String result = categoryService.deleteCategory(id);
        return ResponseEntity.ok(result);
    }
}
