import React, { useState } from 'react';
import {
  GraduationCap,
  X,
  User,
  Mail,
  Building,
  BookOpen,
  Award,
  Sparkles,
  CheckCircle2,
  Calendar,
  LogOut,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { AcademicLevel, StudentProfile, UserSettings } from '../../types/index.ts';

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSettings: UserSettings;
  onSaveProfile: (profile: StudentProfile, displayName: string) => void;
  onSignOut: () => void;
}

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  onClose,
  userSettings,
  onSaveProfile,
  onSignOut,
}) => {
  const profile = userSettings.studentProfile;

  // Form states
  const [fullName, setFullName] = useState(profile.fullName || userSettings.displayName || '');
  const [email, setEmail] = useState(profile.email || '');
  const [studentId, setStudentId] = useState(profile.studentId || '');
  const [institution, setInstitution] = useState(profile.institution || 'Marwadi University');
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>(
    profile.academicLevel || userSettings.academicLevel || 'university'
  );
  const [major, setMajor] = useState(profile.major || 'Computer Science & Engineering');
  const [currentSemester, setCurrentSemester] = useState(
    profile.currentSemester || 'Semester 5 (Fall 2026)'
  );
  const [learningStyle, setLearningStyle] = useState(
    profile.learningStyle || 'Active Recall & Problem Solving'
  );

  const [activeTab, setActiveTab] = useState<'view_card' | 'edit_profile'>(
    profile.isLoggedIn ? 'view_card' : 'edit_profile'
  );
  const [successNotice, setSuccessNotice] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: StudentProfile = {
      fullName: fullName.trim() || 'Student Scholar',
      email: email.trim() || 'student@university.edu',
      studentId: studentId.trim() || `STU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      institution: institution.trim() || 'University',
      academicLevel,
      major: major.trim() || 'General Studies',
      currentSemester: currentSemester.trim() || 'Current Term',
      learningStyle,
      isLoggedIn: true,
    };

    onSaveProfile(updatedProfile, updatedProfile.fullName);
    setSuccessNotice(true);
    setTimeout(() => {
      setSuccessNotice(false);
      setActiveTab('view_card');
    }, 1200);
  };

  const handleQuickDemoLogin = () => {
    const demoProfile: StudentProfile = {
      fullName: 'Alex Chen',
      email: 'alex.chen@university.edu',
      studentId: 'MU-2026-CS-8491',
      institution: 'Marwadi University',
      academicLevel: 'university',
      major: 'Computer Science & Engineering',
      currentSemester: 'Semester 5 (Year 3)',
      learningStyle: 'Active Recall & Problem Solving',
      isLoggedIn: true,
    };

    setFullName(demoProfile.fullName);
    setEmail(demoProfile.email);
    setStudentId(demoProfile.studentId);
    setInstitution(demoProfile.institution);
    setAcademicLevel(demoProfile.academicLevel);
    setMajor(demoProfile.major);
    setCurrentSemester(demoProfile.currentSemester);
    setLearningStyle(demoProfile.learningStyle);

    onSaveProfile(demoProfile, demoProfile.fullName);
    setActiveTab('view_card');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl max-h-[90vh] flex flex-col z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Student Academic Identity</h2>
              <p className="text-xs text-blue-100">StudyPilot AI Personalized Learning Profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: ID Card vs Edit Profile */}
        <div className="px-6 pt-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('view_card')}
              className={`pb-2.5 text-xs font-bold transition-colors relative ${
                activeTab === 'view_card'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Student Digital ID
              {activeTab === 'view_card' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('edit_profile')}
              className={`pb-2.5 text-xs font-bold transition-colors relative ${
                activeTab === 'edit_profile'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Academic Details Form
              {activeTab === 'edit_profile' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>
          </div>

          <button
            onClick={handleQuickDemoLogin}
            className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 mb-2"
          >
            <Sparkles className="w-3 h-3" />
            Quick Demo Student
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {successNotice && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Student profile successfully saved and verified!</span>
            </div>
          )}

          {/* TAB 1: Digital ID Card Preview */}
          {activeTab === 'view_card' && (
            <div className="space-y-6">
              {/* Virtual Student Card */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-slate-700 relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                  {/* Top card row */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest uppercase text-blue-300 block">
                        STUDENT IDENTITY CARD
                      </span>
                      <h3 className="text-sm font-bold text-slate-100 mt-0.5">
                        {institution || 'Academic Institution'}
                      </h3>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Student Name & ID */}
                  <div className="pt-2 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-violet-500 text-white flex items-center justify-center text-xl font-bold border-2 border-white/20 shadow-md">
                      {fullName ? fullName.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white tracking-tight">
                        {fullName || 'Student Scholar'}
                      </h4>
                      <p className="text-xs text-blue-200 font-mono">
                        ID: {studentId || 'STU-2026-UNASSIGNED'}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full mt-1 border border-emerald-400/30">
                        <ShieldCheck className="w-3 h-3" />
                        Active Student
                      </span>
                    </div>
                  </div>

                  {/* Course Details Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700/80 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        Degree / Major
                      </span>
                      <span className="font-semibold text-slate-200 truncate block">
                        {major || 'Undergraduate Coursework'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        Semester / Track
                      </span>
                      <span className="font-semibold text-slate-200 block">
                        {currentSemester || 'Semester 5'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        Learning Style
                      </span>
                      <span className="font-medium text-slate-300 block truncate">
                        {learningStyle}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        Email Address
                      </span>
                      <span className="font-mono text-slate-300 text-[11px] block truncate">
                        {email || 'alex.chen@university.edu'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Decorative background watermark */}
                <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('edit_profile')}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  Edit Academic Details
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="px-3.5 py-2 border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Switch Account</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-600/20"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Academic Details Form */}
          {activeTab === 'edit_profile' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Chen"
                    required
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alex.chen@university.edu"
                    required
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    University / College / School Name *
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Marwadi University"
                    required
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student ID / Roll Number
                  </label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. STU-2026-8491"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Level
                  </label>
                  <select
                    value={academicLevel}
                    onChange={(e) => setAcademicLevel(e.target.value as AcademicLevel)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="university">Undergraduate (Bachelor's)</option>
                    <option value="high_school">High School (Grade 9-12 / AP)</option>
                    <option value="competitive_exams">Competitive Exams / Graduate</option>
                    <option value="all">Comprehensive Track</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Major / Department
                  </label>
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="e.g. Computer Science, Pre-Med, Law"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Semester / Year
                  </label>
                  <input
                    type="text"
                    value={currentSemester}
                    onChange={(e) => setCurrentSemester(e.target.value)}
                    placeholder="e.g. Semester 5 (Fall 2026)"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Learning Style
                  </label>
                  <select
                    value={learningStyle}
                    onChange={(e) => setLearningStyle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active Recall & Problem Solving">
                      Active Recall & Problem Solving (Recommended)
                    </option>
                    <option value="Visual & Diagrammatic Analysis">
                      Visual & Diagrammatic Analysis
                    </option>
                    <option value="Structured Summaries & Checklists">
                      Structured Summaries & Checklists
                    </option>
                    <option value="Deep Theoretical Reading">Deep Theoretical Reading</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('view_card')}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-600/20"
                >
                  Save Academic Identity
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
