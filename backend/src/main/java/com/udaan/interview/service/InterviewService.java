package com.udaan.interview.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.udaan.ai.client.GroqClient;
import com.udaan.career.entity.Job;
import com.udaan.career.repository.JobRepository;
import com.udaan.interview.dto.InterviewDtos.*;
import com.udaan.interview.entity.*;
import com.udaan.interview.repository.*;
import com.udaan.profile.entity.User;
import com.udaan.profile.repository.UserRepository;
import com.udaan.skills.entity.Skill;
import com.udaan.skills.repository.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class InterviewService {

    private final InterviewSessionRepository sessionRepository;
    private final InterviewQuestionRepository questionRepository;
    private final InterviewAnswerRepository answerRepository;
    private final AnswerEvaluationRepository evaluationRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final SkillRepository skillRepository;
    private final GroqClient groqClient;
    private final ObjectMapper objectMapper;

    public InterviewService(InterviewSessionRepository sessionRepository,
                            InterviewQuestionRepository questionRepository,
                            InterviewAnswerRepository answerRepository,
                            AnswerEvaluationRepository evaluationRepository,
                            UserRepository userRepository,
                            JobRepository jobRepository,
                            SkillRepository skillRepository,
                            GroqClient groqClient,
                            ObjectMapper objectMapper) {
        this.sessionRepository = sessionRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.evaluationRepository = evaluationRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.skillRepository = skillRepository;
        this.groqClient = groqClient;
        this.objectMapper = objectMapper;
    }

    public List<SessionResponse> getUserSessions(Long userId) {
        List<InterviewSession> sessions = sessionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<SessionResponse> result = new ArrayList<>();
        for (InterviewSession s : sessions) {
            result.add(mapToSessionResponse(s));
        }
        return result;
    }

    public SessionResponse getSessionById(Long sessionId) {
        InterviewSession s = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));
        return mapToSessionResponse(s);
    }

    @Transactional
    public SessionResponse startInterviewSession(Long userId, CreateSessionRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        Job job = null;
        if (req.getJobId() != null) {
            job = jobRepository.findById(req.getJobId()).orElse(null);
        }

        InterviewSession session = new InterviewSession();
        session.setUser(user);
        session.setJob(job);
        session.setCategory(InterviewSession.InterviewCategory.valueOf(req.getCategory()));
        session.setDifficulty(InterviewSession.InterviewDifficulty.valueOf(req.getDifficulty()));
        session.setStatus(InterviewSession.SessionStatus.IN_PROGRESS);
        sessionRepository.save(session);

        // Generate questions via Groq or fallback to high-value role-specific curriculum
        String roleTitle = (req.getTargetRole() != null && !req.getTargetRole().trim().isEmpty())
                ? req.getTargetRole().trim()
                : (job != null ? job.getJobTitle() : user.getTargetRole());

        String categoryName = req.getCategory() != null ? req.getCategory() : "TECHNICAL";
        String difficultyName = req.getDifficulty() != null ? req.getDifficulty() : "INTERMEDIATE";

        String sysPrompt = "You are an elite Principal Technical Interviewer evaluating a candidate for the role of '" + roleTitle + "'. " +
                "Generate 3 precise, in-depth mock interview questions strictly tailored to '" + roleTitle + "' for the '" + categoryName + "' category at '" + difficultyName + "' level. " +
                "If category is 'CONCEPTUAL' (System Architecture), ask realistic full-stack system architecture questions (e.g. client-side caching & state sync, REST API design, relational schema modeling, authentication & JWT/CORS, real-time updates). " +
                "If role is Full Stack Developer, NEVER ask low-level Java proxy or CGLIB questions unless explicitly requested; instead focus on React, TypeScript, Spring Boot, MySQL, REST APIs, and full-stack integration. " +
                "Output ONLY a JSON array of 3 objects with keys: questionText, questionType, expectedRubric, skillName.";
        String userPrompt = "Role: " + roleTitle + ", Category: " + categoryName + ", Difficulty: " + difficultyName;

        String aiResp = groqClient.generateChatCompletion(sysPrompt, userPrompt, "INTERVIEW", "QUESTION_GENERATION", user);
        String cleanJson = groqClient.extractJsonBlock(aiResp);

        boolean parsedAiQuestions = false;
        if (cleanJson != null && cleanJson.startsWith("[")) {
            try {
                JsonNode arrayNode = objectMapper.readTree(cleanJson);
                int order = 1;
                for (JsonNode item : arrayNode) {
                    String qText = item.path("questionText").asText();
                    String qType = item.path("questionType").asText(categoryName);
                    String rubric = item.path("expectedRubric").asText("Correct architecture and trade-off analysis.");
                    String skillName = item.path("skillName").asText("Full Stack Engineering");

                    Skill skill = skillRepository.findByNameIgnoreCase(skillName).orElse(null);
                    InterviewQuestion iq = new InterviewQuestion(session, skill, qText, qType, rubric, order++);
                    questionRepository.save(iq);
                }
                parsedAiQuestions = true;
            } catch (Exception ignored) {}
        }

        if (!parsedAiQuestions) {
            String roleLower = roleTitle.toLowerCase();
            List<String[]> defaults;

            if (roleLower.contains("full stack") || roleLower.contains("fullstack")) {
                if ("CONCEPTUAL".equalsIgnoreCase(categoryName)) {
                    defaults = List.of(
                            new String[]{"Design an end-to-end Full Stack Architecture for an e-commerce platform with a React SPA frontend, Spring Boot REST API, and MySQL relational database. How do you handle high-traffic inventory concurrency during flash sales?", "ARCHITECTURE", "Must discuss optimistic locking in MySQL, transactional isolation, inventory reservations, and client-side polling/WebSocket updates.", "System Architecture"},
                            new String[]{"Explain your multi-tier caching strategy for a high-performance web application: browser caching, CDN edge caching, and server-side Redis caching for hot database queries.", "ARCHITECTURE", "Must articulate Cache-Control headers, CDN cache invalidation, cache-aside pattern in Spring Boot, and handling stale data.", "RESTful API Design"},
                            new String[]{"Describe the complete end-to-end security architecture for an SPA communicating with a Spring Boot API, including CORS preflight, JWT storage strategies, and CSRF protection.", "SECURITY", "Must articulate CORS Origin checks, HttpOnly cookies vs Authorization headers, and token refresh.", "Security Architecture"}
                    );
                } else if ("BEHAVIORAL".equalsIgnoreCase(categoryName)) {
                    defaults = List.of(
                            new String[]{"Describe a challenging production bug you encountered across the full stack. How did you isolate whether the root cause was in the React client, API gateway, or database queries?", "BEHAVIORAL", "Must articulate STAR method: Situation, Task, debugging steps across browser DevTools and server logs, and resolution.", "Communication"},
                            new String[]{"Tell me about a time you had to make a critical trade-off between shipping a feature quickly versus addressing architectural debt in the codebase.", "BEHAVIORAL", "Must describe technical decision-making, stakeholder communication, and long-term maintainability considerations.", "Engineering Judgment"},
                            new String[]{"How do you approach code reviews and architectural discussions when collaborating with team members who have differing opinions on component or API design?", "BEHAVIORAL", "Must show empathy, constructive feedback, reliance on objective benchmarks, and adherence to team coding standards.", "Collaboration"}
                    );
                } else {
                    defaults = List.of(
                            new String[]{"In a React + Spring Boot application, explain how client-side state synchronizes with REST endpoints, and how you architect optimistic updates while handling concurrent server errors.", "TECHNICAL", "Must mention state management (Redux/React Query), rollback on HTTP 4xx/5xx, and user feedback.", "React"},
                            new String[]{"How does React's virtual DOM reconciliation (Fiber) work, and how do database transactions (ACID/MVCC) on the backend ensure consistency when multiple web clients mutate shared records?", "CONCEPTUAL", "Must discuss Fiber priority queues, component render trees, and database isolation levels (Read Committed/Repeatable Read).", "MySQL"},
                            new String[]{"Design a RESTful API contract for a paginated resource in Spring Boot, explaining how you structure DTO validation, error responses, and database paging to prevent N+1 query problems.", "TECHNICAL", "Must cover Pageable, DTO validation annotations (@Valid), GlobalExceptionHandler, and JPA JOIN FETCH or EntityGraphs.", "Spring Boot"}
                    );
                }
            } else if (roleLower.contains("frontend") || roleLower.contains("ui") || roleLower.contains("web")) {
                defaults = List.of(
                        new String[]{"Explain how React Fiber reconciles the virtual DOM tree in O(n) complexity, and what causes cascading re-renders in complex component hierarchies.", "TECHNICAL", "Must discuss heuristic diffing, stable keys, useMemo, and useCallback trade-offs.", "React"},
                        new String[]{"How do you measure and optimize Core Web Vitals (LCP, INP, CLS) in a large-scale Single Page Application?", "PERFORMANCE", "Must mention route-based code splitting, image optimization, critical CSS, and minimizing main thread blocking.", "Frontend"},
                        new String[]{"Compare TypeScript discriminated unions with traditional OOP polymorphism for modeling complex UI and API data contracts.", "CONCEPTUAL", "Must articulate compile-time type narrowing, exhaustiveness checks, and runtime safety.", "TypeScript"}
                );
            } else {
                defaults = List.of(
                        new String[]{"How does MySQL InnoDB implement transactions, and what specific roles do Undo and Redo logs play during crash recovery?", "TECHNICAL", "Must mention WAL, MVCC, redo persistence and undo rollback.", "MySQL"},
                        new String[]{"Explain the difference between JDK dynamic proxies and CGLIB in Spring Boot @Transactional, and what happens when calling a transactional method within the same bean.", "TECHNICAL", "Must articulate interface proxying vs class inheritance and self-invocation limitations.", "Spring Boot"},
                        new String[]{"Describe a scenario where a database index could actually hurt query performance or system throughput, and how you diagnose it with EXPLAIN.", "CONCEPTUAL", "Must discuss write amplification on high INSERT/UPDATE workloads, index maintenance overhead, and low cardinality.", "Database"}
                );
            }

            int order = 1;
            for (String[] def : defaults) {
                Skill skill = skillRepository.findByNameIgnoreCase(def[3]).orElse(null);
                InterviewQuestion iq = new InterviewQuestion(session, skill, def[0], def[1], def[2], order++);
                questionRepository.save(iq);
            }
        }

        return mapToSessionResponse(session);
    }

    @Transactional
    public EvaluationDto submitAnswer(Long sessionId, SubmitAnswerRequest req) {
        InterviewQuestion question = questionRepository.findById(req.getQuestionId())
                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + req.getQuestionId()));

        Optional<InterviewAnswer> existingAnswer = answerRepository.findByQuestionId(req.getQuestionId());
        InterviewAnswer answer = existingAnswer.orElseGet(() -> new InterviewAnswer(question, req.getUserAnswer()));
        answer.setUserAnswer(req.getUserAnswer());
        answer.setSubmittedAt(LocalDateTime.now());
        answerRepository.save(answer);

        // Grade response via Groq
        String sysPrompt = "You are a Principal Technical Interviewer evaluating a candidate's answer. Return strictly a JSON object with keys: score (0-100 integer), strengths, weaknesses, improvementTips, idealAnswer, conceptsToRevise, followUpQuestion.";
        String userPrompt = "Question: " + question.getQuestionText() + "\n" +
                "Expected Rubric: " + question.getExpectedRubric() + "\n" +
                "Candidate Answer: " + req.getUserAnswer();

        String aiResp = groqClient.generateChatCompletion(sysPrompt, userPrompt, "INTERVIEW", "ANSWER_EVALUATION", question.getSession().getUser());
        String cleanJson = groqClient.extractJsonBlock(aiResp);

        int score = 80;
        String strengths = "Clear structure and good high-level conceptual understanding.";
        String weaknesses = "Could provide deeper low-level technical trade-offs.";
        String tips = "Mention edge-case behaviors and internal memory structures.";
        String ideal = "An ideal response covers internal engine mechanisms and architectural guarantees.";
        String revise = question.getSkill() != null ? question.getSkill().getName() : "Core Architecture";
        String followUp = "How would you handle this scenario at scale when concurrent writes increase tenfold?";

        if (cleanJson != null && cleanJson.startsWith("{")) {
            try {
                JsonNode root = objectMapper.readTree(cleanJson);
                score = root.path("score").asInt(80);
                strengths = root.path("strengths").asText(strengths);
                weaknesses = root.path("weaknesses").asText(weaknesses);
                tips = root.path("improvementTips").asText(tips);
                ideal = root.path("idealAnswer").asText(ideal);
                revise = root.path("conceptsToRevise").asText(revise);
                followUp = root.path("followUpQuestion").asText(followUp);
            } catch (Exception ignored) {}
        } else {
            // Deterministic score based on response depth
            int wordCount = req.getUserAnswer().trim().split("\\s+").length;
            score = Math.min(95, Math.max(50, 60 + (wordCount / 5)));
        }

        AnswerEvaluation eval = evaluationRepository.findByAnswerId(answer.getId())
                .orElseGet(AnswerEvaluation::new);
        eval.setAnswer(answer);
        eval.setScore(score);
        eval.setStrengths(strengths);
        eval.setWeaknesses(weaknesses);
        eval.setImprovementTips(tips);
        eval.setIdealAnswer(ideal);
        eval.setConceptsToRevise(revise);
        evaluationRepository.save(eval);

        EvaluationDto dto = new EvaluationDto();
        dto.setAnswerId(answer.getId());
        dto.setScore(score);
        dto.setStrengths(strengths);
        dto.setWeaknesses(weaknesses);
        dto.setImprovementTips(tips);
        dto.setIdealAnswer(ideal);
        dto.setConceptsToRevise(revise);
        dto.setFollowUpQuestion(followUp);
        return dto;
    }

    @Transactional
    public SessionResponse completeSession(Long sessionId) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        List<InterviewQuestion> questions = questionRepository.findBySessionIdOrderBySequenceOrderAsc(sessionId);
        double totalScore = 0.0;
        int evaluatedCount = 0;

        for (InterviewQuestion q : questions) {
            Optional<InterviewAnswer> ans = answerRepository.findByQuestionId(q.getId());
            if (ans.isPresent()) {
                Optional<AnswerEvaluation> eval = evaluationRepository.findByAnswerId(ans.get().getId());
                if (eval.isPresent()) {
                    totalScore += eval.get().getScore();
                    evaluatedCount++;
                }
            }
        }

        double avg = evaluatedCount > 0 ? (totalScore / evaluatedCount) : 0.0;
        session.setOverallScore(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
        session.setStatus(InterviewSession.SessionStatus.COMPLETED);
        session.setCompletedAt(LocalDateTime.now());
        String revisionSkill = (questions.isEmpty() || questions.get(0).getSkill() == null)
                ? (session.getJob() != null ? session.getJob().getJobTitle() : "core full-stack architecture principles")
                : questions.get(0).getSkill().getName() + " and associated design trade-offs";
        session.setSummaryFeedback("Session completed across " + questions.size() + " questions with an average score of " +
                session.getOverallScore() + "/100. Key areas highlighted for revision: review " + revisionSkill + ".");
        sessionRepository.save(session);

        return mapToSessionResponse(session);
    }

    private SessionResponse mapToSessionResponse(InterviewSession session) {
        SessionResponse res = new SessionResponse();
        res.setId(session.getId());
        res.setJobId(session.getJob() != null ? session.getJob().getId() : null);
        res.setJobTitle(session.getJob() != null ? session.getJob().getJobTitle() : "General Target Role");
        res.setCategory(session.getCategory().name());
        res.setDifficulty(session.getDifficulty().name());
        res.setStatus(session.getStatus().name());
        res.setOverallScore(session.getOverallScore());
        res.setSummaryFeedback(session.getSummaryFeedback());
        res.setCreatedAt(session.getCreatedAt().toString());

        List<InterviewQuestion> questions = questionRepository.findBySessionIdOrderBySequenceOrderAsc(session.getId());
        List<QuestionDto> qDtos = new ArrayList<>();
        for (InterviewQuestion q : questions) {
            QuestionDto qd = new QuestionDto();
            qd.setId(q.getId());
            qd.setQuestionText(q.getQuestionText());
            qd.setQuestionType(q.getQuestionType());
            qd.setExpectedRubric(q.getExpectedRubric());
            qd.setSequenceOrder(q.getSequenceOrder());
            qd.setSkillName(q.getSkill() != null ? q.getSkill().getName() : "General");

            Optional<InterviewAnswer> ans = answerRepository.findByQuestionId(q.getId());
            if (ans.isPresent()) {
                qd.setUserAnswer(ans.get().getUserAnswer());
                Optional<AnswerEvaluation> eval = evaluationRepository.findByAnswerId(ans.get().getId());
                if (eval.isPresent()) {
                    EvaluationDto ed = new EvaluationDto();
                    ed.setAnswerId(ans.get().getId());
                    ed.setScore(eval.get().getScore());
                    ed.setStrengths(eval.get().getStrengths());
                    ed.setWeaknesses(eval.get().getWeaknesses());
                    ed.setImprovementTips(eval.get().getImprovementTips());
                    ed.setIdealAnswer(eval.get().getIdealAnswer());
                    ed.setConceptsToRevise(eval.get().getConceptsToRevise());
                    qd.setEvaluation(ed);
                }
            }
            qDtos.add(qd);
        }
        res.setQuestions(qDtos);
        return res;
    }
}
