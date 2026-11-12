import React, { useState } from 'react';
import { User, Enrollment, Course, SupportedLocale } from '../types';
import { translations } from '../i18n/translations';
import { 
  CheckCircle2, 
  Video, 
  Headphones, 
  BookOpen, 
  Clock, 
  Sparkles,
  ArrowRight,
  Shield,
  FileCheck
} from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  enrollments: Enrollment[];
  courses: Course[];
  locale: SupportedLocale;
  onToggleReadiness: (courseId: number, isReady: boolean) => Promise<void>;
  onLaunchLiveSession: (course: Course) => void;
  onOpenAudioStudio: (course: Course) => void;
  onOpenCurriculumPdf: (course: Course) => void;
  onEnrollNewCourse: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  enrollments,
  courses,
  locale,
  onToggleReadiness,
  onLaunchLiveSession,
  onOpenAudioStudio,
  onOpenCurriculumPdf,
  onEnrollNewCourse,
}) => {
  const t = translations[locale];
  const [updatingCourseId, setUpdatingCourseId] = useState<number | null>(null);

  // Active paid enrollments
  const activeEnrollments = enrollments.filter(e => e.payment_status === 'completed');

  const handleToggle = async (courseId: number, currentReady: boolean) => {
    setUpdatingCourseId(courseId);
    try {
      await onToggleReadiness(courseId, !currentReady);
    } finally {
      setUpdatingCourseId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner & Student Status */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">STUDENT PORTAL</span>
            <span aria-hidden="true">·</span>
            <span>RESTRICTED PATHWAY: /student/dashboard</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-emerald-600">
              <Shield className="w-3.5 h-3.5" />
              <span>RBAC Token Verified</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Welcome back, {user.full_name.split(' ')[0]}!
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
            You have immediate access to your curated lesson plans, audio pronunciation recordings, and real-time live tutor instruction.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onEnrollNewCourse}
            className="px-4 py-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-xs rounded-xl shadow-xs transition-colors whitespace-nowrap"
          >
            + Enroll in Additional Dialect
          </button>
        </div>
      </div>

      {/* Primary Section: Active Enrolled Courses & Class Readiness Controls */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Active Enrolled Courses</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                {activeEnrollments.length} Active
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Instant access enabled via verified M-Pesa / Visa transactions.
            </p>
          </div>
        </div>

        {activeEnrollments.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No active enrollments yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Select a language course from the catalog to test instant checkout and receive your personalized curriculum.
            </p>
            <button
              onClick={onEnrollNewCourse}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl"
            >
              Browse Language Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {activeEnrollments.map((enrollment) => {
              const course = enrollment.course || courses.find(c => c.id === enrollment.course_id);
              if (!course) return null;

              return (
                <div
                  key={enrollment.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6"
                >
                  {/* Header Row */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                          {course.language_name}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Level: {course.level}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Paid & Verified</span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-[11px] text-slate-400">
                          Ref: {enrollment.transaction_ref || 'VERIFIED'}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
                        Lead Native Tutor: <strong className="text-slate-800 dark:text-slate-100">{course.tutor_name}</strong>
                      </p>
                    </div>

                    {/* Architectural Feature from Proposal: "I am Ready for Class" Toggle Switch */}
                    <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 min-w-[280px]">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {t.readyForClass}
                        </span>
                        
                        <button
                          onClick={() => handleToggle(course.id, enrollment.is_ready_for_class)}
                          disabled={updatingCourseId === course.id}
                          className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            enrollment.is_ready_for_class ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              enrollment.is_ready_for_class ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                        {enrollment.is_ready_for_class ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            {t.readyStatusActive}
                          </span>
                        ) : (
                          <span>{t.readyStatusInactive}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Curated Lesson Syllabus Cards */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span>Curated Syllabus & Study Modules</span>
                      <span className="text-slate-400 font-normal">Self-paced with Tutor Review</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mb-1">
                          MODULE 01
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                          Polite Greetings & Introductions
                        </div>
                        <div className="text-[11px] text-slate-500">Hujambo, Habari za asubuhi, Shikamoo etiquette</div>
                        <div className="mt-2 text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Completed</span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mb-1">
                          MODULE 02
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                          Market Bargaining & Currency
                        </div>
                        <div className="text-[11px] text-slate-500">Bei gani? Punguza kidogo, Safaricom payments</div>
                        <div className="mt-2 text-[10px] font-semibold text-blue-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>In Progress (60%)</span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[11px] text-slate-400 font-bold mb-1">
                          MODULE 03
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                          Transport & Direction Navigation
                        </div>
                        <div className="text-[11px] text-slate-500">Matatu stages, Bodaboda, Panda hapa, Kushoto</div>
                        <div className="mt-2 text-[10px] text-slate-400">Up next</div>
                      </div>

                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="text-[11px] text-slate-400 font-bold mb-1">
                          MODULE 04
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                          Indigenous Proverbs & Etiquette
                        </div>
                        <div className="text-[11px] text-slate-500">Methali za Kiswahili, Cultural hospitality</div>
                        <div className="mt-2 text-[10px] text-slate-400">Locked</div>
                      </div>
                    </div>
                  </div>

                  {/* Instant Action Bar for 3 Modalities */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      
                      {/* Modality 1: Live Interactive Tutoring */}
                      <button
                        onClick={() => onLaunchLiveSession(course)}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        <span>Launch Live Tutoring Room</span>
                      </button>

                      {/* Modality 2: Audio Pronunciation Studio */}
                      <button
                        onClick={() => onOpenAudioStudio(course)}
                        className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
                      >
                        <Headphones className="w-4 h-4" />
                        <span>Record & Check Pronunciation</span>
                      </button>

                      {/* Modality 3: PDF Curriculum Download & Reader */}
                      <button
                        onClick={() => onOpenCurriculumPdf(course)}
                        className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center gap-2"
                      >
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        <span>View Curriculum PDF</span>
                      </button>
                    </div>

                    <div className="text-xs text-slate-400">
                      Enrolled: {enrollment.enrolled_at.substring(0, 10)}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
