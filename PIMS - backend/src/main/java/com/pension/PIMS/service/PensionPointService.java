package com.pension.PIMS.service;

import com.pension.PIMS.data.DaoManager;
import com.pension.PIMS.dtos.pensionPoint.PensionPointRequest;
import com.pension.PIMS.model.PensionPoint;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PensionPointService {

    private final DaoManager daoManager;

    public PensionPointService(DaoManager daoManager) {
        this.daoManager = daoManager;
    }

    public String createPensionPoints(PensionPointRequest request) {

        validate(request);

        String code = request.code().trim().toUpperCase();

        if (daoManager
                .getPensionPointDao()
                .existsByCode(code)) {

            throw new RuntimeException(
                    "Pension point code already exists"
            );
        }

        PensionPoint pensionPoint = new PensionPoint();

        pensionPoint.setCode(code);
        pensionPoint.setName(request.name().trim());
        pensionPoint.setAddress(request.address());
        pensionPoint.setTelephone(request.telephone());
        pensionPoint.setEmail(request.email());
        pensionPoint.setPensionFiles(request.pensionFiles());
        pensionPoint.setActive(true);

        daoManager.getPensionPointDao().save(pensionPoint);

        return "Pension point added successfully.";
    }

    public PensionPoint getById(Long id) {

        return daoManager
                .getPensionPointDao()
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Pension point not found"
                        )
                );
    }

    public PensionPoint getByCode(String code) {

        return daoManager
                .getPensionPointDao()
                .findByCode(code)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Pension point not found"
                        )
                );
    }

    public List<PensionPoint> getAll() {
        return daoManager.getPensionPointDao().findAll();
    }

    public List<PensionPoint> getAllActive() {
        return daoManager.getPensionPointDao().findAllActive();
    }

    public String update (Long id, PensionPointRequest request) {

        validate(request);

        PensionPoint existing = getById(id);

        String code = request.code().trim().toUpperCase();

        if (!existing.getCode().equals(code)
                && daoManager
                .getPensionPointDao()
                .existsByCode(code)) {

            throw new RuntimeException(
                    "Pension point code already exists"
            );
        }

        existing.setCode(code);
        existing.setName(request.name().trim());
        existing.setAddress(request.address());
        existing.setTelephone(request.telephone());
        existing.setEmail(request.email());
        existing.setPensionFiles(request.pensionFiles());

        daoManager.getPensionPointDao().update(existing);

        return "Pension point updated successfully.";
    }

    public void activate(Long id) {
        getById(id);

        daoManager.getPensionPointDao().activate(id);
    }

    public void deactivated(Long id) {
        getById(id);

        daoManager.getPensionPointDao().deactivate(id);
    }

    private void validate(PensionPointRequest request) {

        if (request == null) {
            throw new RuntimeException(
                    "Request is required"
            );
        }

        if (request.code() == null ||
                request.code().isBlank()) {

            throw new RuntimeException(
                    "Pension point code is required"
            );
        }

        if (request.name() == null ||
                request.name().isBlank()) {

            throw new RuntimeException(
                    "Pension point name is required"
            );
        }
    }
}
