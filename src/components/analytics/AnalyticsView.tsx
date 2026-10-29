import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Award,
  Calendar,
  Flame,
  Filter,
  BookOpen,
} from 'lucide-react';
import { FocusRecord, QuizAttempt, StudyPlan, Subject, UserSettings } from '../../types/index.ts';
import {
  calculateOverallProgress,
  calculateQuizAverage,
  calculateStudyStreak,
  calculateSubjectProgress,
  calculateTotalActiveHours,
} from '../../utils/rules.ts';

interface AnalyticsViewProps {
  subjects: Subject[];
  studyPlan: StudyPlan | null;
  quizAttempts: QuizAttempt[];
  focusRecords: FocusRecord[];
  userSettings: UserSettings;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  subjects,
  studyPlan,
  quizAttempts,
  focusRecords,
  userSettings,
}) => {
  // Date range filter: '7d' | '30d' | 'all'
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('7d');

  // Filter records based on selected range
  const now = new Date();
  const filterCutoff = new Date();
  if (dateRange === '7d') {
    filterCutoff.setDate(now.getDate() - 7);
  } else if (dateRange === '30d') {
    filterCutoff.setDate(now.getDate() - 30);
  } else {
    filterCutoff.setTime(0); // All time
  }

  const filteredFocus = focusRecords.filter((r) => {
    if (!r.completedAt) return false;
    return new Date(r.completedAt) >= filterCutoff;
  });

  const filteredQuizzes = quizAttempts.filter((q) => {
    if (!q.completedAt) return false;
    return new Date(q.completedAt) >= filterCutoff;
  });

  // Calculate statistics from filtered records
  const overall = calculateOverallProgress(subjects);
  const quizAvg = calculateQuizAverage(filteredQuizzes);
  const totalHours = calculateTotalActiveHours(filteredFocus);
  const streak = calculateStudyStreak(focusRecords, studyPlan?.sessions || []);

  // Study minutes by subject
  const subjectMinutes: Record<string, number> = {};
  for (const s of subjects) {
    subjectMinutes[s.name] = 0;
  }
  for (const r of filteredFocus) {
    const sName = r.subjectName || 'General';
    subjectMinutes[sName] = (subjectMinutes[sName] || 0) + Math.round((r.activeSeconds || 0) / 60);
  }

  // Daily distribution (last 7 or 14 days depending on range)
  const daysCount = dateRange === '7d' ? 7 : dateRange === '30d' ? 14 : 7;
  const dayBars: { label: string; date: string; minutes: number }[] = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

    const daySeconds = filteredFocus
      .filter((r) => r.completedAt && r.completedAt.split('T')[0] === dateStr)
      .reduce((acc, curr) => acc + (curr.activeSeconds || 0), 0);

    dayBars.push({ label, date: dateStr, minutes: Math.round(daySeconds / 60) });
  }

  const maxMinutes = Math.max(...dayBars.map((b) => b.minutes), 60);

  // Weekly Goal calculation (e.g. 7 days * daily goal)
  const weeklyGoalMinutes = (userSettings.dailyStudyGoalMinutes || 120) * 7;
  const currentWeekMinutes = dayBars.reduce((acc, curr) => acc + curr.minutes, 0);
  const weeklyGoalProgress = Math.min(
    Math.round((currentWeekMinutes / weeklyGoalMinutes) * 100),
    100
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header bar with Date Range Filter */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Academic Progress & Analytics
            </h1>
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/40 flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              Verified Telemetry
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Historical study minutes, examination pacing, quiz score trajectories, and topic completion.
          </p>
        </div>

        {/* Date Filter Segmented Buttons */}
        <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-1 shrink-0 self-start sm:self-center transition-colors">
          <button
            onClick={() => setDateRange('7d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              dateRange === '7d'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDateRange('30d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              dateRange === '30d'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setDateRange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              dateRange === 'all'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Study Streak
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-current" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{streak}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">consecutive days</span>
          </div>
          <div className="mt-2 text-xs text-amber-700 dark:text-amber-400 font-medium">
            Active daily study sessions
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Filtered Active Hours
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{totalHours}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">hours logged</span>
          </div>
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
            Across {filteredFocus.length} sessions
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Overall Topic Mastery
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              {overall.percentage}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({overall.completedTopics}/{overall.totalTopics})
            </span>
          </div>
          <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            {overall.totalTopics - overall.completedTopics} topics remaining
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Average Quiz Score
            </span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              {quizAvg.averagePercentage > 0 ? `${quizAvg.averagePercentage}%` : 'N/A'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({quizAvg.totalAttempts} {quizAvg.totalAttempts === 1 ? 'attempt' : 'attempts'})
            </span>
          </div>
          <div className="mt-2 text-xs text-violet-600 dark:text-violet-400 font-medium">Active recall assessments</div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart: Study Minutes by Day (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Study Minutes Over Time</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Active study minutes logged in Focus Timer
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
              Total: {currentWeekMinutes} mins
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="pt-6 flex items-end justify-between gap-2 h-52 px-2">
            {dayBars.map((b, i) => {
              const heightPercent =
                maxMinutes > 0 ? Math.max(Math.round((b.minutes / maxMinutes) * 100), 4) : 4;

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {b.minutes}m
                  </span>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-md h-36 flex items-end overflow-hidden">
                    <div
                      className="w-full bg-blue-600 group-hover:bg-blue-500 rounded-t-md transition-all duration-500"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[40px] text-center">
                    {b.label.slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Weekly Goal Progress Bar */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Weekly Target Progress</span>
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                {currentWeekMinutes} / {weeklyGoalMinutes} mins ({weeklyGoalProgress}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${weeklyGoalProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Chart: Time by Subject Breakdown (4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 transition-colors">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Study Time by Subject</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Distribution across courses</p>
          </div>

          <div className="space-y-4 pt-2">
            {Object.keys(subjectMinutes).length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">No subject study time recorded yet.</p>
            ) : (
              Object.entries(subjectMinutes).map(([sName, mins], idx) => {
                const subObj = subjects.find((s) => s.name === sName);
                const color = subObj?.color || '#2563EB';
                const percentOfTotal =
                  currentWeekMinutes > 0 ? Math.round((mins / currentWeekMinutes) * 100) : 0;

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="font-bold text-slate-900 dark:text-white truncate">{sName}</span>
                      </div>
                      <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400 font-medium">
                        {mins}m ({percentOfTotal}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${percentOfTotal}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Quiz Trajectory History & Completed vs Pending Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quiz Performance History */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Quiz Score Trajectory</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {filteredQuizzes.length} tests recorded
            </span>
          </div>

          {filteredQuizzes.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic py-6 text-center">
              No quizzes completed in the selected time range.
            </p>
          ) : (
            <div className="space-y-3">
              {filteredQuizzes.slice(0, 5).map((q) => (
                <div
                  key={q.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs transition-colors"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 dark:text-white block truncate">{q.topic}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] block mt-0.5">
                      {q.subjectName} · {q.completedAt.slice(0, 10)}
                    </span>
                  </div>

                  <span
                    className={`font-bold px-2 py-0.5 rounded tabular-nums ${
                      q.percentage >= 80
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : q.percentage >= 60
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                    }`}
                  >
                    {q.percentage}% ({q.score}/{q.totalQuestions})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Syllabus Completion Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Syllabus Completion Breakdown</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {overall.completedTopics} of {overall.totalTopics} Done
            </span>
          </div>

          <div className="space-y-3">
            {subjects.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic py-4 text-center">
                No subjects registered yet.
              </p>
            ) : (
              subjects.map((sub) => {
                const prog = calculateSubjectProgress(sub);
                const done = sub.topics.filter((t) => t.completed).length;

                return (
                  <div
                    key={sub.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 dark:text-white block truncate">{sub.name}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px] block mt-0.5">
                        {done} / {sub.topics.length} topics completed
                      </span>
                    </div>

                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">{prog}%</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
