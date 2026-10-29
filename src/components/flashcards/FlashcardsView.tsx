import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  RotateCw,
  Shuffle,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Plus,
  Save,
  FolderOpen,
  Trash2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Flashcard, FlashcardSet, Subject } from '../../types/index.ts';

interface FlashcardsViewProps {
  subjects: Subject[];
  flashcardSets: FlashcardSet[];
  onSaveFlashcardSet: (set: FlashcardSet) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  subjects,
  flashcardSets,
  onSaveFlashcardSet,
}) => {
  // Creator states
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects.length > 0 ? subjects[0].id : ''
  );
  const [topicOrNotes, setTopicOrNotes] = useState<string>('');
  const [cardCount, setCardCount] = useState<number>(6);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Active flashcard deck state
  const [activeSet, setActiveSet] = useState<FlashcardSet | null>(
    flashcardSets.length > 0 ? flashcardSets[0] : null
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Keyboard navigation support (Space to flip, Left/Right arrows to navigate)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSet, currentIndex]);

  const handleNext = () => {
    if (!activeSet || activeSet.cards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % activeSet.cards.length);
  };

  const handlePrev = () => {
    if (!activeSet || activeSet.cards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + activeSet.cards.length) % activeSet.cards.length);
  };

  const handleShuffle = () => {
    if (!activeSet) return;
    const shuffledCards = [...activeSet.cards].sort(() => Math.random() - 0.5);
    setActiveSet({
      ...activeSet,
      cards: shuffledCards,
    });
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const toggleMarkKnown = () => {
    if (!activeSet) return;
    const currentCard = activeSet.cards[currentIndex];
    const updatedCards = activeSet.cards.map((c, i) =>
      i === currentIndex ? { ...c, known: !c.known, needsRevision: false } : c
    );
    const updatedSet = { ...activeSet, cards: updatedCards };
    setActiveSet(updatedSet);
    onSaveFlashcardSet(updatedSet);
  };

  const toggleMarkRevision = () => {
    if (!activeSet) return;
    const updatedCards = activeSet.cards.map((c, i) =>
      i === currentIndex ? { ...c, needsRevision: !c.needsRevision, known: false } : c
    );
    const updatedSet = { ...activeSet, cards: updatedCards };
    setActiveSet(updatedSet);
    onSaveFlashcardSet(updatedSet);
  };

  const handleGenerate = async () => {
    if (!topicOrNotes.trim()) {
      setApiError('Please enter a topic or paste study notes to generate cards.');
      return;
    }

    setApiError(null);
    setIsGenerating(true);

    try {
      const selectedSub = subjects.find((s) => s.id === selectedSubjectId);
      const subjectName = selectedSub ? selectedSub.name : 'General Academic Subject';

      const res = await fetch('/api/gemini/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName,
          topicOrNotes,
          count: cardCount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate flashcards from Gemini.');
      }

      const cards: Flashcard[] = (data.cards || []).map((c: any, i: number) => ({
        id: c.id || `card_${Date.now()}_${i}`,
        front: c.front,
        back: c.back,
        known: false,
        needsRevision: false,
      }));

      if (cards.length === 0) {
        throw new Error('No flashcards returned from model. Please retry.');
      }

      const newSet: FlashcardSet = {
        id: `fc_set_${Date.now()}`,
        subjectId: selectedSubjectId,
        subjectName,
        title: `${subjectName} - ${topicOrNotes.slice(0, 30)}`,
        cards,
        createdAt: new Date().toISOString(),
      };

      onSaveFlashcardSet(newSet);
      setActiveSet(newSet);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'An error occurred while generating flashcards.');
    } finally {
      setIsGenerating(false);
    }
  };

  const cards = activeSet?.cards || [];
  const currentCard = cards[currentIndex];
  const knownCount = cards.filter((c) => c.known).length;
  const revisionCount = cards.filter((c) => c.needsRevision).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Active Recall Flashcards
            </h1>
            <span className="text-[11px] font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 px-2 py-0.5 rounded-full border border-violet-100 dark:border-violet-900/40 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Spaced Repetition
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Test and reinforce memory retention with interactive 3D flip cards, shuffle, and mastery flags.
            Keyboard shortcuts: <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] text-slate-700 dark:text-slate-300">Space</kbd> to flip, <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] text-slate-700 dark:text-slate-300">←</kbd> <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] text-slate-700 dark:text-slate-300">→</kbd> to navigate.
          </p>
        </div>

        {/* Existing decks selector */}
        {flashcardSets.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={activeSet?.id || ''}
              onChange={(e) => {
                const found = flashcardSets.find((s) => s.id === e.target.value);
                if (found) {
                  setActiveSet(found);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }
              }}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {flashcardSets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.cards.length} cards)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Grid: Card Player (Center/Left) & Generator Form (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive 3D Flashcard Player (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {!activeSet || cards.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center transition-colors">
              <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Flashcard Deck Selected</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Generate a set on the right to start your active recall drill session.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5 transition-colors">
              {/* Deck Info & Mini Counters */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-2">
                <div>
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/40">
                    {activeSet.subjectName}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
                    {activeSet.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold tabular-nums">
                  <span className="text-slate-500 dark:text-slate-400">
                    Card {currentIndex + 1} of {cards.length}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/40">
                    {knownCount} Known
                  </span>
                  <span className="text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-100 dark:border-amber-900/40">
                    {revisionCount} Review
                  </span>
                </div>
              </div>

              {/* 3D Flip Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && setIsFlipped(!isFlipped)}
                className="relative w-full h-72 sm:h-80 cursor-pointer select-none perspective-[1000px] group"
                aria-label="Click to flip flashcard"
              >
                <div
                  className={`w-full h-full duration-500 preserve-3d transition-transform rounded-2xl ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'none',
                  }}
                >
                  {/* FRONT SIDE (Prompt / Question) */}
                  <div
                    className="absolute inset-0 w-full h-full bg-slate-50 dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 group-hover:border-blue-400 dark:group-hover:border-blue-500 rounded-2xl p-6 sm:p-8 flex flex-col justify-between backface-hidden shadow-xs transition-colors"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Prompt / Term
                      </span>
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-400 flex items-center gap-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        <RotateCw className="w-3.5 h-3.5" />
                        Click to Reveal
                      </span>
                    </div>

                    <div className="my-auto text-center px-4">
                      <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                        {currentCard?.front}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                      <span>Front</span>
                      <span>Press Space to Flip</span>
                    </div>
                  </div>

                  {/* BACK SIDE (Answer / Definition) */}
                  <div
                    className="absolute inset-0 w-full h-full bg-blue-900 dark:bg-blue-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between backface-hidden shadow-md border border-blue-800 dark:border-blue-900"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <div className="flex items-center justify-between text-blue-200 text-[11px] font-bold uppercase tracking-wider">
                      <span>Answer / Explanation</span>
                      <span className="flex items-center gap-1 text-xs text-blue-300">
                        <RotateCw className="w-3.5 h-3.5" />
                        Click to Flip Back
                      </span>
                    </div>

                    <div className="my-auto text-center px-4">
                      <p className="text-base sm:text-lg font-medium text-blue-50 leading-relaxed">
                        {currentCard?.back}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-blue-300">
                      <span>Back</span>
                      <span>Press Space to Flip</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Player Navigation & Status Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMarkKnown}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                      currentCard?.known
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{currentCard?.known ? 'Marked Known' : 'Mark as Known'}</span>
                  </button>

                  <button
                    onClick={toggleMarkRevision}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                      currentCard?.needsRevision
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{currentCard?.needsRevision ? 'Needs Review' : 'Mark for Review'}</span>
                  </button>

                  <button
                    onClick={handleShuffle}
                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Shuffle cards"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={handlePrev}
                    className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                    title="Previous Card"
                    aria-label="Previous Card"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 tabular-nums px-2">
                    {currentIndex + 1} / {cards.length}
                  </span>
                  <button
                    onClick={handleNext}
                    className="p-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white rounded-lg transition-colors"
                    title="Next Card"
                    aria-label="Next Card"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Flashcard Generator Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Generate New Flashcard Set</h2>
            <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>

          {apiError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Subject Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Subject
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
              <option value="">General Study Topic</option>
            </select>
          </div>

          {/* Topic or Notes Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Topic or Notes Material *
            </label>
            <textarea
              rows={5}
              value={topicOrNotes}
              onChange={(e) => setTopicOrNotes(e.target.value)}
              placeholder="e.g. Memory Hierarchy, L1/L2 Caches, Hit Rate, and Cache Replacement Policies..."
              className="w-full p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800/80 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
            />
          </div>

          {/* Card Count Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Number of Cards
            </label>
            <select
              value={cardCount}
              onChange={(e) => setCardCount(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 Cards</option>
              <option value={8}>8 Cards (Recommended)</option>
              <option value={12}>12 Cards</option>
              <option value={15}>15 Cards</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topicOrNotes.trim()}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing Deck...' : 'Generate Flashcards'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
