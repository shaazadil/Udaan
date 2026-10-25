package com.udaan.skills.repository;

import com.udaan.skills.entity.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {
    List<UserSkill> findByUserId(Long userId);
    Optional<UserSkill> findByUserIdAndSkillId(Long userId, Long skillId);
    Long countByUserId(Long userId);
    Long countByUserIdAndProficiencyLevel(Long userId, UserSkill.ProficiencyLevel level);
}
