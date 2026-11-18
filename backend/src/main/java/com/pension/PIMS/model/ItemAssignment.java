package com.pension.PIMS.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.LocalDateTime;

@Entity
public class ItemAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long itemId;

    private Long pensionPointId;

    private Long assignedTo;

    private LocalDateTime assignedAt;

    private LocalDateTime returnedAt;

    private String status;

    private String remarks;

    public ItemAssignment() {
    }

    public ItemAssignment(Long id, Long itemId, Long pensionPointId, Long assignedTo, LocalDateTime assignedAt, LocalDateTime returnedAt, String status, String remarks) {
        this.id = id;
        this.itemId = itemId;
        this.pensionPointId = pensionPointId;
        this.assignedTo = assignedTo;
        this.assignedAt = assignedAt;
        this.returnedAt = returnedAt;
        this.status = status;
        this.remarks = remarks;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public Long getPensionPointId() {
        return pensionPointId;
    }

    public void setPensionPointId(Long pensionPointId) {
        this.pensionPointId = pensionPointId;
    }

    public Long getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(Long assignedTo) {
        this.assignedTo = assignedTo;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public LocalDateTime getReturnedAt() {
        return returnedAt;
    }

    public void setReturnedAt(LocalDateTime returnedAt) {
        this.returnedAt = returnedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
