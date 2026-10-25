package com.udaan.career.repository;

import com.udaan.career.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    @Query("SELECT a FROM Application a WHERE a.user.id = :userId ORDER BY a.updatedAt DESC")
    List<Application> findByUserIdOrderByUpdatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.user.id = :userId AND a.status = :status")
    Long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") Application.ApplicationStatus status);
}
