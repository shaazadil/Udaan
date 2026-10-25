package com.udaan.interview.controller;

import com.udaan.common.ApiResponse;
import com.udaan.interview.dto.InterviewDtos.*;
import com.udaan.interview.service.InterviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @GetMapping("/interviews")
    public ResponseEntity<ApiResponse<List<SessionResponse>>> getUserSessions(
            @RequestParam(value = "userId", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(interviewService.getUserSessions(userId)));
    }

    @GetMapping("/interviews/{id}")
    public ResponseEntity<ApiResponse<SessionResponse>> getSessionById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(interviewService.getSessionById(id)));
    }

    @PostMapping("/interviews")
    public ResponseEntity<ApiResponse<SessionResponse>> startSession(
            @RequestParam(value = "userId", defaultValue = "1") Long userId,
            @RequestBody CreateSessionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Interview session started", interviewService.startInterviewSession(userId, request)));
    }

    @PostMapping("/interviews/{id}/answers")
    public ResponseEntity<ApiResponse<EvaluationDto>> submitAnswer(
            @PathVariable Long id,
            @RequestBody SubmitAnswerRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Answer evaluated", interviewService.submitAnswer(id, request)));
    }

    @PostMapping("/interviews/{id}/complete")
    public ResponseEntity<ApiResponse<SessionResponse>> completeSession(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Interview completed", interviewService.completeSession(id)));
    }
}
