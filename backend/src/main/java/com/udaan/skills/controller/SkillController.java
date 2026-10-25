package com.udaan.skills.controller;

import com.udaan.common.ApiResponse;
import com.udaan.skills.dto.SkillDtos.*;
import com.udaan.skills.entity.Project;
import com.udaan.skills.entity.Skill;
import com.udaan.skills.entity.UserSkill;
import com.udaan.skills.service.SkillService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    @GetMapping("/skills")
    public ResponseEntity<ApiResponse<List<Skill>>> getAllSkills() {
        return ResponseEntity.ok(ApiResponse.ok(skillService.getAllSkills()));
    }

    @GetMapping("/skills/profile")
    public ResponseEntity<ApiResponse<List<UserSkill>>> getUserSkills(
            @RequestParam(value = "userId", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(skillService.getUserSkills(userId)));
    }

    @PostMapping("/skills/profile")
    public ResponseEntity<ApiResponse<UserSkill>> addOrUpdateUserSkill(
            @RequestParam(value = "userId", defaultValue = "1") Long userId,
            @RequestBody UserSkillRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Skill proficiency saved", skillService.addOrUpdateUserSkill(userId, request)));
    }

    @GetMapping("/skills/gap-analysis")
    public ResponseEntity<ApiResponse<SkillGapResponse>> getSkillGaps(
            @RequestParam(value = "userId", defaultValue = "1") Long userId,
            @RequestParam(value = "jobId", required = false) Long jobId) {
        return ResponseEntity.ok(ApiResponse.ok(skillService.detectSkillGaps(userId, jobId)));
    }

    @GetMapping("/roadmaps")
    public ResponseEntity<ApiResponse<List<RoadmapResponse>>> getUserRoadmaps(
            @RequestParam(value = "userId", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(skillService.getUserRoadmaps(userId)));
    }

    @PostMapping("/roadmaps")
    public ResponseEntity<ApiResponse<RoadmapResponse>> generateRoadmap(
            @RequestParam(value = "userId", defaultValue = "1") Long userId,
            @RequestBody RoadmapRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Roadmap generated", skillService.generateRoadmap(userId, request)));
    }

    @PatchMapping("/roadmaps/milestones/{id}")
    public ResponseEntity<ApiResponse<RoadmapResponse>> updateMilestoneStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.getOrDefault("status", "COMPLETED");
        return ResponseEntity.ok(ApiResponse.ok("Milestone updated", skillService.updateMilestoneStatus(id, status)));
    }

    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<List<Project>>> getUserProjects(
            @RequestParam(value = "userId", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(skillService.getUserProjects(userId)));
    }

    @PostMapping("/projects")
    public ResponseEntity<ApiResponse<Project>> saveProject(
            @RequestParam(value = "userId", defaultValue = "1") Long userId,
            @RequestBody Project project) {
        return ResponseEntity.ok(ApiResponse.ok("Project saved", skillService.saveProject(userId, project)));
    }
}
