package com.udaan.knowledge.controller;

import com.udaan.common.ApiResponse;
import com.udaan.knowledge.dto.KnowledgeDtos.*;
import com.udaan.knowledge.entity.Tag;
import com.udaan.knowledge.service.KnowledgeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/knowledge")
public class KnowledgeController {

    private final KnowledgeService knowledgeService;

    public KnowledgeController(KnowledgeService knowledgeService) {
        this.knowledgeService = knowledgeService;
    }

    @GetMapping("/documents")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> getUserDocuments(
            @RequestParam(value = "userId", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(knowledgeService.getUserDocuments(userId)));
    }

    @GetMapping("/documents/{id}")
    public ResponseEntity<ApiResponse<DocumentResponse>> getDocumentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(knowledgeService.getDocumentById(id)));
    }

    @PostMapping("/documents")
    public ResponseEntity<ApiResponse<DocumentResponse>> saveDocument(
            @RequestParam(value = "userId", defaultValue = "1") Long userId,
            @RequestBody DocumentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Note saved and indexed", knowledgeService.saveDocument(userId, request)));
    }

    @DeleteMapping("/documents/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable Long id) {
        knowledgeService.deleteDocument(id);
        return ResponseEntity.ok(ApiResponse.ok("Document deleted", null));
    }

    @GetMapping("/tags")
    public ResponseEntity<ApiResponse<List<Tag>>> getAllTags() {
        return ResponseEntity.ok(ApiResponse.ok(knowledgeService.getAllTags()));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> searchDocuments(
            @RequestParam(value = "userId", defaultValue = "1") Long userId,
            @RequestParam("query") String query) {
        return ResponseEntity.ok(ApiResponse.ok(knowledgeService.searchDocuments(userId, query)));
    }

    @PostMapping("/ask")
    public ResponseEntity<ApiResponse<AskResponse>> askKnowledgeAssistant(
            @RequestParam(value = "userId", defaultValue = "1") Long userId,
            @RequestBody AskRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Assistant responded", knowledgeService.askKnowledgeAssistant(userId, request)));
    }

    @PostMapping("/revision-questions")
    public ResponseEntity<ApiResponse<List<RevisionQuestionItem>>> generateRevisionQuestions(
            @RequestParam(value = "userId", defaultValue = "1") Long userId,
            @RequestParam("documentId") Long documentId) {
        return ResponseEntity.ok(ApiResponse.ok("Revision flashcards generated",
                knowledgeService.generateRevisionQuestions(userId, documentId)));
    }
}
