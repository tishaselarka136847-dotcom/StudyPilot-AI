import React from 'react';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  HelpCircle,
  Sparkles,
  Timer,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Flame,
  Award,
  ChevronRight,
} from 'lucide-react';
import {
  FocusRecord,
  QuizAttempt,
  StudyPlan,
  StudySession,
  Subject,
  UserSettings,
} from '../../types/index.ts';
import {
  calculateOverallProgress,
  calculateQuizAverage,
  calculateStudyStreak,
  calculateSubjectProgress,
  calculateTotalActiveHours,
} from '../../utils/rules.ts';
import { NavTab } from '../layout/Sidebar.tsx';

interface DashboardViewProps {
  subjects: Subject[];
  studyPlan: StudyPlan | null;
  quizAttempts: QuizAttempt[];
  focusRecords: FocusRecord[];
  userSettings: UserSettings;
  isDemoData: boolean;
  onSelectTab: (tab: NavTab) => void;
  onToggleSessionComplete: (sessionId: string) => void;
  onToggleTopicComplete: (subjectId: string, topicId: string) => void;
  onOpenDemoModal: () => void;
  onLoadStarterCourses?: () => void;
  onStartRealWorkspace?: () => void;
  onOpenAuthModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  subjects,
  studyPlan,
  quizAttempts,
  focusRecords,
  userSettings,
  isDemoData,
  onSelectTab,
  onToggleSessionComplete,
  onOpenDemoModal,
  onLoadStarterCourses,
  onStartRealWorkspace,
  onOpenAuthModal,
}) => {
  // Calculations from actual data
  const overall = calculateOverallProgress(subjects);
  const quizStats = calculateQuizAverage(quizAttempts);
  const totalHours = calculateTotalActiveHours(focusRecords);
  const streak = calculateStudyStreak(focusRecords, studyPlan?.sessions || []);

  // Today's date in local YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = (studyPlan?.sessions || []).filter((s) => s.date === todayStr);

  // Upcoming examinations sorted by closest date
  const upcomingExams = subjects
    .filter((s) => Boolean(s.examDate))
    .sort((a, b) => (a.examDate! > b.examDate! ? 1 : -1));

  // Weekly study minutes per day (last 7 days)
  const last7Days: { date: string; label: string; minutes: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

    // Sum active seconds on that day
    const dayRecords = focusRecords.filter(
      (r) => r.completedAt && r.completedAt.split('T')[0] === dateStr
    );
    const dayMinutes = Math.round(
      dayRecords.reduce((acc, curr) => acc + (curr.activeSeconds || 0), 0) / 60
    );

    last7Days.push({ date: dateStr, label: dayLabel, minutes: dayMinutes });
  }

  const maxWeeklyMinutes = Math.max(...last7Days.map((d) => d.minutes), 60);

  // Dynamic greeting based on current local hour
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Demo Data Switcher Banner */}
      {isDemoData && (
        <div className="bg-amber-500/10 border border-amber-500/30 dark:bg-amber-950/40 dark:border-amber-700/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-sm block">Sample Demonstration Mode is Active</span>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                You are viewing sample courses (CS 301, CHM 220, CS 201). Ready to manage your own real courses?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onStartRealWorkspace && (
              <button
                onClick={onStartRealWorkspace}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Start My Real Student Workspace
              </button>
            )}
          </div>
        </div>
      )}

      {/* Fresh Student Onboarding Hero Card if 0 subjects */}
      {subjects.length === 0 && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-3.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Real Student Workspace Ready</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Welcome to StudyPilot AI!
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Your personal study workspace is clean and ready. Add your enrolled subjects and target examination dates to unlock AI-powered timetable generation, automated lecture summaries, and active recall quizzes.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onSelectTab('subjects')}
                className="px-5 py-2.5 bg-white hover:bg-blue-50 text-blue-900 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Add Your Enrolled Subjects</span>
              </button>
              {onLoadStarterCourses && (
                <button
                  onClick={onLoadStarterCourses}
                  className="px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Quick-Load Starter Template</span>
                </button>
              )}
              {onOpenAuthModal && (
                <button
                  onClick={onOpenAuthModal}
                  className="px-4 py-2.5 bg-blue-950/40 hover:bg-blue-950/60 border border-white/20 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  <span>Set Up Student Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Greeting & Status Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800 uppercase tracking-wider">
                {userSettings.academicLevel === 'university'
                  ? 'University Standard'
                  : userSettings.academicLevel === 'high_school'
                  ? 'High School Prep'
                  : 'Comprehensive Track'}
              </span>
              {isDemoData && (
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  Sample Demonstration Data
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {greeting}, {userSettings.displayName || userSettings.studentProfile?.fullName || 'Scholar'}!
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              You are on a <strong className="text-slate-800 dark:text-slate-200">{streak}-day study streak</strong>.
              Today you have <strong className="text-slate-800 dark:text-slate-200">{todaySessions.length} study tasks</strong> scheduled.
              Keep your momentum going!
            </p>
          </div>

          {/* Quick CTA cluster */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('timer')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm shadow-blue-600/20 cursor-pointer"
            >
              <Timer className="w-4 h-4" />
              <span>Start Focus Session</span>
            </button>
            <button
              onClick={() => onSelectTab('planner')}
              className="px-4 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors border border-transparent dark:border-slate-700 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Generate My Study Plan</span>
            </button>
          </div>
        </div>

        {/* Decorative soft backdrop gradient */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-50 dark:bg-blue-950/20 rounded-full blur-3xl pointer-events-none -z-0 opacity-80" />
      </div>

      {/* 4 Core Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Subjects Added */}
        <div
          onClick={() => onSelectTab('subjects')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Enrolled Subjects
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              {subjects.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">active courses</span>
          </div>
          <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Manage syllabuses</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: Study Hours Completed */}
        <div
          onClick={() => onSelectTab('timer')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-teal-300 dark:hover:border-teal-700 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Study Hours Logged
            </span>
            <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              {totalHours}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">hours active</span>
          </div>
          <div className="mt-3 text-xs text-teal-700 dark:text-teal-400 font-medium flex items-center gap-1">
            <span>Goal: {userSettings.dailyStudyGoalMinutes / 60}h daily</span>
          </div>
        </div>

        {/* Card 3: Topics Completed */}
        <div
          onClick={() => onSelectTab('subjects')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Topics Mastered
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              {overall.completedTopics}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              / {overall.totalTopics} total ({overall.percentage}%)
            </span>
          </div>
          {/* Progress Bar */}
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${overall.percentage}%` }}
            />
          </div>
        </div>

        {/* Card 4: Quiz Average */}
        <div
          onClick={() => onSelectTab('quiz')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Quiz Average
            </span>
            <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              {quizStats.averagePercentage > 0 ? `${quizStats.averagePercentage}%` : 'N/A'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({quizStats.totalAttempts} {quizStats.totalAttempts === 1 ? 'attempt' : 'attempts'})
            </span>
          </div>
          <div className="mt-3 text-xs text-violet-600 dark:text-violet-400 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Practice active recall</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Tasks & Weekly Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Today's Study Tasks */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Today's Study Schedule</h2>
              </div>
              <button
                onClick={() => onSelectTab('planner')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {todaySessions.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  <CalendarDays className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No scheduled sessions for today.
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Generate an AI study plan based on your exam deadlines, or create custom sessions.
                  </p>
                  <button
                    onClick={() => onSelectTab('planner')}
                    className="mt-4 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Generate Study Plan
                  </button>
                </div>
              ) : (
                todaySessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-start sm:items-center justify-between gap-3 ${
                      session.completed
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-850 text-slate-600 dark:text-slate-400'
                        : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <button
                        onClick={() => onToggleSessionComplete(session.id)}
                        className={`mt-0.5 sm:mt-0 w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer ${
                          session.completed
                            ? 'bg-emerald-600 text-white'
                            : 'border border-slate-300 dark:border-slate-600 hover:border-blue-600 text-transparent'
                        }`}
                        aria-label={session.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        <CheckCircle2 className="w-4 h-4 fill-current" />
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-semibold ${
                              session.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {session.topic}
                          </span>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {session.subjectName}
                          </span>
                          <span className="text-[11px] font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 px-1.5 py-0.5 rounded border border-violet-100 dark:border-violet-800">
                            {session.activity}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <span className="tabular-nums font-mono font-medium">
                            {session.startTime} – {session.endTime}
                          </span>
                          <span>·</span>
                          <span>{session.durationMinutes} mins</span>
                          <span>·</span>
                          <span
                            className={`font-semibold ${
                              session.priority === 'High'
                                ? 'text-red-600 dark:text-red-400'
                                : session.priority === 'Medium'
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {session.priority} Priority
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectTab('timer')}
                      className="shrink-0 p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                      title="Study this topic in Focus Timer"
                    >
                      <Timer className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions Footer inside Today's Task Card */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => onSelectTab('planner')}
              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-800 dark:hover:text-blue-200 text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer"
            >
              <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Smart Plan</span>
            </button>
            <button
              onClick={() => onSelectTab('summarizer')}
              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/40 text-slate-700 dark:text-slate-300 hover:text-violet-800 dark:hover:text-violet-200 text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span>Summarize</span>
            </button>
            <button
              onClick={() => onSelectTab('quiz')}
              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-200 text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Create Quiz</span>
            </button>
            <button
              onClick={() => onSelectTab('coach')}
              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-200 text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Ask Coach</span>
            </button>
          </div>
        </div>

        {/* Right Column: Weekly Study Activity & Exam Countdown */}
        <div className="space-y-6">
          {/* Weekly Activity Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Weekly Study Minutes</h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tabular-nums">Last 7 Days</span>
            </div>

            {/* SVG / CSS Bar Chart */}
            <div className="mt-6 flex items-end justify-between gap-2 h-36 px-1">
              {last7Days.map((item, idx) => {
                const heightPercent =
                  maxWeeklyMinutes > 0
                    ? Math.max(Math.round((item.minutes / maxWeeklyMinutes) * 100), 6)
                    : 6;
                const isToday = item.date === todayStr;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.minutes}m
                    </span>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-md h-24 flex items-end overflow-hidden">
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          isToday ? 'bg-blue-600' : 'bg-blue-400/80 group-hover:bg-blue-500 dark:bg-blue-500/70'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span
                      className={`text-[11px] font-medium truncate ${
                        isToday ? 'text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Examinations */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upcoming Examinations</h3>
              </div>
              <button
                onClick={() => onSelectTab('subjects')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Manage
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {upcomingExams.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic py-2">
                  No examination dates set yet. Add target dates in Subjects.
                </p>
              ) : (
                upcomingExams.slice(0, 3).map((sub) => {
                  const examDate = new Date(sub.examDate + 'T00:00:00');
                  const now = new Date();
                  now.setHours(0, 0, 0, 0);
                  const diffDays = Math.ceil(
                    (examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div
                      key={sub.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: sub.color || '#2563EB' }}
                          />
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {sub.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Code: {sub.code || 'N/A'} · Confidence: {sub.confidenceLevel}/5
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full tabular-nums ${
                            diffDays <= 7
                              ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                              : diffDays <= 14
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          }`}
                        >
                          {diffDays === 0
                            ? 'Today!'
                            : diffDays === 1
                            ? 'Tomorrow'
                            : diffDays < 0
                            ? 'Passed'
                            : `${diffDays} days left`}
                        </span>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono tabular-nums">
                          {sub.examDate}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subject-Wise Progress Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Subject-Wise Syllabus Progress</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live topic completion percentages across enrolled academic courses
            </p>
          </div>
          <button
            onClick={() => onSelectTab('subjects')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Edit Subjects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {subjects.length === 0 ? (
          <div className="mt-6 p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No subjects added yet.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Add your enrolled courses to start tracking syllabus completion percentages and test deadlines.
            </p>
            <button
              onClick={() => onSelectTab('subjects')}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Add First Subject
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {subjects.map((sub) => {
              const prog = calculateSubjectProgress(sub);
              const completedCount = sub.topics.filter((t) => t.completed).length;

              return (
                <div
                  key={sub.id}
                  onClick={() => onSelectTab('subjects')}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group bg-slate-50/50 dark:bg-slate-850"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-medium">
                        {sub.code}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {sub.name}
                      </h4>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">{prog}%</span>
                  </div>

                  <div className="mt-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${prog}%`,
                        backgroundColor: sub.color || '#2563EB',
                      }}
                    />
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      {completedCount} of {sub.topics.length} topics
                    </span>
                    <span>Confidence: {sub.confidenceLevel}/5</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
