package com.pension.PIMS.dtos.items;

public record ItemAssignmentRequest(
        Long itemId,
        Long pensionPointId,
        Long assignedTo,
        String remarks
) {
}
