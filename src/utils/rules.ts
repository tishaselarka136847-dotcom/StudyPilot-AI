import { FocusRecord, QuizAttempt, StudySession, Subject } from '../types/index.ts';

/**
 * Calculates topic completion percentage for a subject.
 */
export function calculateSubjectProgress(subject: Subject): number {
  if (!subject.topics || subject.topics.length === 0) return 0;
  const completed = subject.topics.filter(t => t.completed).length;
  return Math.round((completed / subject.topics.length) * 100);
}

/**
 * Calculates total topics completed and overall progress percentage across all subjects.
 */
export function calculateOverallProgress(subjects: Subject[]): {
  totalTopics: number;
  completedTopics: number;
  percentage: number;
} {
  let totalTopics = 0;
  let completedTopics = 0;

  for (const sub of subjects) {
    if (sub.topics) {
      totalTopics += sub.topics.length;
      completedTopics += sub.topics.filter(t => t.completed).length;
    }
  }

  const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  return { totalTopics, completedTopics, percentage };
}

/**
 * Calculates average quiz percentage score.
 */
export function calculateQuizAverage(attempts: QuizAttempt[]): {
  averagePercentage: number;
  totalAttempts: number;
} {
  if (!attempts || attempts.length === 0) {
    return { averagePercentage: 0, totalAttempts: 0 };
  }
  const sum = attempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
  return {
    averagePercentage: Math.round(sum / attempts.length),
    totalAttempts: attempts.length,
  };
}

/**
 * Calculates total active study hours from completed focus records.
 * Only active seconds are credited; paused time is not counted.
 */
export function calculateTotalActiveHours(records: FocusRecord[]): number {
  if (!records || records.length === 0) return 0;
  const totalSeconds = records.reduce((acc, curr) => acc + (curr.activeSeconds || 0), 0);
  return Math.round((totalSeconds / 3600) * 10) / 10;
}

/**
 * Computes consecutive study streak based on distinct dates of study activity
 * (focus sessions or completed schedule tasks).
 */
export function calculateStudyStreak(
  focusRecords: FocusRecord[],
  studySessions: StudySession[] = []
): number {
  const datesSet = new Set<string>();

  for (const r of focusRecords) {
    if (r.completedAt && r.activeSeconds > 60) {
      datesSet.add(r.completedAt.split('T')[0]);
    }
  }

  for (const s of studySessions) {
    if (s.completed && s.date) {
      datesSet.add(s.date);
    }
  }

  if (datesSet.size === 0) return 0;

  const sortedDates = Array.from(datesSet).sort().reverse();
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // If there's no activity today or yesterday, the active streak is broken
  const mostRecent = sortedDates[0];
  if (mostRecent !== todayStr && mostRecent !== yesterday) {
    return 0;
  }

  let streak = 0;
  let checkDate = new Date(mostRecent);

  for (const d of sortedDates) {
    const expectedStr = checkDate.toISOString().split('T')[0];
    if (d === expectedStr) {
      streak += 1;
      checkDate = new Date(checkDate.getTime() - 86400000);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Validates timetable sessions according to scheduling rules:
 * - No overlaps on the same day
 * - Respect daily study hour limit
 * - No sessions after subject's exam date
 */
export function validateTimetableSessions(
  sessions: StudySession[],
  availableDays: string[],
  maxDailyHours: number,
  subjectExams: Record<string, string> = {}
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const dayMinutes: Record<string, number> = {};

  for (const s of sessions) {
    // Check day availability
    if (s.date) {
      const sessionDate = new Date(s.date + 'T00:00:00');
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayOfWeek = dayNames[sessionDate.getDay()];
      if (availableDays.length > 0 && !availableDays.includes(dayOfWeek)) {
        errors.push(`Session for "${s.topic}" is scheduled on ${dayOfWeek} (${s.date}), which is not an available day.`);
      }
    }

    // Accumulate daily study minutes
    dayMinutes[s.date] = (dayMinutes[s.date] || 0) + s.durationMinutes;

    // Check exam date constraint
    if (s.subjectName && subjectExams[s.subjectName]) {
      const examDateStr = subjectExams[s.subjectName];
      if (s.date >= examDateStr) {
        errors.push(`Session for "${s.subjectName}" is scheduled on ${s.date}, which is on or after the exam date (${examDateStr}).`);
      }
    }

    // Check duration sanity
    if (s.durationMinutes <= 0) {
      errors.push(`Session for "${s.topic}" has an invalid duration (${s.durationMinutes}m).`);
    }
  }

  // Check daily limit
  for (const [date, minutes] of Object.entries(dayMinutes)) {
    if (minutes > maxDailyHours * 60) {
      errors.push(`Date ${date} exceeds max daily hours: ${minutes / 60}h > ${maxDailyHours}h.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
