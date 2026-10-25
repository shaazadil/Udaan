package com.udaan.ai.entity;

import com.udaan.profile.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_interactions")
public class AiInteraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 50)
    private String module;

    @Column(name = "operation_type", nullable = false, length = 100)
    private String operationType;

    @Column(name = "model_used", nullable = false, length = 80)
    private String modelUsed = "llama-3.3-70b-versatile";

    @Column(name = "duration_ms", nullable = false)
    private Integer durationMs = 0;

    @Column(name = "status_code", nullable = false, length = 20)
    private String statusCode = "SUCCESS";

    @Lob
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public AiInteraction() {}

    public AiInteraction(User user, String module, String operationType, String modelUsed, Integer durationMs, String statusCode) {
        this.user = user;
        this.module = module;
        this.operationType = operationType;
        this.modelUsed = modelUsed;
        this.durationMs = durationMs;
        this.statusCode = statusCode;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getModule() { return module; }
    public void setModule(String module) { this.module = module; }

    public String getOperationType() { return operationType; }
    public void setOperationType(String operationType) { this.operationType = operationType; }

    public String getModelUsed() { return modelUsed; }
    public void setModelUsed(String modelUsed) { this.modelUsed = modelUsed; }

    public Integer getDurationMs() { return durationMs; }
    public void setDurationMs(Integer durationMs) { this.durationMs = durationMs; }

    public String getStatusCode() { return statusCode; }
    public void setStatusCode(String statusCode) { this.statusCode = statusCode; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
