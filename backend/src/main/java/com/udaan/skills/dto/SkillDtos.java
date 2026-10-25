package com.udaan.skills.dto;

import java.util.List;

public class SkillDtos {

    public static class UserSkillRequest {
        private String skillName;
        private String category = "General";
        private String proficiencyLevel = "INTERMEDIATE";
        private String evidenceSource = "MANUAL_DECLARATION";
        private String evidenceDescription;

        public String getSkillName() { return skillName; }
        public void setSkillName(String skillName) { this.skillName = skillName; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getProficiencyLevel() { return proficiencyLevel; }
        public void setProficiencyLevel(String proficiencyLevel) { this.proficiencyLevel = proficiencyLevel; }
        public String getEvidenceSource() { return evidenceSource; }
        public void setEvidenceSource(String evidenceSource) { this.evidenceSource = evidenceSource; }
        public String getEvidenceDescription() { return evidenceDescription; }
        public void setEvidenceDescription(String evidenceDescription) { this.evidenceDescription = evidenceDescription; }
    }

    public static class SkillGapResponse {
        private String targetRole;
        private Long jobId;
        private List<String> demonstratedSkills;
        private List<String> criticalGaps;
        private List<String> partialSkills;
        private int totalGaps;

        public String getTargetRole() { return targetRole; }
        public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
        public Long getJobId() { return jobId; }
        public void setJobId(Long jobId) { this.jobId = jobId; }
        public List<String> getDemonstratedSkills() { return demonstratedSkills; }
        public void setDemonstratedSkills(List<String> demonstratedSkills) { this.demonstratedSkills = demonstratedSkills; }
        public List<String> getCriticalGaps() { return criticalGaps; }
        public void setCriticalGaps(List<String> criticalGaps) { this.criticalGaps = criticalGaps; }
        public List<String> getPartialSkills() { return partialSkills; }
        public void setPartialSkills(List<String> partialSkills) { this.partialSkills = partialSkills; }
        public int getTotalGaps() { return totalGaps; }
        public void setTotalGaps(int totalGaps) { this.totalGaps = totalGaps; }
    }

    public static class RoadmapRequest {
        private String targetRole;
        private Long jobId;
        private String focusArea;

        public String getTargetRole() { return targetRole; }
        public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
        public Long getJobId() { return jobId; }
        public void setJobId(Long jobId) { this.jobId = jobId; }
        public String getFocusArea() { return focusArea; }
        public void setFocusArea(String focusArea) { this.focusArea = focusArea; }
    }

    public static class RoadmapResponse {
        private Long id;
        private String title;
        private String targetRole;
        private String description;
        private String status;
        private double progressPercentage;
        private int totalHours;
        private List<MilestoneDto> milestones;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getTargetRole() { return targetRole; }
        public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public double getProgressPercentage() { return progressPercentage; }
        public void setProgressPercentage(double progressPercentage) { this.progressPercentage = progressPercentage; }
        public int getTotalHours() { return totalHours; }
        public void setTotalHours(int totalHours) { this.totalHours = totalHours; }
        public List<MilestoneDto> getMilestones() { return milestones; }
        public void setMilestones(List<MilestoneDto> milestones) { this.milestones = milestones; }
    }

    public static class MilestoneDto {
        private Long id;
        private String title;
        private String skillName;
        private int stepOrder;
        private int estimatedHours;
        private String status;
        private String conceptExplanation;
        private String practiceTask;
        private String completedAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getSkillName() { return skillName; }
        public void setSkillName(String skillName) { this.skillName = skillName; }
        public int getStepOrder() { return stepOrder; }
        public void setStepOrder(int stepOrder) { this.stepOrder = stepOrder; }
        public int getEstimatedHours() { return estimatedHours; }
        public void setEstimatedHours(int estimatedHours) { this.estimatedHours = estimatedHours; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getConceptExplanation() { return conceptExplanation; }
        public void setConceptExplanation(String conceptExplanation) { this.conceptExplanation = conceptExplanation; }
        public String getPracticeTask() { return practiceTask; }
        public void setPracticeTask(String practiceTask) { this.practiceTask = practiceTask; }
        public String getCompletedAt() { return completedAt; }
        public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }
    }
}
