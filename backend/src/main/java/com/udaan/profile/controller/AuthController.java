package com.udaan.profile.controller;

import com.udaan.career.entity.Job;
import com.udaan.career.entity.JobRequirement;
import com.udaan.career.entity.Resume;
import com.udaan.career.repository.JobRepository;
import com.udaan.career.repository.JobRequirementRepository;
import com.udaan.career.repository.ResumeRepository;
import com.udaan.common.ApiResponse;
import com.udaan.knowledge.entity.Document;
import com.udaan.knowledge.entity.DocumentChunk;
import com.udaan.knowledge.entity.Tag;
import com.udaan.knowledge.repository.DocumentChunkRepository;
import com.udaan.knowledge.repository.DocumentRepository;
import com.udaan.knowledge.repository.TagRepository;
import com.udaan.profile.entity.User;
import com.udaan.profile.repository.UserRepository;
import com.udaan.skills.entity.Skill;
import com.udaan.skills.entity.UserSkill;
import com.udaan.skills.repository.SkillRepository;
import com.udaan.skills.repository.UserSkillRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final ResumeRepository resumeRepository;
    private final JobRepository jobRepository;
    private final JobRequirementRepository jobRequirementRepository;
    private final DocumentRepository documentRepository;
    private final DocumentChunkRepository chunkRepository;
    private final TagRepository tagRepository;

    public AuthController(UserRepository userRepository,
                          SkillRepository skillRepository,
                          UserSkillRepository userSkillRepository,
                          ResumeRepository resumeRepository,
                          JobRepository jobRepository,
                          JobRequirementRepository jobRequirementRepository,
                          DocumentRepository documentRepository,
                          DocumentChunkRepository chunkRepository,
                          TagRepository tagRepository) {
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.userSkillRepository = userSkillRepository;
        this.resumeRepository = resumeRepository;
        this.jobRepository = jobRepository;
        this.jobRequirementRepository = jobRequirementRepository;
        this.documentRepository = documentRepository;
        this.chunkRepository = chunkRepository;
        this.tagRepository = tagRepository;
    }

    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
        private String targetRole;
        private String education;
        private String experienceSummary;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getTargetRole() { return targetRole; }
        public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
        public String getEducation() { return education; }
        public void setEducation(String education) { this.education = education; }
        public String getExperienceSummary() { return experienceSummary; }
        public void setExperienceSummary(String experienceSummary) { this.experienceSummary = experienceSummary; }
    }

    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<ApiResponse<User>> register(@RequestBody RegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Name is required");
        }

        String role = (request.getTargetRole() != null && !request.getTargetRole().trim().isEmpty())
                ? request.getTargetRole().trim()
                : "Full Stack Developer";

        Optional<User> existing = userRepository.findByEmail(request.getEmail().trim().toLowerCase());
        if (existing.isPresent()) {
            User existingUser = existing.get();
            existingUser.setName(request.getName().trim());
            existingUser.setTargetRole(role);
            if (request.getEducation() != null) existingUser.setEducation(request.getEducation());
            if (request.getExperienceSummary() != null) existingUser.setExperienceSummary(request.getExperienceSummary());
            userRepository.save(existingUser);
            return ResponseEntity.ok(ApiResponse.ok("User session restored", existingUser));
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setTargetRole(role);
        user.setPasswordHash(request.getPassword() != null ? request.getPassword() : "default123");
        user.setEducation(request.getEducation() != null ? request.getEducation() : "B.Tech in Computer Science & Engineering");
        user.setExperienceSummary(request.getExperienceSummary() != null ? request.getExperienceSummary() :
                "Passionate " + role + " focused on building high-quality, scalable web applications.");
        user = userRepository.save(user);

        // Seed initial canonical skills for candidate target role
        seedUserSkillsForRole(user, role);

        // Seed candidate's personalized starter resume
        seedStarterResume(user, role);

        // Seed role-appropriate job posting
        seedStarterJob(user, role);

        // Seed starter technical note
        seedStarterNote(user, role);

        return ResponseEntity.ok(ApiResponse.ok("User registered successfully", user));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<User>> login(@RequestBody LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("No account registered with email: " + request.getEmail()));

        return ResponseEntity.ok(ApiResponse.ok("Login successful", user));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(userRepository.findAll()));
    }

    private void seedUserSkillsForRole(User user, String role) {
        List<Skill> canonical = skillRepository.findAll();
        Map<String, Skill> skillMap = new HashMap<>();
        for (Skill s : canonical) {
            skillMap.put(s.getName().toLowerCase(), s);
        }

        boolean isFullStack = role.toLowerCase().contains("full stack");
        boolean isFrontend = role.toLowerCase().contains("frontend");

        // Canonical names to assign
        List<String[]> skillsToAssign = new ArrayList<>();
        if (isFullStack) {
            skillsToAssign.add(new String[]{"React", "ADVANCED", "PROJECT", "0.90"});
            skillsToAssign.add(new String[]{"TypeScript", "INTERMEDIATE", "PROJECT", "0.85"});
            skillsToAssign.add(new String[]{"Java", "INTERMEDIATE", "RESUME", "0.80"});
            skillsToAssign.add(new String[]{"Spring Boot", "INTERMEDIATE", "PROJECT", "0.80"});
            skillsToAssign.add(new String[]{"MySQL", "INTERMEDIATE", "PROJECT", "0.85"});
            skillsToAssign.add(new String[]{"RESTful API Design", "ADVANCED", "RESUME", "0.90"});
            skillsToAssign.add(new String[]{"Git", "ADVANCED", "RESUME", "0.95"});
            skillsToAssign.add(new String[]{"Docker", "DEVELOPING", "MANUAL_DECLARATION", "0.60"});
        } else if (isFrontend) {
            skillsToAssign.add(new String[]{"React", "ADVANCED", "PROJECT", "0.95"});
            skillsToAssign.add(new String[]{"TypeScript", "ADVANCED", "PROJECT", "0.90"});
            skillsToAssign.add(new String[]{"Git", "ADVANCED", "RESUME", "0.90"});
            skillsToAssign.add(new String[]{"RESTful API Design", "INTERMEDIATE", "PROJECT", "0.80"});
        } else {
            // Default Backend
            skillsToAssign.add(new String[]{"Java", "ADVANCED", "RESUME", "0.95"});
            skillsToAssign.add(new String[]{"Spring Boot", "ADVANCED", "PROJECT", "0.90"});
            skillsToAssign.add(new String[]{"MySQL", "INTERMEDIATE", "PROJECT", "0.85"});
            skillsToAssign.add(new String[]{"RESTful API Design", "ADVANCED", "RESUME", "0.90"});
            skillsToAssign.add(new String[]{"Git", "ADVANCED", "RESUME", "0.90"});
            skillsToAssign.add(new String[]{"Docker", "DEVELOPING", "MANUAL_DECLARATION", "0.50"});
        }

        for (String[] entry : skillsToAssign) {
            Skill s = skillMap.get(entry[0].toLowerCase());
            if (s != null) {
                UserSkill us = new UserSkill();
                us.setUser(user);
                us.setSkill(s);
                us.setProficiencyLevel(UserSkill.ProficiencyLevel.valueOf(entry[1]));
                us.setEvidenceSource(UserSkill.EvidenceSource.valueOf(entry[2]));
                us.setEvidenceDescription("Demonstrated proficiency in " + s.getName() + " for " + role + " projects.");
                us.setConfidenceLevel(new BigDecimal(entry[3]));
                userSkillRepository.save(us);
            }
        }
    }

    private void seedStarterResume(User user, String role) {
        Resume resume = new Resume();
        resume.setUser(user);
        resume.setTitle(user.getName() + " - " + role + " Resume v1.0");
        resume.setVersionNumber(1);
        resume.setIsActive(true);

        String resumeText = user.getName().toUpperCase() + "\n" +
                "Target Role: " + role + " | Email: " + user.getEmail() + "\n\n" +
                "PROFESSIONAL SUMMARY:\n" +
                user.getExperienceSummary() + "\n\n" +
                "CORE TECHNICAL SKILLS:\n" +
                "- Programming & Frameworks: React, TypeScript, Java, Spring Boot, Node.js\n" +
                "- Database & Storage: MySQL (InnoDB schema design, indexing, transactions), PostgreSQL\n" +
                "- Web & Protocols: RESTful API Design, JSON, WebSockets, HTTP/2\n" +
                "- Tools & DevOps: Git, GitHub, Maven, Docker, Postman\n\n" +
                "KEY PROJECTS:\n" +
                "1. Udaan Career Intelligence Platform:\n" +
                "- Architected full-stack features connecting a modern React TypeScript frontend to a Spring Boot 3 REST API.\n" +
                "- Designed normalized MySQL schema with 20 relational tables and foreign key constraints.\n" +
                "- Integrated Groq AI LLM for automated skill roadmaps and adaptive mock interview grading.\n\n" +
                "2. Distributed E-Commerce Services:\n" +
                "- Developed high-throughput REST endpoints handling orders, inventory, and payment callbacks.\n" +
                "- Implemented caching and idempotent request processing.\n\n" +
                "EDUCATION:\n" +
                user.getEducation() + " - Focus: Software Engineering & Data Structures";

        resume.setRawText(resumeText);
        resumeRepository.save(resume);
    }

    private void seedStarterJob(User user, String role) {
        Job job = new Job();
        job.setUser(user);
        job.setJobTitle(role);
        job.setCompanyName("PhonePe / Zepto");
        job.setLocation("Bengaluru, India (Hybrid)");
        job.setEmploymentType("FULL_TIME");

        String desc = "We are seeking a talented " + role + " to build scalable web applications and resilient services. " +
                "In this role, you will collaborate with cross-functional product teams, implement high-performance interfaces, " +
                "and engineer backend endpoints with relational data integrity.";
        job.setDescriptionText(desc);
        job = jobRepository.save(job);

        // Add matching requirements
        List<Skill> canonical = skillRepository.findAll();
        Map<String, Skill> skillMap = new HashMap<>();
        for (Skill s : canonical) {
            skillMap.put(s.getName().toLowerCase(), s);
        }

        createRequirement(job, skillMap.get("react"), "React & Frontend Architecture", true, 4);
        createRequirement(job, skillMap.get("typescript"), "TypeScript Type-Safe Programming", true, 3);
        createRequirement(job, skillMap.get("spring boot"), "Java Spring Boot Microservices", true, 4);
        createRequirement(job, skillMap.get("mysql"), "MySQL Schema Design & Optimization", true, 3);
        createRequirement(job, skillMap.get("restful api design"), "RESTful API Standards", true, 3);
        createRequirement(job, null, "Distributed Caching with Redis", false, 3);
        createRequirement(job, null, "Apache Kafka Event Streaming", false, 3);
    }

    private void createRequirement(Job job, Skill skill, String text, boolean isMandatory, int weight) {
        JobRequirement req = new JobRequirement();
        req.setJob(job);
        req.setSkill(skill);
        req.setRequirementText(text);
        req.setIsMandatory(isMandatory);
        req.setWeight(weight);
        jobRequirementRepository.save(req);
    }

    private void seedStarterNote(User user, String role) {
        Document doc = new Document();
        doc.setUser(user);
        doc.setTitle(role + " Architecture: Full-Stack React & Spring Boot Integration");
        doc.setContent("When engineering modern full-stack applications with React and Spring Boot:\n" +
                "1. Stateless JWT or session headers must be configured with proper CORS origins.\n" +
                "2. Standardize API envelope responses (success, message, data, timestamp).\n" +
                "3. Use database composite indexing for high-frequency queries to avoid full table scans.\n" +
                "4. Implement client-side error handling and disabled states during asynchronous operations.");
        doc.setSummary("Architectural principles for full-stack React and Spring Boot integration.");

        // Tags
        Tag tag1 = tagRepository.findByNameIgnoreCase("Architecture").orElseGet(() -> tagRepository.save(new Tag("Architecture")));
        Tag tag2 = tagRepository.findByNameIgnoreCase("FullStack").orElseGet(() -> tagRepository.save(new Tag("FullStack")));
        doc.getTags().add(tag1);
        doc.getTags().add(tag2);

        doc = documentRepository.save(doc);

        DocumentChunk chunk = new DocumentChunk();
        chunk.setDocument(doc);
        chunk.setChunkIndex(0);
        chunk.setContentChunk(doc.getContent());
        chunkRepository.save(chunk);
    }
}
