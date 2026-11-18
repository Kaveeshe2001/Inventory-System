package com.pension.PIMS.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
public class ItemMaintanance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long itemId;

    private String itemCode;

    private String maintenanceType;

    private String problemDescription;

    private String actionTaken;

    private String serviceProvider;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    private BigDecimal cost;

    private String status;

    private String remarks;

    private LocalDateTime createdAt;

    public ItemMaintanance() {
    }

    public ItemMaintanance(Long id, Long itemId, String itemCode, String maintenanceType, String problemDescription, String actionTaken, String serviceProvider, LocalDateTime startedAt, LocalDateTime completedAt, BigDecimal cost, String status, String remarks, LocalDateTime createdAt) {
        this.id = id;
        this.itemId = itemId;
        this.itemCode = itemCode;
        this.maintenanceType = maintenanceType;
        this.problemDescription = problemDescription;
        this.actionTaken = actionTaken;
        this.serviceProvider = serviceProvider;
        this.startedAt = startedAt;
        this.completedAt = completedAt;
        this.cost = cost;
        this.status = status;
        this.remarks = remarks;
        this.createdAt = createdAt;
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

    public String getItemCode() {
        return itemCode;
    }

    public void setItemCode(String itemCode) {
        this.itemCode = itemCode;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public String getMaintenanceType() {
        return maintenanceType;
    }

    public void setMaintenanceType(String maintenanceType) {
        this.maintenanceType = maintenanceType;
    }

    public String getProblemDescription() {
        return problemDescription;
    }

    public void setProblemDescription(String problemDescription) {
        this.problemDescription = problemDescription;
    }

    public String getActionTaken() {
        return actionTaken;
    }

    public void setActionTaken(String actionTaken) {
        this.actionTaken = actionTaken;
    }

    public String getServiceProvider() {
        return serviceProvider;
    }

    public void setServiceProvider(String serviceProvider) {
        this.serviceProvider = serviceProvider;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public BigDecimal getCost() {
        return cost;
    }

    public void setCost(BigDecimal cost) {
        this.cost = cost;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
