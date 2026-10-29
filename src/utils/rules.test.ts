import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSubjectProgress,
  calculateOverallProgress,
  calculateQuizAverage,
  calculateTotalActiveHours,
  calculateStudyStreak,
  validateTimetableSessions,
} from './rules.ts';
import { FocusRecord, QuizAttempt, StudySession, Subject } from '../types/index.ts';

test('calculateSubjectProgress accurately handles complete and empty topics', () => {
  const emptySubject: Subject = {
    id: 's1',
    name: 'Physics',
    code: 'PHY101',
    color: '#2563eb',
    confidenceLevel: 3,
    topics: [],
    createdAt: new Date().toISOString(),
  };
  assert.equal(calculateSubjectProgress(emptySubject), 0);

  const subjectWithTopics: Subject = {
    ...emptySubject,
    topics: [
      { id: 't1', name: 'Optics', completed: true },
      { id: 't2', name: 'Thermodynamics', completed: false },
      { id: 't3', name: 'Mechanics', completed: true },
      { id: 't4', name: 'Nuclear Physics', completed: false },
    ],
  };
  // 2 out of 4 = 50%
  assert.equal(calculateSubjectProgress(subjectWithTopics), 50);
});

test('calculateOverallProgress sums topic completion across multiple subjects', () => {
  const subjects: Subject[] = [
    {
      id: 's1',
      name: 'Math',
      code: 'MTH',
      color: '#2563eb',
      confidenceLevel: 4,
      topics: [
        { id: 't1', name: 'Calculus', completed: true },
        { id: 't2', name: 'Linear Algebra', completed: true },
      ],
      createdAt: '',
    },
    {
      id: 's2',
      name: 'Biology',
      code: 'BIO',
      color: '#0d9488',
      confidenceLevel: 2,
      topics: [
        { id: 't3', name: 'Genetics', completed: false },
        { id: 't4', name: 'Cell Biology', completed: true },
      ],
      createdAt: '',
    },
  ];

  const overall = calculateOverallProgress(subjects);
  assert.equal(overall.totalTopics, 4);
  assert.equal(overall.completedTopics, 3);
  assert.equal(overall.percentage, 75);
});

test('calculateQuizAverage calculates accurate percentage scores and handles empty logs', () => {
  assert.deepEqual(calculateQuizAverage([]), { averagePercentage: 0, totalAttempts: 0 });

  const attempts: QuizAttempt[] = [
    {
      id: 'a1',
      quizId: 'q1',
      subjectName: 'Math',
      topic: 'Calculus',
      score: 4,
      totalQuestions: 5,
      percentage: 80,
      userAnswers: {},
      completedAt: '',
    },
    {
      id: 'a2',
      quizId: 'q2',
      subjectName: 'Biology',
      topic: 'Genetics',
      score: 5,
      totalQuestions: 5,
      percentage: 100,
      userAnswers: {},
      completedAt: '',
    },
    {
      id: 'a3',
      quizId: 'q3',
      subjectName: 'History',
      topic: 'Renaissance',
      score: 3,
      totalQuestions: 5,
      percentage: 60,
      userAnswers: {},
      completedAt: '',
    },
  ];

  const avg = calculateQuizAverage(attempts);
  assert.equal(avg.averagePercentage, 80); // (80 + 100 + 60) / 3 = 80%
  assert.equal(avg.totalAttempts, 3);
});

test('calculateTotalActiveHours records only active study seconds without inflation', () => {
  const records: FocusRecord[] = [
    {
      id: 'f1',
      taskName: 'Algorithms Problem Set',
      subjectName: 'Computer Science',
      durationMinutes: 50,
      activeSeconds: 3000, // 50 mins = 3000s
      completedAt: '2026-10-28T10:00:00Z',
    },
    {
      id: 'f2',
      taskName: 'Organic Reaction Mechanism',
      subjectName: 'Chemistry',
      durationMinutes: 25,
      activeSeconds: 1500, // 25 mins = 1500s
      completedAt: '2026-10-28T14:00:00Z',
    },
  ];

  // 4500 seconds / 3600 = 1.25 hours, rounded to 1.3
  assert.equal(calculateTotalActiveHours(records), 1.3);
});

test('validateTimetableSessions detects schedule conflicts and constraints', () => {
  const sessions: StudySession[] = [
    {
      id: 'sess1',
      date: '2026-11-01',
      startTime: '09:00',
      endTime: '09:50',
      subjectName: 'Operating Systems',
      topic: 'Processes & Threads',
      activity: 'Active Recall',
      durationMinutes: 50,
      priority: 'High',
      completed: false,
    },
    {
      id: 'sess2',
      date: '2026-11-01',
      startTime: '10:00',
      endTime: '10:50',
      subjectName: 'Operating Systems',
      topic: 'Deadlocks',
      activity: 'Problem Solving',
      durationMinutes: 50,
      priority: 'High',
      completed: false,
    },
  ];

  // 100 mins <= 2 hours (120 mins). Assuming 2026-11-01 is Sunday, let's include 'Sun'.
  const valid = validateTimetableSessions(sessions, ['Sun', 'Mon'], 2, {
    'Operating Systems': '2026-11-15',
  });
  assert.equal(valid.isValid, true);
  assert.equal(valid.errors.length, 0);

  // Fails if daily hour is 1 hour (60 min) but sessions total 100 min
  const invalidHours = validateTimetableSessions(sessions, ['Sun', 'Mon'], 1, {});
  assert.equal(invalidHours.isValid, false);
  assert.ok(invalidHours.errors.some(e => e.includes('exceeds max daily hours')));

  // Fails if scheduled after exam date
  const postExam = validateTimetableSessions(sessions, ['Sun', 'Mon'], 3, {
    'Operating Systems': '2026-10-30', // Exam was in October
  });
  assert.equal(postExam.isValid, false);
  assert.ok(postExam.errors.some(e => e.includes('on or after the exam date')));
});
