package com.pension.PIMS.controller;

import com.pension.PIMS.dtos.items.ItemRequestApprovalRequest;
import com.pension.PIMS.dtos.items.ItemRequestCreateRequest;
import com.pension.PIMS.model.ItemRequest;
import com.pension.PIMS.service.ItemRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/item-requests")
@CrossOrigin(maxAge = 3600)
public class ItemRequestController {

    private final ItemRequestService service;

    public ItemRequestController(ItemRequestService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<String> createRequest( @RequestBody ItemRequestCreateRequest request, @RequestParam Long userId) {

        String requestId = service.createRequest(request,  userId);

        return ResponseEntity.ok(requestId);
    }

    @GetMapping
    public ResponseEntity<List<ItemRequest>> getAllItemRequest() {
        return ResponseEntity.ok(
                service.getAllItemRequests()
        );
    }

    @GetMapping("{id}")
    public ResponseEntity<ItemRequest> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(
                service.getRequestById(id)
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ItemRequest>> getRequestByStatus(@PathVariable String status) {
        return ResponseEntity.ok(
                service.getRequestByStatus(status)
        );
    }

    @GetMapping("/my")
    public ResponseEntity<List<ItemRequest>> getMyRequests(@RequestParam Long userId) {
            return ResponseEntity.ok(
                    service.getMyRequest(userId)
            );
    }

    @PutMapping("{id}/approve")
    public ResponseEntity<String> approveRequest(@PathVariable Long id, @RequestParam Long adminId) {
        return ResponseEntity.ok(
                service.approveRequest(id, adminId)
        );
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<String> rejectRequest(@PathVariable Long id, @RequestParam Long adminId, @RequestBody ItemRequestApprovalRequest decision) {

        return ResponseEntity.ok(
                service.rejectRequest(id, adminId, decision)
        );
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<String> cancelRequest(@PathVariable Long id, @RequestParam Long userId) {

        return ResponseEntity.ok(
                service.cancelRequest(id, userId)
        );
    }
}
