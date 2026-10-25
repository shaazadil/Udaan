package com.udaan.knowledge.dto;

import java.util.List;

public class KnowledgeDtos {

    public static class DocumentRequest {
        private String title;
        private String content;
        private String resourceUrl;
        private List<String> tags;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getResourceUrl() { return resourceUrl; }
        public void setResourceUrl(String resourceUrl) { this.resourceUrl = resourceUrl; }
        public List<String> getTags() { return tags; }
        public void setTags(List<String> tags) { this.tags = tags; }
    }

    public static class DocumentResponse {
        private Long id;
        private String title;
        private String content;
        private String summary;
        private String resourceUrl;
        private List<String> tags;
        private String createdAt;
        private String updatedAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getSummary() { return summary; }
        public void setSummary(String summary) { this.summary = summary; }
        public String getResourceUrl() { return resourceUrl; }
        public void setResourceUrl(String resourceUrl) { this.resourceUrl = resourceUrl; }
        public List<String> getTags() { return tags; }
        public void setTags(List<String> tags) { this.tags = tags; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
        public String getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class AskRequest {
        private String question;
        private Long documentId;

        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }
        public Long getDocumentId() { return documentId; }
        public void setDocumentId(Long documentId) { this.documentId = documentId; }
    }

    public static class AskResponse {
        private String answer;
        private List<String> sourceReferences;
        private boolean groundedInSources;

        public String getAnswer() { return answer; }
        public void setAnswer(String answer) { this.answer = answer; }
        public List<String> getSourceReferences() { return sourceReferences; }
        public void setSourceReferences(List<String> sourceReferences) { this.sourceReferences = sourceReferences; }
        public boolean isGroundedInSources() { return groundedInSources; }
        public void setGroundedInSources(boolean groundedInSources) { this.groundedInSources = groundedInSources; }
    }

    public static class RevisionQuestionItem {
        private String question;
        private String answer;
        private String keyConcepts;
        private String type;

        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }
        public String getAnswer() { return answer; }
        public void setAnswer(String answer) { this.answer = answer; }
        public String getKeyConcepts() { return keyConcepts; }
        public void setKeyConcepts(String keyConcepts) { this.keyConcepts = keyConcepts; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
    }
}
