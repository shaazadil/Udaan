package com.udaan.skills.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.udaan.ai.client.GroqClient;
import com.udaan.career.entity.JobRequirement;
import com.udaan.career.repository.JobRepository;
import com.udaan.career.repository.JobRequirementRepository;
import com.udaan.profile.entity.User;
import com.udaan.profile.repository.UserRepository;
import com.udaan.skills.dto.SkillDtos.*;
import com.udaan.skills.entity.*;
import com.udaan.skills.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class SkillService {

    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final LearningRoadmapRepository roadmapRepository;
    private final RoadmapMilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final JobRequirementRepository jobRequirementRepository;
    private final GroqClient groqClient;
    private final ObjectMapper objectMapper;

    public SkillService(SkillRepository skillRepository,
                        UserSkillRepository userSkillRepository,
                        LearningRoadmapRepository roadmapRepository,
                        RoadmapMilestoneRepository milestoneRepository,
                        ProjectRepository projectRepository,
                        UserRepository userRepository,
                        JobRepository jobRepository,
                        JobRequirementRepository jobRequirementRepository,
                        GroqClient groqClient,
                        ObjectMapper objectMapper) {
        this.skillRepository = skillRepository;
        this.userSkillRepository = userSkillRepository;
        this.roadmapRepository = roadmapRepository;
        this.milestoneRepository = milestoneRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.jobRequirementRepository = jobRequirementRepository;
        this.groqClient = groqClient;
        this.objectMapper = objectMapper;
    }

    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    public List<UserSkill> getUserSkills(Long userId) {
        return userSkillRepository.findByUserId(userId);
    }

    @Transactional
    public UserSkill addOrUpdateUserSkill(Long userId, UserSkillRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        Skill skill = skillRepository.findByNameIgnoreCase(req.getSkillName())
                .orElseGet(() -> skillRepository.save(new Skill(req.getSkillName(), req.getCategory(), "Custom skill")));

        Optional<UserSkill> existing = userSkillRepository.findByUserIdAndSkillId(userId, skill.getId());
        UserSkill us;
        if (existing.isPresent()) {
            us = existing.get();
            us.setProficiencyLevel(UserSkill.ProficiencyLevel.valueOf(req.getProficiencyLevel()));
            us.setEvidenceSource(UserSkill.EvidenceSource.valueOf(req.getEvidenceSource()));
            us.setEvidenceDescription(req.getEvidenceDescription());
            us.setAssessedAt(LocalDateTime.now());
        } else {
            us = new UserSkill(user, skill,
                    UserSkill.ProficiencyLevel.valueOf(req.getProficiencyLevel()),
                    UserSkill.EvidenceSource.valueOf(req.getEvidenceSource()),
                    req.getEvidenceDescription());
        }
        return userSkillRepository.save(us);
    }

    public SkillGapResponse detectSkillGaps(Long userId, Long jobId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        List<UserSkill> userSkills = userSkillRepository.findByUserId(userId);
        Map<String, UserSkill> userSkillMap = new HashMap<>();
        for (UserSkill us : userSkills) {
            userSkillMap.put(us.getSkill().getName().toLowerCase(), us);
        }

        List<String> demonstrated = new ArrayList<>();
        List<String> partial = new ArrayList<>();
        List<String> criticalGaps = new ArrayList<>();

        if (jobId != null) {
            List<JobRequirement> reqs = jobRequirementRepository.findByJobId(jobId);
            for (JobRequirement jr : reqs) {
                String skillName = jr.getSkill() != null ? jr.getSkill().getName() : jr.getRequirementText();
                UserSkill us = userSkillMap.get(skillName.toLowerCase());
                if (us != null) {
                    if (us.getProficiencyLevel() == UserSkill.ProficiencyLevel.ADVANCED ||
                        us.getProficiencyLevel() == UserSkill.ProficiencyLevel.INTERMEDIATE) {
                        demonstrated.add(skillName);
                    } else {
                        partial.add(skillName);
                    }
                } else {
                    criticalGaps.add(skillName);
                }
            }
        } else {
            // Role-aware competency checks
            String[] targetExpected;
            String roleLower = (user.getTargetRole() != null) ? user.getTargetRole().toLowerCase() : "";
            if (roleLower.contains("full stack") || roleLower.contains("fullstack")) {
                targetExpected = new String[]{"React", "TypeScript", "Spring Boot", "MySQL", "RESTful API Design", "Docker", "State Management (Redux/Zustand)", "Cloud & CI/CD Pipelines"};
            } else if (roleLower.contains("frontend") || roleLower.contains("ui") || roleLower.contains("web")) {
                targetExpected = new String[]{"React", "TypeScript", "Next.js", "CSS Architecture", "State Management", "Performance Optimization", "Web Testing"};
            } else {
                targetExpected = new String[]{"Java", "Spring Boot", "MySQL", "Docker", "Distributed System Design", "Redis Caching", "Microservices Architecture"};
            }

            for (String exp : targetExpected) {
                UserSkill us = userSkillMap.get(exp.toLowerCase());
                if (us != null) {
                    demonstrated.add(exp);
                } else {
                    criticalGaps.add(exp);
                }
            }
        }

        SkillGapResponse response = new SkillGapResponse();
        response.setTargetRole(user.getTargetRole());
        response.setJobId(jobId);
        response.setDemonstratedSkills(demonstrated);
        response.setPartialSkills(partial);
        response.setCriticalGaps(criticalGaps);
        response.setTotalGaps(criticalGaps.size() + partial.size());
        return response;
    }

    public List<RoadmapResponse> getUserRoadmaps(Long userId) {
        List<LearningRoadmap> roadmaps = roadmapRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<RoadmapResponse> result = new ArrayList<>();
        for (LearningRoadmap r : roadmaps) {
            result.add(buildRoadmapResponse(r));
        }
        return result;
    }

    @Transactional
    public RoadmapResponse generateRoadmap(Long userId, RoadmapRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        String targetRole = req.getTargetRole() != null ? req.getTargetRole() : user.getTargetRole();
        SkillGapResponse gaps = detectSkillGaps(userId, req.getJobId());

        String title = "Personalized Mastery Plan: " + targetRole;
        String desc = "Structured curriculum tailored to bridge identified competency gaps in " +
                String.join(", ", gaps.getCriticalGaps());

        LearningRoadmap roadmap = new LearningRoadmap(user, targetRole, title, desc);
        roadmapRepository.save(roadmap);

        // Try generating milestones via Groq
        String sysPrompt = "You are an expert Principal Engineer and Tech Educator for " + targetRole + ". Return a JSON array of 4 ordered learning milestones strictly tailored to " + targetRole + " to bridge competency gaps. Format strictly as a JSON array of objects with keys: title, conceptExplanation, stepOrder, estimatedHours, practiceTask, skillName.";
        String userPrompt = "Target Role: " + targetRole + "\n" +
                "Missing Skills: " + String.join(", ", gaps.getCriticalGaps()) + "\n" +
                "Partial Skills: " + String.join(", ", gaps.getPartialSkills()) + "\n" +
                "Return JSON array only.";

        String aiResp = groqClient.generateChatCompletion(sysPrompt, userPrompt, "SKILL", "ROADMAP_GENERATION", user);
        String cleanJson = groqClient.extractJsonBlock(aiResp);

        boolean parsedAiMilestones = false;
        if (cleanJson != null && cleanJson.startsWith("[")) {
            try {
                JsonNode arrayNode = objectMapper.readTree(cleanJson);
                for (JsonNode item : arrayNode) {
                    String mTitle = item.path("title").asText("Core Competency Study");
                    String mConcept = item.path("conceptExplanation").asText("In-depth study of foundational principles.");
                    int mStep = item.path("stepOrder").asInt(1);
                    int mHours = item.path("estimatedHours").asInt(8);
                    String mTask = item.path("practiceTask").asText("Build a demo module.");
                    String mSkillName = item.path("skillName").asText("Engineering");

                    Skill skill = skillRepository.findByNameIgnoreCase(mSkillName)
                            .orElseGet(() -> skillRepository.save(new Skill(mSkillName, "General", "Roadmap skill")));

                    RoadmapMilestone rm = new RoadmapMilestone(roadmap, skill, mTitle, mStep, mHours, mConcept, mTask);
                    milestoneRepository.save(rm);
                }
                parsedAiMilestones = true;
            } catch (Exception ignored) {}
        }

        if (!parsedAiMilestones) {
            // High quality deterministic role-tailored milestones
            List<String> skillsToTeach = new ArrayList<>(gaps.getCriticalGaps());
            if (skillsToTeach.isEmpty()) {
                String roleLower = targetRole.toLowerCase();
                if (roleLower.contains("full stack") || roleLower.contains("fullstack")) {
                    skillsToTeach.addAll(List.of("Full-Stack State Management & React Query", "Advanced Spring Boot REST & DTO Architecture", "Docker Containerization & CI/CD", "End-to-End Testing & Performance Profiling"));
                } else if (roleLower.contains("frontend") || roleLower.contains("ui") || roleLower.contains("web")) {
                    skillsToTeach.addAll(List.of("React Reconciliation & Fiber Internals", "Core Web Vitals & Bundle Optimization", "TypeScript Advanced Generics & State", "Automated Component & E2E Testing"));
                } else {
                    skillsToTeach.addAll(List.of("Distributed Caching with Redis", "Docker Pipelines & Container Security", "Apache Kafka Message Brokers", "Advanced Database Indexing & Query Plans"));
                }
            }

            int step = 1;
            for (String sName : skillsToTeach.subList(0, Math.min(4, skillsToTeach.size()))) {
                Skill skill = skillRepository.findByNameIgnoreCase(sName)
                        .orElseGet(() -> skillRepository.save(new Skill(sName, "General", "Discovered skill")));

                String concept = "Master the design patterns, concurrency implications, and architectural tradeoffs of " + sName + ".";
                String task = "Implement a working GitHub repo demonstrating production-ready " + sName + " with automated unit and integration tests.";

                RoadmapMilestone rm = new RoadmapMilestone(roadmap, skill, "Mastering " + sName, step, 8 + (step * 2), concept, task);
                milestoneRepository.save(rm);
                step++;
            }
        }

        // Recommend associated practical project tailored to role
        String roleLower = targetRole.toLowerCase();
        String projTitle = roleLower.contains("full stack")
                ? "Full Stack Career Intelligence Platform (React + Spring Boot)"
                : (roleLower.contains("frontend")
                ? "Design System & High-Performance Web Dashboard (Next.js + TypeScript)"
                : "Scalable High-Throughput Microservices Engine (Java + Redis)");

        String projDesc = roleLower.contains("full stack")
                ? "Full-stack application with a typed component UI, secure REST API, MySQL relational schema, and automated CI/CD pipeline."
                : (roleLower.contains("frontend")
                ? "Production-ready web application showcasing accessible component design, sub-second LCP, and real-time state synchronization."
                : "Distributed backend architecture with horizontal scalability, caching strategies, and resilient error recovery mechanisms.");

        Project project = new Project(user, roadmap,
                projTitle,
                projDesc,
                String.join(", ", gaps.getCriticalGaps()),
                Project.ProjectStatus.PLANNED);
        projectRepository.save(project);

        return buildRoadmapResponse(roadmap);
    }

    @Transactional
    public RoadmapResponse updateMilestoneStatus(Long milestoneId, String status) {
        RoadmapMilestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new IllegalArgumentException("Milestone not found: " + milestoneId));

        RoadmapMilestone.MilestoneStatus mStatus = RoadmapMilestone.MilestoneStatus.valueOf(status);
        milestone.setStatus(mStatus);
        if (mStatus == RoadmapMilestone.MilestoneStatus.COMPLETED) {
            milestone.setCompletedAt(LocalDateTime.now());
        } else {
            milestone.setCompletedAt(null);
        }
        milestoneRepository.save(milestone);

        // Calculate progress percentage deterministically
        LearningRoadmap roadmap = milestone.getRoadmap();
        Long total = milestoneRepository.countByRoadmapId(roadmap.getId());
        Long completed = milestoneRepository.countByRoadmapIdAndStatus(roadmap.getId(), RoadmapMilestone.MilestoneStatus.COMPLETED);

        if (total > 0 && total.equals(completed)) {
            roadmap.setStatus(LearningRoadmap.RoadmapStatus.COMPLETED);
            roadmapRepository.save(roadmap);
        }

        return buildRoadmapResponse(roadmap);
    }

    public List<Project> getUserProjects(Long userId) {
        return projectRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public Project saveProject(Long userId, Project project) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        project.setUser(user);
        return projectRepository.save(project);
    }

    private RoadmapResponse buildRoadmapResponse(LearningRoadmap roadmap) {
        List<RoadmapMilestone> milestones = milestoneRepository.findByRoadmapIdOrderByStepOrderAsc(roadmap.getId());
        int total = milestones.size();
        int completed = 0;
        int totalHours = 0;

        List<MilestoneDto> dtos = new ArrayList<>();
        for (RoadmapMilestone m : milestones) {
            if (m.getStatus() == RoadmapMilestone.MilestoneStatus.COMPLETED) completed++;
            totalHours += (m.getEstimatedHours() != null ? m.getEstimatedHours() : 5);

            MilestoneDto d = new MilestoneDto();
            d.setId(m.getId());
            d.setTitle(m.getTitle());
            d.setSkillName(m.getSkill() != null ? m.getSkill().getName() : "General");
            d.setStepOrder(m.getStepOrder());
            d.setEstimatedHours(m.getEstimatedHours());
            d.setStatus(m.getStatus().name());
            d.setConceptExplanation(m.getConceptExplanation());
            d.setPracticeTask(m.getPracticeTask());
            d.setCompletedAt(m.getCompletedAt() != null ? m.getCompletedAt().toString() : null);
            dtos.add(d);
        }

        double progress = total > 0 ? ((double) completed / total) * 100.0 : 0.0;

        RoadmapResponse res = new RoadmapResponse();
        res.setId(roadmap.getId());
        res.setTitle(roadmap.getTitle());
        res.setTargetRole(roadmap.getTargetRole());
        res.setDescription(roadmap.getDescription());
        res.setStatus(roadmap.getStatus().name());
        res.setProgressPercentage(Math.round(progress * 10.0) / 10.0);
        res.setTotalHours(totalHours);
        res.setMilestones(dtos);
        return res;
    }
}
