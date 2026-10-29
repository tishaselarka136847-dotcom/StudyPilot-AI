import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Coffee,
  Award,
} from 'lucide-react';
import { FocusRecord, Subject, UserSettings } from '../../types/index.ts';

interface FocusTimerViewProps {
  subjects: Subject[];
  focusRecords: FocusRecord[];
  userSettings: UserSettings;
  onAddFocusRecord: (record: FocusRecord) => void;
  onTimerTick?: (secondsLeft: number, isRunning: boolean) => void;
}

export const FocusTimerView: React.FC<FocusTimerViewProps> = ({
  subjects,
  focusRecords,
  userSettings,
  onAddFocusRecord,
  onTimerTick,
}) => {
  // Session configuration
  const defaultDuration = userSettings.sessionDurationMinutes || 50;
  const [selectedDuration, setSelectedDuration] = useState<number>(defaultDuration);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects.length > 0 ? subjects[0].id : ''
  );
  const [taskName, setTaskName] = useState<string>('');

  // Mode: 'study' | 'break'
  const [mode, setMode] = useState<'study' | 'break'>('study');

  // Countdown timer state
  const [secondsRemaining, setSecondsRemaining] = useState<number>(defaultDuration * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeElapsedSeconds, setActiveElapsedSeconds] = useState<number>(0);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);

  // Interval reference
  const intervalRef = useRef<any>(null);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  // Sync state with header indicator
  useEffect(() => {
    onTimerTick?.(secondsRemaining, isRunning);
  }, [secondsRemaining, isRunning]);

  // Timer tick effect: ONLY counts when isRunning is TRUE
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            handleFinishSession();
            return 0;
          }
          return prev - 1;
        });

        // Only accumulate active study seconds if in 'study' mode
        if (mode === 'study') {
          setActiveElapsedSeconds((prev) => prev + 1);
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
    setSessionCompleted(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsRemaining(selectedDuration * 60);
    setActiveElapsedSeconds(0);
    setSessionCompleted(false);
  };

  const handleDurationChange = (minutes: number) => {
    setIsRunning(false);
    setSelectedDuration(minutes);
    setSecondsRemaining(minutes * 60);
    setActiveElapsedSeconds(0);
    setSessionCompleted(false);
  };

  const handleSwitchMode = (newMode: 'study' | 'break') => {
    setIsRunning(false);
    setMode(newMode);
    const duration =
      newMode === 'study' ? selectedDuration : userSettings.breakDurationMinutes || 10;
    setSecondsRemaining(duration * 60);
    setActiveElapsedSeconds(0);
    setSessionCompleted(false);
  };

  const handleFinishSession = () => {
    setIsRunning(false);

    // Only record if active seconds > 30 to prevent empty/duplicate records
    if (mode === 'study' && activeElapsedSeconds >= 30) {
      const subjectName = selectedSubject ? selectedSubject.name : 'General Focus';
      const record: FocusRecord = {
        id: `foc_${Date.now()}`,
        taskName: taskName.trim() || 'Focused Study Session',
        subjectName,
        durationMinutes: selectedDuration,
        activeSeconds: activeElapsedSeconds,
        completedAt: new Date().toISOString(),
      };

      onAddFocusRecord(record);
      setSessionCompleted(true);
    }
  };

  // Format MM:SS with tabular-nums
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  // Circular progress stroke calculation
  const totalSeconds = (mode === 'study' ? selectedDuration : userSettings.breakDurationMinutes || 10) * 60;
  const progressPercent = totalSeconds > 0 ? (totalSeconds - secondsRemaining) / totalSeconds : 0;
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressPercent);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Focus Session Timer
            </h1>
            <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-100 dark:border-teal-900/40 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Active Time Tracking
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deep work intervals with honest tracking. Paused time is never counted towards your study
            hours.
          </p>
        </div>

        {/* Study vs Break Segmented Control */}
        <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-1 shrink-0 transition-colors">
          <button
            onClick={() => handleSwitchMode('study')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'study'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Study Block</span>
          </button>
          <button
            onClick={() => handleSwitchMode('break')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'break'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Restorative Break</span>
          </button>
        </div>
      </div>

      {/* Main Timer Dial & Task Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xs flex flex-col items-center justify-center space-y-8 transition-colors">
        {/* Task Selection Bar */}
        <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Select Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 font-medium bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
              <option value="">General Focus</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Task or Topic Focus
            </label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. Chapter 3 Problems, TLB Diagrams"
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Duration Preset Selector */}
        {mode === 'study' && (
          <div className="flex items-center gap-2">
            {[25, 50, 90].map((mins) => (
              <button
                key={mins}
                onClick={() => handleDurationChange(mins)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedDuration === mins
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {mins} min {mins === 50 ? '(Deep Work)' : mins === 25 ? '(Pomodoro)' : '(Extended)'}
              </button>
            ))}
          </div>
        )}

        {/* Circular Countdown Dial with SVG */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
            {/* Background Track */}
            <circle
              cx="120"
              cy="120"
              r={radius}
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Active Progress Ring */}
            <circle
              cx="120"
              cy="120"
              r={radius}
              stroke={mode === 'study' ? '#3B82F6' : '#14B8A6'}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Time Text Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono tracking-tighter tabular-nums">
              {timeDisplay}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
              {isRunning
                ? mode === 'study'
                  ? 'Active Study Session'
                  : 'Restorative Break'
                : 'Timer Paused'}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1">
              {Math.round(activeElapsedSeconds / 60)}m active logged
            </span>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleStartPause}
            className={`px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 text-white transition-all shadow-md ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{secondsRemaining < selectedDuration * 60 ? 'Resume' : 'Start Focus'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {activeElapsedSeconds >= 30 && (
            <button
              onClick={handleFinishSession}
              className="px-4 py-3 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Record completed study time to history"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Complete</span>
            </button>
          )}
        </div>

        {/* Completion Celebration Banner */}
        {sessionCompleted && (
          <div className="w-full max-w-md p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-center gap-3 text-emerald-900 dark:text-emerald-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <Award className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold block text-sm">Focus Session Recorded!</span>
              <span>
                Logged <strong className="tabular-nums font-mono">{Math.round(activeElapsedSeconds / 60)} minutes</strong>{' '}
                of active study to your dashboard and streak history.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Focus History Log */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Completed Focus Sessions</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {focusRecords.length} recorded
          </span>
        </div>

        {focusRecords.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic py-4 text-center">
            No focus sessions logged yet. Complete a study session to build your study streak.
          </p>
        ) : (
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {focusRecords.slice(0, 8).map((record) => (
              <div
                key={record.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs transition-colors"
              >
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 dark:text-white block truncate">{record.taskName}</span>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] mt-0.5">
                    {record.subjectName} · {record.completedAt.slice(0, 10)}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-100 dark:border-teal-900/40 tabular-nums">
                    {Math.round(record.activeSeconds / 60)} mins
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
