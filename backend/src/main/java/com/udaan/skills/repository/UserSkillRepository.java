package com.udaan.skills.repository;

import com.udaan.skills.entity.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {
    @Query("SELECT us FROM UserSkill us WHERE us.user.id = :userId")
    List<UserSkill> findByUserId(@Param("userId") Long userId);

    @Query("SELECT us FROM UserSkill us WHERE us.user.id = :userId AND us.skill.id = :skillId")
    Optional<UserSkill> findByUserIdAndSkillId(@Param("userId") Long userId, @Param("skillId") Long skillId);

    @Query("SELECT COUNT(us) FROM UserSkill us WHERE us.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(us) FROM UserSkill us WHERE us.user.id = :userId AND us.proficiencyLevel = :level")
    Long countByUserIdAndProficiencyLevel(@Param("userId") Long userId, @Param("level") UserSkill.ProficiencyLevel level);
}
