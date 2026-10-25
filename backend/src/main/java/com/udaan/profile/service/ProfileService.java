package com.udaan.profile.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.udaan.career.entity.ResumeAnalysis;
import com.udaan.career.repository.ApplicationRepository;
import com.udaan.career.repository.ResumeAnalysisRepository;
import com.udaan.interview.entity.InterviewSession;
import com.udaan.interview.repository.InterviewSessionRepository;
import com.udaan.knowledge.entity.Document;
import com.udaan.knowledge.repository.DocumentRepository;
import com.udaan.profile.dto.ProfileDtos.*;
import com.udaan.profile.entity.User;
import com.udaan.profile.repository.UserRepository;
import com.udaan.skills.entity.LearningRoadmap;
import com.udaan.skills.entity.RoadmapMilestone;
import com.udaan.skills.entity.UserSkill;
import com.udaan.skills.repository.LearningRoadmapRepository;
import com.udaan.skills.repository.RoadmapMilestoneRepository;
import com.udaan.skills.repository.UserSkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final LearningRoadmapRepository roadmapRepository;
    private final RoadmapMilestoneRepository milestoneRepository;
    private final InterviewSessionRepository sessionRepository;
    private final DocumentRepository documentRepository;
    private final ApplicationRepository applicationRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ProfileService(UserRepository userRepository,
                          UserSkillRepository userSkillRepository,
                          ResumeAnalysisRepository resumeAnalysisRepository,
                          LearningRoadmapRepository roadmapRepository,
                          RoadmapMilestoneRepository milestoneRepository,
                          InterviewSessionRepository sessionRepository,
                          DocumentRepository documentRepository,
                          ApplicationRepository applicationRepository) {
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
        this.resumeAnalysisRepository = resumeAnalysisRepository;
        this.roadmapRepository = roadmapRepository;
        this.milestoneRepository = milestoneRepository;
        this.sessionRepository = sessionRepository;
        this.documentRepository = documentRepository;
        this.applicationRepository = applicationRepository;
    }

    public User getUserProfile(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
    }

    @Transactional
    public User updateProfile(Long userId, UpdateProfileRequest req) {
        User user = getUserProfile(userId);
        if (req.getName() != null) user.setName(req.getName());
        if (req.getTargetRole() != null) user.setTargetRole(req.getTargetRole());
        if (req.getEducation() != null) user.setEducation(req.getEducation());
        if (req.getExperienceSummary() != null) user.setExperienceSummary(req.getExperienceSummary());
        return userRepository.save(user);
    }

    public DashboardSummaryResponse getDashboardSummary(Long userId) {
        User user = getUserProfile(userId);

        long skillsCount = userSkillRepository.countByUserId(userId);
        long advancedSkills = userSkillRepository.countByUserIdAndProficiencyLevel(userId, UserSkill.ProficiencyLevel.ADVANCED);

        DashboardSummaryResponse res = new DashboardSummaryResponse();
        res.setUserId(user.getId());
        res.setName(user.getName());
        res.setTargetRole(user.getTargetRole());
        res.setTotalSkillsProfiled(skillsCount);
        res.setAdvancedSkillsCount(advancedSkills);

        // Resume analysis - completely dynamic from MySQL
        Optional<ResumeAnalysis> latestAnalysis = resumeAnalysisRepository.findLatestByUserId(userId);
        BigDecimal matchScore = null;
        if (latestAnalysis.isPresent()) {
            ResumeAnalysis ra = latestAnalysis.get();
            matchScore = ra.getCompatibilityScore();
            res.setLatestCompatibilityScore(matchScore);
            if (ra.getJob() != null) {
                res.setLatestJobTitle(ra.getJob().getJobTitle());
                res.setLatestCompanyName(ra.getJob().getCompanyName());
            }
            res.setLatestMatchingSkills(parseJsonList(ra.getMatchingSkills()));
            res.setLatestMissingSkills(parseJsonList(ra.getMissingSkills()));
            res.setLatestRecommendation(ra.getRecommendations());
        } else {
            res.setLatestCompatibilityScore(null);
            res.setLatestJobTitle(null);
            res.setLatestCompanyName(null);
            res.setLatestMatchingSkills(Collections.emptyList());
            res.setLatestMissingSkills(Collections.emptyList());
            res.setLatestRecommendation(null);
        }

        // Compute average roadmap progress
        List<LearningRoadmap> roadmaps = roadmapRepository.findByUserIdOrderByCreatedAtDesc(userId);
        double avgRoadmap = 0.0;
        if (!roadmaps.isEmpty()) {
            LearningRoadmap active = roadmaps.get(0);
            res.setActiveRoadmapTitle(active.getTitle());
            Long totalM = milestoneRepository.countByRoadmapId(active.getId());
            Long compM = milestoneRepository.countByRoadmapIdAndStatus(active.getId(), RoadmapMilestone.MilestoneStatus.COMPLETED);
            if (totalM > 0) {
                avgRoadmap = Math.round(((double) compM / totalM) * 1000.0) / 10.0;
            }
        } else {
            res.setActiveRoadmapTitle(null);
        }
        res.setAvgRoadmapCompletion(avgRoadmap);

        // Interview sessions
        Double intAvg = sessionRepository.getAverageScoreByUserId(userId);
        double interviewScore = intAvg != null ? Math.round(intAvg * 10.0) / 10.0 : 0.0;
        res.setAvgInterviewScore(interviewScore);

        List<InterviewSession> sessions = sessionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (!sessions.isEmpty()) {
            res.setLatestInterviewSummary(sessions.get(0).getSummaryFeedback());
        } else {
            res.setLatestInterviewSummary(null);
        }

        long notesCount = documentRepository.countByUserId(userId);
        res.setTotalNotesSaved(notesCount);

        List<Document> userDocs = documentRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        List<String> noteTitles = new ArrayList<>();
        for (int i = 0; i < Math.min(3, userDocs.size()); i++) {
            noteTitles.add(userDocs.get(i).getTitle());
        }
        res.setRecentNoteTitles(noteTitles);

        long appsCount = applicationRepository.countByUserId(userId);
        res.setTotalApplications(appsCount);

        // Dynamic Readiness Index formula (0-100)
        double skillsFactor = Math.min(100.0, skillsCount * 12.5);
        double matchVal = matchScore != null ? matchScore.doubleValue() : 0.0;
        double readiness = 0.0;

        if (matchScore != null || interviewScore > 0 || avgRoadmap > 0 || skillsCount > 0) {
            readiness = (matchVal * 0.30) +
                    (interviewScore * 0.30) +
                    (avgRoadmap * 0.25) +
                    (skillsFactor * 0.15);
        }

        res.setReadinessIndex(Math.round(readiness * 10.0) / 10.0);
        return res;
    }

    private List<String> parseJsonList(String json) {
        if (json == null || json.trim().isEmpty()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
