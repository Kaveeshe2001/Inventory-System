package com.pension.PIMS.dtos.items;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ItemRequest(
        String itemCode,
        String name,
        Long categoryId,
        String brand,
        String model,
        String serialNumber,
        LocalDate purchaseDate,
        BigDecimal purchasePrice,
        LocalDate warrantyExpiry,
        String itemCondition,
        String status,
        String location,
        String description
) {
}
