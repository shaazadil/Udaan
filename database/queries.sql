-- =============================================================================
-- UDAAN AI — ACADEMIC RDBMS DEMONSTRATION QUERIES
-- Database: udaan_db
--
-- This script contains 10 rigorous, product-oriented SQL queries demonstrating:
-- 1. Multi-table INNER & LEFT JOINs
-- 2. Aggregate functions (COUNT, AVG, SUM) with GROUP BY & HAVING
-- 3. Correlated & Uncorrelated Subqueries
-- 4. Full-Text Natural Language Search
-- 5. ACID Transactional Operations
-- 6. Relational Database Views
-- =============================================================================

USE udaan_db;

-- -----------------------------------------------------------------------------
-- QUERY 1: Multi-Table LEFT JOIN with Application Pipeline State
-- Retrieve all jobs saved by User 1 alongside application status, applied date,
-- and latest compatibility score from resume analyses.
-- -----------------------------------------------------------------------------
SELECT 
    j.id AS job_id,
    j.job_title,
    j.company_name,
    j.location,
    COALESCE(a.status, 'NOT_APPLIED') AS application_status,
    a.applied_date,
    ra.compatibility_score AS latest_match_score,
    ra.created_at AS analysis_date
FROM jobs j
LEFT JOIN applications a ON j.id = a.job_id AND a.user_id = j.user_id
LEFT JOIN (
    SELECT job_id, compatibility_score, created_at,
           ROW_NUMBER() OVER (PARTITION BY job_id ORDER BY created_at DESC) as rn
    FROM resume_analyses
) ra ON j.id = ra.job_id AND ra.rn = 1
WHERE j.user_id = 1
ORDER BY j.created_at DESC;

-- -----------------------------------------------------------------------------
-- QUERY 2: Skill Gap Identification (Correlated Subquery & LEFT JOIN)
-- For Job 1, list all required skills, check if candidate has verified evidence,
-- and classify missing vs demonstrated competencies.
-- -----------------------------------------------------------------------------
SELECT 
    s.name AS required_skill,
    s.category AS skill_category,
    jr.is_mandatory,
    jr.weight AS requirement_importance,
    COALESCE(us.proficiency_level, 'NOT_EVIDENCED') AS candidate_proficiency,
    COALESCE(us.evidence_source, 'NONE') AS evidence_source,
    CASE 
        WHEN us.proficiency_level IN ('INTERMEDIATE', 'ADVANCED') THEN 'STRONG_MATCH'
        WHEN us.proficiency_level IN ('BEGINNER', 'DEVELOPING') THEN 'PARTIAL_MATCH'
        ELSE 'CRITICAL_GAP'
    END AS match_verdict
FROM job_requirements jr
JOIN skills s ON jr.skill_id = s.id
LEFT JOIN user_skills us ON jr.skill_id = us.skill_id AND us.user_id = (SELECT user_id FROM jobs WHERE id = jr.job_id)
WHERE jr.job_id = 1
ORDER BY jr.is_mandatory DESC, jr.weight DESC;

-- -----------------------------------------------------------------------------
-- QUERY 3: Aggregation & Milestone Completion Metrics (GROUP BY & Arithmetic)
-- Calculate exact roadmap progress percentages, total estimated study hours,
-- and counts of completed vs pending milestones per active roadmap.
-- -----------------------------------------------------------------------------
SELECT 
    lr.id AS roadmap_id,
    lr.title AS roadmap_title,
    lr.target_role,
    COUNT(rm.id) AS total_milestones,
    SUM(CASE WHEN rm.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_milestones,
    SUM(CASE WHEN rm.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS in_progress_milestones,
    SUM(CASE WHEN rm.status = 'NOT_STARTED' THEN 1 ELSE 0 END) AS pending_milestones,
    SUM(rm.estimated_hours) AS total_curriculum_hours,
    ROUND(
        (SUM(CASE WHEN rm.status = 'COMPLETED' THEN 1 ELSE 0 END) * 100.0) / NULLIF(COUNT(rm.id), 0), 
        1
    ) AS progress_percentage
FROM learning_roadmaps lr
JOIN roadmap_milestones rm ON lr.id = rm.roadmap_id
WHERE lr.user_id = 1
GROUP BY lr.id, lr.title, lr.target_role;

-- -----------------------------------------------------------------------------
-- QUERY 4: Mock Interview Performance Evaluation Aggregates (HAVING & AVG)
-- Summarize a user's practice scores grouped by question category, filtering
-- categories with an average score below 90 to flag for revision.
-- -----------------------------------------------------------------------------
SELECT 
    s.category AS session_category,
    COUNT(q.id) AS total_questions_answered,
    ROUND(AVG(e.score), 2) AS average_score,
    MIN(e.score) AS lowest_score,
    MAX(e.score) AS peak_score
FROM interview_sessions s
JOIN interview_questions q ON s.id = q.session_id
JOIN interview_answers a ON q.id = a.question_id
JOIN answer_evaluations e ON a.id = e.answer_id
WHERE s.user_id = 1
GROUP BY s.category
HAVING average_score < 90.00;

-- -----------------------------------------------------------------------------
-- QUERY 5: Cross-Module Grounded Search (Many-to-Many JOIN with FULLTEXT)
-- Find study notes in User's Knowledge Library matching specific tags ('MySQL' or 'Indexing')
-- or containing the query keyword 'InnoDB' in fulltext content.
-- -----------------------------------------------------------------------------
SELECT DISTINCT
    d.id AS document_id,
    d.title,
    d.summary,
    GROUP_CONCAT(DISTINCT t.name ORDER BY t.name SEPARATOR ', ') AS associated_tags,
    d.updated_at
FROM documents d
JOIN document_tags dt ON d.id = dt.document_id
JOIN tags t ON dt.tag_id = t.id
WHERE d.user_id = 1
  AND (t.name IN ('MySQL', 'Indexing') 
       OR MATCH(d.title, d.content) AGAINST('InnoDB' IN NATURAL LANGUAGE MODE))
GROUP BY d.id, d.title, d.summary, d.updated_at;

-- -----------------------------------------------------------------------------
-- QUERY 6: Subquery with IN — Detect Skills Needing Project Evidence
-- Identify all skills that a user claims at BEGINNER or DEVELOPING level without
-- any associated GitHub-backed project in the projects table.
-- -----------------------------------------------------------------------------
SELECT 
    s.id AS skill_id,
    s.name AS skill_name,
    us.proficiency_level,
    us.evidence_description
FROM user_skills us
JOIN skills s ON us.skill_id = s.id
WHERE us.user_id = 1
  AND us.proficiency_level IN ('BEGINNER', 'DEVELOPING')
  AND s.name NOT IN (
      SELECT DISTINCT p.technologies
      FROM projects p
      WHERE p.user_id = 1 AND p.github_url IS NOT NULL
  );

-- -----------------------------------------------------------------------------
-- QUERY 7: Application Funnel Distribution (Conditional Aggregation)
-- Calculate the current pipeline counts across all active job application stages.
-- -----------------------------------------------------------------------------
SELECT 
    COUNT(*) AS total_applications,
    SUM(CASE WHEN status = 'SAVED' THEN 1 ELSE 0 END) AS saved_count,
    SUM(CASE WHEN status = 'APPLIED' THEN 1 ELSE 0 END) AS applied_count,
    SUM(CASE WHEN status = 'ASSESSMENT' THEN 1 ELSE 0 END) AS assessment_count,
    SUM(CASE WHEN status = 'INTERVIEWING' THEN 1 ELSE 0 END) AS interviewing_count,
    SUM(CASE WHEN status = 'OFFERED' THEN 1 ELSE 0 END) AS offer_count,
    SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected_count
FROM applications
WHERE user_id = 1;

-- -----------------------------------------------------------------------------
-- QUERY 8: Relational Database VIEW Definition — Candidate Readiness Summary
-- Provides an abstracted, real-time view combining resume, roadmap, and interview metrics.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_user_readiness_summary AS
SELECT 
    u.id AS user_id,
    u.name,
    u.target_role,
    COUNT(DISTINCT us.skill_id) AS total_skills_profiled,
    COUNT(DISTINCT CASE WHEN us.proficiency_level = 'ADVANCED' THEN us.skill_id END) AS advanced_skills_count,
    COALESCE(ROUND(AVG(rm.progress), 1), 0.0) AS avg_roadmap_completion,
    COALESCE(ROUND(AVG(sess.overall_score), 1), 0.0) AS avg_interview_score,
    COUNT(DISTINCT doc.id) AS total_notes_saved
FROM users u
LEFT JOIN user_skills us ON u.id = us.user_id
LEFT JOIN (
    SELECT roadmap_id, 
           (SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) * 100.0) / COUNT(*) as progress
    FROM roadmap_milestones GROUP BY roadmap_id
) rm ON rm.roadmap_id IN (SELECT id FROM learning_roadmaps WHERE user_id = u.id)
LEFT JOIN interview_sessions sess ON u.id = sess.user_id AND sess.status = 'COMPLETED'
LEFT JOIN documents doc ON u.id = doc.user_id
GROUP BY u.id, u.name, u.target_role;

-- Execute query on the newly defined View:
SELECT * FROM view_user_readiness_summary WHERE user_id = 1;

-- -----------------------------------------------------------------------------
-- QUERY 9: Chunk Retrieval for Grounded RAG-Lite Assistant
-- Retrieve top relevant chunks for a user question matching "caching" or "transaction"
-- -----------------------------------------------------------------------------
SELECT 
    dc.id AS chunk_id,
    d.title AS document_title,
    dc.chunk_index,
    dc.content_chunk
FROM document_chunks dc
JOIN documents d ON dc.document_id = d.id
WHERE d.user_id = 1 
  AND MATCH(dc.content_chunk) AGAINST('caching transaction' IN NATURAL LANGUAGE MODE)
LIMIT 3;

-- -----------------------------------------------------------------------------
-- QUERY 10: Atomic ACID Transactional Operation
-- Safely complete a roadmap milestone, mark completion timestamp,
-- and update the parent roadmap status if all milestones are completed.
-- -----------------------------------------------------------------------------
START TRANSACTION;

-- Step A: Mark milestone as completed
UPDATE roadmap_milestones
SET status = 'COMPLETED', completed_at = NOW()
WHERE id = 2 AND roadmap_id = 1;

-- Step B: Conditionally advance roadmap status if 0 pending milestones remain
UPDATE learning_roadmaps
SET status = 'COMPLETED', updated_at = NOW()
WHERE id = 1
  AND NOT EXISTS (
      SELECT 1 FROM roadmap_milestones 
      WHERE roadmap_id = 1 AND status != 'COMPLETED'
  );

-- Commit transaction atomically
COMMIT;
