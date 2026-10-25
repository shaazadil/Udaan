package com.udaan.skills.repository;

import com.udaan.skills.entity.LearningRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LearningRoadmapRepository extends JpaRepository<LearningRoadmap, Long> {
    @Query("SELECT lr FROM LearningRoadmap lr WHERE lr.user.id = :userId ORDER BY lr.createdAt DESC")
    List<LearningRoadmap> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT lr FROM LearningRoadmap lr WHERE lr.user.id = :userId AND lr.status = :status ORDER BY lr.id DESC")
    List<LearningRoadmap> findByUserIdAndStatusList(@Param("userId") Long userId, @Param("status") LearningRoadmap.RoadmapStatus status);

    default Optional<LearningRoadmap> findFirstByUserIdAndStatus(Long userId, LearningRoadmap.RoadmapStatus status) {
        return findByUserIdAndStatusList(userId, status).stream().findFirst();
    }
}
