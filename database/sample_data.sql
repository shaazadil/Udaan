-- =============================================================================
-- UDAAN AI — SAMPLE ACADEMIC DEMONSTRATION DATA
-- Database: udaan_db
-- =============================================================================

USE udaan_db;

-- 1. SEED USERS
INSERT INTO users (id, name, email, password_hash, target_role, education, experience_summary)
VALUES 
(1, 'Aarav Sharma', 'aarav.sharma@example.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO.K8tJg6P1n0hQy1q5yF7V6mJ4g2w3yC', 'Senior Backend Engineer', 'B.Tech in Computer Science, 2024', '3 years building scalable microservices in Java Spring Boot and relational database design.'),
(2, 'Priya Patel', 'priya.patel@example.com', '$2a$10$8FqKtq98hPqEX7fNZaFWoO.K8tJg6P1n0hQy1q5yF7V6mJ4g2w3yD', 'Full Stack Developer', 'B.E. Information Technology, 2025', 'Early-career software engineer passionate about modern React, TypeScript, and Spring Boot.');

-- 2. SEED CANONICAL SKILLS
INSERT INTO skills (id, name, category, description)
VALUES
(1, 'Java', 'Programming Language', 'Object-oriented programming, modern Java 17+, concurrency, and JVM internals.'),
(2, 'Spring Boot', 'Framework', 'Enterprise backend framework including Spring Data, Web, and Security.'),
(3, 'MySQL', 'Database', 'Relational database management, indexing, query optimization, and normalization.'),
(4, 'React', 'Frontend', 'Component lifecycle, hooks, state management, and modern SPA architecture.'),
(5, 'TypeScript', 'Programming Language', 'Typed superset of JavaScript providing compile-time type safety.'),
(6, 'Docker', 'DevOps', 'Containerization of backend and frontend applications for consistent deployment.'),
(7, 'RESTful API Design', 'Architecture', 'Designing scalable, stateless, standardized HTTP REST APIs with proper status codes.'),
(8, 'Data Structures & Algorithms', 'Computer Science Core', 'Algorithmic problem-solving, tree/graph traversal, dynamic programming.'),
(9, 'System Design', 'Architecture', 'High-level architecture, caching strategies, distributed systems, and message queues.'),
(10, 'Git', 'Version Control', 'Distributed version control, branching strategies, rebase, and collaboration.');

-- 3. SEED USER SKILLS (Evidence-backed)
INSERT INTO user_skills (user_id, skill_id, proficiency_level, evidence_source, evidence_description, confidence_level)
VALUES
(1, 1, 'ADVANCED', 'RESUME', 'Engineered 12+ production microservices using Java 17 and Spring Boot.', 0.95),
(1, 2, 'ADVANCED', 'PROJECT', 'Built Udaan AI Spring Boot backend using Spring Data JPA.', 0.90),
(1, 3, 'INTERMEDIATE', 'PROJECT', 'Designed normalized 20-table MySQL schema with composite indexes.', 0.85),
(1, 7, 'ADVANCED', 'RESUME', 'Implemented enterprise REST APIs following Richardson Maturity Model.', 0.90),
(1, 9, 'DEVELOPING', 'MANUAL_DECLARATION', 'Studied caching with Redis and message brokers with RabbitMQ.', 0.60),
(1, 6, 'BEGINNER', 'MANUAL_DECLARATION', 'Basic Dockerfile creation and docker-compose orchestration.', 0.40);

-- 4. SEED RESUMES
INSERT INTO resumes (id, user_id, title, raw_text, version_number, is_active)
VALUES
(1, 1, 'Aarav Sharma - Backend Specialist v1.2', 
'AARAV SHARMA
Email: aarav.sharma@example.com | GitHub: github.com/aaravsharma
SUMMARY:
Full-stack Java developer with 3 years of hands-on experience in Spring Boot, MySQL, REST APIs, and modern web architectures. Strong foundation in data structures, algorithms, and system design.
SKILLS:
- Languages: Java, SQL, TypeScript
- Frameworks: Spring Boot, Spring Data JPA, Hibernate, React
- Databases: MySQL (Schema design, indexing, transactions)
- Tools: Git, Maven, Postman, Docker
PROJECTS:
1. CareerForge AI Platform:
- Architected enterprise Spring Boot backend with 20 normalized tables.
- Integrated Groq LLM API for automated resume-job matching and personalized roadmaps.
- Optimized query execution times by 40% using composite B-Tree indexes.
2. High-Throughput Payment Ledger:
- Processed 10,000+ daily transactions using ACID-compliant Spring transactions.
- Handled idempotency and distributed locking mechanisms.
EDUCATION:
B.Tech in Computer Science and Engineering, 2024 - GPA: 8.9/10',
1, TRUE);

-- 5. SEED JOBS
INSERT INTO jobs (id, user_id, job_title, company_name, description_text, location, employment_type)
VALUES
(1, 1, 'Senior Java Software Engineer', 'FinTech Innovations Ltd.', 
'We are looking for a Senior Java Software Engineer to lead backend architecture.
Key Responsibilities:
- Design robust RESTful APIs and event-driven microservices using Java 17+ and Spring Boot.
- Build and optimize high-performance MySQL databases with high transaction volumes.
- Containerize services using Docker and Kubernetes.
- Drive system design discussions, caching strategies, and performance tuning.
Requirements:
- Strong proficiency in Java, Spring Boot, and Spring Data JPA.
- Deep knowledge of relational database modeling, indexing, and SQL tuning.
- Experience with Docker, Redis, and distributed systems.
- Excellent communication and problem-solving skills.',
'Bangalore, India (Hybrid)', 'Full-time'),

(2, 1, 'Full Stack Engineer (Java + React)', 'CloudScale Technologies',
'Looking for a full stack engineer proficient in Spring Boot backends and modern React frontends.
Requirements:
- Java, Spring Boot, MySQL, React, TypeScript, Git.',
'Remote', 'Full-time');

-- 6. SEED JOB REQUIREMENTS
INSERT INTO job_requirements (id, job_id, skill_id, requirement_text, is_mandatory, weight)
VALUES
(1, 1, 1, 'Core Java 17+ and OOP design patterns', TRUE, 5),
(2, 1, 2, 'Spring Boot and Spring Data JPA', TRUE, 5),
(3, 1, 3, 'Relational Database Design & MySQL Index Optimization', TRUE, 4),
(4, 1, 6, 'Docker containerization and deployment pipelines', FALSE, 3),
(5, 1, 9, 'Distributed System Design & Caching', TRUE, 4),
(6, 1, 7, 'Standardized REST API Architecture', TRUE, 4);

-- 7. SEED RESUME ANALYSES
INSERT INTO resume_analyses (id, resume_id, job_id, compatibility_score, matching_skills, missing_skills, recommendations, cover_letter_draft)
VALUES
(1, 1, 1, 84.00,
JSON_ARRAY('Java', 'Spring Boot', 'MySQL', 'RESTful API Design'),
JSON_ARRAY('Docker (Production experience needed)', 'Distributed System Design / Caching'),
'1. Highlight production Docker container deployment experience in your primary projects section.
2. Emphasize distributed caching strategies (e.g., Redis or Memcached) to strengthen alignment with the Senior role requirements.
3. Quantify performance gains achieved through MySQL indexing on the Payment Ledger project.',
'Dear Hiring Manager at FinTech Innovations Ltd.,

I am writing to express my strong enthusiasm for the Senior Java Software Engineer position. With a robust track record of architecting scalable Spring Boot backends and designing normalized, high-performance MySQL databases, I am confident in my ability to immediately contribute to your fintech platforms.

In my recent work, I engineered the backend for the CareerForge AI platform, architecting a 20-table relational schema and achieving a 40% query latency reduction through index tuning. My experience with transactional consistency and REST architecture aligns directly with your mission.

Thank you for your consideration, and I look forward to speaking with you.

Sincerely,
Aarav Sharma');

-- 8. SEED APPLICATIONS
INSERT INTO applications (id, user_id, job_id, status, applied_date, notes, salary_offered)
VALUES
(1, 1, 1, 'INTERVIEWING', '2026-10-15', 'Technical screening cleared. System design round scheduled next week.', '₹18,00,000 - ₹24,00,000'),
(2, 1, 2, 'APPLIED', '2026-10-20', 'Applied via company portal. Awaiting response.', NULL);

-- 9. SEED LEARNING ROADMAPS
INSERT INTO learning_roadmaps (id, user_id, target_role, title, description, status)
VALUES
(1, 1, 'Senior Backend Engineer', 'Advanced Backend & Distributed Systems Mastery', 
'Targeted learning plan designed to master high-scale distributed systems, Redis caching, and production Docker containerization.', 'ACTIVE');

-- 10. SEED ROADMAP MILESTONES
INSERT INTO roadmap_milestones (id, roadmap_id, skill_id, title, concept_explanation, step_order, estimated_hours, status, practice_task, completed_at)
VALUES
(1, 1, 9, 'Caching Patterns with Redis', 'Learn Cache-Aside, Write-Through, and Write-Behind caching strategies with invalidation policies.', 1, 8, 'COMPLETED', 'Implement Redis cache-aside in a Spring Boot application using @Cacheable and TTLs.', '2026-10-18 10:00:00'),
(2, 1, 6, 'Production Docker Containerization', 'Multi-stage builds, non-root users, health checks, and docker-compose for multi-container environments.', 2, 6, 'IN_PROGRESS', 'Create a multi-stage Dockerfile for a Spring Boot service reducing image size under 150MB.', NULL),
(3, 1, 9, 'Message Queues & Event-Driven Systems', 'Decoupling services using RabbitMQ/Kafka, event schemas, dead-letter queues, and at-least-once delivery.', 3, 12, 'NOT_STARTED', 'Build an asynchronous notification service consuming events from a message topic.', NULL),
(4, 1, 3, 'Advanced MySQL Query Execution Plans', 'Deep dive into EXPLAIN ANALYZE, B-Tree index cardinality, composite index leftmost prefix rule.', 4, 8, 'NOT_STARTED', 'Optimize slow queries on a 1-million-row sample table avoiding full table scans.', NULL);

-- 11. SEED PROJECTS
INSERT INTO projects (id, user_id, roadmap_id, title, description, technologies, status, github_url, learning_outcomes)
VALUES
(1, 1, 1, 'Distributed Rate Limiter Service', 'Token bucket and leaky bucket rate limiter built with Spring Boot and Redis.', 'Java 21, Spring Boot, Redis, Docker', 'IN_PROGRESS', 'https://github.com/aaravsharma/distributed-rate-limiter', 'Hands-on concurrency control, Lua scripts in Redis, sliding window metrics.');

-- 12. SEED INTERVIEW SESSIONS
INSERT INTO interview_sessions (id, user_id, job_id, category, difficulty, status, overall_score, summary_feedback, completed_at)
VALUES
(1, 1, 1, 'TECHNICAL', 'ADVANCED', 'COMPLETED', 82.50, 
'Strong grasp of Java concurrency, memory management, and Spring transaction boundaries. Areas for growth include explaining distributed transaction protocols (Saga vs 2PC) and specific Redis eviction algorithms.', 
'2026-10-21 16:30:00');

-- 13. SEED INTERVIEW QUESTIONS
INSERT INTO interview_questions (id, session_id, skill_id, question_text, question_type, expected_rubric, sequence_order)
VALUES
(1, 1, 2, 'Explain the internal working of Spring @Transactional annotation and how proxying handles self-invocation.', 'TECHNICAL', 'Must mention Spring AOP dynamic proxies / CGLIB, TransactionInterceptor, ThreadLocal connection binding, and why calling a transactional method from within the same class bypasses the proxy.', 1),
(2, 1, 3, 'How does MySQL InnoDB implement ACID transactions, and what is the role of the Write-Ahead Logging (WAL) / Redo Log and Undo Log?', 'TECHNICAL', 'Must articulate how Redo Log ensures durability, Undo Log guarantees atomicity and supports MVCC for non-locking reads, and the two-phase commit between InnoDB engine and binlog.', 2);

-- 14. SEED INTERVIEW ANSWERS
INSERT INTO interview_answers (id, question_id, user_answer)
VALUES
(1, 1, 
'Spring @Transactional works using Spring AOP proxies. When a bean is injected, Spring wraps it in a proxy (JDK dynamic proxy if interface exists, or CGLIB subclassing). When a method is called from outside, the proxy intercepts the call, opens a transaction via the PlatformTransactionManager, commits if successful, or rolls back on RuntimeException. If a method calls another transactional method in the same bean directly (this.method()), it bypasses the proxy, so no new transaction boundary is applied.'),
(2, 2, 
'InnoDB implements ACID through Redo logs, Undo logs, and MVCC. Atomicity is maintained using Undo logs which can rollback uncommitted transactions. Durability is achieved via Redo logs following Write-Ahead Logging so page changes are flushed sequentially before writing to tablespace. Consistency is enforced through primary keys and foreign keys. Isolation is handled by MVCC where reads see historical snapshots from undo logs without taking locks.');

-- 15. SEED ANSWER EVALUATIONS
INSERT INTO answer_evaluations (id, answer_id, score, strengths, weaknesses, improvement_tips, ideal_answer, concepts_to_revise)
VALUES
(1, 1, 90, 
'Accurately described Spring AOP proxies, distinction between JDK dynamic and CGLIB proxies, interceptor pipeline, and the self-invocation limitation.',
'Could have mentioned the rollbackFor property and how checked exceptions do not trigger rollback by default unless explicitly configured.',
'Mention @Transactional(rollbackFor = Exception.class) and AspectJ compile-time weaving as an alternative solution for self-invocation.',
'Spring @Transactional leverages AOP proxies... [Full detailed answer]',
'Spring AOP Proxies, Transaction Rollback Rules'),

(2, 2, 85,
'Clear explanation of the respective roles of Redo Log (durability) and Undo Log (atomicity and MVCC). Good mention of WAL.',
'Did not detail the two-phase commit between the InnoDB redo log and the MySQL binary log for crash-safe replication.',
'Briefly explain how InnoDB coordinates with the binlog using XA transactions during commit.',
'MySQL InnoDB enforces ACID properties through a combination of WAL mechanisms... [Full detailed answer]',
'InnoDB Redo/Undo Logs, MVCC, 2PC Binlog Coordination');

-- 16. SEED DOCUMENTS
INSERT INTO documents (id, user_id, title, content, summary, resource_url)
VALUES
(1, 1, 'Deep Dive: MySQL Indexing & Query Optimization',
'# MySQL Indexing & Query Optimization Guide

## 1. B-Tree Index Structure
InnoDB uses B+Trees for both clustered and secondary indexes.
- **Clustered Index:** The primary key stores the actual row data directly in the leaf pages.
- **Secondary Index:** Leaf nodes store the index column values plus the Primary Key pointer.
- **Key Takeaway:** A secondary index lookup that does not cover all queried columns requires an extra bookmark lookup (seek) back to the clustered index.

## 2. The Leftmost Prefix Rule
Composite indexes like (department_id, salary, hire_date) can only be leveraged if query WHERE clauses filter from left to right. Filtering by (salary) alone cannot use this composite index.

## 3. Covering Indexes
If an index contains all fields requested in the SELECT clause (e.g. SELECT id, name FROM users WHERE email = ? with an index on (email, name)), InnoDB returns data directly from the index tree without accessing clustered data pages, drastically minimizing disk I/O.',
'Comprehensive architectural notes on MySQL B+Tree indexing, clustered vs secondary indexes, and query execution optimization.',
'https://dev.mysql.com/doc/refman/8.0/en/optimization-indexes.html'),

(2, 1, 'Spring Boot Microservices & Resilience Patterns',
'# Spring Boot Microservices Best Practices

## 1. Transaction Management
Always explicitly specify `rollbackFor = Exception.class` when handling business logic that may throw checked exceptions. Avoid long-running third-party HTTP calls inside `@Transactional` blocks to prevent database connection pool starvation (HikariCP exhaustion).

## 2. Circuit Breakers & Resilience4j
Protect downstream database and API dependencies using CircuitBreaker, RateLimiter, and Retry modules.
Fallback mechanisms should degrade gracefully rather than throwing 500 errors to the consumer.',
'Guidelines for building resilient Spring Boot microservices, transaction scoping, and HikariCP connection pool health.',
NULL);

-- 17. SEED DOCUMENT CHUNKS
INSERT INTO document_chunks (id, document_id, chunk_index, content_chunk)
VALUES
(1, 1, 0, 'InnoDB uses B+Trees for clustered and secondary indexes. The clustered index holds raw row data on the leaf pages. Secondary index leaves store index values plus the primary key.'),
(2, 1, 1, 'Leftmost Prefix Rule: Composite indexes (A, B, C) can satisfy queries filtering on A, or A and B, or A, B and C. Filtering on B alone cannot use the composite index.'),
(3, 1, 2, 'Covering Index: When an index covers all columns requested in SELECT and WHERE, InnoDB avoids touching clustered leaf pages, eliminating extra I/O.'),
(4, 2, 0, 'Spring Boot transaction best practice: specify rollbackFor = Exception.class. Never make slow external REST calls inside @Transactional methods to prevent HikariCP pool starvation.'),
(5, 2, 1, 'Resilience patterns: Use Resilience4j CircuitBreaker and RateLimiter to isolate failing downstream services and offer fallback responses.');

-- 18. SEED TAGS
INSERT INTO tags (id, name)
VALUES
(1, 'MySQL'),
(2, 'Database'),
(3, 'Indexing'),
(4, 'Spring Boot'),
(5, 'Java'),
(6, 'Microservices'),
(7, 'System Design');

-- 19. SEED DOCUMENT_TAGS
INSERT INTO document_tags (document_id, tag_id)
VALUES
(1, 1), -- MySQL
(1, 2), -- Database
(1, 3), -- Indexing
(2, 4), -- Spring Boot
(2, 5), -- Java
(2, 6); -- Microservices

-- 20. SEED AI_INTERACTIONS
INSERT INTO ai_interactions (id, user_id, module, operation_type, model_used, duration_ms, status_code)
VALUES
(1, 1, 'CAREER', 'RESUME_ANALYSIS', 'llama-3.3-70b-versatile', 1840, 'SUCCESS'),
(2, 1, 'SKILL', 'ROADMAP_GENERATION', 'llama-3.3-70b-versatile', 2310, 'SUCCESS'),
(3, 1, 'INTERVIEW', 'ANSWER_EVALUATION', 'llama-3.3-70b-versatile', 1420, 'SUCCESS'),
(4, 1, 'KNOWLEDGE', 'GROUNDED_QA', 'llama-3.3-70b-versatile', 1150, 'SUCCESS');
