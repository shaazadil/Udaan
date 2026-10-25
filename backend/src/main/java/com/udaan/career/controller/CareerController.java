package com.udaan.career.controller;

import com.udaan.career.dto.CareerDtos.*;
import com.udaan.career.entity.Application;
import com.udaan.career.entity.Job;
import com.udaan.career.entity.Resume;
import com.udaan.career.service.CareerService;
import com.udaan.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CareerController {

    private final CareerService careerService;
    private final Long DEFAULT_USER_ID = 1L; // User Aarav Sharma from seed data

    public CareerController(CareerService careerService) {
        this.careerService = careerService;
    }

    @GetMapping("/resumes")
    public ResponseEntity<ApiResponse<List<Resume>>> getUserResumes(
            @RequestParam(value = "userId", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(careerService.getUserResumes(userId)));
    }

    @PostMapping("/resumes")
    public ResponseEntity<ApiResponse<Resume>> saveResume(
            @RequestParam(value = "userId", defaultValue = "1") Long userId,
            @RequestBody ResumeRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Resume saved successfully", careerService.saveResume(userId, request)));
    }

    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<List<Job>>> getUserJobs(
            @RequestParam(value = "userId", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(careerService.getUserJobs(userId)));
    }

    @GetMapping("/jobs/{id}")
    public ResponseEntity<ApiResponse<Job>> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(careerService.getJobById(id)));
    }

    @PostMapping("/jobs")
    public ResponseEntity<ApiResponse<Job>> saveJob(
            @RequestParam(value = "userId", defaultValue = "1") Long userId,
            @RequestBody JobRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Job saved successfully", careerService.saveJob(userId, request)));
    }

    @PostMapping("/career/analyze")
    public ResponseEntity<ApiResponse<AnalysisResponse>> analyzeCompatibility(
            @RequestParam(value = "userId", defaultValue = "1") Long userId,
            @RequestBody AnalyzeRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Analysis generated successfully",
                careerService.analyzeResumeCompatibility(userId, request)));
    }

    @GetMapping("/career/analyses")
    public ResponseEntity<ApiResponse<List<AnalysisResponse>>> getAnalysisHistory(
            @RequestParam(value = "userId", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(careerService.getAnalysisHistory(userId)));
    }

    @GetMapping("/applications")
    public ResponseEntity<ApiResponse<List<Application>>> getUserApplications(
            @RequestParam(value = "userId", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(careerService.getUserApplications(userId)));
    }

    @PostMapping("/applications")
    public ResponseEntity<ApiResponse<Application>> trackApplication(
            @RequestParam(value = "userId", defaultValue = "1") Long userId,
            @RequestBody ApplicationRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Application recorded", careerService.trackApplication(userId, request)));
    }

    @PatchMapping("/applications/{id}/status")
    public ResponseEntity<ApiResponse<Application>> updateApplicationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.getOrDefault("status", "APPLIED");
        String notes = body.get("notes");
        return ResponseEntity.ok(ApiResponse.ok("Status updated", careerService.updateApplicationStatus(id, status, notes)));
    }
}
