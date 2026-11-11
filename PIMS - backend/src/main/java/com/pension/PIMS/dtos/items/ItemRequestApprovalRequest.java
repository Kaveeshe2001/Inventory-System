package com.pension.PIMS.dtos.items;

public record ItemRequestApprovalRequest(
        String action,
        String rejectionReason
) {
}
