import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Check,
  AlertTriangle,
  Award,
  BookOpen,
  Info,
  Clock,
  History,
} from 'lucide-react';
import { QuizAttempt, QuizQuestion, QuizRecord, Subject } from '../../types/index.ts';
import { generateQuiz } from '../../services/aiService.ts';

interface QuizViewProps {
  subjects: Subject[];
  quizAttempts: QuizAttempt[];
  onSaveQuizAttempt: (attempt: QuizAttempt) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  subjects,
  quizAttempts,
  onSaveQuizAttempt,
}) => {
  // Setup inputs
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects.length > 0 ? subjects[0].id : ''
  );
  const [topicOrNotes, setTopicOrNotes] = useState<string>('');
  const [isFromNotes, setIsFromNotes] = useState<boolean>(false);
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionType, setQuestionType] = useState<'Multiple Choice' | 'True/False'>('Multiple Choice');

  // Generator & Runtime state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<QuizRecord | null>(null);

  // Active quiz runner states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt | null>(null);

  // View state: 'setup' | 'running' | 'results' | 'history'
  const [viewState, setViewState] = useState<'setup' | 'running' | 'results' | 'history'>('setup');

  const selectedSub = subjects.find((s) => s.id === selectedSubjectId);

  const handleGenerateQuiz = async () => {
    if (!topicOrNotes.trim()) {
      setApiError('Please specify a topic or paste notes to generate the quiz.');
      return;
    }

    setApiError(null);
    setIsGenerating(true);

    try {
      const subjectName = selectedSub ? selectedSub.name : 'General Academic Subject';

      const data = await generateQuiz({
        subjectName,
        topicOrNotes,
        isFromNotes,
        numQuestions,
        difficulty,
        questionType,
      });

      const questions: QuizQuestion[] = (data.questions || []).map((q: any, idx: number) => ({
        id: q.id || `q_${idx + 1}`,
        question: q.question,
        options: q.options || [],
        correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
        explanation: q.explanation || '',
        sourceContext: q.sourceContext || (isFromNotes ? 'Supplied notes' : 'General syllabus knowledge'),
      }));

      if (questions.length === 0) {
        throw new Error('No valid questions returned. Please retry with more specific notes.');
      }

      const record: QuizRecord = {
        id: `quiz_${Date.now()}`,
        subjectId: selectedSubjectId,
        subjectName,
        topic: topicOrNotes.slice(0, 50),
        difficulty,
        type: questionType,
        questions,
        isGeneralKnowledge: Boolean(data.isGeneralSubjectKnowledge),
        createdAt: new Date().toISOString(),
      };

      setActiveQuiz(record);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setIsSubmitted(false);
      setViewState('running');
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'An error occurred during quiz generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAnswer = (optionIndex: number) => {
    if (isSubmitted || !activeQuiz) return;
    const currentQ = activeQuiz.questions[currentQuestionIndex];
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex,
    }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;

    let score = 0;
    activeQuiz.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        score += 1;
      }
    });

    const percentage = Math.round((score / activeQuiz.questions.length) * 100);

    const attempt: QuizAttempt = {
      id: `att_${Date.now()}`,
      quizId: activeQuiz.id,
      subjectName: activeQuiz.subjectName,
      topic: activeQuiz.topic,
      score,
      totalQuestions: activeQuiz.questions.length,
      percentage,
      userAnswers,
      completedAt: new Date().toISOString(),
    };

    onSaveQuizAttempt(attempt);
    setLastAttempt(attempt);
    setIsSubmitted(true);
    setViewState('results');
  };

  const handleRetryQuiz = () => {
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
    setViewState('running');
  };

  const handleResetToSetup = () => {
    setActiveQuiz(null);
    setUserAnswers({});
    setIsSubmitted(false);
    setViewState('setup');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              AI Quiz Generator
            </h1>
            <span className="text-[11px] font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 px-2 py-0.5 rounded-full border border-violet-100 dark:border-violet-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Gemini Assessment
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Generate custom exam-grade quizzes from topics or notes. Practice with instant grading,
            detailed explanations, and historical performance tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setViewState(viewState === 'history' ? 'setup' : 'history')}
            className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <History className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{viewState === 'history' ? 'Back to Quiz' : `Attempts (${quizAttempts.length})`}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Quiz History Screen */}
      {viewState === 'history' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Quiz Assessment History</h2>
            <button
              onClick={() => setViewState('setup')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Start New Quiz
            </button>
          </div>

          {quizAttempts.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <HelpCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Quiz Attempts Recorded Yet</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Generate a practice quiz to test your mastery and view score history here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {quizAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {attempt.subjectName}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">· {attempt.topic}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                      Completed: {attempt.completedAt.slice(0, 10)} at {attempt.completedAt.slice(11, 16)}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm font-bold px-2.5 py-1 rounded-lg tabular-nums ${
                        attempt.percentage >= 80
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : attempt.percentage >= 60
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                      }`}
                    >
                      {attempt.score} / {attempt.totalQuestions} ({attempt.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: Quiz Setup Screen */}
      {viewState === 'setup' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Configure Practice Assessment</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select questions format, difficulty, and your syllabus topic or pasted notes.
            </p>
          </div>

          {apiError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Subject Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Course / Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code || 'N/A'})
                </option>
              ))}
              <option value="">General Subject</option>
            </select>
          </div>

          {/* Source Toggle: Topic Name vs Pasted Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Generation Source
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsFromNotes(false)}
                className={`py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  !isFromNotes
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Curriculum Topic
              </button>
              <button
                type="button"
                onClick={() => setIsFromNotes(true)}
                className={`py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isFromNotes
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Pasted Lecture Notes
              </button>
            </div>
          </div>

          {/* Topic or Notes Text Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isFromNotes ? 'Paste Source Notes *' : 'Enter Syllabus Topic *'}
            </label>
            {isFromNotes ? (
              <textarea
                rows={5}
                value={topicOrNotes}
                onChange={(e) => setTopicOrNotes(e.target.value)}
                placeholder="Paste the excerpt or lecture notes you want questions generated from..."
                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            ) : (
              <input
                type="text"
                value={topicOrNotes}
                onChange={(e) => setTopicOrNotes(e.target.value)}
                placeholder="e.g. Virtual Memory, TLBs, and Page Tables"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {isFromNotes
                ? 'Questions will strictly evaluate content found in your provided notes.'
                : 'Questions will be generated from general academic subject knowledge.'}
            </p>
          </div>

          {/* Format & Difficulty Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Questions Count
              </label>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-800"
              >
                <option value={3}>3 Questions (Quick)</option>
                <option value={5}>5 Questions (Standard)</option>
                <option value={10}>10 Questions (Deep Drill)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-800"
              >
                <option value="Easy">Easy (Recall)</option>
                <option value="Medium">Medium (Application)</option>
                <option value="Hard">Hard (Analysis)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Question Type
              </label>
              <select
                value={questionType}
                onChange={(e) =>
                  setQuestionType(e.target.value as 'Multiple Choice' | 'True/False')
                }
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-800"
              >
                <option value="Multiple Choice">Multiple Choice (4 Options)</option>
                <option value="True/False">True / False</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateQuiz}
            disabled={isGenerating || !topicOrNotes.trim()}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating Structured Quiz...' : 'Create Practice Quiz'}</span>
          </button>
        </div>
      )}

      {/* VIEW 3: Active Quiz Runner (One Question At a Time) */}
      {viewState === 'running' && activeQuiz && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Progress Header */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              <span className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded border border-blue-100 dark:border-blue-800 font-bold">
                  {activeQuiz.subjectName}
                </span>
                <span className="text-slate-700 dark:text-slate-200 font-bold">
                  Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
                </span>
              </span>
              <span className="tabular-nums font-mono text-slate-600 dark:text-slate-400">
                {Object.keys(userAnswers).length} answered
              </span>
            </div>

            {/* Stepped Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%`,
                }}
              />
            </div>

            {activeQuiz.isGeneralKnowledge && (
              <div className="mt-3 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Questions are generated from general subject knowledge and curriculum standards.
                </span>
              </div>
            )}
          </div>

          {/* Question Card */}
          {(() => {
            const currentQ = activeQuiz.questions[currentQuestionIndex];
            const selectedOpt = userAnswers[currentQ.id];

            return (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Question {currentQuestionIndex + 1}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {currentQ.question}
                  </h3>
                </div>

                {/* Selectable Options Stack */}
                <div className="space-y-3">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = selectedOpt === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectAnswer(optIdx)}
                        className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-950/70 border-blue-600 text-blue-900 dark:text-blue-100 ring-1 ring-blue-600 shadow-xs'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="leading-relaxed">{opt}</span>
                        </div>

                        {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Prev / Next / Submit Controls */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                    <button
                      onClick={() =>
                        setCurrentQuestionIndex((prev) =>
                          Math.min(prev + 1, activeQuiz.questions.length - 1)
                        )
                      }
                      className="px-5 py-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-600/20 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Answers for Grading</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* VIEW 4: Results & Question-By-Question Breakdown */}
      {viewState === 'results' && activeQuiz && lastAttempt && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Score Summary Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs text-center space-y-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
                lastAttempt.percentage >= 80
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : lastAttempt.percentage >= 60
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                  : 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400'
              }`}
            >
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Assessment Results
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
                {lastAttempt.percentage}% Score
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                You correctly answered <strong className="text-slate-900 dark:text-white">{lastAttempt.score}</strong>{' '}
                out of <strong className="text-slate-900 dark:text-white">{lastAttempt.totalQuestions}</strong> questions.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRetryQuiz}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Quiz</span>
              </button>
              <button
                onClick={handleResetToSetup}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>New Quiz</span>
              </button>
            </div>
          </div>

          {/* Question-By-Question Review */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Detailed Question Analysis & Explanations
            </h3>

            {activeQuiz.questions.map((q, qIdx) => {
              const studentAnswer = lastAttempt.userAnswers[q.id];
              const isCorrect = studentAnswer === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className={`p-6 rounded-2xl border bg-white dark:bg-slate-900 shadow-xs space-y-4 ${
                    isCorrect ? 'border-emerald-200/80 dark:border-emerald-800/80' : 'border-red-200/80 dark:border-red-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-400">
                        Question {qIdx + 1}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{q.question}</h4>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Correct
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          Incorrect
                        </>
                      )}
                    </span>
                  </div>

                  {/* Options List with Highlighting */}
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isOptionCorrect = optIdx === q.correctIndex;
                      const isOptionStudentChoice = optIdx === studentAnswer;

                      let optClasses = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300';
                      if (isOptionCorrect) {
                        optClasses = 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 font-bold';
                      } else if (isOptionStudentChoice && !isCorrect) {
                        optClasses = 'border-red-400 bg-red-50/70 dark:bg-red-950/50 text-red-950 dark:text-red-200 line-through';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${optClasses}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                            <span>{opt}</span>
                          </div>

                          {isOptionCorrect && (
                            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                              Correct Answer
                            </span>
                          )}
                          {isOptionStudentChoice && !isCorrect && (
                            <span className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                              Your Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Card */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Explanation:</span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{q.explanation}</p>
                    {q.sourceContext && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 italic">
                        Context: {q.sourceContext}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
