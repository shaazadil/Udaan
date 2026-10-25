package com.udaan.career.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.udaan.ai.client.GroqClient;
import com.udaan.career.dto.CareerDtos.*;
import com.udaan.career.entity.*;
import com.udaan.career.repository.*;
import com.udaan.profile.entity.User;
import com.udaan.profile.repository.UserRepository;
import com.udaan.skills.entity.Skill;
import com.udaan.skills.entity.UserSkill;
import com.udaan.skills.repository.SkillRepository;
import com.udaan.skills.repository.UserSkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
public class CareerService {

    private final ResumeRepository resumeRepository;
    private final JobRepository jobRepository;
    private final JobRequirementRepository jobRequirementRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final GroqClient groqClient;
    private final ObjectMapper objectMapper;

    public CareerService(ResumeRepository resumeRepository,
                         JobRepository jobRepository,
                         JobRequirementRepository jobRequirementRepository,
                         ResumeAnalysisRepository resumeAnalysisRepository,
                         ApplicationRepository applicationRepository,
                         UserRepository userRepository,
                         SkillRepository skillRepository,
                         UserSkillRepository userSkillRepository,
                         GroqClient groqClient,
                         ObjectMapper objectMapper) {
        this.resumeRepository = resumeRepository;
        this.jobRepository = jobRepository;
        this.jobRequirementRepository = jobRequirementRepository;
        this.resumeAnalysisRepository = resumeAnalysisRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.userSkillRepository = userSkillRepository;
        this.groqClient = groqClient;
        this.objectMapper = objectMapper;
    }

    public List<Resume> getUserResumes(Long userId) {
        return resumeRepository.findByUserIdOrderByVersionNumberDesc(userId);
    }

    @Transactional
    public Resume saveResume(Long userId, ResumeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        List<Resume> existing = resumeRepository.findByUserIdOrderByVersionNumberDesc(userId);
        int nextVersion = existing.isEmpty() ? 1 : existing.get(0).getVersionNumber() + 1;

        Resume resume = new Resume(user, request.getTitle(), request.getRawText(), nextVersion);
        resumeRepository.save(resume);

        // Auto-extract and enrich user skills from resume text
        autoExtractResumeSkills(user, request.getRawText());

        return resume;
    }

    public List<Job> getUserJobs(Long userId) {
        return jobRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Job getJobById(Long jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found with id: " + jobId));
    }

    @Transactional
    public Job saveJob(Long userId, JobRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        Job job = new Job(user, request.getJobTitle(), request.getCompanyName(), request.getDescriptionText());
        job.setLocation(request.getLocation() != null ? request.getLocation() : "Remote");
        job.setEmploymentType(request.getEmploymentType() != null ? request.getEmploymentType() : "Full-time");
        jobRepository.save(job);

        // Parse requirements from request or extract from description
        List<String> rawReqs = request.getRequirements();
        if (rawReqs == null || rawReqs.isEmpty()) {
            rawReqs = extractRequirementsFromText(request.getDescriptionText());
        }

        for (String req : rawReqs) {
            Skill skill = findOrCreateSkill(req);
            JobRequirement jr = new JobRequirement(job, skill, req, true, 4);
            jobRequirementRepository.save(jr);
        }

        return job;
    }

    @Transactional
    public AnalysisResponse analyzeResumeCompatibility(Long userId, Long resumeId, Long jobId) {
        AnalyzeRequest req = new AnalyzeRequest();
        req.setResumeId(resumeId);
        req.setJobId(jobId);
        return analyzeResumeCompatibility(userId, req);
    }

    @Transactional
    public AnalysisResponse analyzeResumeCompatibility(Long userId, AnalyzeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        // Update candidate profile if live custom metadata is supplied
        boolean userUpdated = false;
        if (request.getCandidateName() != null && !request.getCandidateName().trim().isEmpty()
                && !request.getCandidateName().trim().equalsIgnoreCase(user.getName())) {
            user.setName(request.getCandidateName().trim());
            userUpdated = true;
        }
        if (request.getEducation() != null && !request.getEducation().trim().isEmpty()) {
            user.setEducation(request.getEducation().trim());
            userUpdated = true;
        }
        if (request.getExperienceLevel() != null && !request.getExperienceLevel().trim().isEmpty()) {
            user.setExperienceSummary(request.getExperienceLevel().trim());
            userUpdated = true;
        }
        if (request.getCustomJobTitle() != null && !request.getCustomJobTitle().trim().isEmpty()
                && (user.getTargetRole() == null || !user.getTargetRole().equalsIgnoreCase(request.getCustomJobTitle().trim()))) {
            user.setTargetRole(request.getCustomJobTitle().trim());
            userUpdated = true;
        }
        if (userUpdated) {
            userRepository.save(user);
        }

        // Process user declared skills
        if (request.getUserDeclaredSkills() != null && !request.getUserDeclaredSkills().trim().isEmpty()) {
            autoExtractResumeSkills(user, request.getUserDeclaredSkills().trim());
        }

        Resume resume;
        if (request.getCustomResumeText() != null && !request.getCustomResumeText().trim().isEmpty()) {
            String title = (request.getCustomJobTitle() != null && !request.getCustomJobTitle().isBlank())
                    ? request.getCustomJobTitle().trim() + " Tailored Resume"
                    : "Live Input Resume v" + (resumeRepository.findByUserIdOrderByVersionNumberDesc(userId).size() + 1);
            resume = new Resume(user, title, request.getCustomResumeText().trim(), 1);
            resumeRepository.save(resume);
            autoExtractResumeSkills(user, request.getCustomResumeText().trim());
        } else if (request.getResumeId() != null) {
            resume = resumeRepository.findById(request.getResumeId())
                    .orElseThrow(() -> new IllegalArgumentException("Resume not found with id: " + request.getResumeId()));
        } else {
            resume = resumeRepository.findFirstByUserIdAndIsActiveTrue(userId)
                    .orElseThrow(() -> new IllegalArgumentException("No active resume found for user: " + userId));
        }

        Job job;
        if (request.getCustomJobDescription() != null && !request.getCustomJobDescription().trim().isEmpty()) {
            String title = (request.getCustomJobTitle() != null && !request.getCustomJobTitle().isBlank())
                    ? request.getCustomJobTitle().trim() : (user.getTargetRole() != null ? user.getTargetRole() : "Target Position");
            String company = (request.getCustomCompanyName() != null && !request.getCustomCompanyName().isBlank())
                    ? request.getCustomCompanyName().trim() : "Target Enterprise";
            job = new Job(user, title, company, request.getCustomJobDescription().trim());
            jobRepository.save(job);

            List<String> rawReqs = request.getCustomRequirements();
            if (rawReqs == null || rawReqs.isEmpty()) {
                rawReqs = extractRequirementsFromText(request.getCustomJobDescription());
            }
            for (String reqStr : rawReqs) {
                if (reqStr != null && !reqStr.isBlank()) {
                    Skill skill = findOrCreateSkill(reqStr.trim());
                    JobRequirement jr = new JobRequirement(job, skill, reqStr.trim(), true, 4);
                    jobRequirementRepository.save(jr);
                }
            }
        } else if (request.getJobId() != null) {
            job = jobRepository.findById(request.getJobId())
                    .orElseThrow(() -> new IllegalArgumentException("Job not found with id: " + request.getJobId()));
        } else {
            List<Job> jobs = jobRepository.findByUserIdOrderByCreatedAtDesc(userId);
            if (!jobs.isEmpty()) {
                job = jobs.get(0);
            } else {
                throw new IllegalArgumentException("No job opportunity provided or selected.");
            }
        }

        List<JobRequirement> requirements = jobRequirementRepository.findByJobId(job.getId());
        List<UserSkill> userSkills = userSkillRepository.findByUserId(userId);

        Map<Long, UserSkill> userSkillMap = new HashMap<>();
        for (UserSkill us : userSkills) {
            userSkillMap.put(us.getSkill().getId(), us);
        }

        List<String> matching = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        double weightedTotal = 0.0;
        double maxWeightTotal = 0.0;

        String resumeLower = resume.getRawText().toLowerCase();

        for (JobRequirement req : requirements) {
            int weight = req.getWeight() != null ? req.getWeight() : 3;
            maxWeightTotal += weight;

            boolean hasEvidence = false;
            double matchValue = 0.0;

            if (req.getSkill() != null) {
                UserSkill us = userSkillMap.get(req.getSkill().getId());
                if (us != null) {
                    hasEvidence = true;
                    switch (us.getProficiencyLevel()) {
                        case ADVANCED -> matchValue = 1.0;
                        case INTERMEDIATE -> matchValue = 0.85;
                        case DEVELOPING -> matchValue = 0.60;
                        case BEGINNER -> matchValue = 0.40;
                    }
                } else if (resumeLower.contains(req.getSkill().getName().toLowerCase())) {
                    hasEvidence = true;
                    matchValue = 0.75;
                }
            } else if (resumeLower.contains(req.getRequirementText().toLowerCase())) {
                hasEvidence = true;
                matchValue = 0.75;
            }

            weightedTotal += (weight * matchValue);

            String label = req.getSkill() != null ? req.getSkill().getName() : req.getRequirementText();
            if (hasEvidence && matchValue >= 0.6) {
                if (!matching.contains(label)) matching.add(label);
            } else {
                if (!missing.contains(label)) missing.add(label);
            }
        }

        // Deterministic base score calculation
        double rawScore = maxWeightTotal > 0 ? (weightedTotal / maxWeightTotal) * 100.0 : 75.0;
        BigDecimal finalScore = BigDecimal.valueOf(Math.min(100.0, Math.max(10.0, rawScore)))
                .setScale(2, RoundingMode.HALF_UP);

        // Generate AI analysis via Groq
        String sysPrompt = "You are an elite Senior Technical Recruiter and Career Strategist. " +
                "Evaluate the candidate's exact resume against the target role and company. " +
                "Output ONLY a valid JSON object with the following keys:\n" +
                "- compatibilityScore (a numeric score 0-100 reflecting honest alignment)\n" +
                "- matchingSkills (array of strings: skills verified from resume)\n" +
                "- missingSkills (array of strings: required skills missing from resume)\n" +
                "- resumeBulletImprovements (string: 3 specific, actionable, quantified bullet improvements tailored to candidate's projects)\n" +
                "- coverLetterDraft (string: a compelling, professional cover letter tailored to the target company)";

        String userPrompt = "Candidate: " + user.getName() + " (" + (user.getTargetRole() != null ? user.getTargetRole() : "Software Engineer") + ")\n" +
                "Education: " + (user.getEducation() != null ? user.getEducation() : "Engineering") + "\n" +
                "Target Role: " + job.getJobTitle() + " at " + job.getCompanyName() + "\n" +
                "Job Description: " + job.getDescriptionText() + "\n" +
                "Candidate Resume Content:\n" + resume.getRawText() + "\n\n" +
                "Return JSON object only.";

        String aiResponse = groqClient.generateChatCompletion(sysPrompt, userPrompt, "CAREER", "RESUME_ANALYSIS", user);
        String cleanJson = groqClient.extractJsonBlock(aiResponse);

        String recommendations = "1. Highlight production projects demonstrating " + (missing.isEmpty() ? "advanced cloud architecture" : String.join(", ", missing)) + ".\n" +
                "2. Emphasize measurable business outcomes and scale achieved using " + (matching.isEmpty() ? "modern full stack patterns" : String.join(", ", matching)) + ".\n" +
                "3. Align resume bullet points directly with the keywords in " + job.getCompanyName() + "'s job posting.";

        String coverLetter = "Dear Hiring Team at " + job.getCompanyName() + ",\n\n" +
                "I am writing to express my strong enthusiasm for the " + job.getJobTitle() + " position. " +
                "With demonstrable experience in " + (matching.isEmpty() ? "full-stack development" : String.join(", ", matching)) + ", I am confident in my ability to deliver immediate value to your engineering team.\n\n" +
                "I look forward to discussing how my technical background and problem-solving abilities align with your product goals.\n\n" +
                "Sincerely,\n" + user.getName();

        if (cleanJson != null && cleanJson.startsWith("{")) {
            try {
                JsonNode root = objectMapper.readTree(cleanJson);
                if (root.has("compatibilityScore") && root.get("compatibilityScore").isNumber()) {
                    double aiScore = root.get("compatibilityScore").asDouble();
                    if (aiScore > 0 && aiScore <= 100) {
                        finalScore = BigDecimal.valueOf(aiScore).setScale(2, RoundingMode.HALF_UP);
                    }
                }
                if (root.has("matchingSkills") && root.get("matchingSkills").isArray()) {
                    List<String> aiMatching = new ArrayList<>();
                    for (JsonNode item : root.get("matchingSkills")) {
                        aiMatching.add(item.asText());
                    }
                    if (!aiMatching.isEmpty()) matching = aiMatching;
                }
                if (root.has("missingSkills") && root.get("missingSkills").isArray()) {
                    List<String> aiMissing = new ArrayList<>();
                    for (JsonNode item : root.get("missingSkills")) {
                        aiMissing.add(item.asText());
                    }
                    if (!aiMissing.isEmpty()) missing = aiMissing;
                }
                if (root.has("resumeBulletImprovements") && !root.get("resumeBulletImprovements").asText().isBlank()) {
                    recommendations = root.get("resumeBulletImprovements").asText();
                }
                if (root.has("coverLetterDraft") && !root.get("coverLetterDraft").asText().isBlank()) {
                    coverLetter = root.get("coverLetterDraft").asText();
                }
            } catch (Exception ignored) {}
        }

        ResumeAnalysis analysis = new ResumeAnalysis();
        analysis.setResume(resume);
        analysis.setJob(job);
        analysis.setCompatibilityScore(finalScore);
        try {
            analysis.setMatchingSkills(objectMapper.writeValueAsString(matching));
            analysis.setMissingSkills(objectMapper.writeValueAsString(missing));
        } catch (Exception ignored) {
            analysis.setMatchingSkills("[]");
            analysis.setMissingSkills("[]");
        }
        analysis.setRecommendations(recommendations);
        analysis.setCoverLetterDraft(coverLetter);

        resumeAnalysisRepository.save(analysis);

        return mapToAnalysisResponse(analysis, matching, missing);
    }


    public List<AnalysisResponse> getAnalysisHistory(Long userId) {
        List<ResumeAnalysis> analyses = resumeAnalysisRepository.findByResumeUserIdOrderByCreatedAtDesc(userId);
        List<AnalysisResponse> responses = new ArrayList<>();
        for (ResumeAnalysis ra : analyses) {
            List<String> matching = parseJsonList(ra.getMatchingSkills());
            List<String> missing = parseJsonList(ra.getMissingSkills());
            responses.add(mapToAnalysisResponse(ra, matching, missing));
        }
        return responses;
    }

    public List<Application> getUserApplications(Long userId) {
        return applicationRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    @Transactional
    public Application trackApplication(Long userId, ApplicationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new IllegalArgumentException("Job not found: " + request.getJobId()));

        Application app = new Application(user, job, Application.ApplicationStatus.valueOf(request.getStatus()));
        if (request.getAppliedDate() != null && !request.getAppliedDate().isBlank()) {
            app.setAppliedDate(LocalDate.parse(request.getAppliedDate()));
        } else {
            app.setAppliedDate(LocalDate.now());
        }
        app.setNotes(request.getNotes());
        app.setSalaryOffered(request.getSalaryOffered());

        return applicationRepository.save(app);
    }

    @Transactional
    public Application updateApplicationStatus(Long applicationId, String status, String notes) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found: " + applicationId));
        app.setStatus(Application.ApplicationStatus.valueOf(status));
        if (notes != null) app.setNotes(notes);
        return applicationRepository.save(app);
    }

    private void autoExtractResumeSkills(User user, String text) {
        if (text == null || text.isBlank()) return;

        // If text contains commas or semicolons, treat as skill list directly
        if (text.contains(",") || text.contains(";")) {
            String[] tokens = text.split("[,;\\n]+");
            for (String t : tokens) {
                String trimmed = t.trim();
                if (trimmed.length() >= 2 && trimmed.length() <= 40) {
                    Skill skill = findOrCreateSkill(trimmed);
                    if (userSkillRepository.findByUserIdAndSkillId(user.getId(), skill.getId()).isEmpty()) {
                        UserSkill us = new UserSkill(user, skill, UserSkill.ProficiencyLevel.INTERMEDIATE, UserSkill.EvidenceSource.RESUME, "Declared candidate competency: " + trimmed);
                        userSkillRepository.save(us);
                    }
                }
            }
        }

        String[] techCatalogue = {
                "React", "TypeScript", "JavaScript", "Spring Boot", "Java", "MySQL", "PostgreSQL", "MongoDB",
                "Node.js", "Express", "Next.js", "RESTful API Design", "REST API", "Docker", "Kubernetes", "AWS",
                "Redis", "Kafka", "GraphQL", "CI/CD", "Git", "System Design", "Microservices", "HTML5", "CSS3",
                "Tailwind CSS", "Redux", "Zustand", "Jest", "Python", "Django", "Flask", "Go", "Linux"
        };
        String lower = text.toLowerCase();
        for (String sName : techCatalogue) {
            if (lower.contains(sName.toLowerCase())) {
                Skill skill = findOrCreateSkill(sName);
                if (userSkillRepository.findByUserIdAndSkillId(user.getId(), skill.getId()).isEmpty()) {
                    UserSkill us = new UserSkill(user, skill, UserSkill.ProficiencyLevel.INTERMEDIATE, UserSkill.EvidenceSource.RESUME, "Extracted from resume text: " + sName);
                    userSkillRepository.save(us);
                }
            }
        }
    }

    private Skill findOrCreateSkill(String name) {
        return skillRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> skillRepository.save(new Skill(name, "Extracted", "Auto-discovered skill requirement")));
    }

    private List<String> extractRequirementsFromText(String desc) {
        List<String> reqs = new ArrayList<>();
        String[] keywords = {
                "React", "TypeScript", "JavaScript", "Spring Boot", "Java", "MySQL", "PostgreSQL",
                "MongoDB", "Node.js", "Express", "Docker", "Kubernetes", "AWS", "Redis",
                "REST API", "RESTful API Design", "Microservices", "System Design", "Git", "CI/CD", "Kafka"
        };
        String lower = desc.toLowerCase();
        for (String kw : keywords) {
            if (lower.contains(kw.toLowerCase()) && !reqs.contains(kw)) {
                reqs.add(kw);
            }
        }
        if (reqs.isEmpty()) {
            reqs.addAll(List.of("Full Stack Architecture", "REST API Design", "Database Modeling"));
        }
        return reqs;
    }

    private List<String> parseJsonList(String json) {
        try {
            if (json == null || json.isBlank()) return Collections.emptyList();
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private AnalysisResponse mapToAnalysisResponse(ResumeAnalysis analysis, List<String> matching, List<String> missing) {
        AnalysisResponse res = new AnalysisResponse();
        res.setId(analysis.getId());
        res.setResumeId(analysis.getResume().getId());
        res.setJobId(analysis.getJob().getId());
        res.setJobTitle(analysis.getJob().getJobTitle());
        res.setCompanyName(analysis.getJob().getCompanyName());
        res.setCompatibilityScore(analysis.getCompatibilityScore());
        res.setMatchingSkills(matching);
        res.setMissingSkills(missing);
        res.setRecommendations(analysis.getRecommendations());
        res.setCoverLetterDraft(analysis.getCoverLetterDraft());
        res.setCreatedAt(analysis.getCreatedAt().toString());
        return res;
    }
}
