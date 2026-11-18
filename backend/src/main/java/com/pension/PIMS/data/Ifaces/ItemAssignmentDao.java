package com.pension.PIMS.data.Ifaces;

import com.pension.PIMS.model.ItemAssignment;

import java.util.List;
import java.util.Optional;

public interface ItemAssignmentDao {
    Long save(ItemAssignment assignment);

    Optional<ItemAssignment> findById(Long id);

    List<ItemAssignment> findAll();

    List<ItemAssignment> findActive();

    List<ItemAssignment> findByItemId(Long itemId);

    List<ItemAssignment> findByAssignedTo(Long userId);

    List<ItemAssignment> findByPensionPointId(Long pensionPointId);

    Optional<ItemAssignment> findActiveByItemId(Long itemId);

    void returnItem(Long assignmentId, String remarks);
}
