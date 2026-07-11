export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  activityDates?: string[];
  longestStreak?: number;
  currentStreak?: number;
}

export interface Question {
  id: string;
  text: string;
  type: 'hr' | 'technical' | 'aptitude';
  jobRole: string; // e.g., "Software Engineer", "Data Analyst", "AI/ML Engineer", "General"
  difficulty: 'easy' | 'medium' | 'hard';
  idealAnswer: string;
  keywords: string[];
}

export interface InterviewSession {
  id: string;
  userId: string;
  type: 'hr' | 'technical' | 'aptitude';
  jobRole: string;
  status: 'ongoing' | 'completed';
  createdAt: string;
  currentQuestionIndex: number;
}

export interface SubScores {
  technical: number;
  communication: number;
  grammar: number;
  confidence: number;
  keywordMatch: number;
}

export interface SessionAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  questionText: string;
  rawText: string; // The candidate's raw answered text or transcript
  isAudio: boolean;
  speakingSpeed?: number; // words per minute if voice
  subScores: SubScores;
  feedback: string;
  createdAt: string;
}

export interface Report {
  id: string;
  sessionId: string;
  userId: string;
  jobRole: string;
  type: 'hr' | 'technical' | 'aptitude';
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  grammarScore: number;
  confidenceScore: number;
  keywordMatchScore: number;
  suggestions: string[];
  createdAt: string;
  answers: SessionAnswer[];
}

export interface DashboardStats {
  totalSessions: number;
  averageScore: number;
  sessionsByRole: { [key: string]: number };
  sessionsByType: { [key: string]: number };
  scoreTrend: { date: string; score: number }[];
}
