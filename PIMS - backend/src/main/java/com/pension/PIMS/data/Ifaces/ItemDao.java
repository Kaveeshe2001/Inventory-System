package com.pension.PIMS.data.Ifaces;

import com.pension.PIMS.model.Items;

import java.util.List;
import java.util.Optional;

public interface ItemDao {
    Long save(Items items);

    boolean existsByItemCode(String itemCode);

    boolean existsBySerialNumber(String serialNumber);

    Optional<Items> findById(Long id);

    List<Items> findAll();

    List<Items> findAllActive();

    List<Items> findByCategoryId(Long categoryId);

    void update(Items items);

    void updateStatus(Long itemId, String status);

    void delete(Long id);
}
