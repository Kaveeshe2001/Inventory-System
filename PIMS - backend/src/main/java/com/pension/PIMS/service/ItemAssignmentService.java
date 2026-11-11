package com.pension.PIMS.service;

import com.pension.PIMS.data.DaoManager;
import com.pension.PIMS.data.Ifaces.ItemAssignmentDao;
import com.pension.PIMS.data.Ifaces.ItemDao;
import com.pension.PIMS.dtos.items.ItemAssignmentRequest;
import com.pension.PIMS.dtos.items.ItemReturnRequest;
import com.pension.PIMS.model.ItemAssignment;
import com.pension.PIMS.model.Items;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemAssignmentService {

    private final DaoManager daoManager;

    public ItemAssignmentService(DaoManager daoManager) {
        this.daoManager = daoManager;
    }

    @Transactional
    public String createAssignment(ItemAssignmentRequest request) {

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

        if (request.assignedTo() == null) {
            throw new RuntimeException(
                    "Assigned user ID is required"
            );
        }


        ItemDao itemDao =
                daoManager.getItemDao();

        Items item = itemDao.findById(request.itemId())
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
                    "Item is not available"
            );
        }

        ItemAssignmentDao assignmentDao = daoManager.getItemAssignmentDao();

        if (assignmentDao.findActiveByItemId(
                        request.itemId()).isPresent()) {

            throw new RuntimeException(
                    "Item is already assigned"
            );
        }

        ItemAssignment assignment = new ItemAssignment();

        assignment.setItemId(request.itemId());
        assignment.setPensionPointId(request.pensionPointId());
        assignment.setAssignedTo(request.assignedTo());
        assignment.setStatus("ASSIGNED");
        assignment.setRemarks(request.remarks());

        assignmentDao.save(assignment);

        // Change item status
        // from AVAILABLE -> ASSIGNED

        updateItemStatus(request.itemId(),"ASSIGNED");

        return "Item assign successfully.";
    }

    public ItemAssignment getById(Long id) {

        return daoManager
                .getItemAssignmentDao()
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Assignment not found"
                        )
                );
    }

    public List<ItemAssignment> getAll() {
        return daoManager.getItemAssignmentDao().findAll();
    }

    public List<ItemAssignment> getActive() {
        return daoManager.getItemAssignmentDao().findActive();
    }

    public List<ItemAssignment> getItemHistory(Long itemId) {
        return daoManager.getItemAssignmentDao().findByItemId(itemId);
    }

    public List<ItemAssignment> getUserAssignment(Long userId) {
        return daoManager.getItemAssignmentDao().findByAssignedTo(userId);
    }

    public List<ItemAssignment> getPensionPointAssignment(Long pensionPointId) {
        return daoManager.getItemAssignmentDao().findByPensionPointId(pensionPointId);
    }

    @Transactional
    public String returnItem(Long assignmentId, ItemReturnRequest request) {

        ItemAssignment assignment = getById(assignmentId);

        if (!"ASSIGNED".equalsIgnoreCase(
                assignment.getStatus())) {

            throw new RuntimeException(
                    "Item is already returned"
            );
        }


        daoManager
                .getItemAssignmentDao()
                .returnItem(
                        assignmentId,
                        request == null
                                ? null
                                : request.remarks()
                );


        // Item becomes AVAILABLE again

        updateItemStatus(
                assignment.getItemId(),
                "AVAILABLE"
        );

        return "Item returned successfully";
    }

    private void updateItemStatus(Long itemId, String status) {

        Items item = daoManager
                        .getItemDao()
                        .findById(itemId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Item not found"
                                )
                        );

        item.setStatus(status);

        daoManager
                .getItemDao()
                .update(item);

    }
}
