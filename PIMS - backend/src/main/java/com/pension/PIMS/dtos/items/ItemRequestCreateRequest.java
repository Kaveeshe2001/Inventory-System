package com.pension.PIMS.dtos.items;

public record ItemRequestCreateRequest(
        Long itemId,
        Long pensionPointId,
        String pensionFiles,
        String reason
) {
}
