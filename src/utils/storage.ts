import {
  FlashcardSet,
  FocusRecord,
  QuizAttempt,
  QuizRecord,
  StudyPlan,
  Subject,
  SummaryRecord,
  UserSettings,
} from '../types/index.ts';

const STORAGE_KEYS = {
  SUBJECTS: 'studypilot_subjects',
  STUDY_PLAN: 'studypilot_study_plan',
  SUMMARIES: 'studypilot_summaries',
  QUIZZES: 'studypilot_quizzes',
  QUIZ_ATTEMPTS: 'studypilot_quiz_attempts',
  FLASHCARDS: 'studypilot_flashcards',
  FOCUS_RECORDS: 'studypilot_focus_records',
  SETTINGS: 'studypilot_settings',
  IS_DEMO: 'studypilot_is_demo',
  INITIALIZED: 'studypilot_initialized',
};

export const DEFAULT_STUDENT_PROFILE = {
  fullName: '',
  email: '',
  studentId: '',
  institution: 'Marwadi University',
  academicLevel: 'all' as const,
  major: '',
  currentSemester: 'Semester 1',
  learningStyle: 'Active Recall & Problem Solving',
  isLoggedIn: false,
};

// Default User Settings
export const DEFAULT_SETTINGS: UserSettings = {
  displayName: '',
  academicLevel: 'all',
  dailyStudyGoalMinutes: 120, // 2 hours
  sessionDurationMinutes: 50, // Deep Work preset confirmed by user
  breakDurationMinutes: 10,
  availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  theme: 'light',
  studentProfile: DEFAULT_STUDENT_PROFILE,
};

// Calculate dates relative to today for realistic demonstration data
function getRelativeDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

export const DEMO_SUBJECTS: Subject[] = [
  {
    id: 'sub_cs301',
    name: 'Computer Systems Architecture',
    code: 'CS 301',
    color: '#2563EB',
    confidenceLevel: 3,
    examDate: getRelativeDate(12),
    notes: 'Focus on pipelining hazards, cache associativity formulas, and virtual memory address translation.',
    createdAt: new Date().toISOString(),
    topics: [
      { id: 'top_101', name: 'Instruction Pipelining & Structural Hazards', completed: true, completedAt: getRelativeDate(-2) },
      { id: 'top_102', name: 'Memory Hierarchy & Set-Associative Caches', completed: true, completedAt: getRelativeDate(-1) },
      { id: 'top_103', name: 'Virtual Memory, TLBs & Page Table Walks', completed: false },
      { id: 'top_104', name: 'Multicore Synchronization & Cache Coherence', completed: false },
    ],
  },
  {
    id: 'sub_chm220',
    name: 'Organic Chemistry II',
    code: 'CHM 220',
    color: '#0D9488',
    confidenceLevel: 2,
    examDate: getRelativeDate(18),
    notes: 'Prioritize aromatic substitution reaction mechanisms and H-NMR chemical shift tables.',
    createdAt: new Date().toISOString(),
    topics: [
      { id: 'top_201', name: 'Electrophilic Aromatic Substitution (EAS)', completed: true, completedAt: getRelativeDate(-3) },
      { id: 'top_202', name: 'Carbonyl Chemistry & Grignard Reagents', completed: true, completedAt: getRelativeDate(-1) },
      { id: 'top_203', name: '1H and 13C NMR Spectroscopy Analysis', completed: false },
      { id: 'top_204', name: 'Carboxylic Acid Derivatives & Enolates', completed: false },
    ],
  },
  {
    id: 'sub_cs201',
    name: 'Data Structures & Algorithms',
    code: 'CS 201',
    color: '#7C3AED',
    confidenceLevel: 4,
    examDate: getRelativeDate(25),
    notes: 'Review dynamic programming state transitions and amortized runtime proofs.',
    createdAt: new Date().toISOString(),
    topics: [
      { id: 'top_301', name: 'Self-Balancing Trees (AVL & Red-Black)', completed: true, completedAt: getRelativeDate(-5) },
      { id: 'top_302', name: 'Graph Traversal & Shortest Path (Dijkstra)', completed: true, completedAt: getRelativeDate(-4) },
      { id: 'top_303', name: 'Dynamic Programming: Knapsack & Subsequences', completed: true, completedAt: getRelativeDate(-2) },
      { id: 'top_304', name: 'Maximum Flow & Bipartite Matching', completed: false },
    ],
  },
];

export const DEMO_STUDY_PLAN: StudyPlan = {
  id: 'plan_initial',
  createdAt: new Date().toISOString(),
  preferences: {
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    dailyStudyHours: 2.5,
    sessionDurationMinutes: 50,
    breakDurationMinutes: 10,
    revisionPreferences: 'Active recall questions followed by targeted problem sets',
    startDate: getRelativeDate(0),
    endDate: getRelativeDate(7),
  },
  sessions: [
    {
      id: 'sess_1',
      date: getRelativeDate(0),
      startTime: '09:00',
      endTime: '09:50',
      subjectName: 'Computer Systems Architecture',
      topic: 'Virtual Memory, TLBs & Page Table Walks',
      activity: 'Active Recall & Diagrams',
      durationMinutes: 50,
      priority: 'High',
      completed: true,
    },
    {
      id: 'sess_2',
      date: getRelativeDate(0),
      startTime: '10:00',
      endTime: '10:50',
      subjectName: 'Organic Chemistry II',
      topic: '1H and 13C NMR Spectroscopy Analysis',
      activity: 'Problem Solving & Spectrum Decoding',
      durationMinutes: 50,
      priority: 'High',
      completed: false,
    },
    {
      id: 'sess_3',
      date: getRelativeDate(1),
      startTime: '09:30',
      endTime: '10:20',
      subjectName: 'Computer Systems Architecture',
      topic: 'Page Replacement Algorithms (LRU vs Clock)',
      activity: 'Concept Review & Code Tracing',
      durationMinutes: 50,
      priority: 'High',
      completed: false,
    },
    {
      id: 'sess_4',
      date: getRelativeDate(1),
      startTime: '10:30',
      endTime: '11:20',
      subjectName: 'Organic Chemistry II',
      topic: 'Coupling Constants & Chemical Splitting in NMR',
      activity: 'Practice Problems',
      durationMinutes: 50,
      priority: 'Medium',
      completed: false,
    },
    {
      id: 'sess_5',
      date: getRelativeDate(2),
      startTime: '14:00',
      endTime: '14:50',
      subjectName: 'Data Structures & Algorithms',
      topic: 'Maximum Flow & Bipartite Matching',
      activity: 'Ford-Fulkerson Algorithm Tracing',
      durationMinutes: 50,
      priority: 'Medium',
      completed: false,
    },
  ],
  strategyNotes:
    'Plan prioritizes Computer Systems Architecture and Organic Chemistry II due to upcoming exam deadlines within 2-3 weeks and lower self-assessed confidence levels.',
};

export const DEMO_SUMMARIES: SummaryRecord[] = [
  {
    id: 'sum_1',
    subjectName: 'Computer Systems Architecture',
    title: 'Virtual Memory Architecture & Translation Lookaside Buffers (TLB)',
    sourceNotes:
      'Virtual memory provides an illusion of a large, contiguous address space for each process. The CPU produces virtual addresses, which the Memory Management Unit (MMU) translates into physical addresses using page tables. To accelerate translation, the MMU uses a hardware cache called the Translation Lookaside Buffer (TLB). A TLB hit takes ~1 clock cycle, whereas a TLB miss forces a multi-level page table walk in main memory. Page faults occur when a referenced page is marked invalid in the page table, triggering an OS interrupt to bring the missing page from disk into RAM.',
    length: 'Medium',
    style: 'Simple Explanation',
    summary:
      'Virtual memory abstracts physical RAM into an isolated virtual address space for every process. The MMU converts virtual addresses to physical addresses via page tables. To prevent memory bottlenecks, the TLB caches recent translations, enabling single-cycle lookups on hits. Uncached translations trigger page table walks, while unmapped pages cause page faults handled by the operating system.',
    concepts: [
      'Address Space Isolation',
      'Hardware Address Translation via MMU',
      'TLB Caching Mechanism',
      'Page Fault Handling Pipeline',
    ],
    definitions: [
      {
        term: 'Translation Lookaside Buffer (TLB)',
        definition: 'A small, fast associative hardware cache inside the CPU that stores recent virtual-to-physical address mappings.',
      },
      {
        term: 'Page Fault',
        definition: 'A hardware trap raised by the MMU when a program accesses a virtual page that is not currently mapped into physical RAM.',
      },
    ],
    keyPoints: [
      'Virtual memory enables memory protection and allows programs to exceed physical RAM capacity.',
      'TLB hits achieve single-cycle access; misses require multi-level memory walks.',
      'Page faults invoke kernel routines to read disk pages into available physical frames.',
    ],
    examples: [
      'TLB hit achieving ~1 clock cycle access vs. multi-level page table walk in main memory.',
    ],
    terminology: ['MMU', 'Virtual Address', 'Physical Frame', 'TLB Miss', 'Page Table Walk'],
    quickRevision: [
      'CPU generates Virtual Address -> Checked in TLB -> Hit: Physical RAM accessed immediately.',
      'TLB Miss -> MMU walks page table levels in memory -> Page table updated -> Access completed.',
      'Invalid entry in page table -> Page fault exception -> OS loads frame from secondary storage.',
    ],
    createdAt: getRelativeDate(-1),
  },
];

export const DEMO_QUIZ_ATTEMPTS: QuizAttempt[] = [
  {
    id: 'att_1',
    quizId: 'quiz_cs_demo',
    subjectName: 'Computer Systems Architecture',
    topic: 'Memory Hierarchy & Caching',
    score: 4,
    totalQuestions: 5,
    percentage: 80,
    userAnswers: { q_1: 0, q_2: 2, q_3: 1, q_4: 0, q_5: 3 },
    completedAt: getRelativeDate(-1),
  },
  {
    id: 'att_2',
    quizId: 'quiz_chm_demo',
    subjectName: 'Organic Chemistry II',
    topic: 'Electrophilic Aromatic Substitution',
    score: 5,
    totalQuestions: 5,
    percentage: 100,
    userAnswers: { q_1: 1, q_2: 0, q_3: 2, q_4: 3, q_5: 0 },
    completedAt: getRelativeDate(-2),
  },
];

export const DEMO_FLASHCARDS: FlashcardSet[] = [
  {
    id: 'fc_set_1',
    subjectName: 'Computer Systems Architecture',
    title: 'Caches & Memory Hierarchy Key Terms',
    cards: [
      {
        id: 'fc_1',
        front: 'What is the primary purpose of a Translation Lookaside Buffer (TLB)?',
        back: 'To cache recent virtual-to-physical address translations in hardware, avoiding multi-level page table lookups in RAM.',
        known: true,
      },
      {
        id: 'fc_2',
        front: 'What distinguishes Temporal Locality from Spatial Locality?',
        back: 'Temporal locality means recently accessed data will likely be accessed again soon. Spatial locality means items with nearby memory addresses will likely be accessed together.',
        known: true,
      },
      {
        id: 'fc_3',
        front: 'What happens during a Write-Back cache policy on a write hit?',
        back: 'Data is written only to the cache line and marked "dirty". Main memory is updated only when that line is evicted.',
        needsRevision: true,
      },
      {
        id: 'fc_4',
        front: 'Explain the difference between a direct-mapped cache and fully associative cache.',
        back: 'In direct-mapped, each memory block maps to exactly one cache slot. In fully associative, a block can be placed in any cache line.',
        known: true,
      },
      {
        id: 'fc_5',
        front: 'What is a Pipeline Hazard?',
        back: 'A condition that prevents the next instruction in the instruction stream from executing in its designated clock cycle (Structural, Data, or Control).',
        known: true,
      },
    ],
    createdAt: getRelativeDate(-2),
  },
];

export const DEMO_FOCUS_RECORDS: FocusRecord[] = [
  {
    id: 'foc_1',
    taskName: 'Instruction Pipelining & Hazard Diagrams',
    subjectName: 'Computer Systems Architecture',
    durationMinutes: 50,
    activeSeconds: 3000, // 50 mins = 3000s
    completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'foc_2',
    taskName: 'Grignard Reaction Mechanism Drills',
    subjectName: 'Organic Chemistry II',
    durationMinutes: 50,
    activeSeconds: 2820, // 47 mins
    completedAt: getRelativeDate(-1) + 'T15:30:00Z',
  },
  {
    id: 'foc_3',
    taskName: 'Dijkstra Priority Queue Implementation',
    subjectName: 'Data Structures & Algorithms',
    durationMinutes: 50,
    activeSeconds: 3000,
    completedAt: getRelativeDate(-2) + 'T11:00:00Z',
  },
];

// Helper to safely read from localStorage
function safeRead<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error reading localStorage key "${key}":`, err);
    return defaultValue;
  }
}

// Helper to safely write to localStorage
function safeWrite<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('studypilot_storage_change', { detail: { key } }));
  } catch (err) {
    console.error(`Error writing localStorage key "${key}":`, err);
  }
}

// Check if initialized; if not, initialize with clean real workspace for students
export function initializeStorageIfEmpty(): void {
  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (!isInitialized) {
    // Start clean without dummy data so students can immediately enter their own academic data
    safeWrite(STORAGE_KEYS.SUBJECTS, []);
    safeWrite(STORAGE_KEYS.STUDY_PLAN, null);
    safeWrite(STORAGE_KEYS.SUMMARIES, []);
    safeWrite(STORAGE_KEYS.QUIZ_ATTEMPTS, []);
    safeWrite(STORAGE_KEYS.FLASHCARDS, []);
    safeWrite(STORAGE_KEYS.FOCUS_RECORDS, []);
    safeWrite(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    safeWrite(STORAGE_KEYS.IS_DEMO, false);
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
}

export function isDemoDataActive(): boolean {
  return safeRead<boolean>(STORAGE_KEYS.IS_DEMO, false);
}

export function resetToDemoData(): void {
  safeWrite(STORAGE_KEYS.SUBJECTS, DEMO_SUBJECTS);
  safeWrite(STORAGE_KEYS.STUDY_PLAN, DEMO_STUDY_PLAN);
  safeWrite(STORAGE_KEYS.SUMMARIES, DEMO_SUMMARIES);
  safeWrite(STORAGE_KEYS.QUIZ_ATTEMPTS, DEMO_QUIZ_ATTEMPTS);
  safeWrite(STORAGE_KEYS.FLASHCARDS, DEMO_FLASHCARDS);
  safeWrite(STORAGE_KEYS.FOCUS_RECORDS, DEMO_FOCUS_RECORDS);
  safeWrite(STORAGE_KEYS.SETTINGS, {
    ...DEFAULT_SETTINGS,
    displayName: 'Alex Chen',
    studentProfile: {
      fullName: 'Alex Chen',
      email: 'alex.chen@university.edu',
      studentId: 'STU-2026-8491',
      institution: 'Marwadi University',
      academicLevel: 'all',
      major: 'Computer Science & Engineering',
      currentSemester: 'Semester 5 (Fall 2026)',
      learningStyle: 'Active Recall & Problem Solving',
      isLoggedIn: true,
    },
  });
  safeWrite(STORAGE_KEYS.IS_DEMO, true);
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}

export function clearAllData(): void {
  safeWrite(STORAGE_KEYS.SUBJECTS, []);
  safeWrite(STORAGE_KEYS.STUDY_PLAN, null);
  safeWrite(STORAGE_KEYS.SUMMARIES, []);
  safeWrite(STORAGE_KEYS.QUIZ_ATTEMPTS, []);
  safeWrite(STORAGE_KEYS.FLASHCARDS, []);
  safeWrite(STORAGE_KEYS.FOCUS_RECORDS, []);
  safeWrite(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  safeWrite(STORAGE_KEYS.IS_DEMO, false);
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}

// Starter academic courses that a student can load with 1 click if they want a head start
export function loadStarterCourses(): void {
  const starterSubjects: Subject[] = [
    {
      id: `sub_${Date.now()}_1`,
      name: 'Web Application Development',
      code: 'IT 302',
      color: '#2563EB',
      confidenceLevel: 3,
      examDate: getRelativeDate(20),
      notes: 'Frontend state management, REST APIs, and asynchronous programming.',
      createdAt: new Date().toISOString(),
      topics: [
        { id: `top_${Date.now()}_1`, name: 'Component Architecture & Props', completed: true },
        { id: `top_${Date.now()}_2`, name: 'React Hooks & State Flow', completed: false },
        { id: `top_${Date.now()}_3`, name: 'API Integration & Error Handling', completed: false },
      ],
    },
    {
      id: `sub_${Date.now()}_2`,
      name: 'Database Management Systems',
      code: 'CS 304',
      color: '#0D9488',
      confidenceLevel: 4,
      examDate: getRelativeDate(28),
      notes: 'Relational algebra, SQL normalization up to BCNF, and index structures.',
      createdAt: new Date().toISOString(),
      topics: [
        { id: `top_${Date.now()}_4`, name: 'ER Diagrams & Relational Schema', completed: true },
        { id: `top_${Date.now()}_5`, name: 'SQL Queries, Joins & Subqueries', completed: true },
        { id: `top_${Date.now()}_6`, name: 'Normalization & Functional Dependencies', completed: false },
      ],
    },
  ];
  saveSubjects(starterSubjects);
}

// Entity Getters and Setters
export function getSubjects(): Subject[] {
  return safeRead<Subject[]>(STORAGE_KEYS.SUBJECTS, []);
}

export function saveSubjects(subjects: Subject[]): void {
  safeWrite(STORAGE_KEYS.SUBJECTS, subjects);
  safeWrite(STORAGE_KEYS.IS_DEMO, false);
}

export function getStudyPlan(): StudyPlan | null {
  return safeRead<StudyPlan | null>(STORAGE_KEYS.STUDY_PLAN, null);
}

export function saveStudyPlan(plan: StudyPlan | null): void {
  safeWrite(STORAGE_KEYS.STUDY_PLAN, plan);
  safeWrite(STORAGE_KEYS.IS_DEMO, false);
}

export function getSummaries(): SummaryRecord[] {
  return safeRead<SummaryRecord[]>(STORAGE_KEYS.SUMMARIES, []);
}

export function saveSummary(summary: SummaryRecord): void {
  const list = getSummaries();
  const index = list.findIndex(s => s.id === summary.id);
  if (index >= 0) {
    list[index] = summary;
  } else {
    list.unshift(summary);
  }
  safeWrite(STORAGE_KEYS.SUMMARIES, list);
  safeWrite(STORAGE_KEYS.IS_DEMO, false);
}

export function deleteSummary(id: string): void {
  const list = getSummaries().filter(s => s.id !== id);
  safeWrite(STORAGE_KEYS.SUMMARIES, list);
}

export function getQuizAttempts(): QuizAttempt[] {
  return safeRead<QuizAttempt[]>(STORAGE_KEYS.QUIZ_ATTEMPTS, []);
}

export function saveQuizAttempt(attempt: QuizAttempt): void {
  const list = getQuizAttempts();
  list.unshift(attempt);
  safeWrite(STORAGE_KEYS.QUIZ_ATTEMPTS, list);
  safeWrite(STORAGE_KEYS.IS_DEMO, false);
}

export function getFlashcardSets(): FlashcardSet[] {
  return safeRead<FlashcardSet[]>(STORAGE_KEYS.FLASHCARDS, []);
}

export function saveFlashcardSet(set: FlashcardSet): void {
  const list = getFlashcardSets();
  const index = list.findIndex(s => s.id === set.id);
  if (index >= 0) {
    list[index] = set;
  } else {
    list.unshift(set);
  }
  safeWrite(STORAGE_KEYS.FLASHCARDS, list);
  safeWrite(STORAGE_KEYS.IS_DEMO, false);
}

export function getFocusRecords(): FocusRecord[] {
  return safeRead<FocusRecord[]>(STORAGE_KEYS.FOCUS_RECORDS, []);
}

export function addFocusRecord(record: FocusRecord): void {
  const list = getFocusRecords();
  // Prevent duplicate insertion if an identical task and timestamp already exists
  const isDuplicate = list.some(r => r.id === record.id);
  if (!isDuplicate) {
    list.unshift(record);
    safeWrite(STORAGE_KEYS.FOCUS_RECORDS, list);
    safeWrite(STORAGE_KEYS.IS_DEMO, false);
  }
}

export function getUserSettings(): UserSettings {
  const stored = safeRead<UserSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    theme: stored?.theme || 'light',
    studentProfile: {
      ...DEFAULT_STUDENT_PROFILE,
      ...(stored?.studentProfile || {}),
    },
  };
}

export function saveUserSettings(settings: UserSettings): void {
  safeWrite(STORAGE_KEYS.SETTINGS, settings);
}

// Hook helper for listening to storage updates across components
export function subscribeToStorage(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener('studypilot_storage_change', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('studypilot_storage_change', handler);
    window.removeEventListener('storage', handler);
  };
}
