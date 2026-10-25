package com.udaan.knowledge.repository;

import com.udaan.knowledge.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    @Query("SELECT d FROM Document d WHERE d.user.id = :userId ORDER BY d.updatedAt DESC")
    List<Document> findByUserIdOrderByUpdatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT COUNT(d) FROM Document d WHERE d.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);

    @Query(value = "SELECT * FROM documents d WHERE d.user_id = :userId AND " +
           "(LOWER(d.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(d.content) LIKE LOWER(CONCAT('%', :query, '%')))", nativeQuery = true)
    List<Document> searchUserDocuments(@Param("userId") Long userId, @Param("query") String query);
}
