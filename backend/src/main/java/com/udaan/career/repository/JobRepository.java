package com.udaan.career.repository;

import com.udaan.career.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    @Query("SELECT j FROM Job j WHERE j.user.id = :userId ORDER BY j.createdAt DESC")
    List<Job> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT COUNT(j) FROM Job j WHERE j.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);
}
