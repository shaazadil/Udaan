package com.udaan.profile.dto;

import java.math.BigDecimal;
import java.util.List;

public class ProfileDtos {

    public static class UpdateProfileRequest {
        private String name;
        private String targetRole;
        private String education;
        private String experienceSummary;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getTargetRole() { return targetRole; }
        public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
        public String getEducation() { return education; }
        public void setEducation(String education) { this.education = education; }
        public String getExperienceSummary() { return experienceSummary; }
        public void setExperienceSummary(String experienceSummary) { this.experienceSummary = experienceSummary; }
    }

    public static class DashboardSummaryResponse {
        private Long userId;
        private String name;
        private String targetRole;
        private long totalSkillsProfiled;
        private long advancedSkillsCount;
        private BigDecimal latestCompatibilityScore;
        private double avgRoadmapCompletion;
        private double avgInterviewScore;
        private long totalNotesSaved;
        private long totalApplications;
        private String activeRoadmapTitle;
        private double readinessIndex;

        // Dynamic context fields from real database entities
        private String latestJobTitle;
        private String latestCompanyName;
        private List<String> latestMatchingSkills;
        private List<String> latestMissingSkills;
        private String latestRecommendation;
        private String latestInterviewSummary;
        private List<String> recentNoteTitles;

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getTargetRole() { return targetRole; }
        public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
        public long getTotalSkillsProfiled() { return totalSkillsProfiled; }
        public void setTotalSkillsProfiled(long totalSkillsProfiled) { this.totalSkillsProfiled = totalSkillsProfiled; }
        public long getAdvancedSkillsCount() { return advancedSkillsCount; }
        public void setAdvancedSkillsCount(long advancedSkillsCount) { this.advancedSkillsCount = advancedSkillsCount; }
        public BigDecimal getLatestCompatibilityScore() { return latestCompatibilityScore; }
        public void setLatestCompatibilityScore(BigDecimal latestCompatibilityScore) { this.latestCompatibilityScore = latestCompatibilityScore; }
        public double getAvgRoadmapCompletion() { return avgRoadmapCompletion; }
        public void setAvgRoadmapCompletion(double avgRoadmapCompletion) { this.avgRoadmapCompletion = avgRoadmapCompletion; }
        public double getAvgInterviewScore() { return avgInterviewScore; }
        public void setAvgInterviewScore(double avgInterviewScore) { this.avgInterviewScore = avgInterviewScore; }
        public long getTotalNotesSaved() { return totalNotesSaved; }
        public void setTotalNotesSaved(long totalNotesSaved) { this.totalNotesSaved = totalNotesSaved; }
        public long getTotalApplications() { return totalApplications; }
        public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }
        public String getActiveRoadmapTitle() { return activeRoadmapTitle; }
        public void setActiveRoadmapTitle(String activeRoadmapTitle) { this.activeRoadmapTitle = activeRoadmapTitle; }
        public double getReadinessIndex() { return readinessIndex; }
        public void setReadinessIndex(double readinessIndex) { this.readinessIndex = readinessIndex; }

        public String getLatestJobTitle() { return latestJobTitle; }
        public void setLatestJobTitle(String latestJobTitle) { this.latestJobTitle = latestJobTitle; }
        public String getLatestCompanyName() { return latestCompanyName; }
        public void setLatestCompanyName(String latestCompanyName) { this.latestCompanyName = latestCompanyName; }
        public List<String> getLatestMatchingSkills() { return latestMatchingSkills; }
        public void setLatestMatchingSkills(List<String> latestMatchingSkills) { this.latestMatchingSkills = latestMatchingSkills; }
        public List<String> getLatestMissingSkills() { return latestMissingSkills; }
        public void setLatestMissingSkills(List<String> latestMissingSkills) { this.latestMissingSkills = latestMissingSkills; }
        public String getLatestRecommendation() { return latestRecommendation; }
        public void setLatestRecommendation(String latestRecommendation) { this.latestRecommendation = latestRecommendation; }
        public String getLatestInterviewSummary() { return latestInterviewSummary; }
        public void setLatestInterviewSummary(String latestInterviewSummary) { this.latestInterviewSummary = latestInterviewSummary; }
        public List<String> getRecentNoteTitles() { return recentNoteTitles; }
        public void setRecentNoteTitles(List<String> recentNoteTitles) { this.recentNoteTitles = recentNoteTitles; }
    }
}
