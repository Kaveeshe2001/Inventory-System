package com.pension.PIMS.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.LocalDateTime;

@Entity
public class ItemRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private Long itemId;

    private Long requestedBy;

    private Long pensionPointId;

    private Long pensionFiles;

    private String reason;

    private String status;

    private LocalDateTime requestedAt;

    private Long approvedBy;

    private LocalDateTime approvedAt;

    private String rejectionReason;

    public ItemRequest() {
    }

    public ItemRequest(Long id, Long itemId, Long requestedBy, Long pensionPointId, Long pensionFiles, String reason, String status, LocalDateTime requestedAt, Long approvedBy, LocalDateTime approvedAt, String rejectionReason) {
        this.id = id;
        this.itemId = itemId;
        this.requestedBy = requestedBy;
        this.pensionPointId = pensionPointId;
        this.pensionFiles = pensionFiles;
        this.reason = reason;
        this.status = status;
        this.requestedAt = requestedAt;
        this.approvedBy = approvedBy;
        this.approvedAt = approvedAt;
        this.rejectionReason = rejectionReason;
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

    public Long getRequestedBy() {
        return requestedBy;
    }

    public void setRequestedBy(Long requestedBy) {
        this.requestedBy = requestedBy;
    }

    public Long getPensionPointId() {
        return pensionPointId;
    }

    public void setPensionPointId(Long pensionPointId) {
        this.pensionPointId = pensionPointId;
    }

    public Long getPensionFiles() {
        return pensionFiles;
    }

    public void setPensionFiles(Long pensionFiles) {
        this.pensionFiles = pensionFiles;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }

    public Long getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(Long approvedBy) {
        this.approvedBy = approvedBy;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}
