package com.pension.PIMS.dtos.items;

import java.math.BigDecimal;

public record ItemMaintenanceRequest(
        Long itemId,
        String maintenanceType,
        String problemDescription,
        String actionTaken,
        String itemCode,
        String serviceProvider,
        BigDecimal cost,
        String remarks
) {
}
