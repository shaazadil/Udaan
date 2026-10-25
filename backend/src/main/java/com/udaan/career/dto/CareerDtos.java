package com.udaan.career.dto;

import java.math.BigDecimal;
import java.util.List;

public class CareerDtos {

    public static class ResumeRequest {
        private String title = "Primary Resume";
        private String rawText;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getRawText() { return rawText; }
        public void setRawText(String rawText) { this.rawText = rawText; }
    }

    public static class JobRequest {
        private String jobTitle;
        private String companyName;
        private String descriptionText;
        private String location = "Remote";
        private String employmentType = "Full-time";
        private List<String> requirements;

        public String getJobTitle() { return jobTitle; }
        public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }
        public String getDescriptionText() { return descriptionText; }
        public void setDescriptionText(String descriptionText) { this.descriptionText = descriptionText; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public String getEmploymentType() { return employmentType; }
        public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }
        public List<String> getRequirements() { return requirements; }
        public void setRequirements(List<String> requirements) { this.requirements = requirements; }
    }

    public static class AnalyzeRequest {
        private Long resumeId;
        private Long jobId;
        private String candidateName;
        private String experienceLevel;
        private String education;
        private String userDeclaredSkills;
        private String customResumeText;
        private String customJobTitle;
        private String customCompanyName;
        private String customJobDescription;
        private List<String> customRequirements;

        public Long getResumeId() { return resumeId; }
        public void setResumeId(Long resumeId) { this.resumeId = resumeId; }
        public Long getJobId() { return jobId; }
        public void setJobId(Long jobId) { this.jobId = jobId; }
        public String getCandidateName() { return candidateName; }
        public void setCandidateName(String candidateName) { this.candidateName = candidateName; }
        public String getExperienceLevel() { return experienceLevel; }
        public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }
        public String getEducation() { return education; }
        public void setEducation(String education) { this.education = education; }
        public String getUserDeclaredSkills() { return userDeclaredSkills; }
        public void setUserDeclaredSkills(String userDeclaredSkills) { this.userDeclaredSkills = userDeclaredSkills; }
        public String getCustomResumeText() { return customResumeText; }
        public void setCustomResumeText(String customResumeText) { this.customResumeText = customResumeText; }
        public String getCustomJobTitle() { return customJobTitle; }
        public void setCustomJobTitle(String customJobTitle) { this.customJobTitle = customJobTitle; }
        public String getCustomCompanyName() { return customCompanyName; }
        public void setCustomCompanyName(String customCompanyName) { this.customCompanyName = customCompanyName; }
        public String getCustomJobDescription() { return customJobDescription; }
        public void setCustomJobDescription(String customJobDescription) { this.customJobDescription = customJobDescription; }
        public List<String> getCustomRequirements() { return customRequirements; }
        public void setCustomRequirements(List<String> customRequirements) { this.customRequirements = customRequirements; }
    }

    public static class AnalysisResponse {
        private Long id;
        private Long resumeId;
        private Long jobId;
        private String jobTitle;
        private String companyName;
        private BigDecimal compatibilityScore;
        private List<String> matchingSkills;
        private List<String> missingSkills;
        private String recommendations;
        private String coverLetterDraft;
        private String createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getResumeId() { return resumeId; }
        public void setResumeId(Long resumeId) { this.resumeId = resumeId; }
        public Long getJobId() { return jobId; }
        public void setJobId(Long jobId) { this.jobId = jobId; }
        public String getJobTitle() { return jobTitle; }
        public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }
        public BigDecimal getCompatibilityScore() { return compatibilityScore; }
        public void setCompatibilityScore(BigDecimal compatibilityScore) { this.compatibilityScore = compatibilityScore; }
        public List<String> getMatchingSkills() { return matchingSkills; }
        public void setMatchingSkills(List<String> matchingSkills) { this.matchingSkills = matchingSkills; }
        public List<String> getMissingSkills() { return missingSkills; }
        public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }
        public String getRecommendations() { return recommendations; }
        public void setRecommendations(String recommendations) { this.recommendations = recommendations; }
        public String getCoverLetterDraft() { return coverLetterDraft; }
        public void setCoverLetterDraft(String coverLetterDraft) { this.coverLetterDraft = coverLetterDraft; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    public static class ApplicationRequest {
        private Long jobId;
        private String status = "SAVED";
        private String appliedDate;
        private String notes;
        private String salaryOffered;

        public Long getJobId() { return jobId; }
        public void setJobId(Long jobId) { this.jobId = jobId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getAppliedDate() { return appliedDate; }
        public void setAppliedDate(String appliedDate) { this.appliedDate = appliedDate; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public String getSalaryOffered() { return salaryOffered; }
        public void setSalaryOffered(String salaryOffered) { this.salaryOffered = salaryOffered; }
    }
}
