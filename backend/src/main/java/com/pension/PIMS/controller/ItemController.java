package com.pension.PIMS.controller;

import com.pension.PIMS.dtos.items.ItemRequest;
import com.pension.PIMS.model.Items;
import com.pension.PIMS.service.CategoryService;
import com.pension.PIMS.service.ItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "/items")
@CrossOrigin(maxAge = 3600)
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> createItem (@RequestBody ItemRequest request) {
        String result = itemService.createItem(request);
        return ResponseEntity.ok(Map.of("Success", result));
    }

    @GetMapping
    public ResponseEntity<List<Items>> getAllItems() {
        return ResponseEntity.ok(
                itemService.getAlItems()
        );
    }

    @GetMapping("/active")
    public ResponseEntity<List<Items>> getActiveItems() {
        return ResponseEntity.ok(
                itemService.getActiveItems()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Items> getItem(@PathVariable Long id) {
        return ResponseEntity.ok(
                itemService.getItemsById(id)
        );
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Items>> getItemsbyCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(
                itemService.getItemsByCategory(categoryId)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateItem (@PathVariable Long id, @RequestBody ItemRequest request) {
        String result = itemService.updateItem(id, request);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteItem (@PathVariable Long id) {
        String result = itemService.deleteItem(id);
        return ResponseEntity.ok(result);
    }
}
