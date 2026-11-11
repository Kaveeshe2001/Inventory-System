package com.pension.PIMS.controller;

import com.pension.PIMS.dtos.items.ItemAssignmentRequest;
import com.pension.PIMS.dtos.items.ItemReturnRequest;
import com.pension.PIMS.model.ItemAssignment;
import com.pension.PIMS.model.ItemRequest;
import com.pension.PIMS.service.ItemAssignmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/item-assignments")
@CrossOrigin(maxAge = 3600)
public class ItemAssignmentController {

    private final ItemAssignmentService service;

    public ItemAssignmentController(ItemAssignmentService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<String> createAssignment(@RequestBody ItemAssignmentRequest request) {
        String result = service.createAssignment(request);
        return ResponseEntity.ok(result);
    }

    @GetMapping
    public ResponseEntity<List<ItemAssignment>> getAll() {
        return ResponseEntity.ok(
                service.getAll()
        );
    }

    @GetMapping("/active")
    public ResponseEntity<List<ItemAssignment>> getActive() {
        return ResponseEntity.ok(
                service.getActive()
        );
    }

    @GetMapping("{id}")
    public ResponseEntity<ItemAssignment> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                service.getById(id)
        );
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<ItemAssignment>> getItemHistory(@PathVariable Long itemId) {

        return ResponseEntity.ok(
                service.getItemHistory(itemId)
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ItemAssignment>> getUserAssignment(@PathVariable Long userId) {

        return ResponseEntity.ok(
                service.getUserAssignment(userId)
        );
    }

    @GetMapping("/pension-point/{pensionPointId}")
    public ResponseEntity<List<ItemAssignment>>
    getPensionPointAssignments(@PathVariable Long pensionPointId) {

        return ResponseEntity.ok(
                service.getPensionPointAssignment(pensionPointId)
        );
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<String> returnItem(@PathVariable Long id, @RequestBody(required = false) ItemReturnRequest request) {

        return ResponseEntity.ok(
                service.returnItem(id, request)
        );
    }
}
