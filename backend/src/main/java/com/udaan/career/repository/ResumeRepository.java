package com.udaan.career.repository;

import com.udaan.career.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByUserIdOrderByVersionNumberDesc(Long userId);
    Optional<Resume> findFirstByUserIdAndIsActiveTrue(Long userId);
}
