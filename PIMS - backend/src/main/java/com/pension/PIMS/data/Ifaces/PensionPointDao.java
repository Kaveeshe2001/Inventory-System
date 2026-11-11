package com.pension.PIMS.data.Ifaces;

import com.pension.PIMS.model.PensionPoint;

import java.util.List;
import java.util.Optional;

public interface PensionPointDao {

    Long save(PensionPoint pensionPoint);

    Optional<PensionPoint> findById(Long id);

    Optional<PensionPoint> findByCode(String code);

    List<PensionPoint> findAll();

    List<PensionPoint> findAllActive();

    boolean existsByCode(String code);

    void update(PensionPoint pensionPoint);

    void activate(Long id);

    void deactivate(Long id);
}
