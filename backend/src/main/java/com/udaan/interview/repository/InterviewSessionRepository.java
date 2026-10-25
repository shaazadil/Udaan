package com.udaan.interview.repository;

import com.udaan.interview.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {
    @Query("SELECT s FROM InterviewSession s WHERE s.user.id = :userId ORDER BY s.createdAt DESC")
    List<InterviewSession> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT COUNT(s) FROM InterviewSession s WHERE s.user.id = :userId AND s.status = :status")
    Long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") InterviewSession.SessionStatus status);

    @Query("SELECT AVG(s.overallScore) FROM InterviewSession s WHERE s.user.id = :userId AND s.status = 'COMPLETED'")
    Double getAverageScoreByUserId(@Param("userId") Long userId);
}
