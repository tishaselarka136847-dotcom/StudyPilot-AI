import React from 'react';
import {
  Menu,
  RotateCcw,
  Sparkles,
  Timer,
  CheckCircle2,
  Database,
  User,
  Sun,
  Moon,
  GraduationCap,
} from 'lucide-react';
import { NavTab } from './Sidebar.tsx';
import { UserSettings } from '../../types/index.ts';

interface HeaderProps {
  activeTab: NavTab;
  onOpenMobileMenu: () => void;
  onOpenDemoModal: () => void;
  onOpenAuthModal: () => void;
  isDemoData: boolean;
  userSettings: UserSettings;
  activeTimerSeconds?: number;
  isTimerRunning?: boolean;
  onSelectTab: (tab: NavTab) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Academic Overview & Daily Progress' },
  subjects: { title: 'Subjects & Syllabus', subtitle: 'Course Curriculum & Topic Mastery' },
  planner: { title: 'AI Study Plan Generator', subtitle: 'Personalized Smart Timetable' },
  summarizer: { title: 'Notes Summarizer', subtitle: 'Lecture Synthesis & Definition Extraction' },
  quiz: { title: 'AI Quiz Generator', subtitle: 'Self-Assessment & Active Recall Drills' },
  flashcards: { title: 'Flashcards', subtitle: 'Spaced Repetition & Key Term Mastery' },
  coach: { title: 'AI Study Coach', subtitle: 'Socratic Academic Mentorship' },
  timer: { title: 'Focus Session Timer', subtitle: 'Deep Work & Pomodoro Session Tracker' },
  analytics: { title: 'Progress & Analytics', subtitle: 'Telemetry, Streaks & Examination Readiness' },
  settings: { title: 'Settings', subtitle: 'Preferences, Targets & Academic Level' },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  onOpenDemoModal,
  onOpenAuthModal,
  isDemoData,
  userSettings,
  activeTimerSeconds = 0,
  isTimerRunning = false,
  onSelectTab,
  theme,
  onToggleTheme,
}) => {
  const current = TAB_TITLES[activeTab];
  const profile = userSettings.studentProfile;

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Mobile Menu Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>StudyPilot AI</span>
            <span aria-hidden="true">/</span>
            <span className="text-slate-800 dark:text-slate-100 font-semibold truncate">
              {current.title}
            </span>
          </div>
          <p className="hidden sm:block text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Actions, Theme, Demo Badge & Profile */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Active Timer Quick Widget */}
        {activeTimerSeconds > 0 && (
          <button
            onClick={() => onSelectTab('timer')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold tabular-nums transition-all ${
              isTimerRunning
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 animate-pulse'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            }`}
            title="Active Focus Session"
          >
            <Timer className="w-3.5 h-3.5" />
            <span>{formatTimer(activeTimerSeconds)}</span>
          </button>
        )}

        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Slate Theme'}
          aria-label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Slate Theme'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Demo Data Indicator / Switcher */}
        <button
          onClick={onOpenDemoModal}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
            isDemoData
              ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
          title="Demo Data Status & Reset Options"
        >
          <Database className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="hidden md:inline">
            {isDemoData ? 'Demo Data' : 'User Data'}
          </span>
          <span className="text-[11px] underline text-slate-500 dark:text-slate-400 ml-0.5">Reset</span>
        </button>

        {/* Student Profile Pill */}
        <button
          onClick={onOpenAuthModal}
          className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all shadow-xs"
          title="View Student Digital ID & Academic Profile"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="text-left hidden sm:block">
            <span className="block text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[110px] leading-tight">
              {profile?.fullName || userSettings.displayName || 'Student Profile'}
            </span>
            <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate max-w-[110px]">
              {profile?.studentId || 'Set ID Details'}
            </span>
          </div>
        </button>
      </div>
    </header>
  );
};
