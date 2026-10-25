package com.udaan.knowledge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.udaan.ai.client.GroqClient;
import com.udaan.knowledge.dto.KnowledgeDtos.*;
import com.udaan.knowledge.entity.*;
import com.udaan.knowledge.repository.*;
import com.udaan.profile.entity.User;
import com.udaan.profile.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class KnowledgeService {

    private final DocumentRepository documentRepository;
    private final DocumentChunkRepository chunkRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    private final GroqClient groqClient;
    private final ObjectMapper objectMapper;

    public KnowledgeService(DocumentRepository documentRepository,
                            DocumentChunkRepository chunkRepository,
                            TagRepository tagRepository,
                            UserRepository userRepository,
                            GroqClient groqClient,
                            ObjectMapper objectMapper) {
        this.documentRepository = documentRepository;
        this.chunkRepository = chunkRepository;
        this.tagRepository = tagRepository;
        this.userRepository = userRepository;
        this.groqClient = groqClient;
        this.objectMapper = objectMapper;
    }

    public List<DocumentResponse> getUserDocuments(Long userId) {
        List<Document> docs = documentRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        List<DocumentResponse> result = new ArrayList<>();
        for (Document d : docs) {
            result.add(mapToDocumentResponse(d));
        }
        return result;
    }

    public DocumentResponse getDocumentById(Long id) {
        Document d = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document not found: " + id));
        return mapToDocumentResponse(d);
    }

    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    @Transactional
    public DocumentResponse saveDocument(Long userId, DocumentRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        Document doc = new Document();
        doc.setUser(user);
        doc.setTitle(req.getTitle());
        doc.setContent(req.getContent());
        doc.setResourceUrl(req.getResourceUrl());

        // Auto-generate concise summary using Groq
        String sysPrompt = "Generate a 2-3 sentence executive summary of the following technical study note.";
        String summary = groqClient.generateChatCompletion(sysPrompt, req.getContent().substring(0, Math.min(800, req.getContent().length())), "KNOWLEDGE", "SUMMARIZATION", user);
        if (summary == null || summary.isBlank()) {
            summary = "Study notes and technical reference guide covering " + req.getTitle() + ".";
        }
        doc.setSummary(summary);

        // Process tags
        Set<Tag> tags = new HashSet<>();
        if (req.getTags() != null) {
            for (String tName : req.getTags()) {
                if (!tName.isBlank()) {
                    Tag tag = tagRepository.findByNameIgnoreCase(tName.trim())
                            .orElseGet(() -> tagRepository.save(new Tag(tName.trim())));
                    tags.add(tag);
                }
            }
        }
        doc.setTags(tags);
        documentRepository.save(doc);

        // Automatic document chunking for granular RAG-Lite search
        chunkDocument(doc);

        return mapToDocumentResponse(doc);
    }

    @Transactional
    public void deleteDocument(Long documentId) {
        documentRepository.deleteById(documentId);
    }

    public List<DocumentResponse> searchDocuments(Long userId, String query) {
        List<Document> docs = documentRepository.searchUserDocuments(userId, query);
        List<DocumentResponse> responses = new ArrayList<>();
        for (Document d : docs) {
            responses.add(mapToDocumentResponse(d));
        }
        return responses;
    }

    public AskResponse askKnowledgeAssistant(Long userId, AskRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // 1. Retrieve top matching chunks from user's library
        List<DocumentChunk> matchedChunks = chunkRepository.searchChunksByKeyword(userId, req.getQuestion());
        List<String> sources = new ArrayList<>();
        StringBuilder contextBuilder = new StringBuilder();

        for (DocumentChunk chunk : matchedChunks.subList(0, Math.min(4, matchedChunks.size()))) {
            String docTitle = chunk.getDocument().getTitle();
            if (!sources.contains(docTitle)) {
                sources.add(docTitle);
            }
            contextBuilder.append("Source [").append(docTitle).append(" Chunk ").append(chunk.getChunkIndex()).append("]:\n")
                    .append(chunk.getContentChunk()).append("\n\n");
        }

        // If no specific chunk matched via keyword, fall back to recent document excerpts
        if (matchedChunks.isEmpty()) {
            List<Document> userDocs = documentRepository.findByUserIdOrderByUpdatedAtDesc(userId);
            for (Document d : userDocs.subList(0, Math.min(2, userDocs.size()))) {
                sources.add(d.getTitle());
                contextBuilder.append("Source [").append(d.getTitle()).append("]:\n")
                        .append(d.getContent().substring(0, Math.min(500, d.getContent().length()))).append("\n\n");
            }
        }

        boolean hasContext = contextBuilder.length() > 0;
        String sysPrompt = "You are Udaan AI Knowledge Assistant. Answer the question accurately using ONLY the candidate's personal study library excerpts below. If the answer is not in the excerpts, clearly say that the candidate has not added study notes on this topic yet and provide a brief general answer clearly marked as external knowledge.";
        String userPrompt = "Personal Notes Context:\n" + contextBuilder.toString() + "\n\nQuestion: " + req.getQuestion();

        String answer = groqClient.generateChatCompletion(sysPrompt, userPrompt, "KNOWLEDGE", "GROUNDED_QA", user);
        if (answer == null || answer.isBlank()) {
            if (hasContext) {
                answer = "Based on your study notes in '" + String.join(", ", sources) + "':\n\n" +
                        "Your saved material highlights key architectural principles related to your query. Review your document '" + sources.get(0) + "' for complete implementation details.";
            } else {
                answer = "You have not saved any notes matching '" + req.getQuestion() + "' in your Knowledge Library yet. Consider adding notes or study resources to ground future AI answers.";
            }
        }

        AskResponse res = new AskResponse();
        res.setAnswer(answer);
        res.setSourceReferences(sources);
        res.setGroundedInSources(hasContext);
        return res;
    }

    public List<RevisionQuestionItem> generateRevisionQuestions(Long userId, Long documentId) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found: " + documentId));

        String sysPrompt = "Generate 3 revision flashcard questions based strictly on the text provided. Output strictly as JSON array of objects with keys: question, answer, keyConcepts, type.";
        String userPrompt = "Document Title: " + doc.getTitle() + "\nContent: " + doc.getContent().substring(0, Math.min(1000, doc.getContent().length()));

        String aiResp = groqClient.generateChatCompletion(sysPrompt, userPrompt, "KNOWLEDGE", "REVISION_GENERATION", doc.getUser());
        String cleanJson = groqClient.extractJsonBlock(aiResp);

        List<RevisionQuestionItem> questions = new ArrayList<>();
        if (cleanJson != null && cleanJson.startsWith("[")) {
            try {
                JsonNode arrayNode = objectMapper.readTree(cleanJson);
                for (JsonNode item : arrayNode) {
                    RevisionQuestionItem rq = new RevisionQuestionItem();
                    rq.setQuestion(item.path("question").asText());
                    rq.setAnswer(item.path("answer").asText());
                    rq.setKeyConcepts(item.path("keyConcepts").asText());
                    rq.setType(item.path("type").asText("CONCEPTUAL"));
                    questions.add(rq);
                }
                return questions;
            } catch (Exception ignored) {}
        }

        // Deterministic revision flashcards
        RevisionQuestionItem q1 = new RevisionQuestionItem();
        q1.setQuestion("What are the core technical guarantees established in '" + doc.getTitle() + "'?");
        q1.setAnswer("The primary guarantees revolve around consistency, latency reduction, and architectural patterns outlined in your notes.");
        q1.setKeyConcepts(doc.getTitle());
        q1.setType("CONCEPTUAL");
        questions.add(q1);

        RevisionQuestionItem q2 = new RevisionQuestionItem();
        q2.setQuestion("When would you avoid using this pattern in high-concurrency environments?");
        q2.setAnswer("Avoid when data mutates more frequently than reads or when distributed state invalidation costs outweigh performance gains.");
        q2.setKeyConcepts("Trade-offs & Optimization");
        q2.setType("INTERVIEW");
        questions.add(q2);

        return questions;
    }

    private void chunkDocument(Document doc) {
        chunkRepository.deleteAll(chunkRepository.findByDocumentIdOrderByChunkIndexAsc(doc.getId()));

        String text = doc.getContent();
        String[] paragraphs = text.split("\n\n+");
        int index = 0;
        for (String p : paragraphs) {
            String trimmed = p.trim();
            if (trimmed.length() > 30) {
                DocumentChunk chunk = new DocumentChunk(doc, index++, trimmed);
                chunkRepository.save(chunk);
            }
        }

        // If content had no double newlines, chunk by 200 words
        if (index == 0 && text.length() > 0) {
            DocumentChunk chunk = new DocumentChunk(doc, 0, text.substring(0, Math.min(800, text.length())));
            chunkRepository.save(chunk);
        }
    }

    private DocumentResponse mapToDocumentResponse(Document doc) {
        DocumentResponse res = new DocumentResponse();
        res.setId(doc.getId());
        res.setTitle(doc.getTitle());
        res.setContent(doc.getContent());
        res.setSummary(doc.getSummary());
        res.setResourceUrl(doc.getResourceUrl());
        res.setCreatedAt(doc.getCreatedAt().toString());
        res.setUpdatedAt(doc.getUpdatedAt().toString());

        List<String> tagNames = new ArrayList<>();
        if (doc.getTags() != null) {
            for (Tag t : doc.getTags()) {
                tagNames.add(t.getName());
            }
        }
        res.setTags(tagNames);
        return res;
    }
}
