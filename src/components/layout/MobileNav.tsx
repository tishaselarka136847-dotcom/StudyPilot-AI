import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  Sparkles,
  Timer,
  X,
  Layers,
  HelpCircle,
  FileText,
  BarChart3,
  Settings,
  GraduationCap,
} from 'lucide-react';
import { NavTab } from './Sidebar.tsx';

interface MobileNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
}) => {
  const bottomTabs: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'subjects', label: 'Syllabus', icon: BookOpen },
    { id: 'planner', label: 'Planner', icon: CalendarDays },
    { id: 'coach', label: 'Coach', icon: Sparkles },
    { id: 'timer', label: 'Timer', icon: Timer },
  ];

  const allTabs: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; aiBadge?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects & Syllabus', icon: BookOpen },
    { id: 'planner', label: 'AI Study Plan Generator', icon: CalendarDays, aiBadge: true },
    { id: 'summarizer', label: 'Notes Summarizer', icon: FileText, aiBadge: true },
    { id: 'quiz', label: 'AI Quiz Generator', icon: HelpCircle, aiBadge: true },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'coach', label: 'AI Study Coach', icon: Sparkles, aiBadge: true },
    { id: 'timer', label: 'Focus Session Timer', icon: Timer },
    { id: 'analytics', label: 'Progress & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Bottom Sticky Navigation Bar for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around safe-area-bottom shadow-lg transition-colors">
        {bottomTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[11px] font-medium transition-colors ${
                isActive ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className="mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Slide-over Drawer for Complete Mobile Navigation */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Scrim */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 border-r border-slate-200 dark:border-slate-800 transition-colors">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">StudyPilot AI</h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Academic Study Planner</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {allTabs.map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTab(t.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span>{t.label}</span>
                    </div>
                    {t.aiBadge && (
                      <span className="text-[10px] font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 px-1.5 py-0.5 rounded border border-violet-100 dark:border-violet-900/40">
                        AI
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};
