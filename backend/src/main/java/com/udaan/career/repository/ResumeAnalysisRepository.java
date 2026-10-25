package com.udaan.career.repository;

import com.udaan.career.entity.ResumeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeAnalysisRepository extends JpaRepository<ResumeAnalysis, Long> {
    List<ResumeAnalysis> findByResumeUserIdOrderByCreatedAtDesc(Long userId);
    List<ResumeAnalysis> findByJobIdOrderByCreatedAtDesc(Long jobId);

    @Query("SELECT ra FROM ResumeAnalysis ra WHERE ra.resume.user.id = :userId ORDER BY ra.createdAt DESC LIMIT 1")
    Optional<ResumeAnalysis> findLatestByUserId(@Param("userId") Long userId);
}
