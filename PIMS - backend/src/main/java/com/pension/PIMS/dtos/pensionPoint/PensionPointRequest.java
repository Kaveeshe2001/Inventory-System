package com.pension.PIMS.dtos.pensionPoint;

public record PensionPointRequest(
        String code,
        String name,
        String address,
        String telephone,
        String email,
        String pensionFiles
) {
}
