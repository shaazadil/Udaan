import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import type { UserSkill, RoadmapMilestone, ProjectRecommendation } from '../../types';
import {
  IconSkills,
  IconCheck,
  IconSparkles,
  IconRefresh,
} from '../../components/brand/Icons';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/EmptyState';

interface RoadmapData {
  id: number;
  title: string;
  targetRole: string;
  progressPercentage: number;
  milestones: RoadmapMilestone[];
}

interface GapData {
  targetRole: string;
  demonstratedSkills: string[];
  missingSkills: string[];
}

export const SkillsPage: React.FC = () => {
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<RoadmapData | null>(null);
  const [gapData, setGapData] = useState<GapData | null>(null);
  const [projects, setProjects] = useState<ProjectRecommendation[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [updatingMilestoneId, setUpdatingMilestoneId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'profile' | 'projects'>('roadmap');

  const [activeUserId, setActiveUserId] = useState<number>(() => Number(localStorage.getItem('udaan_user_id') || '1'));

  const fetchSkillData = async (uid: number) => {
    setIsLoading(true);
    try {
      const [skillsData, roadmapsData, gaps, projectsData] = await Promise.all([
        apiClient.get<UserSkill[]>(`/skills/profile?userId=${uid}`),
        apiClient.get<RoadmapData[]>(`/roadmaps?userId=${uid}`),
        apiClient.get<GapData>(`/skills/gap-analysis?userId=${uid}`),
        apiClient.get<ProjectRecommendation[]>(`/projects?userId=${uid}`),
      ]);

      setUserSkills(skillsData);
      setGapData(gaps);
      setProjects(projectsData);

      if (roadmapsData && roadmapsData.length > 0) {
        setActiveRoadmap(roadmapsData[0]);
      } else {
        setActiveRoadmap(null);
      }
    } catch (err) {
      console.error('Failed to fetch skill data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillData(activeUserId);
    const handleUserChanged = () => {
      const newUid = Number(localStorage.getItem('udaan_user_id') || '1');
      setActiveUserId(newUid);
      fetchSkillData(newUid);
    };
    window.addEventListener('udaan_user_changed', handleUserChanged);
    return () => window.removeEventListener('udaan_user_changed', handleUserChanged);
  }, []);

  const handleToggleMilestone = async (milestone: RoadmapMilestone) => {
    const newStatus = milestone.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    setUpdatingMilestoneId(milestone.id);

    try {
      const updatedRoadmap = await apiClient.patch<RoadmapData>(
        `/roadmaps/milestones/${milestone.id}`,
        { status: newStatus }
      );
      setActiveRoadmap(updatedRoadmap);
    } catch (err: any) {
      alert(`Failed to update milestone: ${err.message || 'Server error'}`);
    } finally {
      setUpdatingMilestoneId(null);
    }
  };

  const handleGenerateRoadmap = async () => {
    setIsGenerating(true);
    const userRole = localStorage.getItem('udaan_target_role') || gapData?.targetRole || 'Full Stack Developer';
    try {
      const result = await apiClient.post<RoadmapData>(`/roadmaps?userId=${activeUserId}`, {
        targetRole: userRole,
        focusAreas: gapData?.missingSkills && gapData.missingSkills.length > 0
          ? gapData.missingSkills
          : ['Frontend Architecture', 'Cloud Deployment', 'State Management'],
      });
      setActiveRoadmap(result);
    } catch (err: any) {
      alert(`Roadmap generation failed: ${err.message || 'Server error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-border">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-forest">
            Module 2: Skill Intelligence
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-charcoal mt-0.5">
            Personalized Learning Roadmaps
          </h1>
          <p className="text-sm text-neutral-muted mt-1">
            Ordered milestones and technical objectives tailored directly to bridge your target role gaps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => fetchSkillData(activeUserId)}
            icon={<IconRefresh size={14} />}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            variant="saffron"
            isLoading={isGenerating}
            onClick={handleGenerateRoadmap}
            icon={<IconSparkles size={14} />}
          >
            Re-generate via Groq AI
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-border pb-2">
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'roadmap'
              ? 'bg-forest text-white'
              : 'text-neutral-muted hover:text-charcoal hover:bg-white'
          }`}
        >
          Active Roadmap
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'profile'
              ? 'bg-forest text-white'
              : 'text-neutral-muted hover:text-charcoal hover:bg-white'
          }`}
        >
          Skill Matrix ({userSkills.length})
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'projects'
              ? 'bg-forest text-white'
              : 'text-neutral-muted hover:text-charcoal hover:bg-white'
          }`}
        >
          Capstone Projects ({projects.length})
        </button>
      </div>

      {/* VIEW 1: ROADMAP */}
      {activeTab === 'roadmap' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Roadmap Timeline Column */}
          <div className="lg:col-span-8 space-y-5">
            {isLoading ? (
              <Card>
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-24 w-full mb-3" />
                <Skeleton className="h-24 w-full" />
              </Card>
            ) : activeRoadmap ? (
              <Card variant="elevated">
                {/* Roadmap Title & Progress Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-border">
                  <div>
                    <span className="text-xs uppercase font-semibold tracking-wider text-forest">
                      Track: {activeRoadmap.targetRole}
                    </span>
                    <h2 className="text-xl font-bold text-charcoal mt-0.5">
                      {activeRoadmap.title}
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-neutral-muted block">Completion Rate</span>
                    <span className="font-mono text-2xl font-bold text-forest">
                      {activeRoadmap.progressPercentage}%
                    </span>
                  </div>
                </div>

                <div className="my-4">
                  <div className="w-full bg-neutral-border/60 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-forest h-full rounded-full transition-all duration-300"
                      style={{ width: `${activeRoadmap.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Ordered Milestones */}
                <div className="space-y-4 pt-2">
                  {activeRoadmap.milestones?.map((milestone, idx) => {
                    const isDone = milestone.status === 'COMPLETED';
                    const isUpdating = updatingMilestoneId === milestone.id;

                    return (
                      <div
                        key={milestone.id}
                        className={`p-5 rounded-xl border transition-all duration-200 ${
                          isDone
                            ? 'bg-ivory border-neutral-border opacity-90'
                            : 'bg-white border-forest/30 shadow-subtle'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3.5">
                            {/* Number / Status Circle */}
                            <button
                              onClick={() => handleToggleMilestone(milestone)}
                              disabled={isUpdating}
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-150 flex-shrink-0 mt-0.5 ${
                                isDone
                                  ? 'bg-forest text-white'
                                  : 'bg-ivory text-charcoal border border-neutral-border hover:border-forest'
                              }`}
                              title={isDone ? 'Mark In Progress' : 'Mark Completed'}
                            >
                              {isDone ? <IconCheck size={14} /> : idx + 1}
                            </button>

                            <div>
                              <div className="flex items-center gap-2">
                                <h3
                                  className={`text-sm font-semibold ${
                                    isDone ? 'line-through text-neutral-muted' : 'text-charcoal'
                                  }`}
                                >
                                  {milestone.title}
                                </h3>
                                <Badge
                                  variant={isDone ? 'forest' : 'warning'}
                                  size="sm"
                                >
                                  {milestone.status}
                                </Badge>
                              </div>

                              {milestone.conceptExplanation && (
                                <p className="text-xs text-neutral-muted mt-1 leading-relaxed">
                                  {milestone.conceptExplanation}
                                </p>
                              )}

                              {milestone.practiceTask && (
                                <div className="mt-3 p-3 rounded-lg bg-ivory text-xs border border-neutral-border/70">
                                  <strong className="text-forest block mb-0.5">
                                    Capstone Exercise:
                                  </strong>
                                  <span className="text-charcoal">{milestone.practiceTask}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex-shrink-0 text-right">
                            <span className="font-mono text-xs text-neutral-muted block">
                              ~{milestone.estimatedHours} hrs
                            </span>
                            <Button
                              size="sm"
                              variant={isDone ? 'outline' : 'primary'}
                              onClick={() => handleToggleMilestone(milestone)}
                              isLoading={isUpdating}
                              className="mt-2 text-xs"
                            >
                              {isDone ? 'Reopen' : 'Complete'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ) : (
              <Card className="text-center py-12">
                <IconSkills size={36} className="text-neutral-muted mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-charcoal">No Active Roadmap Found</h3>
                <p className="text-xs text-neutral-muted mt-1 max-w-sm mx-auto mb-4">
                  Click below to generate a tailored learning path from your identified skill gaps.
                </p>
                <Button size="sm" variant="primary" onClick={handleGenerateRoadmap}>
                  Generate Learning Roadmap
                </Button>
              </Card>
            )}
          </div>

          {/* Right Column: Identified Gaps Summary */}
          <div className="lg:col-span-4 space-y-5">
            <Card>
              <CardHeader
                title="Target Competencies"
                subtitle="Derived from active job requirements"
              />

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-forest uppercase tracking-wider block mb-2">
                    Demonstrated Skills ({gapData?.demonstratedSkills?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {gapData?.demonstratedSkills?.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded text-xs bg-forest-surface text-forest font-medium border border-forest/20"
                      >
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-border">
                  <span className="text-xs font-semibold text-status-error uppercase tracking-wider block mb-2">
                    Priority Gaps ({gapData?.missingSkills?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {gapData?.missingSkills?.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded text-xs bg-status-error-bg text-status-error font-medium border border-status-error/20"
                      >
                        ! {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-border text-xs text-neutral-muted leading-relaxed">
                  Completing milestones permanently marks skill mastery in MySQL, reflecting across all your career analyses.
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* VIEW 2: SKILL MATRIX */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader
            title="Candidate Skill Profile Matrix"
            subtitle="Verified proficiencies and evidence sources recorded in MySQL"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory border-b border-neutral-border text-neutral-muted uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Skill Name</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Proficiency Level</th>
                  <th className="py-3 px-4 font-semibold">Evidence Source</th>
                  <th className="py-3 px-4 font-semibold">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border/60">
                {userSkills.map((sk) => (
                  <tr key={sk.id} className="hover:bg-ivory/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-charcoal">{sk.skillName}</td>
                    <td className="py-3 px-4 text-neutral-muted">{sk.category}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          sk.proficiencyLevel === 'ADVANCED'
                            ? 'forest'
                            : sk.proficiencyLevel === 'INTERMEDIATE'
                            ? 'saffron'
                            : 'neutral'
                        }
                      >
                        {sk.proficiencyLevel}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-neutral-muted font-mono">{sk.evidenceSource}</td>
                    <td className="py-3 px-4 font-mono font-bold text-forest">
                      {(sk.confidenceLevel * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* VIEW 3: CAPSTONE PROJECTS */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <Card key={proj.id} variant="elevated">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <Badge variant="forest" size="sm">
                    {proj.status}
                  </Badge>
                  <h3 className="text-base font-bold text-charcoal mt-1.5">{proj.title}</h3>
                </div>
              </div>

              <p className="text-xs text-neutral-muted leading-relaxed mb-4">
                {proj.description}
              </p>

              <div className="space-y-2 text-xs border-t border-neutral-border/60 pt-3">
                <div>
                  <span className="text-neutral-muted font-medium">Stack: </span>
                  <span className="font-mono text-charcoal">{proj.technologies}</span>
                </div>
                {proj.learningOutcomes && (
                  <div>
                    <span className="text-forest font-semibold">Outcomes: </span>
                    <span className="text-neutral-muted">{proj.learningOutcomes}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
