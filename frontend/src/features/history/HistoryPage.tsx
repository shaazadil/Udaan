import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import type { ResumeAnalysis, Application } from '../../types';
import {
  IconCareer,
  IconRefresh,
} from '../../components/brand/Icons';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/EmptyState';

export const HistoryPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<ResumeAnalysis[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'CAREER' | 'APPLICATIONS'>('ALL');

  const userId = Number(localStorage.getItem('udaan_user_id') || '1');

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const [analysesData, appsData] = await Promise.all([
        apiClient.get<ResumeAnalysis[]>(`/career/analyses?userId=${userId}`),
        apiClient.get<Application[]>(`/applications?userId=${userId}`),
      ]);
      setAnalyses(analysesData);
      setApplications(appsData);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-border">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-forest">
            Audited Record
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-charcoal mt-0.5">
            History &amp; Insights
          </h1>
          <p className="text-sm text-neutral-muted mt-1">
            Chronological audit of resume assessments, interview runs, and job application milestones in MySQL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={fetchHistory}
            icon={<IconRefresh size={14} />}
          >
            Refresh Logs
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['ALL', 'CAREER', 'APPLICATIONS'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === tab
                ? 'bg-forest text-white'
                : 'bg-white border border-neutral-border text-neutral-muted hover:text-charcoal'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {/* Resume Analyses */}
        {(filter === 'ALL' || filter === 'CAREER') && (
          <Card>
            <CardHeader
              title="Resume Compatibility Analyses"
              subtitle="Deterministic skill match evaluations"
            />
            <div className="space-y-3">
              {isLoading && <Skeleton className="h-20 w-full mb-3" />}
              {!isLoading && analyses.map((a) => (
                <div
                  key={a.id}
                  className="p-4 rounded-xl bg-ivory border border-neutral-border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-forest-surface text-forest flex items-center justify-center flex-shrink-0 mt-0.5">
                      <IconCareer size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-charcoal">
                        {a.jobTitle || 'Target Role'} · {a.companyName || 'Target Company'}
                      </h4>
                      <p className="text-xs text-neutral-muted mt-0.5">
                        Matching Skills: {a.matchingSkills?.join(', ')}
                      </p>
                      <span className="text-[11px] text-neutral-muted block mt-1">
                        Recorded on {new Date(a.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="font-mono text-xl font-bold text-forest">
                      {a.compatibilityScore}%
                    </div>
                    <Badge variant="forest" size="sm">Deterministic</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Applications */}
        {(filter === 'ALL' || filter === 'APPLICATIONS') && (
          <Card>
            <CardHeader
              title="Application Pipeline History"
              subtitle="Logged transitions across hiring stages"
            />
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-xl bg-ivory border border-neutral-border flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-charcoal">{app.jobTitle}</h4>
                    <p className="text-xs text-neutral-muted">{app.companyName}</p>
                    <span className="text-[11px] text-neutral-muted block mt-0.5">
                      Updated: {new Date(app.updatedAt || app.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <Badge
                    variant={
                      app.status === 'OFFERED'
                        ? 'success'
                        : app.status === 'INTERVIEWING'
                        ? 'forest'
                        : app.status === 'REJECTED'
                        ? 'error'
                        : 'neutral'
                    }
                  >
                    {app.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
