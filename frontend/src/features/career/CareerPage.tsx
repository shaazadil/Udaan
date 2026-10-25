import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import type { Resume, Job, ResumeAnalysis, Application, ApplicationStatus } from '../../types';
import {
  IconCheck,
  IconAlertCircle,
  IconSparkles,
  IconCopy,
  IconFileText,
} from '../../components/brand/Icons';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/EmptyState';
import { Input, Textarea } from '../../components/ui/Input';

export const CareerPage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysis | null>(null);
  const [history, setHistory] = useState<ResumeAnalysis[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);
  const [activeTab, setActiveTab] = useState<'analyzer' | 'applications' | 'history'>('analyzer');

  // Input options mode: 'select' from database or 'custom' live input
  const [inputMode, setInputMode] = useState<'select' | 'custom'>('select');
  const [candidateName, setCandidateName] = useState(() => localStorage.getItem('udaan_user_name') || 'Shaaz Adil');
  const [candidateEducation, setCandidateEducation] = useState('B.Tech in Computer Science & Engineering');
  const [candidateExpSummary, setCandidateExpSummary] = useState('2+ years hands-on experience in React, TypeScript, Spring Boot, MySQL');
  const [candidateSkills, setCandidateSkills] = useState('React, TypeScript, Spring Boot, MySQL, RESTful API Design, Git, Docker');
  const [customResumeText, setCustomResumeText] = useState('');
  const [customJobTitle, setCustomJobTitle] = useState(() => localStorage.getItem('udaan_target_role') || 'Full Stack Developer');
  const [customCompanyName, setCustomCompanyName] = useState('Zepto / PhonePe');
  const [customJobDescription, setCustomJobDescription] = useState(
    'We are seeking a Full Stack Developer to build scalable web applications using React, TypeScript, and Java Spring Boot. Responsibilities include building responsive UI components, developing RESTful microservices, optimizing MySQL queries, and deploying containerized services.'
  );
  const [customSkills, setCustomSkills] = useState('React, TypeScript, Spring Boot, MySQL, RESTful API Design, Docker');

  const [activeUserId, setActiveUserId] = useState<number>(() => Number(localStorage.getItem('udaan_user_id') || '1'));

  const loadInitialData = async (uid: number) => {
    setIsLoading(true);
    try {
      const [resumesData, jobsData, historyData, appsData, profileData] = await Promise.all([
        apiClient.get<Resume[]>(`/resumes?userId=${uid}`),
        apiClient.get<Job[]>(`/jobs?userId=${uid}`),
        apiClient.get<ResumeAnalysis[]>(`/career/analyses?userId=${uid}`),
        apiClient.get<Application[]>(`/applications?userId=${uid}`),
        apiClient.get<any>(`/profile?userId=${uid}`).catch(() => null),
      ]);

      setResumes(resumesData);
      setJobs(jobsData);
      setHistory(historyData);
      setApplications(appsData);

      if (profileData) {
        if (profileData.name) setCandidateName(profileData.name);
        if (profileData.education) setCandidateEducation(profileData.education);
        if (profileData.experienceSummary) setCandidateExpSummary(profileData.experienceSummary);
        if (profileData.targetRole) setCustomJobTitle(profileData.targetRole);
      }

      if (resumesData.length > 0) {
        setSelectedResumeId(resumesData[0].id);
        if (!customResumeText) {
          setCustomResumeText(resumesData[0].rawText);
        }
      } else {
        setSelectedResumeId(null);
      }
      if (jobsData.length > 0) {
        setSelectedJobId(jobsData[0].id);
      } else {
        setSelectedJobId(null);
      }
      if (historyData.length > 0) {
        setAnalysisResult(historyData[0]);
      } else {
        setAnalysisResult(null);
      }
    } catch (err) {
      console.error('Failed to load career data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData(activeUserId);
    const handleUserChanged = () => {
      const newUid = Number(localStorage.getItem('udaan_user_id') || '1');
      setActiveUserId(newUid);
      setCandidateName(localStorage.getItem('udaan_user_name') || 'Shaaz Adil');
      setCustomJobTitle(localStorage.getItem('udaan_target_role') || 'Full Stack Developer');
      loadInitialData(newUid);
    };
    window.addEventListener('udaan_user_changed', handleUserChanged);
    return () => window.removeEventListener('udaan_user_changed', handleUserChanged);
  }, []);

  const handleRunAnalysis = async () => {
    if (inputMode === 'select' && (!selectedResumeId || !selectedJobId)) return;
    if (inputMode === 'custom' && (!customResumeText.trim() || !customJobDescription.trim())) {
      alert('Please provide both resume text and target job description to run real-time analysis.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const payload = inputMode === 'custom'
        ? {
            candidateName: candidateName.trim(),
            education: candidateEducation.trim(),
            experienceLevel: candidateExpSummary.trim(),
            userDeclaredSkills: candidateSkills.trim(),
            customResumeText: customResumeText.trim(),
            customJobTitle: customJobTitle.trim(),
            customCompanyName: customCompanyName.trim(),
            customJobDescription: customJobDescription.trim(),
            customRequirements: customSkills.split(',').map((s) => s.trim()).filter(Boolean),
          }
        : {
            resumeId: selectedResumeId,
            jobId: selectedJobId,
          };

      const result = await apiClient.post<ResumeAnalysis>(`/career/analyze?userId=${activeUserId}`, payload);
      setAnalysisResult(result);

      // Refresh list of resumes, jobs, and history
      const updatedHistory = await apiClient.get<ResumeAnalysis[]>(`/career/analyses?userId=${activeUserId}`);
      setHistory(updatedHistory);
      const updatedResumes = await apiClient.get<Resume[]>(`/resumes?userId=${activeUserId}`);
      setResumes(updatedResumes);
      const updatedJobs = await apiClient.get<Job[]>(`/jobs?userId=${activeUserId}`);
      setJobs(updatedJobs);
    } catch (err: any) {
      alert(`Analysis failed: ${err.message || 'Server error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyCoverLetter = () => {
    if (analysisResult?.coverLetterDraft) {
      navigator.clipboard.writeText(analysisResult.coverLetterDraft);
      setCopiedCoverLetter(true);
      setTimeout(() => setCopiedCoverLetter(false), 2500);
    }
  };

  const handleStatusUpdate = async (appId: number, newStatus: ApplicationStatus) => {
    try {
      await apiClient.patch(`/applications/${appId}/status`, { status: newStatus });
      const updatedApps = await apiClient.get<Application[]>(`/applications?userId=${activeUserId}`);
      setApplications(updatedApps);
    } catch (err) {
      console.error('Failed to update application status:', err);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-border">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-forest">
            Module 1: Career Intelligence
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-charcoal mt-0.5">
            Resume Analysis &amp; Job Alignment
          </h1>
          <p className="text-sm text-neutral-muted mt-1">
            Evaluate candidate compatibility against specific job requirements using deterministic matching.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-neutral-border rounded-lg">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'analyzer'
                ? 'bg-forest text-white'
                : 'text-neutral-muted hover:text-charcoal'
            }`}
          >
            Alignment Studio
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'applications'
                ? 'bg-forest text-white'
                : 'text-neutral-muted hover:text-charcoal'
            }`}
          >
            Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'history'
                ? 'bg-forest text-white'
                : 'text-neutral-muted hover:text-charcoal'
            }`}
          >
            History ({history.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: ALIGNMENT STUDIO */}
      {activeTab === 'analyzer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Selectors & Inputs */}
          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardHeader
                title="Input Parameters"
                subtitle="Select saved candidate data or enter custom input in real-time"
              />

              {/* Mode Toggle Switcher */}
              <div className="flex items-center gap-1.5 p-1 bg-ivory border border-neutral-border rounded-lg mb-4">
                <button
                  type="button"
                  onClick={() => setInputMode('select')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    inputMode === 'select'
                      ? 'bg-white text-forest shadow-sm'
                      : 'text-neutral-muted hover:text-charcoal'
                  }`}
                >
                  Saved Profiles ({resumes.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputMode('custom');
                    if (!customResumeText && selectedResumeId) {
                      const cur = resumes.find((r) => r.id === selectedResumeId);
                      if (cur) setCustomResumeText(cur.rawText);
                    }
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    inputMode === 'custom'
                      ? 'bg-white text-forest shadow-sm'
                      : 'text-neutral-muted hover:text-charcoal'
                  }`}
                >
                  Live Custom Input &amp; Paste
                </button>
              </div>

              <div className="space-y-4">
                {inputMode === 'select' ? (
                  <>
                    {/* Resume Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                        Candidate Resume
                      </label>
                      <select
                        value={selectedResumeId || ''}
                        onChange={(e) => {
                          const rid = Number(e.target.value);
                          setSelectedResumeId(rid);
                          const r = resumes.find((res) => res.id === rid);
                          if (r) setCustomResumeText(r.rawText);
                        }}
                        className="w-full bg-ivory text-charcoal text-sm rounded-lg border border-neutral-border p-2.5 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
                      >
                        {resumes.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.title} (v{r.versionNumber})
                          </option>
                        ))}
                      </select>
                      {selectedResumeId && (
                        <div className="mt-2 p-2.5 bg-ivory rounded text-xs text-neutral-muted font-mono leading-relaxed line-clamp-3 border border-neutral-border/60">
                          {resumes.find((r) => r.id === selectedResumeId)?.rawText}
                        </div>
                      )}
                    </div>

                    {/* Job Description Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                        Target Job Opportunity
                      </label>
                      <select
                        value={selectedJobId || ''}
                        onChange={(e) => setSelectedJobId(Number(e.target.value))}
                        className="w-full bg-ivory text-charcoal text-sm rounded-lg border border-neutral-border p-2.5 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
                      >
                        {jobs.map((j) => (
                          <option key={j.id} value={j.id}>
                            {j.jobTitle} · {j.companyName}
                          </option>
                        ))}
                      </select>
                      {selectedJobId && (
                        <div className="mt-2 p-2.5 bg-ivory rounded text-xs text-neutral-muted leading-relaxed line-clamp-3 border border-neutral-border/60">
                          {jobs.find((j) => j.id === selectedJobId)?.descriptionText}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Section 1: Candidate Profile & Qualifications */}
                    <div className="p-3.5 bg-ivory/60 rounded-xl border border-neutral-border space-y-3">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-forest block">
                        Candidate Profile &amp; Background
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Candidate Name"
                          value={candidateName}
                          onChange={(e) => setCandidateName(e.target.value)}
                          placeholder="e.g. Shaaz Adil"
                        />
                        <Input
                          label="Current / Desired Role"
                          value={customJobTitle}
                          onChange={(e) => setCustomJobTitle(e.target.value)}
                          placeholder="e.g. Full Stack Developer"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Highest Degree / College"
                          value={candidateEducation}
                          onChange={(e) => setCandidateEducation(e.target.value)}
                          placeholder="e.g. B.Tech Computer Science"
                        />
                        <Input
                          label="Experience Level / Summary"
                          value={candidateExpSummary}
                          onChange={(e) => setCandidateExpSummary(e.target.value)}
                          placeholder="e.g. 2+ YOE in React & Spring Boot"
                        />
                      </div>
                      <div>
                        <Input
                          label="Candidate Technical Skills (Comma-separated)"
                          value={candidateSkills}
                          onChange={(e) => setCandidateSkills(e.target.value)}
                          placeholder="React, TypeScript, Spring Boot, MySQL, REST APIs, Docker"
                          helperText="The skills you actively know and want the evaluator to match."
                        />
                      </div>
                    </div>

                    {/* Section 2: Complete Resume Text (Editable / Paste) */}
                    <div>
                      <Textarea
                        label="Candidate Resume Text (Editable / Paste Real Resume)"
                        rows={6}
                        value={customResumeText}
                        onChange={(e) => setCustomResumeText(e.target.value)}
                        placeholder="Paste full resume text, projects, metrics, and work achievements here..."
                        helperText="The Groq AI will evaluate these exact qualifications against job requirements."
                      />
                    </div>

                    {/* Section 3: Target Job Opportunity */}
                    <div className="p-3.5 bg-ivory/60 rounded-xl border border-neutral-border space-y-3">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-forest block">
                        Target Job Opportunity &amp; Requirements
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Target Company"
                          value={customCompanyName}
                          onChange={(e) => setCustomCompanyName(e.target.value)}
                          placeholder="e.g. Zepto / PhonePe / Razorpay"
                        />
                        <Input
                          label="Target Role Title"
                          value={customJobTitle}
                          onChange={(e) => setCustomJobTitle(e.target.value)}
                          placeholder="e.g. Full Stack Developer"
                        />
                      </div>

                      <div>
                        <Input
                          label="Mandatory Requirements / Skills (Comma-separated)"
                          value={customSkills}
                          onChange={(e) => setCustomSkills(e.target.value)}
                          placeholder="React, TypeScript, Spring Boot, MySQL, REST APIs, Docker"
                          helperText="Skills the AI will evaluate as primary requirements."
                        />
                      </div>

                      <div>
                        <Textarea
                          label="Job Description & Responsibilities"
                          rows={4}
                          value={customJobDescription}
                          onChange={(e) => setCustomJobDescription(e.target.value)}
                          placeholder="Paste real job description, key responsibilities, or required technologies..."
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Submit Action */}
                <Button
                  size="md"
                  variant="primary"
                  isLoading={isAnalyzing}
                  onClick={handleRunAnalysis}
                  className="w-full justify-center shadow-subtle mt-2"
                  icon={<IconSparkles size={16} />}
                >
                  {inputMode === 'custom' ? 'Run Live AI Alignment on Custom Input' : 'Generate Compatibility Analysis'}
                </Button>
              </div>
            </Card>

            {/* Formula Explanation Note */}
            <div className="p-4 bg-ivory rounded-xl border border-neutral-border text-xs text-neutral-muted leading-relaxed">
              <strong className="text-charcoal block mb-1">Explainable Scoring Policy</strong>
              Compatibility scores are computed deterministically on the backend: Mandatory skills carry a 70% aggregate weight, while secondary skills carry 30%. No subjective scores are invented.
            </div>
          </div>

          {/* Right Column: Detailed Compatibility Results */}
          <div className="lg:col-span-7 space-y-6">
            {isLoading ? (
              <Card>
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-40 w-full" />
              </Card>
            ) : analysisResult ? (
              <>
                {/* Score Banner */}
                <Card variant="elevated" className="border-forest/30">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-border">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-neutral-muted">
                        Analysis Assessment
                      </span>
                      <h3 className="text-lg font-bold text-charcoal mt-0.5">
                        {analysisResult.jobTitle || 'Target Position'}
                      </h3>
                      <p className="text-xs text-neutral-muted">
                        Company: {analysisResult.companyName || 'Evaluated Company'}
                      </p>
                    </div>

                    <div className="text-right sm:text-right">
                      <span className="text-xs uppercase font-medium text-neutral-muted block">
                        Compatibility Score
                      </span>
                      <div className="font-mono text-3xl font-extrabold text-forest">
                        {analysisResult.compatibilityScore}%
                      </div>
                    </div>
                  </div>

                  {/* Skills Grid: Matching vs Missing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                    {/* Matching skills */}
                    <div className="p-4 rounded-xl bg-forest-surface/60 border border-forest/20">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-forest uppercase tracking-wider mb-2.5">
                        <IconCheck size={14} />
                        <span>Matching Skills ({analysisResult.matchingSkills?.length || 0})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.matchingSkills?.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded text-xs bg-white text-forest font-medium border border-forest/20 shadow-subtle"
                          >
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing skills */}
                    <div className="p-4 rounded-xl bg-status-error-bg/60 border border-status-error/20">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-status-error uppercase tracking-wider mb-2.5">
                        <IconAlertCircle size={14} />
                        <span>Missing Skills ({analysisResult.missingSkills?.length || 0})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.missingSkills?.length ? (
                          analysisResult.missingSkills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded text-xs bg-white text-status-error font-medium border border-status-error/20 shadow-subtle"
                            >
                              ! {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-neutral-muted">No missing skills detected!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {analysisResult.recommendations && (
                    <div className="mt-5 p-4 rounded-xl bg-ivory border border-neutral-border text-xs leading-relaxed">
                      <strong className="text-charcoal block mb-1 uppercase font-semibold tracking-wider text-[11px]">
                        Resume Optimization Advice
                      </strong>
                      <p className="text-neutral-muted whitespace-pre-line">
                        {analysisResult.recommendations}
                      </p>
                    </div>
                  )}
                </Card>

                {/* Groq AI Generated Cover Letter Draft */}
                {analysisResult.coverLetterDraft && (
                  <Card>
                    <CardHeader
                      title="Role-Tailored Cover Letter Draft"
                      subtitle="Synthesized via Groq LLM highlighting demonstrated skills"
                      action={
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={handleCopyCoverLetter}
                          icon={<IconCopy size={14} />}
                        >
                          {copiedCoverLetter ? 'Copied!' : 'Copy Draft'}
                        </Button>
                      }
                    />
                    <div className="p-4 rounded-xl bg-ivory border border-neutral-border text-xs text-charcoal leading-relaxed whitespace-pre-wrap font-sans">
                      {analysisResult.coverLetterDraft}
                    </div>
                  </Card>
                )}
              </>
            ) : (
              <Card className="text-center py-12">
                <IconFileText size={36} className="text-neutral-muted mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-charcoal">No Analysis Generated Yet</h3>
                <p className="text-xs text-neutral-muted mt-1 max-w-sm mx-auto">
                  Select your resume and target job opportunity on the left, then click Generate to compute real compatibility.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: APPLICATION TRACKER */}
      {activeTab === 'applications' && (
        <Card>
          <CardHeader
            title="Job Application Pipeline"
            subtitle="Track live interview statuses across your target opportunities"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory border-b border-neutral-border text-neutral-muted uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Position</th>
                  <th className="py-3 px-4 font-semibold">Company</th>
                  <th className="py-3 px-4 font-semibold">Current Status</th>
                  <th className="py-3 px-4 font-semibold">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border/60">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-ivory/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-charcoal">
                      {app.jobTitle}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-muted">
                      {app.companyName}
                    </td>
                    <td className="py-3.5 px-4">
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
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusUpdate(app.id, e.target.value as ApplicationStatus)}
                        className="bg-white text-xs text-charcoal rounded border border-neutral-border px-2 py-1 focus:outline-none focus:ring-1 focus:ring-forest"
                      >
                        <option value="SAVED">SAVED</option>
                        <option value="APPLIED">APPLIED</option>
                        <option value="ASSESSMENT">ASSESSMENT</option>
                        <option value="INTERVIEWING">INTERVIEWING</option>
                        <option value="OFFERED">OFFERED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* VIEW 3: ANALYSIS HISTORY */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader
            title="Analysis History Log"
            subtitle="Previous deterministic evaluations stored in MySQL"
          />
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-ivory border border-neutral-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-ivory-warm transition-colors"
              >
                <div>
                  <h4 className="text-sm font-semibold text-charcoal">
                    {item.jobTitle || 'Target Role'} · {item.companyName || 'Company'}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-neutral-muted">
                    <span>Matching: {item.matchingSkills?.length || 0}</span>
                    <span>·</span>
                    <span>Gaps: {item.missingSkills?.length || 0}</span>
                    <span>·</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="font-mono text-xl font-bold text-forest">
                    {item.compatibilityScore}%
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setAnalysisResult(item);
                      setActiveTab('analyzer');
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
