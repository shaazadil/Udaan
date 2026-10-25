import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import type { CareerReadinessSummary } from '../../types';
import {
  IconCareer,
  IconSkills,
  IconInterviews,
  IconKnowledge,
  IconArrowRight,
  IconTarget,
  IconRefresh,
} from '../../components/brand/Icons';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/EmptyState';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<CareerReadinessSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = Number(localStorage.getItem('udaan_user_id') || '1');

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<CareerReadinessSummary>(`/dashboard/summary?userId=${userId}`);
      setSummary(data);

      // Keep local session aligned with real DB values
      if (data.name) localStorage.setItem('udaan_user_name', data.name);
      if (data.targetRole) localStorage.setItem('udaan_target_role', data.targetRole);
    } catch (err: any) {
      console.error('Failed to load dashboard summary:', err);
      setError('Unable to fetch live career metrics from the Spring Boot backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [userId]);

  return (
    <div className="space-y-8 font-sans">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-border">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-forest font-mono">
            Candidate ID: #{userId} · Executive Summary
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-charcoal mt-1">
            Welcome back, {summary?.name || 'Candidate'}.
          </h1>
          <p className="text-sm text-neutral-muted mt-1">
            Your real-time career progress and priorities for <strong className="text-forest font-semibold">{summary?.targetRole || 'Software Engineering'}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={fetchSummary}
            icon={<IconRefresh size={14} />}
            disabled={isLoading}
          >
            Refresh Metrics
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/career')}
            icon={<IconArrowRight size={14} />}
            iconPosition="right"
          >
            Analyse Resume
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-status-error-bg text-status-error border border-status-error/20 flex items-center justify-between">
          <span className="text-sm">{error}</span>
          <Button size="sm" variant="outline" onClick={fetchSummary}>
            Retry Request
          </Button>
        </div>
      )}

      {/* Priority Directive Banner — Completely Dynamic */}
      {summary?.latestCompatibilityScore !== null && summary?.latestCompatibilityScore !== undefined ? (
        <div className="p-5 md:p-6 rounded-xl bg-forest-surface border border-forest/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <IconTarget size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-forest font-mono">
                  Priority Directive
                </span>
                <Badge variant="saffron" size="sm">
                  {summary.latestCompatibilityScore}% Compatibility
                </Badge>
              </div>
              <h3 className="text-base font-semibold text-charcoal mt-0.5">
                Target Role Alignment: {summary.latestJobTitle || summary.targetRole}
              </h3>
              <p className="text-xs text-neutral-muted mt-0.5 max-w-2xl leading-relaxed">
                {summary.latestRecommendation ||
                  (summary.latestMissingSkills && summary.latestMissingSkills.length > 0
                    ? `Identified missing skills: ${summary.latestMissingSkills.join(', ')}. Bridge these gaps to increase your compatibility.`
                    : 'Your verified skills closely match this position.')}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/skills')}
            className="flex-shrink-0"
            icon={<IconArrowRight size={14} />}
            iconPosition="right"
          >
            Open Roadmap
          </Button>
        </div>
      ) : (
        <div className="p-5 md:p-6 rounded-xl bg-saffron-subtle border border-saffron/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-saffron text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <IconTarget size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-saffron-deep font-mono">
                  Setup Action Needed
                </span>
                <Badge variant="warning" size="sm">First Step</Badge>
              </div>
              <h3 className="text-base font-semibold text-charcoal mt-0.5">
                Run Your First Compatibility Analysis for {summary?.targetRole}
              </h3>
              <p className="text-xs text-neutral-muted mt-0.5 max-w-2xl leading-relaxed">
                You haven’t evaluated your resume against a target position yet. Go to Career Intelligence to compute your deterministic compatibility score, identify missing skills, and unlock your personalized roadmap.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="saffron"
            onClick={() => navigate('/career')}
            className="flex-shrink-0"
            icon={<IconArrowRight size={14} />}
            iconPosition="right"
          >
            Analyse Resume Now
          </Button>
        </div>
      )}

      {/* 4 Quantitative Metric Cards (Space Grotesk accent for numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Skills Profiled */}
        <Card variant="elevated">
          <div className="flex items-center justify-between text-neutral-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Profiled Skills</span>
            <IconSkills size={18} className="text-forest" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mb-2" />
          ) : (
            <div className="font-mono text-3xl font-bold text-charcoal">
              {summary?.totalSkillsProfiled ?? 0}
            </div>
          )}
          <div className="text-xs text-neutral-muted mt-1 flex items-center gap-1.5">
            <span className="font-semibold text-forest">
              {summary?.advancedSkillsCount ?? 0} Advanced
            </span>
            <span>· Live in MySQL</span>
          </div>
        </Card>

        {/* Card 2: Latest Compatibility */}
        <Card variant="elevated">
          <div className="flex items-center justify-between text-neutral-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Target Compatibility</span>
            <IconCareer size={18} className="text-forest" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <div className="font-mono text-3xl font-bold text-forest">
              {summary?.latestCompatibilityScore !== null && summary?.latestCompatibilityScore !== undefined
                ? `${summary.latestCompatibilityScore}%`
                : 'Pending'}
            </div>
          )}
          <div className="text-xs text-neutral-muted mt-1 truncate">
            {summary?.latestJobTitle ? `${summary.latestJobTitle}` : 'Evaluate in Career module'}
          </div>
        </Card>

        {/* Card 3: Roadmap Progress */}
        <Card variant="elevated">
          <div className="flex items-center justify-between text-neutral-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Roadmap Progress</span>
            <IconTarget size={18} className="text-saffron-deep" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <div className="font-mono text-3xl font-bold text-charcoal">
              {summary?.avgRoadmapCompletion ? `${summary.avgRoadmapCompletion}%` : '0.0%'}
            </div>
          )}
          <div className="text-xs text-neutral-muted mt-1 truncate">
            {summary?.activeRoadmapTitle || 'No active roadmap generated'}
          </div>
        </Card>

        {/* Card 4: Mock Interview Score */}
        <Card variant="elevated">
          <div className="flex items-center justify-between text-neutral-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Interview Calibration</span>
            <IconInterviews size={18} className="text-forest" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mb-2" />
          ) : (
            <div className="font-mono text-3xl font-bold text-charcoal">
              {summary?.avgInterviewScore && summary.avgInterviewScore > 0
                ? `${summary.avgInterviewScore}`
                : 'Not Taken'}
              {summary?.avgInterviewScore && summary.avgInterviewScore > 0 ? (
                <span className="text-sm font-normal text-neutral-muted">/100</span>
              ) : null}
            </div>
          )}
          <div className="text-xs text-neutral-muted mt-1">
            {summary?.avgInterviewScore && summary.avgInterviewScore > 0
              ? 'Evaluated by Groq rubric'
              : 'Launch practice session'}
          </div>
        </Card>
      </div>

      {/* 2-Column Module Overview Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: Career Intelligence Status */}
        <Card>
          <CardHeader
            title="Career Intelligence"
            subtitle="Resume & Target Alignment"
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate('/career')}>
                Studio →
              </Button>
            }
          />
          {summary?.latestCompatibilityScore !== null && summary?.latestCompatibilityScore !== undefined ? (
            <div className="space-y-3.5 text-sm">
              <div className="p-3.5 bg-ivory rounded-lg border border-neutral-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-neutral-muted">Evaluated Target Opportunity</span>
                  <div className="font-semibold text-charcoal">{summary.latestJobTitle}</div>
                  <div className="text-xs text-neutral-muted">Company: {summary.latestCompanyName || 'Target Industry'}</div>
                </div>
                <Badge variant="forest">{summary.latestCompatibilityScore}% Match</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-forest-surface/70 border border-forest/20 rounded-lg">
                  <span className="font-semibold text-forest block mb-1">
                    Matching Skills ({summary.latestMatchingSkills?.length || 0})
                  </span>
                  <span className="text-neutral-muted line-clamp-2">
                    {summary.latestMatchingSkills?.join(', ') || 'None identified yet'}
                  </span>
                </div>
                <div className="p-3 bg-status-error-bg/70 border border-status-error/20 rounded-lg">
                  <span className="font-semibold text-status-error block mb-1">
                    Identified Gaps ({summary.latestMissingSkills?.length || 0})
                  </span>
                  <span className="text-neutral-muted line-clamp-2">
                    {summary.latestMissingSkills?.join(', ') || 'No gaps detected'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center bg-ivory rounded-xl border border-dashed border-neutral-border space-y-3">
              <IconCareer size={32} className="text-neutral-muted mx-auto" />
              <h4 className="text-sm font-semibold text-charcoal">No Compatibility Analyses Yet</h4>
              <p className="text-xs text-neutral-muted max-w-sm mx-auto">
                Compare your resume against a target position to compute your real matching percentage and missing competencies.
              </p>
              <Button size="sm" variant="outline" onClick={() => navigate('/career')}>
                Run Compatibility Analysis
              </Button>
            </div>
          )}
        </Card>

        {/* Module 2: Skill Intelligence Roadmap */}
        <Card>
          <CardHeader
            title="Skill Intelligence Roadmap"
            subtitle={summary?.activeRoadmapTitle || `Personalized Path for ${summary?.targetRole}`}
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate('/skills')}>
                Roadmap →
              </Button>
            }
          />
          {summary?.activeRoadmapTitle ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-xs text-neutral-muted mb-1">
                <span>Milestone Completion</span>
                <span className="font-mono font-bold text-forest">
                  {summary.avgRoadmapCompletion}% Completed
                </span>
              </div>
              <div className="w-full bg-neutral-border/60 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-forest h-full rounded-full transition-all duration-300"
                  style={{ width: `${summary.avgRoadmapCompletion}%` }}
                />
              </div>

              <div className="p-4 bg-ivory rounded-lg border border-neutral-border mt-3 text-xs text-neutral-muted flex items-center justify-between">
                <span>Active Track: <strong>{summary.activeRoadmapTitle}</strong></span>
                <Button size="sm" variant="outline" onClick={() => navigate('/skills')}>
                  View Milestones
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center bg-ivory rounded-xl border border-dashed border-neutral-border space-y-3">
              <IconSkills size={32} className="text-neutral-muted mx-auto" />
              <h4 className="text-sm font-semibold text-charcoal">No Active Learning Roadmap</h4>
              <p className="text-xs text-neutral-muted max-w-sm mx-auto">
                Generate an ordered milestone curriculum with practice tasks tailored specifically to your {summary?.targetRole} path.
              </p>
              <Button size="sm" variant="outline" onClick={() => navigate('/skills')}>
                Generate Personalized Roadmap
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Bottom Grid: Interview Practice & Knowledge Library */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 3: Interview Intelligence */}
        <Card>
          <CardHeader
            title="Interview Intelligence"
            subtitle="Adaptive Mock Interview Performance"
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate('/interviews')}>
                Console →
              </Button>
            }
          />
          {summary?.avgInterviewScore && summary.avgInterviewScore > 0 ? (
            <div className="p-4 bg-ivory rounded-lg border border-neutral-border space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-charcoal">
                  Target Role Calibration ({summary.targetRole})
                </span>
                <span className="text-xs font-mono font-bold text-forest">
                  Average Score: {summary.avgInterviewScore} / 100
                </span>
              </div>
              <p className="text-xs text-neutral-muted leading-relaxed">
                {summary.latestInterviewSummary || 'Recent mock interview evaluated by Groq AI rubric.'}
              </p>
            </div>
          ) : (
            <div className="p-6 text-center bg-ivory rounded-xl border border-dashed border-neutral-border space-y-3">
              <IconInterviews size={32} className="text-neutral-muted mx-auto" />
              <h4 className="text-sm font-semibold text-charcoal">No Mock Interviews Taken Yet</h4>
              <p className="text-xs text-neutral-muted max-w-sm mx-auto">
                Take an adaptive mock interview for {summary?.targetRole} across technical, conceptual, or behavioural modes.
              </p>
              <Button size="sm" variant="outline" onClick={() => navigate('/interviews')}>
                Start Practice Session
              </Button>
            </div>
          )}
        </Card>

        {/* Module 4: Knowledge Library */}
        <Card>
          <CardHeader
            title="Knowledge Intelligence"
            subtitle="Saved Technical Notes & Grounded RAG"
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate('/knowledge')}>
                Library →
              </Button>
            }
          />
          {summary?.recentNoteTitles && summary.recentNoteTitles.length > 0 ? (
            <div className="space-y-2.5">
              {summary.recentNoteTitles.map((title, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-ivory rounded-lg border border-neutral-border flex items-center justify-between"
                >
                  <h4 className="text-xs font-semibold text-charcoal line-clamp-1">{title}</h4>
                  <Badge variant="forest" size="sm">Indexed in MySQL</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center bg-ivory rounded-xl border border-dashed border-neutral-border space-y-3">
              <IconKnowledge size={32} className="text-neutral-muted mx-auto" />
              <h4 className="text-sm font-semibold text-charcoal">No Saved Technical Notes</h4>
              <p className="text-xs text-neutral-muted max-w-sm mx-auto">
                Save study notes and engineering snippets. Query them using Groq RAG with explicit citation footnotes.
              </p>
              <Button size="sm" variant="outline" onClick={() => navigate('/knowledge')}>
                Create First Technical Note
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
