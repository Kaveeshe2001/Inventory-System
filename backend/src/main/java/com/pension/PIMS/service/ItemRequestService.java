package com.pension.PIMS.service;

import com.pension.PIMS.data.DaoManager;
import com.pension.PIMS.data.Ifaces.ItemDao;
import com.pension.PIMS.dtos.items.ItemRequestApprovalRequest;
import com.pension.PIMS.dtos.items.ItemRequestCreateRequest;
import com.pension.PIMS.model.ItemRequest;
import com.pension.PIMS.model.Items;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemRequestService {

    private final DaoManager daoManager;

    public ItemRequestService(DaoManager daoManager) {
        this.daoManager = daoManager;
    }

    @Transactional
        public String createRequest(ItemRequestCreateRequest request, Long currentUserId) {

        if (request.itemId() == null) {
            throw new RuntimeException(
                    "Item ID is required"
            );
        }

        if (request.pensionPointId() == null) {
            throw new RuntimeException(
                    "Pension point ID is required"
            );
        }

        if (currentUserId == null) {
            throw new RuntimeException(
                    "User ID is required"
            );
        }

        ItemDao itemDao = daoManager.getItemDao();

        Items item = itemDao.findById(request.itemId())
                .orElseThrow(() ->
                        new RuntimeException("Item not found"));

        if (!Boolean.TRUE.equals(item.isActive())) {

            throw new RuntimeException(
                    "Item is inactive"
            );
        }

        if (!"AVAILABLE".equals(item.getStatus())) {
            throw new RuntimeException(
                    "Item is not available");
        }

        ItemRequest itemRequest = new ItemRequest();

        itemRequest.setItemId(request.itemId());
        itemRequest.setRequestedBy(currentUserId);
        itemRequest.setPensionPointId(request.pensionPointId());
                if (request.pensionFiles() != null && !request.pensionFiles().isBlank()) {
                        try {
                                itemRequest.setPensionFiles(Long.valueOf(request.pensionFiles()));
                        } catch (NumberFormatException exception) {
                                throw new IllegalArgumentException("Pension file count must be a whole number");
                        }
                }
        itemRequest.setReason(request.reason());
        itemRequest.setStatus("PENDING");

                Long requestId = daoManager.getItemRequestDao().save(itemRequest);
                return String.valueOf(requestId);
    }

    public List<ItemRequest> getAllItemRequests() {
        return daoManager.getItemRequestDao().findAll();
    }

    public ItemRequest getRequestById(Long id) {
        return daoManager
                .getItemRequestDao()
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Item request not found"
                        )
                );
    }

    public List<ItemRequest> getRequestByStatus(String status) {
        return daoManager.getItemRequestDao().findByStatus(status);
    }

    public List<ItemRequest> getMyRequest(Long userId) {
        return daoManager.getItemRequestDao().findByRequestedBy(userId);
    }

    @Transactional
    public String approveRequest (Long requestId, Long adminId) {

        ItemRequest request = getRequestById(requestId);

        if (!"PENDING".equalsIgnoreCase(
                request.getStatus())) {

            throw new RuntimeException(
                    "Only pending requests can be approved"
            );
        }

        Items item = daoManager
                .getItemDao()
                .findById(request.getItemId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Item not found"
                        )
                );

        if (!Boolean.TRUE.equals(
                item.isActive())) {

            throw new RuntimeException(
                    "Item is inactive"
            );
        }

        if (!"AVAILABLE".equalsIgnoreCase(
                item.getStatus())) {

            throw new RuntimeException(
                    "Item is no longer available"
            );
        }

        if (daoManager
                .getItemAssignmentDao()
                .findActiveByItemId(request.getItemId())
                .isPresent()) {

            throw new RuntimeException(
                    "Item is already assigned"
            );
        }

        daoManager.getItemRequestDao().approve(requestId, adminId);

        return "Item request approved successfully";
    }

    @Transactional
    public String rejectRequest(Long requestId, Long adminId, ItemRequestApprovalRequest decision) {

        ItemRequest request = getRequestById(requestId);

        if (!"PENDING".equalsIgnoreCase(
                request.getStatus())) {

            throw new RuntimeException(
                    "Only pending requests can be rejected"
            );
        }

        String reason = decision == null
                        ? null
                        : decision.rejectionReason();


        if (reason == null || reason.trim().isEmpty()) {

            throw new RuntimeException(
                    "Rejection reason is required"
            );
        }

        daoManager.getItemRequestDao().reject(requestId, adminId, reason);

        return "Item request rejected";
    }

    @Transactional
    public String cancelRequest (Long requestId, Long currentUserId) {

        ItemRequest request = getRequestById(requestId);

        if (!request.getRequestedBy()
                .equals(currentUserId)) {

            throw new RuntimeException(
                    "You can only cancel your own request"
            );
        }

        if (!"PENDING".equalsIgnoreCase(
                request.getStatus())) {

            throw new RuntimeException(
                    "Only pending requests can be cancelled"
            );
        }

        daoManager.getItemRequestDao().cancel(requestId);

        return "Item request cancelled.";
    }
}
