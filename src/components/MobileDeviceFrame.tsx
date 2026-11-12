import React, { useState } from 'react';
import { User, Course, Enrollment, AudioSubmission, SupportedLocale, UserRole } from '../types';
import { translations } from '../i18n/translations';
import { 
  BookOpen, 
  Video, 
  Headphones, 
  Shield, 
  UserCheck, 
  Wifi, 
  Battery, 
  Radio, 
  CreditCard,
  Volume2,
  Lock,
  ChevronRight,
  CheckCircle2,
  Mic
} from 'lucide-react';

interface MobileDeviceFrameProps {
  user: User;
  courses: Course[];
  enrollments: Enrollment[];
  audioSubmissions: AudioSubmission[];
  locale: SupportedLocale;
  currentUserRole: UserRole;
  onEnroll: (courseId: number) => void;
  onToggleReadiness: (courseId: number, isReady: boolean) => Promise<void>;
  onLaunchLive: (course: Course) => void;
  onOpenAudio: (course: Course) => void;
  onOpenPdf: (course: Course) => void;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({
  user,
  courses,
  enrollments,
  audioSubmissions,
  locale,
  currentUserRole,
  onEnroll,
  onToggleReadiness,
  onLaunchLive,
  onOpenAudio,
  onOpenPdf,
}) => {
  const t = translations[locale];
  const [mobileTab, setMobileTab] = useState<'home' | 'student' | 'live' | 'audio' | 'tutor'>('student');
  const paidEnrollments = enrollments.filter(e => e.payment_status === 'completed');

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4">
      
      {/* Mobile Device Mockup Frame */}
      <div className="w-[380px] h-[780px] bg-slate-950 rounded-[48px] p-3 shadow-2xl border-4 border-slate-700/80 relative flex flex-col overflow-hidden ring-1 ring-slate-800">
        
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-between px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Screen Bezel & Body */}
        <div className="w-full h-full bg-slate-50 dark:bg-slate-900 rounded-[40px] flex flex-col overflow-hidden relative text-slate-900 dark:text-white">
          
          {/* Mobile Status Bar (9:41, 5G, Battery) */}
          <div className="pt-3 px-6 h-10 flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 select-none shrink-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
            <span>09:41</span>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="text-[10px] font-bold">5G</span>
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4 text-emerald-500" />
            </div>
          </div>

          {/* Mobile Top App Bar */}
          <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                LS
              </span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                LughaSmart Mobile
              </span>
            </div>
            <div className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold">
              {currentUserRole.toUpperCase()}
            </div>
          </div>

          {/* Scrollable Screen Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 text-xs">
            
            {/* TAB 1: HOME / COURSES */}
            {mobileTab === 'home' && (
              <div className="space-y-4">
                <div>
                  <div className="text-[11px] text-emerald-600 font-bold uppercase">
                    Indigenous Dialects
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Explore Kenyan Languages
                  </h2>
                </div>

                <div className="space-y-3">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-600 uppercase text-[10px]">
                          {course.language_name}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {course.course_type}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {course.title}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white tabular-nums">
                          KES {course.price_kes.toLocaleString()}
                        </span>
                        <button
                          onClick={() => onEnroll(course.id)}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold text-xs"
                        >
                          Enroll
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: STUDENT DASHBOARD & READY TOGGLE */}
            {mobileTab === 'student' && (
              <div className="space-y-4">
                
                {/* Greeting Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm space-y-1">
                  <div className="text-[10px] uppercase font-bold opacity-80">Mobile Student Hub</div>
                  <div className="text-base font-extrabold">Hello, {user.full_name.split(' ')[0]}</div>
                  <div className="text-[11px] opacity-90">Instant access to lesson plans & live tutors</div>
                </div>

                {/* Readiness Toggle Card */}
                {paidEnrollments.length > 0 && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {t.readyForClass}
                      </span>
                      <button
                        onClick={() => onToggleReadiness(paidEnrollments[0].course_id, !paidEnrollments[0].is_ready_for_class)}
                        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
                          paidEnrollments[0].is_ready_for_class ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition ${
                            paidEnrollments[0].is_ready_for_class ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {paidEnrollments[0].is_ready_for_class ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          <span>Visible in Tutor's Live Queue</span>
                        </span>
                      ) : (
                        <span>Toggle when ready for instant live class</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Enrolled Courses */}
                <div className="space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white">Enrolled Programs</div>
                  {paidEnrollments.map((enr) => {
                    const c = enr.course || courses.find(x => x.id === enr.course_id);
                    if (!c) return null;
                    return (
                      <div
                        key={enr.id}
                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2"
                      >
                        <div className="font-bold text-slate-900 dark:text-white">{c.title}</div>
                        <div className="text-[11px] text-slate-500">Tutor: {c.tutor_name}</div>
                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                          <button
                            onClick={() => onLaunchLive(c)}
                            className="py-1.5 px-2 bg-blue-600 text-white rounded-lg text-[10px] font-semibold text-center"
                          >
                            Live Room
                          </button>
                          <button
                            onClick={() => onOpenAudio(c)}
                            className="py-1.5 px-2 bg-purple-600 text-white rounded-lg text-[10px] font-semibold text-center"
                          >
                            Audio Lab
                          </button>
                          <button
                            onClick={() => onOpenPdf(c)}
                            className="py-1.5 px-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-[10px] font-semibold text-center"
                          >
                            Syllabus
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* TAB 3: LIVE ROOM */}
            {mobileTab === 'live' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                  <div className="font-bold flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-emerald-400" />
                    <span>Live 1-on-1 Mobile Stream</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono">E2EE Locked</div>
                </div>

                <div className="aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative">
                  <img
                    src="/src/assets/images/tutor_amina_avatar_1794473845671.jpg"
                    alt="Tutor Amina"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white">
                    Dr. Amina Wambui
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">Active Phonics Lesson:</div>
                  <div className="italic text-slate-600 dark:text-slate-300">"Hujambo! Karibu nyumbani."</div>
                  <div className="text-emerald-600 font-medium">Cadence: High clarity, penultimate syllable stressed.</div>
                </div>
              </div>
            )}

            {/* TAB 4: AUDIO PRONUNCIATION */}
            {mobileTab === 'audio' && (
              <div className="space-y-4">
                <div className="font-bold text-slate-900 dark:text-white">
                  Mobile Pronunciation Checker
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-3">
                  <div className="text-xs text-purple-600 font-bold uppercase">Kiswahili Greeting</div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white">
                    "Habari yako rafiki?"
                  </div>
                  <div className="text-[11px] text-slate-500">How are you friend?</div>

                  <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-sm active:scale-95 transition-transform">
                    <Mic className="w-8 h-8" />
                  </div>
                  <div className="text-[10px] text-slate-400">Tap mic to record voice sample</div>
                </div>
              </div>
            )}

            {/* TAB 5: TUTOR RBAC SEGREGATION TEST */}
            {mobileTab === 'tutor' && (
              <div className="space-y-4">
                {currentUserRole === 'tutor' ? (
                  <div className="space-y-3">
                    <div className="font-bold text-slate-900 dark:text-white">Tutor Mobile Console</div>
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-900 dark:text-emerald-300">
                      <strong>1 Student Ready:</strong> John Miller waiting for Swahili session.
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 text-center space-y-2 text-red-900 dark:text-red-300">
                    <Shield className="w-8 h-8 text-red-600 mx-auto" />
                    <div className="font-bold text-sm">HTTP 403 Forbidden</div>
                    <div className="text-[11px]">
                      Student accounts cannot access tutor endpoints. Direct URL manipulation blocked by backend security.
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Ergonomic Mobile Bottom Tab Bar (Pattern 1 from Skill) */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-5 items-center px-1 z-40">
            
            <button
              onClick={() => setMobileTab('home')}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                mobileTab === 'home' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Courses</span>
            </button>

            <button
              onClick={() => setMobileTab('student')}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                mobileTab === 'student' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'
              }`}
            >
              <UserCheck className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">My Class</span>
            </button>

            <button
              onClick={() => setMobileTab('live')}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                mobileTab === 'live' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Video className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Live</span>
            </button>

            <button
              onClick={() => setMobileTab('audio')}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                mobileTab === 'audio' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Volume2 className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Pronounce</span>
            </button>

            <button
              onClick={() => setMobileTab('tutor')}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                mobileTab === 'tutor' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Tutor</span>
            </button>

          </div>

          {/* iPhone Home Swipe Bar */}
          <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-slate-400 dark:bg-slate-600 rounded-full z-50 pointer-events-none" />

        </div>

      </div>

    </div>
  );
};
