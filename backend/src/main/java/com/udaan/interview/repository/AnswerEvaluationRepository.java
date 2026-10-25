package com.udaan.interview.repository;

import com.udaan.interview.entity.AnswerEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnswerEvaluationRepository extends JpaRepository<AnswerEvaluation, Long> {
    Optional<AnswerEvaluation> findByAnswerId(Long answerId);
}
