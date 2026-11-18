package com.pension.PIMS.data.Ifaces;

import com.pension.PIMS.model.ItemRequest;

import java.util.List;
import java.util.Optional;

public interface ItemRequestDao {
    Long save(ItemRequest request);

    Optional<ItemRequest> findById(Long id);

    List<ItemRequest> findAll();

    List<ItemRequest> findByStatus(String status);

    List<ItemRequest> findByRequestedBy(Long userId);

    void approve(
            Long requestId,
            Long approvedBy
    );

    void reject(
            Long requestId,
            Long approvedBy,
            String rejectionReason
    );

    void cancel(Long requestId);
}
