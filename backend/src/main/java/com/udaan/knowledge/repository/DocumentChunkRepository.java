package com.udaan.knowledge.repository;

import com.udaan.knowledge.entity.DocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, Long> {
    List<DocumentChunk> findByDocumentIdOrderByChunkIndexAsc(Long documentId);

    @Query(value = "SELECT dc.* FROM document_chunks dc JOIN documents d ON dc.document_id = d.id WHERE d.user_id = :userId AND " +
           "LOWER(dc.content_chunk) LIKE LOWER(CONCAT('%', :query, '%'))", nativeQuery = true)
    List<DocumentChunk> searchChunksByKeyword(@Param("userId") Long userId, @Param("query") String query);
}
