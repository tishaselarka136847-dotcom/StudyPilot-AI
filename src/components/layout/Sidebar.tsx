import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  FileText,
  HelpCircle,
  Layers,
  Sparkles,
  Timer,
  BarChart3,
  Settings,
  Flame,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'subjects'
  | 'planner'
  | 'summarizer'
  | 'quiz'
  | 'flashcards'
  | 'coach'
  | 'timer'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  studyStreak: number;
  totalActiveHours: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  studyStreak,
  totalActiveHours,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; aiBadge?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects & Syllabus', icon: BookOpen },
    { id: 'planner', label: 'AI Study Plan', icon: CalendarDays, aiBadge: true },
    { id: 'summarizer', label: 'Notes Summarizer', icon: FileText, aiBadge: true },
    { id: 'quiz', label: 'AI Quiz Generator', icon: HelpCircle, aiBadge: true },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'coach', label: 'AI Study Coach', icon: Sparkles, aiBadge: true },
    { id: 'timer', label: 'Focus Timer', icon: Timer },
    { id: 'analytics', label: 'Progress & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-30 hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-64'
      }`}
      aria-label="Primary Navigation"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 dark:border-slate-800">
        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer overflow-hidden"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelectTab('dashboard')}
          aria-label="StudyPilot AI Home"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="block text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                StudyPilot AI
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-1">
                Your Personal Study Planner
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive
                    ? item.aiBadge
                      ? 'text-violet-600 dark:text-violet-400'
                      : 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />

              {!collapsed && (
                <div className="flex-1 flex items-center justify-between text-left truncate">
                  <span className="truncate">{item.label}</span>
                  {item.aiBadge && (
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 px-1.5 py-0.5 rounded border border-violet-100 dark:border-violet-800">
                      AI
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Pacing & Streak Widget (Bottom) */}
      {!collapsed ? (
        <div className="p-3 m-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Study Streak</span>
            <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              {studyStreak} {studyStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Active Study</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
              {totalActiveHours} hrs logged
            </span>
          </div>
          <button
            onClick={() => onSelectTab('timer')}
            className="w-full mt-1 py-1.5 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Timer className="w-3.5 h-3.5" />
            Start Focus Session
          </button>
        </div>
      ) : (
        <div className="p-2 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs"
            title={`${studyStreak} day streak`}
          >
            🔥{studyStreak}
          </div>
        </div>
      )}
    </aside>
  );
};
