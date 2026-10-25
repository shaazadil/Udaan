package com.udaan.career.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "resume_analyses")
public class ResumeAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(name = "compatibility_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal compatibilityScore;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "matching_skills", columnDefinition = "JSON")
    private String matchingSkills;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "missing_skills", columnDefinition = "JSON")
    private String missingSkills;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String recommendations;

    @Lob
    @Column(name = "cover_letter_draft", columnDefinition = "TEXT")
    private String coverLetterDraft;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public ResumeAnalysis() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Resume getResume() { return resume; }
    public void setResume(Resume resume) { this.resume = resume; }

    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }

    public BigDecimal getCompatibilityScore() { return compatibilityScore; }
    public void setCompatibilityScore(BigDecimal compatibilityScore) { this.compatibilityScore = compatibilityScore; }

    public String getMatchingSkills() { return matchingSkills; }
    public void setMatchingSkills(String matchingSkills) { this.matchingSkills = matchingSkills; }

    public String getMissingSkills() { return missingSkills; }
    public void setMissingSkills(String missingSkills) { this.missingSkills = missingSkills; }

    public String getRecommendations() { return recommendations; }
    public void setRecommendations(String recommendations) { this.recommendations = recommendations; }

    public String getCoverLetterDraft() { return coverLetterDraft; }
    public void setCoverLetterDraft(String coverLetterDraft) { this.coverLetterDraft = coverLetterDraft; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
