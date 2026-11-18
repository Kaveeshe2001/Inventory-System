package com.pension.PIMS.data.Ifaces;
import com.pension.PIMS.model.ItemMaintanance;

import java.util.List;
import java.util.Optional;

public interface ItemMaintenanceDao {

    Long save(ItemMaintanance maintenance);

    Optional<ItemMaintanance> findById(Long id);

    List<ItemMaintanance> findAll();

    List<ItemMaintanance> findByItemId(Long itemId);

    List<ItemMaintanance> findByStatus(String status);

    void updateStatus(
            Long id,
            String status
    );

    void completeMaintenance(
            Long id,
            String accessoryCode,
            String actionTaken,
            String remarks,
            java.math.BigDecimal cost
    );

    void cancelMaintenance(Long id);
}
