import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  AlertTriangle,
  Database,
  Check,
  User,
  Clock,
  Calendar,
  Sparkles,
  Sun,
  Moon,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { AcademicLevel, UserSettings } from '../../types/index.ts';

interface SettingsViewProps {
  userSettings: UserSettings;
  isDemoData: boolean;
  onSaveSettings: (settings: UserSettings) => void;
  onResetToDemo: () => void;
  onClearAllData: () => void;
  onOpenAuthModal: () => void;
  onSelectTheme?: (theme: 'light' | 'dark') => void;
}

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const SettingsView: React.FC<SettingsViewProps> = ({
  userSettings,
  isDemoData,
  onSaveSettings,
  onResetToDemo,
  onClearAllData,
  onOpenAuthModal,
  onSelectTheme,
}) => {
  const [displayName, setDisplayName] = useState(userSettings.displayName || '');
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>(
    userSettings.academicLevel || 'all'
  );
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(
    userSettings.dailyStudyGoalMinutes || 120
  );
  const [sessionDuration, setSessionDuration] = useState(
    userSettings.sessionDurationMinutes || 50
  );
  const [breakDuration, setBreakDuration] = useState(
    userSettings.breakDurationMinutes || 10
  );
  const [availableDays, setAvailableDays] = useState<string[]>(
    userSettings.availableDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  );
  const [theme, setTheme] = useState<'light' | 'dark'>(userSettings.theme || 'light');
  const [customApiKey, setCustomApiKey] = useState(userSettings.customApiKey || '');

  // Keep local theme state in sync when userSettings.theme changes externally (e.g. from outer header button)
  useEffect(() => {
    if (userSettings.theme) {
      setTheme(userSettings.theme);
    }
  }, [userSettings.theme]);

  const [savedNotice, setSavedNotice] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  // Immediate theme handler that switches and applies the theme across the app right away
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    if (onSelectTheme) {
      onSelectTheme(newTheme);
    } else {
      onSaveSettings({
        ...userSettings,
        theme: newTheme,
      });
    }
  };

  const toggleDay = (day: string) => {
    if (availableDays.includes(day)) {
      if (availableDays.length === 1) return;
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserSettings = {
      ...userSettings,
      displayName: displayName.trim() || 'Scholar',
      academicLevel,
      dailyStudyGoalMinutes: Number(dailyGoalMinutes) || 120,
      sessionDurationMinutes: Number(sessionDuration) || 50,
      breakDurationMinutes: Number(breakDuration) || 10,
      availableDays,
      theme,
      customApiKey: customApiKey.trim() || undefined,
    };

    onSaveSettings(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const profile = userSettings.studentProfile;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Preferences & System Settings
            </h1>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-1">
              <Settings className="w-3 h-3" />
              Configuration
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Customize theme appearance, academic tier, focus intervals, and manage student profile data.
          </p>
        </div>

        {savedNotice && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold animate-in fade-in duration-200">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Preferences Saved!</span>
          </div>
        )}
      </div>

      {/* Student Academic Identity Card Preview Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shrink-0">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-mono tracking-widest uppercase text-blue-200 block">
              VERIFIED STUDENT PROFILE
            </span>
            <h2 className="text-base font-bold text-white truncate">
              {profile?.fullName || displayName || 'Student Profile'}
            </h2>
            <p className="text-xs text-blue-100 truncate">
              {profile?.institution || 'Marwadi University'} · {profile?.major || 'Computer Science'} ({profile?.studentId || 'ID: Active'})
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAuthModal}
          className="px-4 py-2 bg-white hover:bg-blue-50 text-blue-900 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
        >
          Manage Student ID Card
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
        {/* Appearance Theme Selector */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Interface Theme</h2>
            </div>
            <button
              type="button"
              onClick={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')}
              className="px-3 py-1 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Switch to Light Theme</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Switch to Dark Theme</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleThemeChange('light')}
              onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && handleThemeChange('light')}
              className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all select-none ${
                theme === 'light'
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200 shadow-xs ring-1 ring-blue-600/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="theme_choice"
                  value="light"
                  checked={theme === 'light'}
                  onChange={() => handleThemeChange('light')}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Academic Light Theme</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Clean daylight canvas with high-contrast slate text.
                  </p>
                </div>
              </div>
              {theme === 'light' ? (
                <Check className="w-4 h-4 text-blue-600 shrink-0" />
              ) : (
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  Select
                </span>
              )}
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => handleThemeChange('dark')}
              onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && handleThemeChange('dark')}
              className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all select-none ${
                theme === 'dark'
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200 shadow-xs ring-1 ring-blue-600/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="theme_choice"
                  value="dark"
                  checked={theme === 'dark'}
                  onChange={() => handleThemeChange('dark')}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span>Deep Slate Dark Theme</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Comfortable low-glare dark surfaces for night study.
                  </p>
                </div>
              </div>
              {theme === 'dark' ? (
                <Check className="w-4 h-4 text-blue-600 shrink-0" />
              ) : (
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  Select
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>Profile & Academic Track</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Alex Chen"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Academic Curriculum Level
              </label>
              <select
                value={academicLevel}
                onChange={(e) => setAcademicLevel(e.target.value as AcademicLevel)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Tiers (Comprehensive)</option>
                <option value="university">Undergraduate & University</option>
                <option value="high_school">High School & AP / IB Prep</option>
                <option value="competitive_exams">Competitive Exams & Certifications</option>
              </select>
            </div>
          </div>
        </div>

        {/* Study Timing Intervals */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Study & Break Rhythm</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Daily Study Goal (Minutes)
              </label>
              <input
                type="number"
                step="15"
                min="30"
                max="720"
                value={dailyGoalMinutes}
                onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 tabular-nums"
              />
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                {(dailyGoalMinutes / 60).toFixed(1)} hours per day
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Focus Duration
              </label>
              <select
                value={sessionDuration}
                onChange={(e) => setSessionDuration(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={25}>25 minutes (Pomodoro)</option>
                <option value={50}>50 minutes (Deep Work)</option>
                <option value={90}>90 minutes (Ultradian)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Break Duration
              </label>
              <select
                value={breakDuration}
                onChange={(e) => setBreakDuration(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Available Study Days */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Default Available Study Days</span>
          </h2>

          <div className="grid grid-cols-7 gap-2 max-w-md">
            {ALL_DAYS.map((day) => {
              const isSelected = availableDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
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

        {/* AI Engine & Vercel Deployment Configuration */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Engine & Vercel Deployment</span>
          </h2>
          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Instant Client-Side Engine (Vercel Optimized)
                </span>
              </div>
              <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-md w-fit">
                Zero Latency
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              All study schedules, notes summarization, quiz generation, active recall flashcards, and AI tutor coaching run completely in your browser without requiring a backend server.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Custom Google Gemini API Key (Optional)
              </label>
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="AIzaSy... (Leave empty to use built-in high-speed engine)"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                Stored securely in your local browser only. Never transmitted to third-party servers.
              </p>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* Demonstration & Data Reset Zone */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5 transition-colors">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-600" />
            <span>Data Storage & Demo Controls</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your persistent localStorage data. You can restore rich demonstration data or start
            completely blank with an empty workspace.
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
              Restore Demonstration Seed Data
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Populates realistic university courses (CS 301, CHM 220, CS 201), sample timetables,
              and focus records.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shrink-0 transition-colors"
          >
            Load Demo Data
          </button>
        </div>

        <div className="p-4 bg-red-50/60 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-red-900 dark:text-red-300 block">
              Clear All Stored Data (Factory Reset)
            </span>
            <span className="text-[11px] text-red-700 dark:text-red-400 block mt-0.5">
              Removes all subjects, study plans, summaries, quizzes, and focus history. Starts with an
              empty clean state.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setConfirmClearOpen(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors shadow-xs"
          >
            Clear All Data
          </button>
        </div>
      </div>

      {/* Modal: Confirm Reset to Demo */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setConfirmResetOpen(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 text-center">Load Demo Data?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
              This will overwrite your current subjects and records with realistic academic sample
              courses.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => setConfirmResetOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetToDemo();
                  setConfirmResetOpen(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex-1 shadow-xs"
              >
                Load Demo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Clear All Data */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setConfirmClearOpen(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 text-center">Factory Data Reset?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
              This will permanently delete all courses, timetable sessions, and quiz history from
              this browser.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => setConfirmClearOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAllData();
                  setConfirmClearOpen(false);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex-1 shadow-xs"
              >
                Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
