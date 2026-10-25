package com.udaan.interview.dto;

import java.math.BigDecimal;
import java.util.List;

public class InterviewDtos {

    public static class CreateSessionRequest {
        private Long jobId;
        private String category = "TECHNICAL";
        private String difficulty = "INTERMEDIATE";
        private String targetRole;

        public Long getJobId() { return jobId; }
        public void setJobId(Long jobId) { this.jobId = jobId; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
        public String getTargetRole() { return targetRole; }
        public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
    }

    public static class SubmitAnswerRequest {
        private Long questionId;
        private String userAnswer;

        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }
        public String getUserAnswer() { return userAnswer; }
        public void setUserAnswer(String userAnswer) { this.userAnswer = userAnswer; }
    }

    public static class SessionResponse {
        private Long id;
        private Long jobId;
        private String jobTitle;
        private String category;
        private String difficulty;
        private String status;
        private BigDecimal overallScore;
        private String summaryFeedback;
        private String createdAt;
        private List<QuestionDto> questions;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getJobId() { return jobId; }
        public void setJobId(Long jobId) { this.jobId = jobId; }
        public String getJobTitle() { return jobTitle; }
        public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public BigDecimal getOverallScore() { return overallScore; }
        public void setOverallScore(BigDecimal overallScore) { this.overallScore = overallScore; }
        public String getSummaryFeedback() { return summaryFeedback; }
        public void setSummaryFeedback(String summaryFeedback) { this.summaryFeedback = summaryFeedback; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
        public List<QuestionDto> getQuestions() { return questions; }
        public void setQuestions(List<QuestionDto> questions) { this.questions = questions; }
    }

    public static class QuestionDto {
        private Long id;
        private String questionText;
        private String questionType;
        private String expectedRubric;
        private int sequenceOrder;
        private String skillName;
        private String userAnswer;
        private EvaluationDto evaluation;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getQuestionText() { return questionText; }
        public void setQuestionText(String questionText) { this.questionText = questionText; }
        public String getQuestionType() { return questionType; }
        public void setQuestionType(String questionType) { this.questionType = questionType; }
        public String getExpectedRubric() { return expectedRubric; }
        public void setExpectedRubric(String expectedRubric) { this.expectedRubric = expectedRubric; }
        public int getSequenceOrder() { return sequenceOrder; }
        public void setSequenceOrder(int sequenceOrder) { this.sequenceOrder = sequenceOrder; }
        public String getSkillName() { return skillName; }
        public void setSkillName(String skillName) { this.skillName = skillName; }
        public String getUserAnswer() { return userAnswer; }
        public void setUserAnswer(String userAnswer) { this.userAnswer = userAnswer; }
        public EvaluationDto getEvaluation() { return evaluation; }
        public void setEvaluation(EvaluationDto evaluation) { this.evaluation = evaluation; }
    }

    public static class EvaluationDto {
        private Long answerId;
        private int score;
        private String strengths;
        private String weaknesses;
        private String improvementTips;
        private String idealAnswer;
        private String conceptsToRevise;
        private String followUpQuestion;

        public Long getAnswerId() { return answerId; }
        public void setAnswerId(Long answerId) { this.answerId = answerId; }
        public int getScore() { return score; }
        public void setScore(int score) { this.score = score; }
        public String getStrengths() { return strengths; }
        public void setStrengths(String strengths) { this.strengths = strengths; }
        public String getWeaknesses() { return weaknesses; }
        public void setWeaknesses(String weaknesses) { this.weaknesses = weaknesses; }
        public String getImprovementTips() { return improvementTips; }
        public void setImprovementTips(String improvementTips) { this.improvementTips = improvementTips; }
        public String getIdealAnswer() { return idealAnswer; }
        public void setIdealAnswer(String idealAnswer) { this.idealAnswer = idealAnswer; }
        public String getConceptsToRevise() { return conceptsToRevise; }
        public void setConceptsToRevise(String conceptsToRevise) { this.conceptsToRevise = conceptsToRevise; }
        public String getFollowUpQuestion() { return followUpQuestion; }
        public void setFollowUpQuestion(String followUpQuestion) { this.followUpQuestion = followUpQuestion; }
    }
}
