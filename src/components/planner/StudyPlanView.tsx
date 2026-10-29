import React, { useState } from 'react';
import {
  CalendarDays,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Plus,
  Edit3,
  Trash2,
  Filter,
  Check,
  Calendar,
  X,
  ArrowRight,
  Info,
} from 'lucide-react';
import { StudyPlan, StudySession, Subject, UserSettings } from '../../types/index.ts';

interface StudyPlanViewProps {
  subjects: Subject[];
  studyPlan: StudyPlan | null;
  userSettings: UserSettings;
  onSavePlan: (plan: StudyPlan) => void;
  onToggleSessionComplete: (sessionId: string) => void;
}

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({
  subjects,
  studyPlan,
  userSettings,
  onSavePlan,
  onToggleSessionComplete,
}) => {
  // Input parameters
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(
    subjects.map((s) => s.id)
  );
  const [availableDays, setAvailableDays] = useState<string[]>(
    userSettings.availableDays && userSettings.availableDays.length > 0
      ? userSettings.availableDays
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  );
  const [dailyHours, setDailyHours] = useState<number>(
    userSettings.dailyStudyGoalMinutes ? userSettings.dailyStudyGoalMinutes / 60 : 3
  );
  const [sessionDuration, setSessionDuration] = useState<number>(
    userSettings.sessionDurationMinutes || 50
  );
  const [breakDuration, setBreakDuration] = useState<number>(
    userSettings.breakDurationMinutes || 10
  );
  const [revisionPref, setRevisionPref] = useState<string>(
    'Active recall questioning followed by high-yield concept review'
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(nextWeek.toISOString().split('T')[0]);

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [confirmRegenerateOpen, setConfirmRegenerateOpen] = useState(false);
  const [filterDate, setFilterDate] = useState<string>('all');
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);

  const toggleDay = (day: string) => {
    if (availableDays.includes(day)) {
      if (availableDays.length === 1) return; // Keep at least one
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const toggleSubject = (id: string) => {
    if (selectedSubjectIds.includes(id)) {
      setSelectedSubjectIds(selectedSubjectIds.filter((sId) => sId !== id));
    } else {
      setSelectedSubjectIds([...selectedSubjectIds, id]);
    }
  };

  const handleGenerateClick = () => {
    if (studyPlan && studyPlan.sessions.length > 0) {
      setConfirmRegenerateOpen(true);
    } else {
      executeGeneratePlan();
    }
  };

  const executeGeneratePlan = async () => {
    setConfirmRegenerateOpen(false);
    setApiError(null);

    // Validation
    const chosenSubjects = subjects.filter((s) => selectedSubjectIds.includes(s.id));
    if (chosenSubjects.length === 0) {
      setApiError('Please select at least one subject to generate a study timetable.');
      return;
    }
    if (availableDays.length === 0) {
      setApiError('Please choose at least one available study day of the week.');
      return;
    }
    if (dailyHours <= 0 || dailyHours > 12) {
      setApiError('Daily study hours must be between 0.5 and 12 hours.');
      return;
    }
    if (sessionDuration <= 0) {
      setApiError('Session duration must be greater than zero.');
      return;
    }

    setIsGenerating(true);

    try {
      const payload = {
        subjects: chosenSubjects.map((s) => ({
          name: s.name,
          examDate: s.examDate || '',
          confidenceLevel: s.confidenceLevel,
          topics: s.topics.map((t) => ({ name: t.name, completed: t.completed })),
        })),
        availableDays,
        dailyStudyHours: Number(dailyHours),
        sessionDurationMinutes: Number(sessionDuration),
        breakDurationMinutes: Number(breakDuration),
        revisionPreferences: revisionPref,
        startDate,
        endDate,
      };

      const res = await fetch('/api/gemini/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate plan from AI server.');
      }

      // Map sessions to full model
      const formattedSessions: StudySession[] = (data.sessions || []).map((s: any, idx: number) => ({
        id: s.id || `sess_${Date.now()}_${idx}`,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        subjectName: s.subjectName,
        topic: s.topic,
        activity: s.activity || 'Active Recall',
        durationMinutes: Number(s.durationMinutes) || sessionDuration,
        priority: s.priority || 'Medium',
        completed: false,
      }));

      const newPlan: StudyPlan = {
        id: `plan_${Date.now()}`,
        createdAt: new Date().toISOString(),
        preferences: {
          availableDays,
          dailyStudyHours: dailyHours,
          sessionDurationMinutes: sessionDuration,
          breakDurationMinutes: breakDuration,
          revisionPreferences: revisionPref,
          startDate,
          endDate,
        },
        sessions: formattedSessions,
        unfinishedTopics: data.unfinishedTopics || [],
        limitationExplanation: data.limitationExplanation || '',
        strategyNotes: data.strategyNotes || '',
      };

      onSavePlan(newPlan);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'An unexpected error occurred while communicating with Gemini.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEditedSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession || !studyPlan) return;

    const updatedSessions = studyPlan.sessions.map((s) =>
      s.id === editingSession.id ? editingSession : s
    );

    onSavePlan({
      ...studyPlan,
      sessions: updatedSessions,
    });
    setEditingSession(null);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (!studyPlan) return;
    const updatedSessions = studyPlan.sessions.filter((s) => s.id !== sessionId);
    onSavePlan({
      ...studyPlan,
      sessions: updatedSessions,
    });
  };

  // Group and filter sessions
  const sessions = studyPlan?.sessions || [];
  const filteredSessions =
    filterDate === 'all' ? sessions : sessions.filter((s) => s.date === filterDate);

  // Distinct dates present in timetable
  const distinctDates = Array.from(new Set(sessions.map((s) => s.date))).sort();

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* View Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              AI Study Plan Generator
            </h1>
            <span className="text-[11px] font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 px-2 py-0.5 rounded-full border border-violet-100 dark:border-violet-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Gemini Powered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Calculates an optimized, conflict-free timetable that accounts for your examination dates,
            daily study capacity, and self-assessed confidence levels.
          </p>
        </div>

        {studyPlan && (
          <button
            onClick={handleGenerateClick}
            disabled={isGenerating}
            className="px-4 py-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate Schedule</span>
          </button>
        )}
      </div>

      {/* Main Grid: Parameters on Left, Timetable on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Parameters (4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Schedule Parameters</h2>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Step 1 of 2</span>
          </div>

          {apiError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Validation Notice</p>
                <p className="mt-0.5">{apiError}</p>
              </div>
            </div>
          )}

          {/* Subjects Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Subjects to Include ({selectedSubjectIds.length}/{subjects.length})
            </label>
            {subjects.length === 0 ? (
              <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800">
                No subjects found. Please add your courses in Subjects & Syllabus first.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {subjects.map((sub) => {
                  const isChecked = selectedSubjectIds.includes(sub.id);
                  return (
                    <label
                      key={sub.id}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-medium'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSubject(sub.id)}
                          className="w-3.5 h-3.5 text-blue-600 rounded"
                        />
                        <span className="truncate">{sub.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0">
                        {sub.topics.length} topics
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Available Study Days */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Available Days of Week
            </label>
            <div className="grid grid-cols-7 gap-1">
              {ALL_DAYS.map((day) => {
                const isSelected = availableDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Study Hours & Session Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Daily Study Limit
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium pointer-events-none">
                  hrs/day
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Session Length
              </label>
              <select
                value={sessionDuration}
                onChange={(e) => setSessionDuration(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800"
              >
                <option value={25}>25 min (Pomodoro)</option>
                <option value={50}>50 min (Deep Work)</option>
                <option value={90}>90 min (Extended)</option>
              </select>
            </div>
          </div>

          {/* Break Duration & Planning Window */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Break Duration
              </label>
              <select
                value={breakDuration}
                onChange={(e) => setBreakDuration(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800"
              >
                <option value={5}>5 min break</option>
                <option value={10}>10 min break</option>
                <option value={15}>15 min break</option>
                <option value={20}>20 min break</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start From
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Revision Preferences */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Revision & Focus Style
            </label>
            <input
              type="text"
              value={revisionPref}
              onChange={(e) => setRevisionPref(e.target.value)}
              placeholder="e.g. Practice questions, mind maps, formula review"
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Button */}
          <button
            onClick={handleGenerateClick}
            disabled={isGenerating || subjects.length === 0}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing Timetable...' : 'Generate AI Study Plan'}</span>
          </button>
        </div>

        {/* Right Timetable: Results & Schedule Grid (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Strategy Rationale & Limitations Banner */}
          {studyPlan && (
            <div className="space-y-3">
              {studyPlan.strategyNotes && (
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span>AI Scheduling Rationale</span>
                  </div>
                  <p className="leading-relaxed">{studyPlan.strategyNotes}</p>
                </div>
              )}

              {/* Unfinished Topics Notice */}
              {studyPlan.unfinishedTopics && studyPlan.unfinishedTopics.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Capacity Limitation Notice</span>
                  </div>
                  <p className="leading-relaxed">
                    {studyPlan.limitationExplanation ||
                      'Due to daily study hour constraints or upcoming exam cutoffs, the following topics could not fit within the active timetable window:'}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {studyPlan.unfinishedTopics.map((topic, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-amber-100/80 border border-amber-300 rounded font-medium text-[11px]"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timetable Header with Date Filter */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Scheduled Study Sessions ({filteredSessions.length})
                </h2>
              </div>

              {/* Date Filter Tabs */}
              {distinctDates.length > 0 && (
                <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
                  <button
                    onClick={() => setFilterDate('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      filterDate === 'all'
                        ? 'bg-slate-900 dark:bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    All Dates
                  </button>
                  {distinctDates.map((date) => (
                    <button
                      key={date}
                      onClick={() => setFilterDate(date)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        filterDate === date
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {date === todayStr ? 'Today' : date.slice(5)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sessions Table / Cards */}
            <div className="mt-4 space-y-3">
              {filteredSessions.length === 0 ? (
                <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Sessions Found</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Configure your parameters on the left and click "Generate AI Study Plan".
                  </p>
                </div>
              ) : (
                filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      session.completed
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-slate-600 dark:text-slate-400'
                        : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <button
                        onClick={() => onToggleSessionComplete(session.id)}
                        className={`mt-0.5 sm:mt-0 w-5 h-5 rounded flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                          session.completed
                            ? 'bg-emerald-600 text-white'
                            : 'border border-slate-300 dark:border-slate-600 hover:border-blue-600 text-transparent'
                        }`}
                        aria-label={session.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-bold ${
                              session.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {session.topic}
                          </span>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {session.subjectName}
                          </span>
                          <span className="text-[11px] font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 px-1.5 py-0.5 rounded border border-violet-100 dark:border-violet-800">
                            {session.activity}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{session.date}</span>
                          <span>·</span>
                          <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
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

                    {/* Actions: Edit & Delete */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => setEditingSession(session)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Edit Session"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Delete Session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal Before Regenerating / Overwriting Existing Plan */}
      {confirmRegenerateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setConfirmRegenerateOpen(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white text-center">
              Replace Existing Timetable?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
              You already have active study sessions scheduled. Generating a new plan will replace
              your current timetable. Any manual edits will be overwritten.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setConfirmRegenerateOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex-1 cursor-pointer"
              >
                Keep Existing
              </button>
              <button
                onClick={executeGeneratePlan}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex-1 shadow-xs transition-colors cursor-pointer"
              >
                Yes, Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Session Modal */}
      {editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setEditingSession(null)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Edit Study Session</h2>
              <button
                onClick={() => setEditingSession(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedSession} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Topic / Task Name
                </label>
                <input
                  type="text"
                  value={editingSession.topic}
                  onChange={(e) =>
                    setEditingSession({ ...editingSession, topic: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editingSession.date}
                    onChange={(e) =>
                      setEditingSession({ ...editingSession, date: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={editingSession.priority}
                    onChange={(e) =>
                      setEditingSession({
                        ...editingSession,
                        priority: e.target.value as 'High' | 'Medium' | 'Low',
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={editingSession.startTime}
                    onChange={(e) =>
                      setEditingSession({ ...editingSession, startTime: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={editingSession.endTime}
                    onChange={(e) =>
                      setEditingSession({ ...editingSession, endTime: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Study Activity
                </label>
                <input
                  type="text"
                  value={editingSession.activity}
                  onChange={(e) =>
                    setEditingSession({ ...editingSession, activity: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
