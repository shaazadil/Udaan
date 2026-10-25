package com.udaan.skills.repository;

import com.udaan.skills.entity.RoadmapMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoadmapMilestoneRepository extends JpaRepository<RoadmapMilestone, Long> {
    List<RoadmapMilestone> findByRoadmapIdOrderByStepOrderAsc(Long roadmapId);
    Long countByRoadmapId(Long roadmapId);
    Long countByRoadmapIdAndStatus(Long roadmapId, RoadmapMilestone.MilestoneStatus status);
}
