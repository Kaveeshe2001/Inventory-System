package com.pension.PIMS.controller;

import com.pension.PIMS.dtos.items.ItemMaintenanceRequest;
import com.pension.PIMS.model.ItemMaintanance;
import com.pension.PIMS.service.ItemMaintenanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/item-maintenance")
@CrossOrigin(maxAge = 3600)
public class ItemMaintenanceController {

    private final ItemMaintenanceService service;

    public ItemMaintenanceController(ItemMaintenanceService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Long> create(@RequestBody ItemMaintenanceRequest request) {
        Long id = service.createMaintenance(request);
        return ResponseEntity.ok(id);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemMaintanance> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<ItemMaintanance>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<ItemMaintanance>> getByItemId(
            @PathVariable Long itemId) {

        return ResponseEntity.ok(service.getByItemId(itemId));
    }


    @GetMapping("/status/{status}")
    public ResponseEntity<List<ItemMaintanance>> getByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(service.getByStatus(status));
    }


    @PutMapping("/{id}/start")
    public ResponseEntity<String> start(
            @PathVariable Long id) {

        service.startMaintenance(id);

        return ResponseEntity.ok(
                "Maintenance started successfully"
        );
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<String> complete(
            @PathVariable Long id,
            @RequestBody ItemMaintenanceRequest request) {

        service.completeMaintenance(id, request);

        return ResponseEntity.ok("Maintenance completed successfully");
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<String> cancel(
            @PathVariable Long id) {

        service.cancelMaintenance(id);

        return ResponseEntity.ok("Maintenance cancelled successfully");
    }
}
