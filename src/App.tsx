import React, { useState, useEffect } from 'react';
import {
  initializeStorageIfEmpty,
  getSubjects,
  saveSubjects,
  getStudyPlan,
  saveStudyPlan,
  getSummaries,
  saveSummary,
  deleteSummary,
  getQuizAttempts,
  saveQuizAttempt,
  getFlashcardSets,
  saveFlashcardSet,
  getFocusRecords,
  addFocusRecord,
  getUserSettings,
  saveUserSettings,
  resetToDemoData,
  clearAllData,
  isDemoDataActive,
  subscribeToStorage,
  loadStarterCourses,
} from './utils/storage.ts';
import {
  FlashcardSet,
  FocusRecord,
  QuizAttempt,
  StudyPlan,
  Subject,
  SummaryRecord,
  UserSettings,
  StudentProfile,
} from './types/index.ts';
import { calculateStudyStreak, calculateTotalActiveHours } from './utils/rules.ts';
import { NavTab, Sidebar } from './components/layout/Sidebar.tsx';
import { Header } from './components/layout/Header.tsx';
import { MobileNav } from './components/layout/MobileNav.tsx';
import { DashboardView } from './components/dashboard/DashboardView.tsx';
import { SubjectsView } from './components/subjects/SubjectsView.tsx';
import { StudyPlanView } from './components/planner/StudyPlanView.tsx';
import { NotesSummarizerView } from './components/summarizer/NotesSummarizerView.tsx';
import { QuizView } from './components/quiz/QuizView.tsx';
import { FlashcardsView } from './components/flashcards/FlashcardsView.tsx';
import { CoachView } from './components/coach/CoachView.tsx';
import { FocusTimerView } from './components/timer/FocusTimerView.tsx';
import { AnalyticsView } from './components/analytics/AnalyticsView.tsx';
import { SettingsView } from './components/settings/SettingsView.tsx';
import { StudentAuthModal } from './components/auth/StudentAuthModal.tsx';
import { Database, RotateCcw, X, AlertTriangle } from 'lucide-react';

// Initialize storage synchronously before state initialization
initializeStorageIfEmpty();

export default function App() {
  // State slices
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [studentAuthModalOpen, setStudentAuthModalOpen] = useState(false);

  // Entities state
  const [subjects, setSubjects] = useState<Subject[]>(getSubjects());
  const [studyPlan, setStudyPlanState] = useState<StudyPlan | null>(getStudyPlan());
  const [summaries, setSummaries] = useState<SummaryRecord[]>(getSummaries());
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(getQuizAttempts());
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>(getFlashcardSets());
  const [focusRecords, setFocusRecords] = useState<FocusRecord[]>(getFocusRecords());
  const [userSettings, setUserSettings] = useState<UserSettings>(getUserSettings());
  const [isDemo, setIsDemo] = useState<boolean>(isDemoDataActive());

  // Focus Timer Active Status (to reflect in Header indicator)
  const [activeTimerSeconds, setActiveTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Synchronize dark mode class on document element and body
  useEffect(() => {
    const isDark = userSettings.theme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [userSettings.theme]);

  // Reload state from storage when custom event fires
  const reloadFromStorage = () => {
    setSubjects(getSubjects());
    setStudyPlanState(getStudyPlan());
    setSummaries(getSummaries());
    setQuizAttempts(getQuizAttempts());
    setFlashcardSets(getFlashcardSets());
    setFocusRecords(getFocusRecords());
    setUserSettings(getUserSettings());
    setIsDemo(isDemoDataActive());
  };

  useEffect(() => {
    const unsubscribe = subscribeToStorage(reloadFromStorage);
    return () => unsubscribe();
  }, []);

  // Subject operations
  const handleSaveSubject = (subject: Subject) => {
    const list = [...subjects];
    const idx = list.findIndex((s) => s.id === subject.id);
    if (idx >= 0) {
      list[idx] = subject;
    } else {
      list.unshift(subject);
    }
    setSubjects(list);
    saveSubjects(list);
  };

  const handleDeleteSubject = (subjectId: string) => {
    const list = subjects.filter((s) => s.id !== subjectId);
    setSubjects(list);
    saveSubjects(list);
  };

  const handleToggleTopic = (subjectId: string, topicId: string) => {
    const updated = subjects.map((sub) => {
      if (sub.id !== subjectId) return sub;
      const updatedTopics = sub.topics.map((t) => {
        if (t.id !== topicId) return t;
        const newCompleted = !t.completed;
        return {
          ...t,
          completed: newCompleted,
          completedAt: newCompleted ? new Date().toISOString() : undefined,
        };
      });
      return { ...sub, topics: updatedTopics };
    });
    setSubjects(updated);
    saveSubjects(updated);
  };

  const handleAddTopic = (subjectId: string, topicName: string) => {
    const updated = subjects.map((sub) => {
      if (sub.id !== subjectId) return sub;
      const newTopic = {
        id: `top_${Date.now()}`,
        name: topicName,
        completed: false,
      };
      return { ...sub, topics: [...sub.topics, newTopic] };
    });
    setSubjects(updated);
    saveSubjects(updated);
  };

  const handleDeleteTopic = (subjectId: string, topicId: string) => {
    const updated = subjects.map((sub) => {
      if (sub.id !== subjectId) return sub;
      return { ...sub, topics: sub.topics.filter((t) => t.id !== topicId) };
    });
    setSubjects(updated);
    saveSubjects(updated);
  };

  // Study plan operations
  const handleSavePlan = (plan: StudyPlan) => {
    setStudyPlanState(plan);
    saveStudyPlan(plan);
  };

  const handleToggleSessionComplete = (sessionId: string) => {
    if (!studyPlan) return;
    const updatedSessions = studyPlan.sessions.map((s) => {
      if (s.id !== sessionId) return s;
      return { ...s, completed: !s.completed };
    });
    const updatedPlan = { ...studyPlan, sessions: updatedSessions };
    setStudyPlanState(updatedPlan);
    saveStudyPlan(updatedPlan);
  };

  // Summaries operations
  const handleSaveSummary = (summary: SummaryRecord) => {
    saveSummary(summary);
    setSummaries(getSummaries());
  };

  const handleDeleteSummary = (id: string) => {
    deleteSummary(id);
    setSummaries(getSummaries());
  };

  // Quiz operations
  const handleSaveQuizAttempt = (attempt: QuizAttempt) => {
    saveQuizAttempt(attempt);
    setQuizAttempts(getQuizAttempts());
  };

  // Flashcards operations
  const handleSaveFlashcardSet = (set: FlashcardSet) => {
    saveFlashcardSet(set);
    setFlashcardSets(getFlashcardSets());
  };

  // Focus timer operations
  const handleAddFocusRecord = (record: FocusRecord) => {
    addFocusRecord(record);
    setFocusRecords(getFocusRecords());
  };

  // Settings operations
  const handleSaveSettings = (settings: UserSettings) => {
    setUserSettings(settings);
    saveUserSettings(settings);
  };

  const handleToggleTheme = () => {
    const nextTheme = userSettings.theme === 'dark' ? 'light' : 'dark';
    const updated: UserSettings = { ...userSettings, theme: nextTheme };
    handleSaveSettings(updated);
  };

  const handleSetTheme = (newTheme: 'light' | 'dark') => {
    const updated: UserSettings = { ...userSettings, theme: newTheme };
    handleSaveSettings(updated);
  };

  const handleSaveProfile = (profile: StudentProfile, displayName: string) => {
    const updated: UserSettings = {
      ...userSettings,
      displayName: displayName || profile.fullName,
      academicLevel: profile.academicLevel,
      studentProfile: profile,
    };
    handleSaveSettings(updated);
  };

  const handleSignOut = () => {
    const updated: UserSettings = {
      ...userSettings,
      studentProfile: {
        ...userSettings.studentProfile,
        isLoggedIn: false,
      },
    };
    handleSaveSettings(updated);
  };

  const handleResetToDemo = () => {
    resetToDemoData();
    reloadFromStorage();
  };

  const handleClearAll = () => {
    clearAllData();
    reloadFromStorage();
  };

  const handleLoadStarterCourses = () => {
    loadStarterCourses();
    reloadFromStorage();
  };

  const handleStartRealWorkspace = () => {
    handleClearAll();
    setStudentAuthModalOpen(true);
  };

  // Calculated stats for sidebar & telemetry
  const studyStreak = calculateStudyStreak(focusRecords, studyPlan?.sessions || []);
  const totalActiveHours = calculateTotalActiveHours(focusRecords);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors">
      {/* Desktop Collapsible Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        studyStreak={studyStreak}
        totalActiveHours={totalActiveHours}
      />

      {/* Main Workspace Frame */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        } pb-16 md:pb-0`}
      >
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onOpenMobileMenu={() => setMobileNavOpen(true)}
          onOpenDemoModal={() => setDemoModalOpen(true)}
          onOpenAuthModal={() => setStudentAuthModalOpen(true)}
          isDemoData={isDemo}
          userSettings={userSettings}
          activeTimerSeconds={activeTimerSeconds}
          isTimerRunning={isTimerRunning}
          onSelectTab={setActiveTab}
          theme={userSettings.theme || 'light'}
          onToggleTheme={handleToggleTheme}
        />

        {/* Dynamic Main Viewport Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView
              subjects={subjects}
              studyPlan={studyPlan}
              quizAttempts={quizAttempts}
              focusRecords={focusRecords}
              userSettings={userSettings}
              isDemoData={isDemo}
              onSelectTab={setActiveTab}
              onToggleSessionComplete={handleToggleSessionComplete}
              onToggleTopicComplete={handleToggleTopic}
              onOpenDemoModal={() => setDemoModalOpen(true)}
              onLoadStarterCourses={handleLoadStarterCourses}
              onStartRealWorkspace={handleStartRealWorkspace}
              onOpenAuthModal={() => setStudentAuthModalOpen(true)}
            />
          )}

          {activeTab === 'subjects' && (
            <SubjectsView
              subjects={subjects}
              onSaveSubject={handleSaveSubject}
              onDeleteSubject={handleDeleteSubject}
              onToggleTopic={handleToggleTopic}
              onAddTopic={handleAddTopic}
              onDeleteTopic={handleDeleteTopic}
              onLoadStarterCourses={handleLoadStarterCourses}
            />
          )}

          {activeTab === 'planner' && (
            <StudyPlanView
              subjects={subjects}
              studyPlan={studyPlan}
              userSettings={userSettings}
              onSavePlan={handleSavePlan}
              onToggleSessionComplete={handleToggleSessionComplete}
            />
          )}

          {activeTab === 'summarizer' && (
            <NotesSummarizerView
              subjects={subjects}
              savedSummaries={summaries}
              onSaveSummary={handleSaveSummary}
              onDeleteSummary={handleDeleteSummary}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizView
              subjects={subjects}
              quizAttempts={quizAttempts}
              onSaveQuizAttempt={handleSaveQuizAttempt}
            />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardsView
              subjects={subjects}
              flashcardSets={flashcardSets}
              onSaveFlashcardSet={handleSaveFlashcardSet}
            />
          )}

          {activeTab === 'coach' && (
            <CoachView
              subjects={subjects}
              userSettings={userSettings}
              studyStreak={studyStreak}
            />
          )}

          {activeTab === 'timer' && (
            <FocusTimerView
              subjects={subjects}
              focusRecords={focusRecords}
              userSettings={userSettings}
              onAddFocusRecord={handleAddFocusRecord}
              onTimerTick={(sec, running) => {
                setActiveTimerSeconds(sec);
                setIsTimerRunning(running);
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              subjects={subjects}
              studyPlan={studyPlan}
              quizAttempts={quizAttempts}
              focusRecords={focusRecords}
              userSettings={userSettings}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              userSettings={userSettings}
              isDemoData={isDemo}
              onSaveSettings={handleSaveSettings}
              onResetToDemo={handleResetToDemo}
              onClearAllData={handleClearAll}
              onOpenAuthModal={() => setStudentAuthModalOpen(true)}
              onSelectTheme={handleSetTheme}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation & Slide Drawer */}
      <MobileNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Student Onboarding & Digital ID Card Modal */}
      <StudentAuthModal
        isOpen={studentAuthModalOpen}
        onClose={() => setStudentAuthModalOpen(false)}
        userSettings={userSettings}
        onSaveProfile={handleSaveProfile}
        onSignOut={handleSignOut}
      />

      {/* Global Demonstration Data Management Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDemoModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">StudyPilot Data Manager</h3>
              </div>
              <button
                onClick={() => setDemoModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200">Current Storage State:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  {isDemo
                    ? 'Sample demonstration data is active (Computer Systems Architecture, Organic Chemistry II, Data Structures).'
                    : 'Personal student user data is active in this browser.'}
                </p>
                <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {subjects.length} subjects · {focusRecords.length} focus logs · {quizAttempts.length} quiz records
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    handleResetToDemo();
                    setDemoModalOpen(false);
                  }}
                  className="w-full py-2.5 px-4 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Restore Sample Demonstration Data</span>
                </button>

                <button
                  onClick={() => {
                    handleClearAll();
                    setDemoModalOpen(false);
                  }}
                  className="w-full py-2.5 px-4 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span>Clear All Records (Empty Clean State)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
