package com.udaan.career.repository;

import com.udaan.career.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByUserIdOrderByUpdatedAtDesc(Long userId);
    Long countByUserId(Long userId);
    Long countByUserIdAndStatus(Long userId, Application.ApplicationStatus status);
}
