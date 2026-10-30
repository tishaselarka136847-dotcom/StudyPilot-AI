import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Save,
  RotateCcw,
  Check,
  Trash2,
  AlertTriangle,
  FolderOpen,
  X,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { Subject, SummaryRecord } from '../../types/index.ts';
import { summarizeNotes } from '../../services/aiService.ts';

interface NotesSummarizerViewProps {
  subjects: Subject[];
  savedSummaries: SummaryRecord[];
  onSaveSummary: (summary: SummaryRecord) => void;
  onDeleteSummary: (id: string) => void;
}

export const NotesSummarizerView: React.FC<NotesSummarizerViewProps> = ({
  subjects,
  savedSummaries,
  onSaveSummary,
  onDeleteSummary,
}) => {
  // Input states
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects.length > 0 ? subjects[0].id : ''
  );
  const [notesText, setNotesText] = useState<string>('');
  const [summaryLength, setSummaryLength] = useState<'Short' | 'Medium' | 'Detailed'>('Medium');
  const [summaryStyle, setSummaryStyle] = useState<
    'Simple Explanation' | 'Exam Revision' | 'Key Points'
  >('Simple Explanation');

  // Generator states
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [currentResult, setCurrentResult] = useState<SummaryRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Saved archive drawer / modal
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Sample notes quick loader helper for convenience
  const loadSampleNotes = () => {
    setNotesText(
      `Pipelining is an implementation technique whereby multiple instructions are overlapped in execution; it takes advantage of parallelism among the actions needed to execute an instruction.\n\nA classic 5-stage RISC pipeline consists of: Instruction Fetch (IF), Instruction Decode / Register Read (ID), Execution / Address Calculation (EX), Memory Access (MEM), and Write-back (WB).\n\nPipeline Hazards prevent the next instruction from executing in its designated clock cycle:\n1. Structural hazards: Resource conflicts when hardware cannot support all possible combinations of instructions.\n2. Data hazards: Instruction depends on the result of a prior instruction still in the pipeline (RAW, WAR, WAW). Data forwarding/bypassing can resolve RAW hazards without stalling.\n3. Control hazards: Caused by branch or jump instructions. Branch prediction (static or dynamic 2-bit saturating counters) and delayed branching help reduce stall penalties.`
    );
    setErrorMsg(null);
  };

  const handleSummarize = async () => {
    if (!notesText.trim() || notesText.trim().length < 20) {
      setErrorMsg('Please paste or type study notes with at least 20 characters.');
      return;
    }

    setErrorMsg(null);
    setIsSummarizing(true);
    setSavedSuccess(false);

    try {
      const selectedSub = subjects.find((s) => s.id === selectedSubjectId);
      const subjectName = selectedSub ? selectedSub.name : 'General Academic Notes';

      const data = await summarizeNotes({
        subjectName,
        notes: notesText,
        length: summaryLength,
        style: summaryStyle,
      });

      const generated: SummaryRecord = {
        id: `sum_${Date.now()}`,
        subjectId: selectedSubjectId,
        subjectName,
        title: `${subjectName} - ${summaryStyle}`,
        sourceNotes: notesText,
        length: summaryLength,
        style: summaryStyle,
        summary: data.summary || '',
        concepts: data.concepts || [],
        definitions: data.definitions || [],
        keyPoints: data.keyPoints || [],
        examples: data.examples || [],
        terminology: data.terminology || [],
        quickRevision: data.quickRevision || [],
        createdAt: new Date().toISOString(),
      };

      setCurrentResult(generated);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during note summarization.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCopy = () => {
    if (!currentResult) return;
    const textToCopy = `
# ${currentResult.title}
Length: ${currentResult.length} | Style: ${currentResult.style}

## SUMMARY
${currentResult.summary}

## MAIN CONCEPTS
${currentResult.concepts.map((c) => `- ${c}`).join('\n')}

## DEFINITIONS
${currentResult.definitions.map((d) => `- ${d.term}: ${d.definition}`).join('\n')}

## KEY POINTS
${currentResult.keyPoints.map((k) => `- ${k}`).join('\n')}

## QUICK REVISION NOTES
${currentResult.quickRevision.map((q) => `- ${q}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!currentResult) return;
    onSaveSummary(currentResult);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Notes Summarizer
            </h1>
            <span className="text-[11px] font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 px-2 py-0.5 rounded-full border border-violet-100 dark:border-violet-900/40 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Gemini Synthesis
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Paste lecture transcripts, textbook passages, or slides. Gemini distills definitions,
            verifiable examples, key points, and quick-revision flash summaries.
          </p>
        </div>

        <button
          onClick={() => setIsArchiveOpen(true)}
          className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shrink-0"
        >
          <FolderOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span>Saved Summaries ({savedSummaries.length})</span>
        </button>
      </div>

      {/* Main Workspace: Input Panel (Left) & Summary Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Lecture Notes Input</h2>
            <button
              onClick={loadSampleNotes}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
            >
              Paste Sample Notes
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Subject Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subject Context
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code || 'N/A'})
                </option>
              ))}
              <option value="">General Coursework</option>
            </select>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Summary Length
              </label>
              <select
                value={summaryLength}
                onChange={(e) =>
                  setSummaryLength(e.target.value as 'Short' | 'Medium' | 'Detailed')
                }
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Short">Short (Concise)</option>
                <option value="Medium">Medium (Balanced)</option>
                <option value="Detailed">Detailed (Comprehensive)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Output Style
              </label>
              <select
                value={summaryStyle}
                onChange={(e) =>
                  setSummaryStyle(
                    e.target.value as 'Simple Explanation' | 'Exam Revision' | 'Key Points'
                  )
                }
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Simple Explanation">Simple Explanation</option>
                <option value="Exam Revision">Exam Revision</option>
                <option value="Key Points">Key Points</option>
              </select>
            </div>
          </div>

          {/* Notes Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Paste Source Notes or Text *
              </label>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
                {notesText.length} characters
              </span>
            </div>
            <textarea
              rows={9}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Paste your lecture notes, textbook excerpt, study guide, or transcript here..."
              className="w-full p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono leading-relaxed"
            />
          </div>

          <button
            onClick={handleSummarize}
            disabled={isSummarizing || !notesText.trim()}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm shadow-blue-600/20"
          >
            <Sparkles className={`w-4 h-4 ${isSummarizing ? 'animate-spin' : ''}`} />
            <span>{isSummarizing ? 'Analyzing & Summarizing...' : 'Summarize Notes'}</span>
          </button>
        </div>

        {/* Right Column: Structured Output (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs min-h-[500px] flex flex-col justify-between transition-colors">
          <div>
            {/* Header of Results Card */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-2">
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {currentResult ? currentResult.title : 'Generated Summary & Concepts'}
                </h2>
                {currentResult && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Length: {currentResult.length} · Style: {currentResult.style}
                  </p>
                )}
              </div>

              {/* Action Buttons: Copy, Save, Regenerate */}
              {currentResult && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
                    title="Copy full summary to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleSave}
                    className="p-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="Save summary to storage archive"
                  >
                    {savedSuccess ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{savedSuccess ? 'Saved!' : 'Save'}</span>
                  </button>

                  <button
                    onClick={handleSummarize}
                    disabled={isSummarizing}
                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Regenerate summary"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Content Body */}
            {!currentResult ? (
              <div className="p-12 text-center my-auto flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Summary Generated Yet</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                  Input your study notes on the left and select your preferred revision style. Gemini
                  will extract concepts, verified definitions, and high-yield test points.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-6 overflow-y-auto max-h-[600px] pr-2">
                {/* 1. Core Summary */}
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Executive Summary
                  </h3>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {currentResult.summary}
                  </div>
                </div>

                {/* 2. Main Concepts */}
                {currentResult.concepts.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      Main Concepts
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentResult.concepts.map((concept, i) => (
                        <div
                          key={i}
                          className="p-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 flex items-start gap-2 shadow-xs"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0 mt-1.5" />
                          <span>{concept}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Important Definitions */}
                {currentResult.definitions.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      Key Definitions
                    </h3>
                    <div className="space-y-2">
                      {currentResult.definitions.map((def, i) => (
                        <div
                          key={i}
                          className="p-3 bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900/50 rounded-xl text-xs space-y-0.5"
                        >
                          <span className="font-bold text-teal-900 dark:text-teal-300 block">{def.term}</span>
                          <span className="text-slate-700 dark:text-slate-300 leading-relaxed block">
                            {def.definition}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Key Points */}
                {currentResult.keyPoints.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Key Takeaways
                    </h3>
                    <ul className="space-y-1.5">
                      {currentResult.keyPoints.map((pt, i) => (
                        <li
                          key={i}
                          className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 leading-relaxed"
                        >
                          <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 5. Examples contained in source material */}
                {currentResult.examples.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Examples from Notes
                    </h3>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      {currentResult.examples.map((ex, i) => (
                        <p key={i} className="italic">
                          "{ex}"
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Quick Revision Notes */}
                {currentResult.quickRevision.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                      Quick Revision Checklist
                    </h3>
                    <div className="p-3.5 bg-violet-50/50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 rounded-xl space-y-1.5">
                      {currentResult.quickRevision.map((q, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-violet-950 dark:text-violet-200 font-medium">
                          <Check className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Saved Summaries Drawer / Modal */}
      {isArchiveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsArchiveOpen(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[85vh] flex flex-col z-10 animate-in fade-in zoom-in-95 duration-150 transition-colors">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Saved Summaries Archive ({savedSummaries.length})
                </h2>
              </div>
              <button
                onClick={() => setIsArchiveOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {savedSummaries.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No saved summaries found</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Generate and save your first lecture summary to access it here anytime.
                  </p>
                </div>
              ) : (
                savedSummaries.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-start justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/40">
                        {item.subjectName}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1">
                        {item.summary}
                      </p>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-mono">
                        Saved: {item.createdAt.slice(0, 10)} · {item.concepts.length} concepts
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setCurrentResult(item);
                          setNotesText(item.sourceNotes);
                          setIsArchiveOpen(false);
                        }}
                        className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                        title="Delete summary"
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
      )}

      {/* Delete Confirmation Modal for Summaries */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6 z-10 animate-in fade-in zoom-in-95 duration-150 transition-colors">
            <h2 className="text-base font-bold text-slate-900 dark:text-white text-center">Delete Summary?</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
              Are you sure you want to delete this saved summary from your records?
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex-1 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteSummary(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex-1 shadow-xs transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
