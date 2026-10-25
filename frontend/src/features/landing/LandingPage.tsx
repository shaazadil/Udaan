import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IconArrowRight,
  IconCareer,
  IconSkills,
  IconInterviews,
  IconKnowledge,
  IconCheck,
  IconSparkles,
  IconTarget,
  UdaanEmblem,
} from '../../components/brand/Icons';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeModuleTab, setActiveModuleTab] = useState<'career' | 'skills' | 'interview' | 'knowledge'>('career');

  return (
    <div className="w-full overflow-hidden bg-charcoal text-white">
      {/* =========================================================================
          HERO SECTION — CINEMATIC, EDITORIAL, ATMOSPHERIC
          Deep forest-green undertones, dark charcoal, restrained saffron light
          ========================================================================= */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 px-6 md:px-12 bg-gradient-to-b from-charcoal-deep via-[#1B2F25] to-charcoal">
        {/* Subtle architectural atmosphere layer */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 50% 20%, #315C46 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #C58A43 0%, transparent 40%)',
          }}
        />

        {/* Subtle geometric line grid accent */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage:
              'linear-gradient(#F8F7F3 1px, transparent 1px), linear-gradient(90deg, #F8F7F3 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative max-w-5xl mx-auto text-center z-10 flex flex-col items-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-forest-deep/80 border border-forest/40 text-saffron text-xs font-semibold tracking-widest uppercase mb-8 shadow-subtle"
          >
            <span className="w-2 h-2 rounded-full bg-saffron animate-pulse" />
            YOUR FUTURE, IN MOTION.
          </motion.div>

          {/* Main Editorial Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            className="hero-headline font-serif text-white max-w-4xl tracking-tight leading-[1.08] mb-6"
          >
            Your potential is bigger than your resume.
          </motion.h1>

          {/* Supporting Copy */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="sub-headline text-white/80 max-w-2xl font-normal leading-relaxed mb-10 text-base md:text-lg"
          >
            UDAAN brings career planning, skill development, interview preparation, and personal knowledge together in one intelligent workspace.
          </motion.p>

          {/* Primary Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Button
              size="lg"
              variant="saffron"
              onClick={() => navigate('/register')}
              icon={<IconArrowRight size={18} />}
              iconPosition="right"
              className="w-full sm:w-auto px-8"
            >
              Start Your Journey
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => {
                const el = document.getElementById('modules');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/15 text-white border-white/20"
            >
              Explore the Platform
            </Button>
          </motion.div>

          {/* Supporting Anchor Line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xs md:text-sm text-white/50 tracking-wide mt-12 font-medium"
          >
            Discover your gaps. Build your skills. Move forward with purpose.
          </motion.p>
        </div>
      </section>

      {/* =========================================================================
          SECTION A — THE PROBLEM STATEMENT
          Ambition isn't the problem. Knowing what to do next is.
          ========================================================================= */}
      <section id="problem" className="py-24 px-6 md:px-12 bg-charcoal-deep border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-saffron">
              The Fundamental Challenge
            </span>
            <h2 className="section-headline font-serif text-white mt-2 mb-4">
              Ambition isn’t the problem. Knowing what to do next is.
            </h2>
            <p className="text-neutral-subtle text-base leading-relaxed">
              Every day, aspiring engineers and professionals in India navigate fractured guidance, guesswork resume submissions, and disconnected online tutorials. UDAAN solves the 4 systemic roadblocks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                number: '01',
                title: 'Unclear Career Direction',
                description:
                  'Job descriptions are vague and changing rapidly. Candidates struggle to know whether their academic background and projects match target industry expectations.',
              },
              {
                number: '02',
                title: 'Hidden Skill Gaps',
                description:
                  'Standard resumes list generic keywords without structured evidence. You receive silent rejections with zero visibility into which specific competencies fell short.',
              },
              {
                number: '03',
                title: 'Interview Uncertainty',
                description:
                  'Memorising answers fails when real interviewers probe architectural decisions, conceptual depths, or trade-offs. Candidates lack realistic, calibrated practice.',
              },
              {
                number: '04',
                title: 'Scattered Learning',
                description:
                  'Bookmarks, YouTube playlists, GitHub repos, and PDF notes sit fragmented across apps. When interview day arrives, candidates cannot synthesize what they learned.',
              },
            ].map((problem) => (
              <div
                key={problem.number}
                className="p-8 rounded-xl bg-charcoal border border-white/10 hover:border-forest/50 transition-colors duration-200"
              >
                <span className="font-mono text-xs font-bold text-saffron px-2.5 py-1 rounded bg-saffron/10 border border-saffron/20 inline-block mb-4">
                  {problem.number}
                </span>
                <h3 className="font-sans font-semibold text-lg text-white mb-2">
                  {problem.title}
                </h3>
                <p className="text-sm text-neutral-subtle leading-relaxed">
                  {problem.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION B — FOUR INTELLIGENCE MODULES
          Rich, authentic interface previews
          ========================================================================= */}
      <section id="modules" className="py-24 px-6 md:px-12 bg-ivory text-charcoal border-t border-neutral-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest font-sans">
              System Architecture
            </span>
            <h2 className="section-headline font-serif text-charcoal mt-2 mb-4">
              Four Integrated Intelligence Modules
            </h2>
            <p className="text-neutral-muted text-base">
              A unified platform where each capability directly strengthens the next, powered by your persistent career profile.
            </p>
          </div>

          {/* Module Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {[
              { id: 'career', label: '1. Career Intelligence', icon: <IconCareer size={16} /> },
              { id: 'skills', label: '2. Skill Intelligence', icon: <IconSkills size={16} /> },
              { id: 'interview', label: '3. Interview Intelligence', icon: <IconInterviews size={16} /> },
              { id: 'knowledge', label: '4. Knowledge Intelligence', icon: <IconKnowledge size={16} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveModuleTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                  activeModuleTab === tab.id
                    ? 'bg-forest text-white shadow-subtle'
                    : 'bg-white text-charcoal border border-neutral-border hover:bg-ivory-warm'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: Career Intelligence */}
          {activeModuleTab === 'career' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-8 md:p-10 rounded-2xl border border-neutral-border shadow-card">
              <div className="lg:col-span-5 space-y-4">
                <Badge variant="forest">Career Intelligence</Badge>
                <h3 className="text-2xl font-serif text-charcoal font-semibold">
                  Understand where you stand.
                </h3>
                <p className="text-sm text-neutral-muted leading-relaxed">
                  Evaluate your resume against specific job descriptions. View deterministic skill matching, missing competencies, explainable compatibility scores, and generate role-tailored cover letters.
                </p>
                <ul className="space-y-2 pt-2 text-sm text-charcoal">
                  <li className="flex items-center gap-2">
                    <span className="text-forest"><IconCheck size={16} /></span>
                    Deterministic compatibility score formula
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-forest"><IconCheck size={16} /></span>
                    Direct identification of missing requirements
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-forest"><IconCheck size={16} /></span>
                    Groq LLM-powered cover letter synthesis
                  </li>
                </ul>
                <div className="pt-4">
                  <Button size="sm" variant="primary" onClick={() => navigate('/career')}>
                    Open Career Workspace →
                  </Button>
                </div>
              </div>

              {/* Genuine Interface Preview */}
              <div className="lg:col-span-7 bg-ivory rounded-xl border border-neutral-border p-6 font-sans">
                <div className="flex items-center justify-between border-b border-neutral-border pb-3 mb-4">
                  <div>
                    <span className="text-xs text-neutral-muted">Target Position</span>
                    <h4 className="text-sm font-semibold text-charcoal">Senior Backend Engineer · Zepto</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-neutral-muted">Compatibility</span>
                    <div className="text-lg font-mono font-bold text-forest">84.0%</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-charcoal uppercase tracking-wider block mb-1.5">
                      Matching Verified Skills (5)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Java 21', 'Spring Boot 3', 'MySQL / InnoDB', 'Distributed Caching', 'REST APIs'].map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded text-xs bg-forest-surface text-forest font-medium border border-forest/20">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-charcoal uppercase tracking-wider block mb-1.5">
                      Identified Missing Skills (2)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Apache Kafka Event Streaming', 'Kubernetes Helm Deployments'].map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded text-xs bg-status-error-bg text-status-error font-medium border border-status-error/20">
                          ! {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-neutral-border text-xs text-neutral-muted leading-relaxed">
                    <strong className="text-charcoal font-semibold">AI Recommendation:</strong> Target job emphasizes high-throughput event processing. Prioritize Kafka streaming in your roadmap to close the 16% gap.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Skill Intelligence */}
          {activeModuleTab === 'skills' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-8 md:p-10 rounded-2xl border border-neutral-border shadow-card">
              <div className="lg:col-span-5 space-y-4">
                <Badge variant="forest">Skill Intelligence</Badge>
                <h3 className="text-2xl font-serif text-charcoal font-semibold">
                  Build what your career demands.
                </h3>
                <p className="text-sm text-neutral-muted leading-relaxed">
                  Turn identified gaps into structured, step-by-step milestones. Mark tasks complete with real database updates, explore suggested capstone projects, and track measurable growth.
                </p>
                <ul className="space-y-2 pt-2 text-sm text-charcoal">
                  <li className="flex items-center gap-2">
                    <span className="text-forest"><IconCheck size={16} /></span>
                    Ordered learning milestones with time estimates
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-forest"><IconCheck size={16} /></span>
                    Live progress percentage tied to database
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-forest"><IconCheck size={16} /></span>
                    Curated project recommendations
                  </li>
                </ul>
                <div className="pt-4">
                  <Button size="sm" variant="primary" onClick={() => navigate('/skills')}>
                    View Roadmap Console →
                  </Button>
                </div>
              </div>

              {/* Roadmap UI Preview */}
              <div className="lg:col-span-7 bg-ivory rounded-xl border border-neutral-border p-6 space-y-3 font-sans">
                <div className="flex items-center justify-between border-b border-neutral-border pb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-charcoal">Advanced Distributed Systems</h4>
                    <p className="text-xs text-neutral-muted">Milestones for Senior Backend Track</p>
                  </div>
                  <Badge variant="forest">25% Completed</Badge>
                </div>

                <div className="space-y-2.5 pt-1">
                  <div className="p-3 bg-white rounded-lg border border-forest/30 flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-forest text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-semibold text-charcoal">Milestone 1: Relational Indexing &amp; Query Optimization</h5>
                        <span className="text-[11px] text-neutral-muted font-mono">10 hrs</span>
                      </div>
                      <p className="text-xs text-neutral-muted mt-0.5">B-Tree indexing, composite query plans, EXPLAIN analysis.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-neutral-border flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-saffron/20 text-saffron-deep border border-saffron/40 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-semibold text-charcoal">Milestone 2: Distributed Caching with Redis &amp; Invalidation</h5>
                        <span className="text-[11px] text-neutral-muted font-mono">12 hrs</span>
                      </div>
                      <p className="text-xs text-neutral-muted mt-0.5">Cache-aside pattern, stampede mitigation, TTL strategies.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Interview Intelligence */}
          {activeModuleTab === 'interview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-8 md:p-10 rounded-2xl border border-neutral-border shadow-card">
              <div className="lg:col-span-5 space-y-4">
                <Badge variant="forest">Interview Intelligence</Badge>
                <h3 className="text-2xl font-serif text-charcoal font-semibold">
                  Turn knowledge into confidence.
                </h3>
                <p className="text-sm text-neutral-muted leading-relaxed">
                  Engage in realistic role-specific mock interviews across technical, conceptual, and behavioural modes. Receive objective rubric scores, strengths, weaknesses, and ideal benchmark answers.
                </p>
                <ul className="space-y-2 pt-2 text-sm text-charcoal">
                  <li className="flex items-center gap-2">
                    <span className="text-forest"><IconCheck size={16} /></span>
                    Structured multi-dimensional evaluation rubric
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-forest"><IconCheck size={16} /></span>
                    Adaptive follow-ups grounded in actual answers
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-forest"><IconCheck size={16} /></span>
                    Historical score trend tracking in MySQL
                  </li>
                </ul>
                <div className="pt-4">
                  <Button size="sm" variant="primary" onClick={() => navigate('/interviews')}>
                    Launch Mock Interview →
                  </Button>
                </div>
              </div>

              {/* Interview UI Preview */}
              <div className="lg:col-span-7 bg-ivory rounded-xl border border-neutral-border p-6 space-y-3 font-sans">
                <div className="flex items-center justify-between border-b border-neutral-border pb-3">
                  <span className="text-xs font-mono font-semibold text-neutral-muted">QUESTION 1 OF 3 · TECHNICAL</span>
                  <Badge variant="saffron">Evaluated · 85 / 100</Badge>
                </div>

                <div className="text-xs font-semibold text-charcoal bg-white p-3 rounded-lg border border-neutral-border">
                  "How would you prevent duplicate writes in a distributed payment system during transient network partitions?"
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-status-success-bg/60 border border-status-success/20 rounded-md">
                    <span className="font-semibold text-status-success block mb-0.5">Key Strengths</span>
                    <span className="text-neutral-muted">Correctly identified Idempotency Keys and database unique constraints.</span>
                  </div>
                  <div className="p-2.5 bg-status-warning-bg/60 border border-status-warning/20 rounded-md">
                    <span className="font-semibold text-status-warning block mb-0.5">Improvement Area</span>
                    <span className="text-neutral-muted">Should explicitly discuss two-phase commit vs saga pattern trade-offs.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Knowledge Intelligence */}
          {activeModuleTab === 'knowledge' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-8 md:p-10 rounded-2xl border border-neutral-border shadow-card">
              <div className="lg:col-span-5 space-y-4">
                <Badge variant="forest">Knowledge Intelligence</Badge>
                <h3 className="text-2xl font-serif text-charcoal font-semibold">
                  Make what you learn work for you.
                </h3>
                <p className="text-sm text-neutral-muted leading-relaxed">
                  A personal technical second brain. Save notes, tag competencies, search concepts, and query your knowledge with Groq AI answers grounded strictly in your saved references.
                </p>
                <ul className="space-y-2 pt-2 text-sm text-charcoal">
                  <li className="flex items-center gap-2">
                    <span className="text-forest"><IconCheck size={16} /></span>
                    Grounded RAG retrieval with exact citation footnotes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-forest"><IconCheck size={16} /></span>
                    Audited AI interactions in database
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-forest"><IconCheck size={16} /></span>
                    Tag and category organization
                  </li>
                </ul>
                <div className="pt-4">
                  <Button size="sm" variant="primary" onClick={() => navigate('/knowledge')}>
                    Open Knowledge Library →
                  </Button>
                </div>
              </div>

              {/* Knowledge UI Preview */}
              <div className="lg:col-span-7 bg-ivory rounded-xl border border-neutral-border p-6 space-y-3 font-sans">
                <div className="flex items-center justify-between border-b border-neutral-border pb-3">
                  <span className="text-xs font-semibold text-charcoal flex items-center gap-1.5">
                    <IconSparkles size={14} className="text-forest" />
                    AI Grounded Query
                  </span>
                  <span className="text-[11px] text-neutral-muted">Retrieved from 2 candidate notes</span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-neutral-border text-xs">
                  <span className="text-neutral-muted block mb-1">Query: "How does 2PC differ from Saga?"</span>
                  <p className="text-charcoal leading-relaxed">
                    Based on your saved note <strong className="text-forest underline">"Distributed Transactions &amp; Sagas"</strong>, 2PC enforces ACID consistency via a blocking coordinator, whereas Saga employs asynchronous compensating events to achieve eventual consistency.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION C — HOW UDAAN CONNECTS EVERYTHING
          Analyse → Identify → Learn → Practise → Improve
          ========================================================================= */}
      <section id="workflow" className="py-24 px-6 md:px-12 bg-charcoal-deep border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-saffron">
              The Connected Career Loop
            </span>
            <h2 className="section-headline font-serif text-white mt-2 mb-4">
              Your career journey shouldn’t happen in silos.
            </h2>
            <p className="text-neutral-subtle text-base leading-relaxed">
              In traditional platforms, resume builders, online courses, and mock interviews operate in isolation. UDAAN connects them into a closed feedback loop.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
            {[
              {
                step: '01',
                title: 'Analyse',
                summary: 'Upload resume and target job description to compute deterministic match percentage.',
              },
              {
                step: '02',
                title: 'Identify',
                summary: 'Isolate exact missing competencies without guesswork or generic keywords.',
              },
              {
                step: '03',
                title: 'Learn',
                summary: 'Groq AI compiles a personalized milestone roadmap with concrete project tasks.',
              },
              {
                step: '04',
                title: 'Practise',
                summary: 'Take adaptive mock interviews calibrated specifically to target role requirements.',
              },
              {
                step: '05',
                title: 'Improve',
                summary: 'Refined skills update your career profile, raising your readiness index across applications.',
              },
            ].map((node) => (
              <div
                key={node.step}
                className="p-6 rounded-xl bg-charcoal border border-white/10 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-saffron">{node.step}</span>
                    <span className="w-2 h-2 rounded-full bg-forest" />
                  </div>
                  <h4 className="font-sans font-semibold text-base text-white mb-2">
                    {node.title}
                  </h4>
                  <p className="text-xs text-neutral-subtle leading-relaxed">
                    {node.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION D — PRODUCT PREVIEW (EXECUTIVE DASHBOARD DEMO)
          ========================================================================= */}
      <section id="preview" className="py-24 px-6 md:px-12 bg-ivory text-charcoal border-t border-neutral-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest">
              Live Product Experience
            </span>
            <h2 className="section-headline font-serif text-charcoal mt-2 mb-4">
              One profile. A clearer picture of your progress.
            </h2>
            <p className="text-neutral-muted text-base">
              A calm, editorial, functional workspace designed to keep you focused on real development instead of vanity metrics.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-border p-6 md:p-8 shadow-card">
            {/* Mock Top bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-border mb-6">
              <div>
                <span className="text-xs text-neutral-muted">Candidate Career Profile</span>
                <h3 className="text-xl font-bold text-charcoal">Aarav Sharma</h3>
                <p className="text-xs text-forest font-medium">Target: Senior Backend Engineer</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="forest">MySQL 8.4 Live</Badge>
                <Button size="sm" variant="primary" onClick={() => navigate('/dashboard')}>
                  Open Console →
                </Button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-ivory border border-neutral-border">
                <span className="text-xs text-neutral-muted">Profiled Skills</span>
                <div className="text-2xl font-mono font-bold text-charcoal mt-1">6</div>
                <span className="text-[11px] text-forest">3 Advanced Proficiencies</span>
              </div>
              <div className="p-4 rounded-xl bg-ivory border border-neutral-border">
                <span className="text-xs text-neutral-muted">Compatibility Score</span>
                <div className="text-2xl font-mono font-bold text-forest mt-1">84%</div>
                <span className="text-[11px] text-neutral-muted">Deterministic Match</span>
              </div>
              <div className="p-4 rounded-xl bg-ivory border border-neutral-border">
                <span className="text-xs text-neutral-muted">Roadmap Progress</span>
                <div className="text-2xl font-mono font-bold text-saffron mt-1">25%</div>
                <span className="text-[11px] text-neutral-muted">1 of 4 Completed</span>
              </div>
              <div className="p-4 rounded-xl bg-ivory border border-neutral-border">
                <span className="text-xs text-neutral-muted">Mock Interview Avg</span>
                <div className="text-2xl font-mono font-bold text-charcoal mt-1">82.5</div>
                <span className="text-[11px] text-forest">Top Quartile</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-forest-surface border border-forest/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center flex-shrink-0">
                  <IconTarget size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-charcoal">Recommended Next Action</h4>
                  <p className="text-xs text-neutral-muted">
                    Resume analysis identified a gap in <strong>Apache Kafka</strong>. Complete Milestone 2 in your roadmap to bridge this gap.
                  </p>
                </div>
              </div>
              <Button size="sm" variant="primary" onClick={() => navigate('/skills')}>
                Resume Milestone →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION E — FINAL CALL TO ACTION
          ========================================================================= */}
      <section className="py-24 px-6 md:px-12 bg-gradient-to-b from-charcoal to-charcoal-deep border-t border-white/10 text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <UdaanEmblem size={44} className="mb-6" />
          <span className="text-xs font-semibold uppercase tracking-widest text-saffron mb-3">
            Your Next Chapter
          </span>
          <h2 className="section-headline font-serif text-white mb-6">
            Your next opportunity starts with your next step.
          </h2>
          <p className="sub-headline text-white/80 max-w-xl mb-10 text-sm md:text-base leading-relaxed">
            Build a clearer picture of your skills, strengthen your preparation, and move forward with an evidence-backed career plan.
          </p>
          <Button
            size="lg"
            variant="saffron"
            onClick={() => navigate('/register')}
            icon={<IconArrowRight size={18} />}
            iconPosition="right"
            className="px-8 shadow-card"
          >
            Get Started with UDAAN
          </Button>
        </div>
      </section>
    </div>
  );
};
