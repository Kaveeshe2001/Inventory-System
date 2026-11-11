package com.pension.PIMS.service;

import com.pension.PIMS.data.DaoManager;
import com.pension.PIMS.dtos.items.ItemMaintenanceRequest;
import com.pension.PIMS.model.ItemMaintanance;
import com.pension.PIMS.model.Items;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ItemMaintenanceService {

    private final DaoManager daoManager;

    public ItemMaintenanceService(DaoManager daoManager) {
        this.daoManager = daoManager;
    }

    @Transactional
    public Long createMaintenance(ItemMaintenanceRequest request) {

        if (request.itemId() == null) {
            throw new RuntimeException(
                    "Item ID is required"
            );
        }

        if (request.maintenanceType() == null || request.maintenanceType().isBlank()) {

            throw new RuntimeException(
                    "Maintenance type is required"
            );
        }

        if (request.problemDescription() == null || request.problemDescription().isBlank()) {

            throw new RuntimeException(
                    "Problem description is required"
            );
        }


        Items item = daoManager
                        .getItemDao()
                        .findById(request.itemId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Item not found"
                                )
                        );

        if (!Boolean.TRUE.equals(item.isActive())) {

            throw new RuntimeException(
                    "Cannot create maintenance for inactive item"
            );
        }

        String currentStatus = item.getStatus();


        if ("UNDER_REPAIR".equalsIgnoreCase(currentStatus)) {

            throw new RuntimeException(
                    "Item is already under repair"
            );
        }


        if ("DISPOSED".equalsIgnoreCase(currentStatus)) {

            throw new RuntimeException(
                    "Disposed item cannot be sent for maintenance"
            );
        }

        ItemMaintanance maintenance = new ItemMaintanance();

        maintenance.setItemId(request.itemId());
        maintenance.setMaintenanceType(request.maintenanceType());
        maintenance.setProblemDescription(request.problemDescription());
        maintenance.setActionTaken(request.actionTaken());
        maintenance.setServiceProvider(request.serviceProvider());

        maintenance.setCost(request.cost() == null
                        ? BigDecimal.ZERO
                        : request.cost()
        );

        maintenance.setRemarks(request.remarks());
        maintenance.setStartedAt(LocalDateTime.now());
        maintenance.setStatus("OPEN");


        Long maintenanceId =daoManager.getItemMaintenanceDao().save(maintenance);


        daoManager.getItemDao().updateStatus(request.itemId(),"UNDER_REPAIR");

        return maintenanceId;
    }


    public ItemMaintanance getById(Long id) {

        return daoManager
                .getItemMaintenanceDao()
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Maintenance record not found"
                        )
                );

    }

    public List<ItemMaintanance> getAll() {
        return daoManager.getItemMaintenanceDao().findAll();
    }

    public List<ItemMaintanance> getByItemId(Long itemId) {
        return daoManager.getItemMaintenanceDao().findByItemId(itemId);
    }

    public List<ItemMaintanance> getByStatus(String status) {
        return daoManager.getItemMaintenanceDao().findByStatus(status);
    }

    @Transactional
    public void startMaintenance(Long id) {

        ItemMaintanance maintenance = getById(id);

        if (!"OPEN".equalsIgnoreCase(maintenance.getStatus())) {

            throw new RuntimeException(
                    "Only OPEN maintenance can be started"
            );
        }

        daoManager.getItemMaintenanceDao().updateStatus(id, "IN_PROGRESS");
    }

    @Transactional
    public void completeMaintenance(Long id, ItemMaintenanceRequest request) {

        ItemMaintanance maintenance = getById(id);

        if (!"OPEN".equalsIgnoreCase(maintenance.getStatus()) &&
                !"IN_PROGRESS".equalsIgnoreCase(maintenance.getStatus())) {

            throw new RuntimeException(
                    "Maintenance cannot be completed"
            );
        }

        daoManager.getItemMaintenanceDao().completeMaintenance(
                id,
                request.itemCode(),
                request.actionTaken(),
                request.remarks(),
                request.cost()
        );

        Items item = daoManager.getItemDao()
                .findById(
                        maintenance.getItemId()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Item not found"
                        )
                );

        String newItemStatus = "AVAILABLE";


        if (daoManager.getItemAssignmentDao()
                .findActiveByItemId(
                        maintenance.getItemId()
                )
                .isPresent()) {

            newItemStatus = "ASSIGNED";
        }

        daoManager.getItemDao().updateStatus(item.getId(),newItemStatus);
    }

    @Transactional
    public void cancelMaintenance(Long id) {

        ItemMaintanance maintenance = getById(id);

        if ("COMPLETED".equalsIgnoreCase(maintenance.getStatus())) {

            throw new RuntimeException(
                    "Completed maintenance cannot be cancelled"
            );
        }

        daoManager.getItemMaintenanceDao().cancelMaintenance(id);

        Items item = daoManager.getItemDao()
                .findById(
                        maintenance.getId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Item not found"
                        )
                );

        String newItemStatus = "AVAILABLE";

        if (daoManager.getItemAssignmentDao()
                .findActiveByItemId(
                        maintenance.getItemId()
                )
                .isPresent()) {

            newItemStatus = "ASSIGNED";
        }

        daoManager.getItemDao().updateStatus(item.getId(),newItemStatus);
    }
}
