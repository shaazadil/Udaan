package com.udaan.skills.repository;

import com.udaan.skills.entity.LearningRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LearningRoadmapRepository extends JpaRepository<LearningRoadmap, Long> {
    List<LearningRoadmap> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<LearningRoadmap> findFirstByUserIdAndStatus(Long userId, LearningRoadmap.RoadmapStatus status);
}
