import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Calendar,
  Star,
  Check,
  AlertTriangle,
  X,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Subject, Topic } from '../../types/index.ts';
import { calculateSubjectProgress } from '../../utils/rules.ts';

interface SubjectsViewProps {
  subjects: Subject[];
  onSaveSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
  onToggleTopic: (subjectId: string, topicId: string) => void;
  onAddTopic: (subjectId: string, topicName: string) => void;
  onDeleteTopic: (subjectId: string, topicId: string) => void;
  onLoadStarterCourses?: () => void;
}

const COLOR_PRESETS = [
  '#2563EB', // Royal Blue
  '#0D9488', // Teal
  '#7C3AED', // Violet
  '#D97706', // Amber
  '#E11D48', // Rose
  '#059669', // Emerald
  '#4F46E5', // Indigo
];

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  onSaveSubject,
  onDeleteSubject,
  onToggleTopic,
  onAddTopic,
  onDeleteTopic,
  onLoadStarterCourses,
}) => {
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [examDate, setExamDate] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState(3);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Per-subject inline new topic input state
  const [newTopicInputs, setNewTopicInputs] = useState<Record<string, string>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  const openAddModal = () => {
    setEditingSubject(null);
    setName('');
    setCode('');
    setColor(COLOR_PRESETS[0]);
    setExamDate('');
    setConfidenceLevel(3);
    setNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (sub: Subject) => {
    setEditingSubject(sub);
    setName(sub.name);
    setCode(sub.code || '');
    setColor(sub.color || COLOR_PRESETS[0]);
    setExamDate(sub.examDate || '');
    setConfidenceLevel(sub.confidenceLevel || 3);
    setNotes(sub.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter a subject name.');
      return;
    }

    const updatedSubject: Subject = {
      id: editingSubject ? editingSubject.id : `sub_${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      color,
      examDate: examDate || undefined,
      confidenceLevel,
      notes: notes.trim() || undefined,
      topics: editingSubject ? editingSubject.topics : [],
      createdAt: editingSubject ? editingSubject.createdAt : new Date().toISOString(),
    };

    onSaveSubject(updatedSubject);
    setIsModalOpen(false);
  };

  const handleAddTopicSubmit = (subjectId: string) => {
    const topicName = (newTopicInputs[subjectId] || '').trim();
    if (!topicName) return;
    onAddTopic(subjectId, topicName);
    setNewTopicInputs((prev) => ({ ...prev, [subjectId]: '' }));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Subjects & Syllabus Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track course modules, schedule exam targets, and monitor topic completion across all semesters.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onLoadStarterCourses && subjects.length === 0 && (
            <button
              onClick={onLoadStarterCourses}
              className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Load Starter Template</span>
            </button>
          )}
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm shadow-blue-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Subject</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {subjects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center max-w-lg mx-auto shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">No Subjects Added Yet</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create your first academic course, add topics to its syllabus, and assign upcoming exam dates.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Add Subject Now
            </button>
            {onLoadStarterCourses && (
              <button
                onClick={onLoadStarterCourses}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Load Starter Template
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Subjects Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {subjects.map((sub) => {
            const progress = calculateSubjectProgress(sub);
            const isNotesExpanded = expandedNotes[sub.id];

            return (
              <div
                key={sub.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-colors"
              >
                <div>
                  {/* Top Header of Subject Card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs"
                        style={{ backgroundColor: sub.color || '#2563EB' }}
                      >
                        {sub.code ? sub.code.slice(0, 3) : sub.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                            {sub.name}
                          </h2>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                          <span className="font-mono font-medium text-slate-600 dark:text-slate-300">
                            {sub.code || 'NO-CODE'}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {sub.examDate ? `Exam: ${sub.examDate}` : 'No Exam Date'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Edit & Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditModal(sub)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Edit Subject"
                        aria-label={`Edit ${sub.name}`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(sub.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Delete Subject"
                        aria-label={`Delete ${sub.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Confidence Level & Completion Bar */}
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <span className="font-medium">Confidence:</span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= sub.confidenceLevel
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-slate-200 dark:text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">{progress}% Done</span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: sub.color || '#2563EB',
                        }}
                      />
                    </div>
                  </div>

                  {/* Syllabus Notes Collapsible */}
                  {sub.notes && (
                    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs">
                      <button
                        onClick={() =>
                          setExpandedNotes((prev) => ({ ...prev, [sub.id]: !prev[sub.id] }))
                        }
                        className="w-full flex items-center justify-between font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                          Syllabus Notes & Focus Areas
                        </span>
                        {isNotesExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {isNotesExpanded && (
                        <p className="mt-2 text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {sub.notes}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Topics List */}
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span>Syllabus Topics ({sub.topics.length})</span>
                      <span>
                        {sub.topics.filter((t) => t.completed).length} / {sub.topics.length}{' '}
                        completed
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {sub.topics.map((topic) => (
                        <div
                          key={topic.id}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all ${
                            topic.completed
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-slate-500 dark:text-slate-400'
                              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          <label className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={topic.completed}
                              onChange={() => onToggleTopic(sub.id, topic.id)}
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-slate-600 focus:ring-emerald-500"
                            />
                            <span className={`truncate ${topic.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'font-medium'}`}>
                              {topic.name}
                            </span>
                          </label>

                          <button
                            onClick={() => onDeleteTopic(sub.id, topic.id)}
                            className="p-1 text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 rounded transition-colors shrink-0 cursor-pointer"
                            title="Delete topic"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Inline Add Topic Input */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    value={newTopicInputs[sub.id] || ''}
                    onChange={(e) =>
                      setNewTopicInputs((prev) => ({ ...prev, [sub.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTopicSubmit(sub.id);
                      }
                    }}
                    placeholder="Add a new chapter or topic..."
                    className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTopicSubmit(sub.id)}
                    disabled={!(newTopicInputs[sub.id] || '').trim()}
                    aria-label={`Add topic to ${sub.name}`}
                    className="px-3 py-1.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                  >
                    Add Topic
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Computer Systems Architecture"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. CS 301"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Exam Date
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Confidence Level Radio Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Current Confidence Level: {confidenceLevel}/5
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setConfidenceLevel(lvl)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        confidenceLevel === lvl
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {lvl} {lvl === 1 ? '(Low)' : lvl === 5 ? '(High)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Preset Palette */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                        color === c ? 'scale-110 ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Syllabus Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Syllabus Notes / Focus Areas
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key textbook chapters, professor tips, exam weighting..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {editingSubject ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white text-center">
              Delete This Subject?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
              This will remove the course and all associated topics. This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex-1 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteSubject(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex-1 shadow-xs transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
