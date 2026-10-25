package com.udaan.skills.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "roadmap_milestones")
public class RoadmapMilestone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roadmap_id", nullable = false)
    private LearningRoadmap roadmap;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id")
    private Skill skill;

    @Column(nullable = false, length = 255)
    private String title;

    @Lob
    @Column(name = "concept_explanation", columnDefinition = "TEXT")
    private String conceptExplanation;

    @Column(name = "step_order", nullable = false)
    private Integer stepOrder = 1;

    @Column(name = "estimated_hours", nullable = false)
    private Integer estimatedHours = 5;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MilestoneStatus status = MilestoneStatus.NOT_STARTED;

    @Lob
    @Column(name = "practice_task", columnDefinition = "TEXT")
    private String practiceTask;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum MilestoneStatus {
        NOT_STARTED, IN_PROGRESS, COMPLETED
    }

    public RoadmapMilestone() {}

    public RoadmapMilestone(LearningRoadmap roadmap, Skill skill, String title, Integer stepOrder, Integer estimatedHours, String conceptExplanation, String practiceTask) {
        this.roadmap = roadmap;
        this.skill = skill;
        this.title = title;
        this.stepOrder = stepOrder;
        this.estimatedHours = estimatedHours;
        this.conceptExplanation = conceptExplanation;
        this.practiceTask = practiceTask;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LearningRoadmap getRoadmap() { return roadmap; }
    public void setRoadmap(LearningRoadmap roadmap) { this.roadmap = roadmap; }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getConceptExplanation() { return conceptExplanation; }
    public void setConceptExplanation(String conceptExplanation) { this.conceptExplanation = conceptExplanation; }

    public Integer getStepOrder() { return stepOrder; }
    public void setStepOrder(Integer stepOrder) { this.stepOrder = stepOrder; }

    public Integer getEstimatedHours() { return estimatedHours; }
    public void setEstimatedHours(Integer estimatedHours) { this.estimatedHours = estimatedHours; }

    public MilestoneStatus getStatus() { return status; }
    public void setStatus(MilestoneStatus status) { this.status = status; }

    public String getPracticeTask() { return practiceTask; }
    public void setPracticeTask(String practiceTask) { this.practiceTask = practiceTask; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
