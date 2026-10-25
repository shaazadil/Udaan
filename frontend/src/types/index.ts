// =============================================================================
// UDAAN AI — TYPE DEFINITIONS
// Mirrors backend Spring Boot DTOs and MySQL 20-table relational schema
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  targetRole: string;
  education?: string;
  experienceSummary?: string;
  createdAt: string;
}

export type SkillProficiency = 'BEGINNER' | 'DEVELOPING' | 'INTERMEDIATE' | 'ADVANCED';
export type EvidenceSource = 'RESUME' | 'PROJECT' | 'INTERVIEW' | 'MANUAL_DECLARATION';

export interface Skill {
  id: number;
  name: string;
  category: string;
  description?: string;
}

export interface UserSkill {
  id: number;
  userId: number;
  skillId: number;
  skillName: string;
  category: string;
  proficiencyLevel: SkillProficiency;
  evidenceSource: EvidenceSource;
  evidenceDescription?: string;
  confidenceLevel: number;
  assessedAt: string;
}

export interface Resume {
  id: number;
  userId: number;
  title: string;
  rawText: string;
  versionNumber: number;
  isActive: boolean;
  createdAt: string;
}

export interface Job {
  id: number;
  userId: number;
  jobTitle: string;
  companyName: string;
  descriptionText: string;
  location?: string;
  employmentType?: string;
  createdAt: string;
  requirements?: JobRequirement[];
}

export interface JobRequirement {
  id: number;
  jobId: number;
  skillId?: number;
  skillName?: string;
  requirementText: string;
  isMandatory: boolean;
  weight: number;
}

export interface ResumeAnalysis {
  id: number;
  resumeId: number;
  jobId: number;
  jobTitle?: string;
  companyName?: string;
  compatibilityScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendations: string;
  coverLetterDraft?: string;
  createdAt: string;
}

export type ApplicationStatus = 'SAVED' | 'APPLIED' | 'ASSESSMENT' | 'INTERVIEWING' | 'OFFERED' | 'REJECTED' | 'WITHDRAWN';

export interface Application {
  id: number;
  userId: number;
  jobId: number;
  jobTitle: string;
  companyName: string;
  status: ApplicationStatus;
  appliedDate?: string;
  notes?: string;
  salaryOffered?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearningRoadmap {
  id: number;
  userId: number;
  targetRole: string;
  title: string;
  description?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  milestones: RoadmapMilestone[];
  progressPercentage: number;
  createdAt: string;
}

export interface RoadmapMilestone {
  id: number;
  roadmapId: number;
  skillId?: number;
  skillName?: string;
  title: string;
  conceptExplanation?: string;
  stepOrder: number;
  estimatedHours: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  practiceTask?: string;
  completedAt?: string;
}

export interface ProjectRecommendation {
  id: number;
  userId: number;
  roadmapId?: number;
  title: string;
  description: string;
  technologies: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  githubUrl?: string;
  learningOutcomes?: string;
}

export type InterviewCategory = 'TECHNICAL' | 'CONCEPTUAL' | 'BEHAVIORAL' | 'MIXED';
export type InterviewDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type InterviewSessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

export interface InterviewSession {
  id: number;
  userId: number;
  jobId?: number;
  jobTitle?: string;
  category: InterviewCategory;
  difficulty: InterviewDifficulty;
  status: InterviewSessionStatus;
  overallScore?: number;
  summaryFeedback?: string;
  createdAt: string;
  completedAt?: string;
  questions?: InterviewQuestion[];
}

export interface InterviewQuestion {
  id: number;
  sessionId: number;
  skillId?: number;
  questionText: string;
  questionType: string;
  expectedRubric?: string;
  sequenceOrder: number;
  answer?: InterviewAnswer;
}

export interface InterviewAnswer {
  id: number;
  questionId: number;
  userAnswer: string;
  submittedAt: string;
  evaluation?: AnswerEvaluation;
}

export interface AnswerEvaluation {
  id: number;
  answerId: number;
  score: number;
  strengths: string;
  weaknesses: string;
  improvementTips: string;
  idealAnswer: string;
  conceptsToRevise?: string;
}

export interface DocumentNote {
  id: number;
  userId: number;
  title: string;
  content: string;
  summary?: string;
  resourceUrl?: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface CareerReadinessSummary {
  userId: number;
  name: string;
  targetRole: string;
  totalSkillsProfiled: number;
  advancedSkillsCount: number;
  latestCompatibilityScore: number;
  avgRoadmapCompletion: number;
  avgInterviewScore: number;
  totalNotesSaved: number;
  totalApplications: number;
  activeRoadmapTitle?: string;
}
