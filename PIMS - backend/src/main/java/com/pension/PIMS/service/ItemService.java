package com.pension.PIMS.service;

import com.pension.PIMS.data.DaoManager;
import com.pension.PIMS.dtos.items.ItemRequest;
import com.pension.PIMS.model.Category;
import com.pension.PIMS.model.Items;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemService {

    private final DaoManager daoManager;

    public ItemService(DaoManager daoManager) {
        this.daoManager = daoManager;
    }

    public String createItem (ItemRequest request) {

        if (request.itemCode() == null || request.itemCode().trim().isEmpty()) {
            throw new IllegalArgumentException ("Item code is required");
        }

        if (request.name() == null || request.name().trim().isEmpty()) {
            throw new IllegalArgumentException ("Item name is required");
        }

        if (request.categoryId() == null) {

            throw new IllegalArgumentException(
                    "Category is required"
            );
        }

        // Check category exists
        daoManager
                .getCategoryDao()
                .findById(request.categoryId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Category not found"
                        )
                );

        if (daoManager
                .getItemDao()
                .existsByItemCode(request.itemCode())) {

            throw new IllegalArgumentException(
                    "Item code already exists"
            );
        }

        if (request.serialNumber() != null &&
                !request.serialNumber().trim().isEmpty() &&
                daoManager
                        .getItemDao()
                        .existsBySerialNumber(
                                request.serialNumber()
                        )) {

            throw new IllegalArgumentException(
                    "Serial number already exists"
            );
        }

        Items item = new Items();

        item.setItemCode(
                request.itemCode().trim()
        );

        item.setName(
                request.name().trim()
        );

        item.setCategoryId(request.categoryId());
        item.setBrand(request.brand());
        item.setModel(request.model());
        item.setSerialNumber(request.serialNumber());
        item.setPurchaseDate(request.purchaseDate());
        item.setPurchasePrice(request.purchasePrice());
        item.setWarrantyExpiry(request.warrantyExpiry());

        item.setCondition(
                request.itemCondition() != null
                        ? request.itemCondition()
                        : "NEW"
        );

        item.setStatus(
                request.status() != null
                        ? request.status()
                        : "AVAILABLE"
        );

        item.setLocation(request.location());
        item.setDescription(request.description());
        item.setActive(true);

        daoManager.getItemDao().save(item);

        return "Item added successfully.";

    }

    public List<Items> getAlItems() {
        return daoManager.getItemDao().findAll();
    }

    public List<Items> getActiveItems() {
        return daoManager.getItemDao().findAllActive();
    }

    public Items getItemsById(Long id) {

        return daoManager
                .getItemDao()
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Item not found with id: " + id
                        )
                );
    }

    public List<Items> getItemsByCategory(Long categoryId) {
        return daoManager.getItemDao().findByCategoryId(categoryId);
    }

    public String updateItem (Long id, ItemRequest request) {

        Items existing = daoManager
                            .getItemDao()
                            .findById(id)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Item not found with id: " + id
                                    )
                            );

        if (!existing.getItemCode()
                .equalsIgnoreCase(request.itemCode())
                && daoManager
                .getItemDao()
                .existsByItemCode(request.itemCode())) {

            throw new IllegalArgumentException(
                    "Item code already exists"
            );
        }

        if (request.categoryId() == null) {
            throw new IllegalArgumentException(
                    "Category is required"
            );
        }

        daoManager
                .getCategoryDao()
                .findById(request.categoryId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Category not found"
                        )
                );

        existing.setItemCode(request.itemCode());
        existing.setName(request.name());
        existing.setCategoryId(request.categoryId());
        existing.setBrand(request.brand());
        existing.setModel(request.model());
        existing.setSerialNumber(request.serialNumber());
        existing.setPurchaseDate(request.purchaseDate());
        existing.setPurchasePrice(request.purchasePrice());
        existing.setWarrantyExpiry(request.warrantyExpiry());
        existing.setCondition(request.itemCondition());
        existing.setStatus(request.status());
        existing.setLocation(request.location());
        existing.setDescription(request.description());

        daoManager.getItemDao().update(existing);

        return "Item updated successfully.";

    }

    public String deleteItem (Long id) {

        Items existing = daoManager.getItemDao()
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Item not found with id: " + id
                        )
                );

        daoManager.getItemDao().delete(existing.getId());

        return "Item deleted successfully.";
    }
}
