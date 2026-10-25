package com.udaan.ai.repository;

import com.udaan.ai.entity.AiInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiInteractionRepository extends JpaRepository<AiInteraction, Long> {
    @Query("SELECT a FROM AiInteraction a WHERE a.user.id = :userId ORDER BY a.createdAt DESC")
    List<AiInteraction> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    List<AiInteraction> findByModuleOrderByCreatedAtDesc(String module);
}
