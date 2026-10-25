-- =============================================================================
-- UDAAN AI — RELATIONAL DATABASE SCHEMA (MySQL 8.0+)
-- Database: udaan_db
-- Engine: InnoDB | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- =============================================================================

CREATE DATABASE IF NOT EXISTS udaan_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE udaan_db;

-- Disable foreign key checks during drop operations for clean idempotency
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS ai_interactions;
DROP TABLE IF EXISTS document_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS document_chunks;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS answer_evaluations;
DROP TABLE IF EXISTS interview_answers;
DROP TABLE IF EXISTS interview_questions;
DROP TABLE IF EXISTS interview_sessions;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS roadmap_milestones;
DROP TABLE IF EXISTS learning_roadmaps;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS resume_analyses;
DROP TABLE IF EXISTS job_requirements;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS resumes;
DROP TABLE IF EXISTS user_skills;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 1. USERS
-- Central user profile and career baseline
-- =============================================================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NULL,
    target_role VARCHAR(150) NOT NULL DEFAULT 'Full Stack Developer',
    education VARCHAR(255) NULL,
    experience_summary TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_target_role (target_role)
) ENGINE=InnoDB;

-- =============================================================================
-- 2. SKILLS
-- Canonical skill master catalogue
-- =============================================================================
CREATE TABLE skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(80) NOT NULL DEFAULT 'General',
    description VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_skills_name (name),
    INDEX idx_skills_category (category)
) ENGINE=InnoDB;

-- =============================================================================
-- 3. USER_SKILLS
-- User verified and self-reported skill proficiencies with evidence tracing
-- =============================================================================
CREATE TABLE user_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    proficiency_level ENUM('BEGINNER', 'DEVELOPING', 'INTERMEDIATE', 'ADVANCED') NOT NULL DEFAULT 'BEGINNER',
    evidence_source ENUM('RESUME', 'PROJECT', 'INTERVIEW', 'MANUAL_DECLARATION') NOT NULL DEFAULT 'MANUAL_DECLARATION',
    evidence_description TEXT NULL,
    confidence_level DECIMAL(3,2) DEFAULT 0.50, -- Value between 0.00 and 1.00
    assessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_skills_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE RESTRICT,
    UNIQUE KEY uq_user_skill (user_id, skill_id),
    INDEX idx_user_skills_user (user_id),
    INDEX idx_user_skills_skill (skill_id),
    INDEX idx_user_skills_proficiency (proficiency_level)
) ENGINE=InnoDB;

-- =============================================================================
-- 4. RESUMES
-- Versioned resume documents stored with raw extraction text
-- =============================================================================
CREATE TABLE resumes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL DEFAULT 'Primary Resume',
    raw_text LONGTEXT NOT NULL,
    version_number INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_resumes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_resumes_user (user_id),
    INDEX idx_resumes_active (user_id, is_active)
) ENGINE=InnoDB;

-- =============================================================================
-- 5. JOBS
-- Saved job descriptions targeted by candidates
-- =============================================================================
CREATE TABLE jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    job_title VARCHAR(200) NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    description_text TEXT NOT NULL,
    location VARCHAR(150) NULL DEFAULT 'Remote',
    employment_type VARCHAR(50) NULL DEFAULT 'Full-time',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_jobs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_jobs_user (user_id),
    INDEX idx_jobs_company (company_name)
) ENGINE=InnoDB;

-- =============================================================================
-- 6. JOB_REQUIREMENTS
-- Normalized requirements extracted from job postings
-- =============================================================================
CREATE TABLE job_requirements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT NOT NULL,
    skill_id BIGINT NULL,
    requirement_text VARCHAR(500) NOT NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    weight INT NOT NULL DEFAULT 1, -- Weight for deterministic compatibility scoring (1-5)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_reqs_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_job_reqs_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE SET NULL,
    INDEX idx_job_reqs_job (job_id),
    INDEX idx_job_reqs_skill (skill_id)
) ENGINE=InnoDB;

-- =============================================================================
-- 7. RESUME_ANALYSES
-- Analysis records with deterministic compatibility score and AI insights
-- =============================================================================
CREATE TABLE resume_analyses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resume_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    compatibility_score DECIMAL(5,2) NOT NULL, -- 0.00 to 100.00 calculated in Java
    matching_skills JSON NULL,                -- Array of matched skills
    missing_skills JSON NULL,                 -- Array of missing requirements
    recommendations TEXT NULL,                -- Targeted resume improvements
    cover_letter_draft TEXT NULL,             -- Tailored editable cover letter
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_analyses_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    CONSTRAINT fk_analyses_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_analyses_resume (resume_id),
    INDEX idx_analyses_job (job_id),
    INDEX idx_analyses_score (compatibility_score)
) ENGINE=InnoDB;

-- =============================================================================
-- 8. APPLICATIONS
-- Job application pipeline tracker
-- =============================================================================
CREATE TABLE applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    status ENUM('SAVED', 'APPLIED', 'ASSESSMENT', 'INTERVIEWING', 'OFFERED', 'REJECTED', 'WITHDRAWN') NOT NULL DEFAULT 'SAVED',
    applied_date DATE NULL,
    notes TEXT NULL,
    salary_offered VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_applications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_applications_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_apps_user (user_id),
    INDEX idx_apps_status (user_id, status)
) ENGINE=InnoDB;

-- =============================================================================
-- 9. LEARNING_ROADMAPS
-- Tailored study curricula for closing identified skill gaps
-- =============================================================================
CREATE TABLE learning_roadmaps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    target_role VARCHAR(150) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    status ENUM('ACTIVE', 'COMPLETED', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_roadmaps_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_roadmaps_user (user_id),
    INDEX idx_roadmaps_status (user_id, status)
) ENGINE=InnoDB;

-- =============================================================================
-- 10. ROADMAP_MILESTONES
-- Ordered learning steps with tangible practice exercises and status tracking
-- =============================================================================
CREATE TABLE roadmap_milestones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    roadmap_id BIGINT NOT NULL,
    skill_id BIGINT NULL,
    title VARCHAR(255) NOT NULL,
    concept_explanation TEXT NULL,
    step_order INT NOT NULL DEFAULT 1,
    estimated_hours INT NOT NULL DEFAULT 5,
    status ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'NOT_STARTED',
    practice_task TEXT NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_milestones_roadmap FOREIGN KEY (roadmap_id) REFERENCES learning_roadmaps(id) ON DELETE CASCADE,
    CONSTRAINT fk_milestones_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE SET NULL,
    INDEX idx_milestones_roadmap (roadmap_id),
    INDEX idx_milestones_order (roadmap_id, step_order),
    INDEX idx_milestones_status (roadmap_id, status)
) ENGINE=InnoDB;

-- =============================================================================
-- 11. PROJECTS
-- Practical projects demonstrating skill mastery
-- =============================================================================
CREATE TABLE projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    roadmap_id BIGINT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    technologies VARCHAR(300) NOT NULL,
    status ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'PLANNED',
    github_url VARCHAR(255) NULL,
    learning_outcomes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_projects_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_projects_roadmap FOREIGN KEY (roadmap_id) REFERENCES learning_roadmaps(id) ON DELETE SET NULL,
    INDEX idx_projects_user (user_id),
    INDEX idx_projects_status (user_id, status)
) ENGINE=InnoDB;

-- =============================================================================
-- 12. INTERVIEW_SESSIONS
-- Mock interview configuration and overall summary
-- =============================================================================
CREATE TABLE interview_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    job_id BIGINT NULL,
    category ENUM('TECHNICAL', 'CONCEPTUAL', 'BEHAVIORAL', 'MIXED') NOT NULL DEFAULT 'TECHNICAL',
    difficulty ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') NOT NULL DEFAULT 'INTERMEDIATE',
    status ENUM('IN_PROGRESS', 'COMPLETED', 'ABANDONED') NOT NULL DEFAULT 'IN_PROGRESS',
    overall_score DECIMAL(5,2) NULL, -- Calculated in Java from answer evaluations
    summary_feedback TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    CONSTRAINT fk_interviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_interviews_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL,
    INDEX idx_interviews_user (user_id),
    INDEX idx_interviews_status (user_id, status)
) ENGINE=InnoDB;

-- =============================================================================
-- 13. INTERVIEW_QUESTIONS
-- Questions generated per interview session
-- =============================================================================
CREATE TABLE interview_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    skill_id BIGINT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(80) NOT NULL DEFAULT 'TECHNICAL',
    expected_rubric TEXT NULL,
    sequence_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_questions_session FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_questions_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE SET NULL,
    INDEX idx_questions_session (session_id),
    INDEX idx_questions_order (session_id, sequence_order)
) ENGINE=InnoDB;

-- =============================================================================
-- 14. INTERVIEW_ANSWERS
-- Candidate responses submitted for evaluation
-- =============================================================================
CREATE TABLE interview_answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    user_answer TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_answers_question FOREIGN KEY (question_id) REFERENCES interview_questions(id) ON DELETE CASCADE,
    INDEX idx_answers_question (question_id)
) ENGINE=InnoDB;

-- =============================================================================
-- 15. ANSWER_EVALUATIONS
-- Structured rubric-based grading and actionable feedback
-- =============================================================================
CREATE TABLE answer_evaluations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    answer_id BIGINT NOT NULL,
    score INT NOT NULL, -- Scale 0 to 100
    strengths TEXT NULL,
    weaknesses TEXT NULL,
    improvement_tips TEXT NULL,
    ideal_answer TEXT NULL,
    concepts_to_revise VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evals_answer FOREIGN KEY (answer_id) REFERENCES interview_answers(id) ON DELETE CASCADE,
    INDEX idx_evals_answer (answer_id),
    INDEX idx_evals_score (score)
) ENGINE=InnoDB;

-- =============================================================================
-- 16. DOCUMENTS
-- User study notes, cheat sheets, and interview prep knowledge articles
-- =============================================================================
CREATE TABLE documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    summary TEXT NULL,
    resource_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_docs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_docs_user (user_id),
    FULLTEXT idx_docs_content (title, content)
) ENGINE=InnoDB;

-- =============================================================================
-- 17. DOCUMENT_CHUNKS
-- Searchable partitions of documents for localized retrieval (RAG-Lite)
-- =============================================================================
CREATE TABLE document_chunks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NOT NULL,
    chunk_index INT NOT NULL DEFAULT 0,
    content_chunk TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chunks_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    INDEX idx_chunks_document (document_id),
    FULLTEXT idx_chunks_content (content_chunk)
) ENGINE=InnoDB;

-- =============================================================================
-- 18. TAGS
-- Categorical labels for indexing knowledge assets
-- =============================================================================
CREATE TABLE tags (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tags_name (name)
) ENGINE=InnoDB;

-- =============================================================================
-- 19. DOCUMENT_TAGS
-- Many-to-Many association between Documents and Tags
-- =============================================================================
CREATE TABLE document_tags (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    CONSTRAINT fk_doc_tags_doc FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_doc_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE KEY uq_document_tag (document_id, tag_id),
    INDEX idx_doc_tags_doc (document_id),
    INDEX idx_doc_tags_tag (tag_id)
) ENGINE=InnoDB;

-- =============================================================================
-- 20. AI_INTERACTIONS
-- Auditing and performance tracking for all Groq LLM invocations
-- =============================================================================
CREATE TABLE ai_interactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    module VARCHAR(50) NOT NULL,             -- 'CAREER', 'SKILL', 'INTERVIEW', 'KNOWLEDGE'
    operation_type VARCHAR(100) NOT NULL,    -- 'RESUME_ANALYSIS', 'ROADMAP_GEN', etc.
    model_used VARCHAR(80) NOT NULL,         -- e.g. 'llama-3.3-70b-versatile'
    duration_ms INT NOT NULL DEFAULT 0,
    status_code VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    error_message TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ai_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_ai_user (user_id),
    INDEX idx_ai_module (module),
    INDEX idx_ai_created (created_at)
) ENGINE=InnoDB;
