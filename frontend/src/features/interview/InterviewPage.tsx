import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import type {
  InterviewCategory,
  InterviewDifficulty,
  AnswerEvaluation,
} from '../../types';
import {
  IconInterviews,
  IconCheck,
  IconAlertCircle,
  IconSparkles,
  IconArrowRight,
  IconRefresh,
  IconSend,
} from '../../components/brand/Icons';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Textarea } from '../../components/ui/Input';

interface SessionResponse {
  id: number;
  category: InterviewCategory;
  difficulty: InterviewDifficulty;
  status: string;
  overallScore?: number;
  summaryFeedback?: string;
  createdAt: string;
  questions: {
    id: number;
    questionText: string;
    questionType: string;
    sequenceOrder: number;
    evaluation?: AnswerEvaluation;
  }[];
}

export const InterviewPage: React.FC = () => {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [activeSession, setActiveSession] = useState<SessionResponse | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [latestEvaluation, setLatestEvaluation] = useState<AnswerEvaluation | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Setup form states
  const [category, setCategory] = useState<InterviewCategory>('TECHNICAL');
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>('INTERMEDIATE');
  const [targetRole, setTargetRole] = useState(() => localStorage.getItem('udaan_target_role') || 'Full Stack Developer');

  const [activeUserId, setActiveUserId] = useState<number>(() => Number(localStorage.getItem('udaan_user_id') || '1'));

  const fetchSessions = async (uid: number) => {
    setIsLoading(true);
    try {
      const data = await apiClient.get<SessionResponse[]>(`/interviews?userId=${uid}`);
      setSessions(data);
      if (data.length > 0) {
        // Load latest session details
        const latest = await apiClient.get<SessionResponse>(`/interviews/${data[0].id}`);
        setActiveSession(latest);
      } else {
        setActiveSession(null);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions(activeUserId);
    const handleUserChanged = () => {
      const newUid = Number(localStorage.getItem('udaan_user_id') || '1');
      setActiveUserId(newUid);
      setTargetRole(localStorage.getItem('udaan_target_role') || 'Full Stack Developer');
      fetchSessions(newUid);
    };
    window.addEventListener('udaan_user_changed', handleUserChanged);
    return () => window.removeEventListener('udaan_user_changed', handleUserChanged);
  }, []);

  const handleStartSession = async () => {
    setIsStarting(true);
    try {
      const newSession = await apiClient.post<SessionResponse>(`/interviews?userId=${activeUserId}`, {
        category,
        difficulty,
        targetRole,
        questionCount: 3,
      });

      setActiveSession(newSession);
      setCurrentQuestionIndex(0);
      setUserAnswer('');
      setLatestEvaluation(null);

      // Refresh list
      const updatedList = await apiClient.get<SessionResponse[]>(`/interviews?userId=${activeUserId}`);
      setSessions(updatedList);
    } catch (err: any) {
      alert(`Could not start interview session: ${err.message || 'Server error'}`);
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!activeSession || !userAnswer.trim()) return;

    const currentQ = activeSession.questions[currentQuestionIndex];
    if (!currentQ) return;

    setIsSubmitting(true);
    try {
      const evalResult = await apiClient.post<AnswerEvaluation>(
        `/interviews/${activeSession.id}/answers`,
        {
          questionId: currentQ.id,
          userAnswer: userAnswer.trim(),
        }
      );
      setLatestEvaluation(evalResult);

      // Refresh current session state
      const refreshed = await apiClient.get<SessionResponse>(`/interviews/${activeSession.id}`);
      setActiveSession(refreshed);
    } catch (err: any) {
      alert(`Answer evaluation failed: ${err.message || 'Server error'}. Your typed answer has been preserved.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (!activeSession) return;
    if (currentQuestionIndex < activeSession.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setLatestEvaluation(null);
    }
  };

  const handleCompleteInterview = async () => {
    if (!activeSession) return;
    try {
      const finished = await apiClient.post<SessionResponse>(`/interviews/${activeSession.id}/complete`);
      setActiveSession(finished);
      fetchSessions(activeUserId);
    } catch (err) {
      console.error('Failed to complete session:', err);
    }
  };

  const currentQuestion = activeSession?.questions?.[currentQuestionIndex];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-border">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-forest">
            Module 3: Interview Intelligence
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-charcoal mt-0.5">
            Role-Specific Mock Interviews
          </h1>
          <p className="text-sm text-neutral-muted mt-1">
            Calibrated technical, conceptual, and behavioural evaluations powered by the Groq AI rubric engine.
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => fetchSessions(activeUserId)}
          icon={<IconRefresh size={14} />}
        >
          Refresh Sessions
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interview Console */}
        <div className="lg:col-span-8 space-y-6">
          {activeSession ? (
            <Card variant="elevated">
              {/* Question Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-border">
                <div className="flex items-center gap-2">
                  <Badge variant="forest">
                    Question {currentQuestionIndex + 1} of {activeSession.questions.length}
                  </Badge>
                  <Badge variant="neutral">
                    {activeSession.category} · {activeSession.difficulty}
                  </Badge>
                </div>
                {activeSession.status === 'COMPLETED' && (
                  <Badge variant="success">Completed · Score: {activeSession.overallScore}/100</Badge>
                )}
              </div>

              {/* Question Text */}
              <div className="my-5 p-4 rounded-xl bg-ivory border border-neutral-border">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-muted block mb-1">
                  Technical Scenario / Prompt:
                </span>
                <p className="text-base font-medium text-charcoal leading-relaxed">
                  {currentQuestion?.questionText}
                </p>
              </div>

              {/* Evaluation Result or Input Form */}
              {latestEvaluation || currentQuestion?.evaluation ? (
                <div className="space-y-4 pt-2">
                  {(() => {
                    const ev = latestEvaluation || currentQuestion?.evaluation;
                    if (!ev) return null;
                    return (
                      <div className="space-y-4">
                        {/* Score Banner */}
                        <div className="p-4 rounded-xl bg-forest-surface border border-forest/30 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-forest">
                              Multi-Dimensional Rubric Score
                            </span>
                            <div className="text-xl font-bold text-charcoal mt-0.5">
                              Performance Assessment
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-3xl font-extrabold text-forest">
                              {ev.score}
                            </span>
                            <span className="text-xs text-neutral-muted"> / 100</span>
                          </div>
                        </div>

                        {/* Strengths & Weaknesses Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="p-4 rounded-xl bg-status-success-bg/70 border border-status-success/20">
                            <div className="flex items-center gap-1.5 font-semibold text-status-success mb-1">
                              <IconCheck size={14} />
                              <span>Observed Strengths</span>
                            </div>
                            <p className="text-neutral-muted leading-relaxed">
                              {ev.strengths}
                            </p>
                          </div>

                          <div className="p-4 rounded-xl bg-status-warning-bg/70 border border-status-warning/20">
                            <div className="flex items-center gap-1.5 font-semibold text-status-warning mb-1">
                              <IconAlertCircle size={14} />
                              <span>Improvement Recommendations</span>
                            </div>
                            <p className="text-neutral-muted leading-relaxed">
                              {ev.weaknesses || ev.improvementTips}
                            </p>
                          </div>
                        </div>

                        {/* Ideal Benchmark Answer */}
                        {ev.idealAnswer && (
                          <div className="p-4 rounded-xl bg-ivory border border-neutral-border text-xs">
                            <strong className="text-charcoal block mb-1 uppercase font-semibold tracking-wider text-[11px]">
                              Ideal Benchmark Response
                            </strong>
                            <p className="text-neutral-muted leading-relaxed whitespace-pre-line">
                              {ev.idealAnswer}
                            </p>
                          </div>
                        )}

                        {/* Navigation between questions */}
                        <div className="flex items-center justify-end gap-3 pt-3">
                          {currentQuestionIndex < activeSession.questions.length - 1 ? (
                            <Button
                              size="md"
                              variant="primary"
                              onClick={handleNextQuestion}
                              icon={<IconArrowRight size={16} />}
                              iconPosition="right"
                            >
                              Next Question
                            </Button>
                          ) : (
                            <Button
                              size="md"
                              variant="saffron"
                              onClick={handleCompleteInterview}
                              icon={<IconCheck size={16} />}
                              iconPosition="right"
                            >
                              Finalize Mock Interview
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="space-y-4">
                  <Textarea
                    label="Your Technical Response"
                    placeholder="Structure your answer clearly. Explain your architectural choices, assumptions, trade-offs, and failure recovery mechanisms..."
                    rows={7}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    helperText="Take your time to articulate trade-offs. The evaluator weights technical precision and structured reasoning."
                  />

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-neutral-muted">
                      Evaluated against real candidate rubric criteria
                    </span>
                    <Button
                      size="md"
                      variant="primary"
                      isLoading={isSubmitting}
                      disabled={!userAnswer.trim()}
                      onClick={handleSubmitAnswer}
                      icon={<IconSend size={15} />}
                    >
                      Submit for Evaluation
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="text-center py-16">
              <IconInterviews size={44} className="text-neutral-muted mx-auto mb-3" />
              <h3 className="text-base font-semibold text-charcoal">No Interview In Progress</h3>
              <p className="text-xs text-neutral-muted mt-1 max-w-sm mx-auto mb-6">
                Configure your mock interview mode and difficulty on the right, then launch an adaptive evaluation session.
              </p>
            </Card>
          )}
        </div>

        {/* Right Column: Setup Panel & Session History */}
        <div className="lg:col-span-4 space-y-6">
          {/* New Session Configuration Card */}
          <Card>
            <CardHeader
              title="Launch Mock Interview"
              subtitle="Configure role & evaluation focus"
            />

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  Interview Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as InterviewCategory)}
                  className="w-full bg-ivory text-charcoal text-sm rounded-lg border border-neutral-border p-2.5 focus:outline-none focus:ring-2 focus:ring-forest"
                >
                  <option value="TECHNICAL">Technical Deep-Dive</option>
                  <option value="CONCEPTUAL">System Architecture &amp; Conceptual</option>
                  <option value="BEHAVIORAL">Behavioural &amp; Situational</option>
                  <option value="MIXED">Mixed Calibration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  Target Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as InterviewDifficulty)}
                  className="w-full bg-ivory text-charcoal text-sm rounded-lg border border-neutral-border p-2.5 focus:outline-none focus:ring-2 focus:ring-forest"
                >
                  <option value="BEGINNER">Junior / Entry Level</option>
                  <option value="INTERMEDIATE">Intermediate (2-4 YOE)</option>
                  <option value="ADVANCED">Senior / Staff (5+ YOE)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  Target Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-ivory text-charcoal text-sm rounded-lg border border-neutral-border p-2.5 focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <Button
                size="md"
                variant="primary"
                isLoading={isStarting}
                onClick={handleStartSession}
                className="w-full justify-center mt-2 shadow-subtle"
                icon={<IconSparkles size={16} />}
              >
                Begin Calibrated Session
              </Button>
            </div>
          </Card>

          {/* Past Sessions Card */}
          <Card>
            <CardHeader
              title="Interview History"
              subtitle="Previous practice records in MySQL"
            />
            <div className="space-y-2.5">
              {isLoading && <div className="text-xs text-neutral-muted py-2">Loading sessions from MySQL...</div>}
              {sessions.map((s) => (
                <div
                  key={s.id}
                  onClick={async () => {
                    const full = await apiClient.get<SessionResponse>(`/interviews/${s.id}`);
                    setActiveSession(full);
                    setCurrentQuestionIndex(0);
                    setUserAnswer('');
                    setLatestEvaluation(null);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    activeSession?.id === s.id
                      ? 'bg-forest-surface border-forest/40'
                      : 'bg-ivory border-neutral-border hover:bg-ivory-warm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-charcoal">
                      Session #{s.id} · {s.category}
                    </span>
                    <Badge variant={s.status === 'COMPLETED' ? 'forest' : 'neutral'} size="sm">
                      {s.overallScore ? `${s.overallScore}/100` : s.status}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-neutral-muted mt-1 flex items-center justify-between">
                    <span>Difficulty: {s.difficulty}</span>
                    <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
