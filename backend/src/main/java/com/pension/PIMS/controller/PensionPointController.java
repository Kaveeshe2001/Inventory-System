package com.pension.PIMS.controller;

import com.pension.PIMS.dtos.pensionPoint.PensionPointRequest;
import com.pension.PIMS.model.PensionPoint;
import com.pension.PIMS.service.PensionPointService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pension-points")
@CrossOrigin(maxAge = 3600)
public class PensionPointController {

    private final PensionPointService service;

    public PensionPointController(PensionPointService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<String> create(@RequestBody PensionPointRequest request) {

        String results = service.createPensionPoints(request);
        return ResponseEntity.ok(results);
    }

    @GetMapping
    public ResponseEntity<List<PensionPoint>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<PensionPoint>> getAllActive() {
        return ResponseEntity.ok(service.getAllActive());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PensionPoint> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<PensionPoint> getByCode(@PathVariable String code) {
        return ResponseEntity.ok(service.getByCode(code));
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> update(@PathVariable Long id, @RequestBody PensionPointRequest request) {

        String results = service.update(id, request);
        return ResponseEntity.ok(results);
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<String> activate(@PathVariable Long id) {

        service.activate(id);
        return ResponseEntity.ok("Pension point activated successfully");
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<String> deactivate(@PathVariable Long id) {

        service.deactivated(id);
        return ResponseEntity.ok("Pension point deactivated successfully");
    }
}
