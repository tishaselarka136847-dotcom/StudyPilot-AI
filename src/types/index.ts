/**
 * Core TypeScript types for StudyPilot AI
 */

export type AcademicLevel = 'all' | 'university' | 'high_school' | 'competitive_exams';

export interface Topic {
  id: string;
  name: string;
  completed: boolean;
  estimatedHours?: number;
  completedAt?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string; // Hex color (e.g. #2563EB, #7C3AED, #0D9488, #D97706, #E11D48)
  examDate?: string; // YYYY-MM-DD
  confidenceLevel: number; // 1 (low) to 5 (high)
  notes?: string;
  topics: Topic[];
  createdAt: string;
}

export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  subjectName: string;
  subjectId?: string;
  topic: string;
  activity: string; // 'Active Recall' | 'Problem Solving' | 'Reading' | 'Revision' | 'Practice Quiz'
  durationMinutes: number;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
}

export interface StudyPlan {
  id: string;
  createdAt: string;
  preferences: {
    availableDays: string[];
    dailyStudyHours: number;
    sessionDurationMinutes: number;
    breakDurationMinutes: number;
    revisionPreferences: string;
    startDate: string;
    endDate: string;
  };
  sessions: StudySession[];
  unfinishedTopics?: string[];
  limitationExplanation?: string;
  strategyNotes?: string;
}

export interface NoteDefinition {
  term: string;
  definition: string;
}

export interface SummaryRecord {
  id: string;
  subjectId?: string;
  subjectName: string;
  title: string;
  sourceNotes: string;
  length: 'Short' | 'Medium' | 'Detailed';
  style: 'Simple Explanation' | 'Exam Revision' | 'Key Points';
  summary: string;
  concepts: string[];
  definitions: NoteDefinition[];
  keyPoints: string[];
  examples: string[];
  terminology: string[];
  quickRevision: string[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceContext?: string;
}

export interface QuizRecord {
  id: string;
  subjectId?: string;
  subjectName: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'Multiple Choice' | 'True/False';
  questions: QuizQuestion[];
  isGeneralKnowledge?: boolean;
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  subjectName: string;
  topic: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  userAnswers: Record<string, number>;
  completedAt: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  known?: boolean;
  needsRevision?: boolean;
}

export interface FlashcardSet {
  id: string;
  subjectId?: string;
  subjectName: string;
  title: string;
  cards: Flashcard[];
  createdAt: string;
}

export interface FocusRecord {
  id: string;
  taskName: string;
  subjectName: string;
  durationMinutes: number; // Planned duration
  activeSeconds: number; // Actual active elapsed seconds
  completedAt: string;
}

export interface StudentProfile {
  fullName: string;
  email: string;
  studentId: string;
  institution: string;
  academicLevel: AcademicLevel;
  major: string;
  currentSemester: string;
  learningStyle: string;
  isLoggedIn: boolean;
}

export interface UserSettings {
  displayName: string;
  academicLevel: AcademicLevel;
  dailyStudyGoalMinutes: number;
  sessionDurationMinutes: number;
  breakDurationMinutes: number;
  availableDays: string[];
  theme: 'light' | 'dark';
  studentProfile: StudentProfile;
}

export interface CoachMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
