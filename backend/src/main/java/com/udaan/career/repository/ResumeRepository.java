package com.udaan.career.repository;

import com.udaan.career.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    @Query("SELECT r FROM Resume r WHERE r.user.id = :userId ORDER BY r.versionNumber DESC")
    List<Resume> findByUserIdOrderByVersionNumberDesc(@Param("userId") Long userId);

    @Query("SELECT r FROM Resume r WHERE r.user.id = :userId AND r.isActive = true ORDER BY r.id DESC")
    List<Resume> findActiveByUserId(@Param("userId") Long userId);

    default Optional<Resume> findFirstByUserIdAndIsActiveTrue(Long userId) {
        return findActiveByUserId(userId).stream().findFirst();
    }
}
