import React, { useState } from 'react';
import {
  Course,
  Enrollment,
  SharedMaterial,
  LanguageTest,
  TestSubmission,
  AudioSubmission,
  TutorRating,
  UserProfile,
  DailyLiveSession,
  ClassEmailNotification,
} from '../types';
import { WordGame } from './WordGame';
import { speakPhrase, playAudioChime } from '../utils/audio';
import {
  Video,
  Headphones,
  FileText,
  Image as ImageIcon,
  Gamepad2,
  ClipboardCheck,
  Star,
  CheckCircle2,
  ExternalLink,
  Volume2,
  Mic,
  Clock,
  Sparkles,
  Mail,
  Calendar,
} from 'lucide-react';

interface StudentEnrollmentAreaProps {
  currentUser: UserProfile;
  courses: Course[];
  enrollments: Enrollment[];
  liveSessions: DailyLiveSession[];
  emailNotifications: ClassEmailNotification[];
  materials: SharedMaterial[];
  tests: LanguageTest[];
  testSubmissions: TestSubmission[];
  audioSubmissions: AudioSubmission[];
  onEnrollCourse: (course: Course) => void;
  onToggleReady: (enrollmentId: string) => void;
  onToggleModuleComplete: (enrollmentId: string, moduleId: string) => void;
  onSubmitTest: (test: LanguageTest, selectedAnswers: Record<string, number>) => TestSubmission;
  onSubmitAudio: (courseId: string, language: string, phrase: string, score: number) => void;
  onSubmitRating: (rating: Omit<TutorRating, 'id' | 'createdAt'>) => void;
  onSaveWordGameScore: (languageName: string, score: number, pairsMatched: number) => void;
}

export const StudentEnrollmentArea: React.FC<StudentEnrollmentAreaProps> = ({
  currentUser,
  courses,
  enrollments,
  liveSessions,
  emailNotifications,
  materials,
  tests,
  testSubmissions,
  audioSubmissions,
  onEnrollCourse,
  onToggleReady,
  onToggleModuleComplete,
  onSubmitTest,
  onSubmitAudio,
  onSubmitRating,
  onSaveWordGameScore,
}) => {
  const [activeTab, setActiveTab] = useState<
    'classes' | 'materials' | 'audio' | 'games' | 'tests' | 'rate'
  >('classes');
  const [embeddedJitsiUrl, setEmbeddedJitsiUrl] = useState<string | null>(null);
  const [recordingPhrase, setRecordingPhrase] = useState('Hujambo! Habari gani leo?');
  const [isSimRecording, setIsSimRecording] = useState(false);
  const [activeTest, setActiveTest] = useState<LanguageTest | null>(null);
  const [testAnswers, setTestAnswers] = useState<Record<string, number>>({});
  const [lastTestResult, setLastTestResult] = useState<TestSubmission | null>(null);

  // Tutor rating form
  const [ratingStars, setRatingStars] = useState(5);
  const [satisfaction, setSatisfaction] = useState<TutorRating['satisfactionLevel']>('Very Satisfied');
  const [ratingComment, setRatingComment] = useState('');
  const [ratingCourseId, setRatingCourseId] = useState(courses[0]?.id || 'swahili-adult-101');
  const [ratingSaved, setRatingSaved] = useState(false);

  const activeEnrollments = enrollments.filter((e) => e.paymentStatus === 'completed');
  const hasMonthlyUnlimited = activeEnrollments.some((e) => e.planType === 'monthly_pass');
  const enrolledCourseIds = new Set(activeEnrollments.map((e) => e.courseId));

  const visibleLiveSessions = hasMonthlyUnlimited
    ? liveSessions
    : liveSessions.filter((s) => enrolledCourseIds.has(s.courseId));

  const myEmails = emailNotifications.filter(
    (m) =>
      m.recipientEmail.toLowerCase() === currentUser.email.toLowerCase() ||
      enrolledCourseIds.has(m.courseId)
  );

  const visibleMaterials = hasMonthlyUnlimited
    ? materials
    : materials.filter((m) => enrolledCourseIds.has(m.courseId));

  const visibleTests = hasMonthlyUnlimited
    ? tests
    : tests.filter((t) => enrolledCourseIds.has(t.courseId));

  const sharedImages = visibleMaterials.filter((m) => m.materialType === 'image');
  const sharedAudio = visibleMaterials.filter((m) => m.materialType === 'audio');
  const sharedPdfs = visibleMaterials.filter((m) => m.materialType === 'pdf');

  const handleRecordPronunciation = () => {
    setIsSimRecording(true);
    playAudioChime('record_start');
    setTimeout(() => {
      setIsSimRecording(false);
      playAudioChime('success');
      const score = Math.floor(88 + Math.random() * 11);
      const targetCourse = activeEnrollments[0] || {
        courseId: 'swahili-adult-101',
        languageName: 'Kiswahili (Swahili)',
      };
      onSubmitAudio(targetCourse.courseId, targetCourse.languageName, recordingPhrase, score);
    }, 1500);
  };

  const handleCompleteTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTest) return;
    const result = onSubmitTest(activeTest, testAnswers);
    setLastTestResult(result);
    setActiveTest(null);
    setTestAnswers({});
    playAudioChime('success');
  };

  const handleSendRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingComment.trim()) return;
    const course = courses.find((c) => c.id === ratingCourseId) || courses[0];
    onSubmitRating({
      studentUid: currentUser.uid,
      studentName: currentUser.fullName,
      courseId: course.id,
      languageName: course.languageName,
      tutorName: course.tutorName,
      rating: ratingStars,
      satisfactionLevel: satisfaction,
      comment: ratingComment.trim(),
    });
    setRatingComment('');
    setRatingSaved(true);
    playAudioChime('success');
    setTimeout(() => setRatingSaved(false), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Header Summary */}
      <div className="bg-white border border-[#E5E3DC] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-[#0F6B4B]">
            Student Enrollment Area · {currentUser.fullName} ({currentUser.email})
          </div>
          <h1 className="font-display text-3xl font-semibold text-[#18181B]">
            Your Classes, Schedule Updates & Study Materials
          </h1>
          <p className="text-sm text-[#52525B]">
            {hasMonthlyUnlimited
              ? 'Whole-Month Unlimited Pass active — unrestricted access to all live Jitsi rooms, catch-up audio recordings, and PDFs.'
              : 'Pay per session before class or upgrade to the discounted Monthly Pass for unlimited access.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              const first = courses[0];
              if (first) onEnrollCourse(first);
            }}
            className="px-4 py-2.5 bg-[#0F6B4B] hover:bg-[#0B533A] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            + Enroll / Upgrade Pass
          </button>
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F3F2EE] border border-[#E5E3DC] rounded-xl w-fit">
        {[
          { id: 'classes', label: 'Live Jitsi & Schedule', icon: Video },
          { id: 'materials', label: 'Shared Images & PDFs', icon: ImageIcon },
          { id: 'audio', label: 'Catch-Up Audio & Voice', icon: Headphones },
          { id: 'games', label: 'Kids Word Games', icon: Gamepad2 },
          { id: 'tests', label: 'Tests & Scores', icon: ClipboardCheck },
          { id: 'rate', label: 'Rate Tutor', icon: Star },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-[#18181B] shadow-2xs font-semibold'
                  : 'text-[#52525B] hover:text-[#18181B]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-[#0F6B4B]" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Gate if no enrollments */}
      {activeEnrollments.length === 0 && activeTab !== 'rate' ? (
        <div className="bg-white border border-[#E5E3DC] rounded-2xl p-10 text-center space-y-4">
          <h2 className="font-display text-2xl font-semibold text-[#18181B]">
            Payment Required Before Starting Class
          </h2>
          <p className="text-sm text-[#52525B] max-w-lg mx-auto">
            You are signed in! Complete payment for a single session (M-Pesa or Visa) or choose a discounted Whole-Month Unlimited Pass to unlock daily live Jitsi sessions, audio catch-up recordings, PDFs, and tests.
          </p>
          <button
            onClick={() => courses[0] && onEnrollCourse(courses[0])}
            className="px-5 py-2.5 bg-[#0F6B4B] text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Enroll Now
          </button>
        </div>
      ) : (
        <>
          {/* TAB 1: DAILY LIVE JITSI SCHEDULE, EMAIL NOTICES & MODULES */}
          {activeTab === 'classes' && (
            <div className="space-y-6">
              {embeddedJitsiUrl && (
                <div className="bg-white border border-[#E5E3DC] rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-[#E5E3DC] flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0F6B4B]">
                      Connected to Jitsi Classroom: {embeddedJitsiUrl}
                    </span>
                    <button
                      onClick={() => setEmbeddedJitsiUrl(null)}
                      className="text-[#52525B] hover:text-[#18181B] font-medium cursor-pointer"
                    >
                      Close Room View
                    </button>
                  </div>
                  <iframe
                    src={embeddedJitsiUrl}
                    title="LughaSmart Live Jitsi Session"
                    allow="camera; microphone; fullscreen; display-capture"
                    className="w-full h-[460px] border-0 bg-[#18181B]"
                  />
                </div>
              )}

              {/* Tutor Daily Live Session Updates + Class Time Email Notices */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white border border-[#E5E3DC] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-semibold text-[#18181B] flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#0F6B4B]" />
                      <span>Daily Live Sessions (Updated by Tutor)</span>
                    </h2>
                  </div>

                  {visibleLiveSessions.length === 0 ? (
                    <p className="text-xs text-[#71717A]">
                      No live sessions posted for your enrolled course today yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {visibleLiveSessions.map((sess) => (
                        <div
                          key={sess.id}
                          className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E3DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="text-xs text-[#52525B] flex items-center gap-2">
                              <span className="font-semibold text-[#0F6B4B]">{sess.languageName}</span>
                              <span>·</span>
                              <span className="font-mono">
                                {sess.sessionDate} ({sess.startTimeEat} – {sess.endTimeEat})
                              </span>
                              <span>·</span>
                              <span className="font-semibold text-[#18181B]">
                                {sess.status === 'live_now'
                                  ? 'Live Now'
                                  : sess.status === 'completed'
                                  ? 'Completed'
                                  : 'Scheduled'}
                              </span>
                            </div>
                            <div className="text-sm font-semibold text-[#18181B]">{sess.topic}</div>
                          </div>

                          <button
                            onClick={() => setEmbeddedJitsiUrl(sess.jitsiRoomUrl)}
                            className="px-3.5 py-2 bg-[#0F6B4B] hover:bg-[#0B533A] text-white rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Jitsi</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-5 bg-white border border-[#E5E3DC] rounded-2xl p-6 space-y-4">
                  <h2 className="font-display text-xl font-semibold text-[#18181B] flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#0F6B4B]" />
                    <span>Class Time Emails from Tutor</span>
                  </h2>

                  {myEmails.length === 0 ? (
                    <p className="text-xs text-[#71717A]">
                      No class-time update emails received yet.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {myEmails.map((mail) => (
                        <div
                          key={mail.id}
                          className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E3DC] space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between text-[11px] text-[#71717A]">
                            <span className="font-semibold text-[#0F6B4B]">{mail.languageName}</span>
                            <span className="font-mono">{mail.sentAt}</span>
                          </div>
                          <div className="font-semibold text-[#18181B]">{mail.subject}</div>
                          <div className="text-[11px] font-mono text-[#B45309]">
                            Class Time: {mail.classTimeInfo}
                          </div>
                          <p className="text-[#52525B] leading-relaxed">{mail.messageBody}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {activeEnrollments.map((enr) => {
                const course = courses.find((c) => c.id === enr.courseId);
                if (!course) return null;
                const pct = Math.round((enr.completedModuleIds.length / course.modules.length) * 100);

                return (
                  <div
                    key={enr.id}
                    className="bg-white border border-[#E5E3DC] rounded-2xl p-6 sm:p-8 space-y-6"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-xs text-[#52525B] flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-[#0F6B4B]">{course.languageName}</span>
                          <span>·</span>
                          <span>
                            {course.audience === 'adult' ? 'Adult Class (3 Hours)' : 'Children Session (1 Hour)'}
                          </span>
                          <span>·</span>
                          <span className="font-medium text-[#18181B]">
                            {enr.planType === 'monthly_pass' ? 'Monthly Unlimited Pass' : 'Per-Session Pass'}
                          </span>
                          <span>·</span>
                          <span className="font-mono text-[11px]">{enr.transactionRef}</span>
                        </div>
                        <h2 className="font-display text-2xl font-semibold text-[#18181B]">
                          {course.title}
                        </h2>
                        <div className="text-xs text-[#52525B] flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#0F6B4B]" />
                          <span>{enr.preferredSlot}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => onToggleReady(enr.id)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                            enr.isReadyForClass
                              ? 'bg-[#0F6B4B]/10 border-[#0F6B4B] text-[#0F6B4B]'
                              : 'bg-[#F3F2EE] border-[#E5E3DC] text-[#52525B]'
                          }`}
                        >
                          {enr.isReadyForClass ? 'Ready for Live Class' : 'Mark Ready for Class'}
                        </button>

                        <button
                          onClick={() => setEmbeddedJitsiUrl(enr.jitsiRoomUrl)}
                          className="px-4 py-2.5 bg-[#0F6B4B] hover:bg-[#0B533A] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Video className="w-4 h-4" />
                          <span>Open Jitsi Room Here</span>
                        </button>

                        <a
                          href={enr.jitsiRoomUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2.5 border border-[#E5E3DC] hover:bg-[#F3F2EE] text-[#18181B] rounded-xl text-xs font-medium flex items-center gap-1.5"
                        >
                          <span>New Tab</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Modules Covered */}
                    <div className="space-y-3 pt-4 border-t border-[#E5E3DC]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#18181B]">
                          Course Modules ({enr.completedModuleIds.length}/{course.modules.length} Covered)
                        </span>
                        <span className="font-mono font-semibold text-[#0F6B4B] tabular-nums">
                          {pct}% Complete
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {course.modules.map((mod, idx) => {
                          const done = enr.completedModuleIds.includes(mod.id);
                          return (
                            <button
                              key={mod.id}
                              onClick={() => onToggleModuleComplete(enr.id, mod.id)}
                              className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                                done
                                  ? 'bg-[#0F6B4B]/5 border-[#0F6B4B]/40'
                                  : 'bg-[#FAFAF8] border-[#E5E3DC] hover:border-[#A1A1AA]'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[11px] font-mono text-[#71717A] mb-1">
                                <span>Module 0{idx + 1}</span>
                                {done && <CheckCircle2 className="w-3.5 h-3.5 text-[#0F6B4B]" />}
                              </div>
                              <div className="text-xs font-semibold text-[#18181B]">{mod.title}</div>
                              <div className="text-[11px] text-[#52525B] mt-1">{mod.summary}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: TUTOR-SHARED EXPLANATION IMAGES & UPLOADED PDFS */}
          {activeTab === 'materials' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[#18181B]">
                    Tutor-Shared Explanation Images
                  </h2>
                  <p className="text-xs text-[#52525B]">
                    Visual aids and picture flashcards shared by your tutor for clear understanding.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sharedImages.map((img) => (
                    <div
                      key={img.id}
                      className="bg-white border border-[#E5E3DC] rounded-2xl overflow-hidden flex flex-col justify-between"
                    >
                      <div className="aspect-[4/3] bg-[#F3F2EE] border-b border-[#E5E3DC]">
                        <img
                          src={img.mediaUrl}
                          alt={img.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-5 space-y-2">
                        <div className="text-[11px] font-semibold text-[#0F6B4B]">
                          {img.languageName} · Shared by {img.tutorName}
                        </div>
                        <h3 className="text-sm font-semibold text-[#18181B]">{img.title}</h3>
                        <p className="text-xs text-[#52525B] leading-relaxed">{img.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[#18181B]">
                    Uploaded Curriculum PDFs
                  </h2>
                  <p className="text-xs text-[#52525B]">
                    Study guides and lesson workbooks uploaded by your tutor.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sharedPdfs.map((pdf) => (
                    <div
                      key={pdf.id}
                      className="bg-white border border-[#E5E3DC] rounded-2xl p-5 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-semibold text-[#0F6B4B]">
                          {pdf.languageName} · {pdf.fileName}
                        </div>
                        <h3 className="text-sm font-semibold text-[#18181B]">{pdf.title}</h3>
                        <p className="text-xs text-[#52525B]">{pdf.description}</p>
                      </div>
                      <a
                        href={pdf.mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-[#F3F2EE] hover:bg-[#E8E6DF] text-[#18181B] rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#0F6B4B]" />
                        <span>Open PDF</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATCH-UP AUDIO RECORDINGS & PRONUNCIATION RECORDER */}
          {activeTab === 'audio' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[#18181B]">
                    Catch-Up Audio Recordings
                  </h2>
                  <p className="text-xs text-[#52525B]">
                    Listen anytime if you have a tight schedule and missed a live session.
                  </p>
                </div>

                {sharedAudio.map((aud) => (
                  <div
                    key={aud.id}
                    className="bg-white border border-[#E5E3DC] rounded-2xl p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs text-[#52525B]">
                      <span className="font-semibold text-[#0F6B4B]">{aud.languageName}</span>
                      <span className="font-mono tabular-nums">{aud.durationLabel || '10:00 min'}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-[#18181B]">{aud.title}</h3>
                    <p className="text-xs text-[#52525B]">{aud.description}</p>
                    <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E3DC] flex items-center justify-between gap-4">
                      <span className="text-xs italic text-[#3F3F46]">"{aud.mediaUrl}"</span>
                      <button
                        onClick={() => speakPhrase(aud.mediaUrl)}
                        className="px-3.5 py-2 bg-[#0F6B4B] hover:bg-[#0B533A] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Play Audio</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-5 bg-white border border-[#E5E3DC] rounded-2xl p-6 space-y-5 h-fit">
                <div>
                  <h3 className="font-display text-xl font-semibold text-[#18181B]">
                    Practice Pronunciation
                  </h3>
                  <p className="text-xs text-[#52525B] mt-1">
                    Record a phrase for tutor pronunciation review.
                  </p>
                </div>

                <input
                  type="text"
                  value={recordingPhrase}
                  onChange={(e) => setRecordingPhrase(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4D4D8] text-xs"
                />

                <button
                  onClick={handleRecordPronunciation}
                  disabled={isSimRecording}
                  className="w-full py-2.5 bg-[#0F6B4B] hover:bg-[#0B533A] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>{isSimRecording ? 'Recording Voice Sample...' : 'Record & Submit to Tutor'}</span>
                </button>

                <div className="space-y-2.5 pt-3 border-t border-[#E5E3DC]">
                  <div className="text-xs font-semibold text-[#18181B]">Your Recent Recordings</div>
                  {audioSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E3DC] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#18181B]">{sub.phrase}</span>
                        <span className="font-mono text-[#0F6B4B] font-semibold tabular-nums">
                          {sub.accuracyScore}%
                        </span>
                      </div>
                      <div className="text-[11px] text-[#52525B]">
                        Tutor Feedback: {sub.tutorFeedback || 'Pending tutor review'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHILDREN'S INTERACTIVE WORD GAMES */}
          {activeTab === 'games' && <WordGame onSaveScore={onSaveWordGameScore} />}

          {/* TAB 5: TESTS & PROGRESS */}
          {activeTab === 'tests' && (
            <div className="space-y-6">
              {lastTestResult && (
                <div className="p-4 rounded-xl bg-[#0F6B4B]/10 border border-[#0F6B4B]/30 text-xs text-[#0F6B4B] flex items-center gap-2 font-semibold">
                  <Sparkles className="w-4 h-4" />
                  <span>
                    Test Submitted: "{lastTestResult.testTitle}" — Score: {lastTestResult.scorePercent}% ({lastTestResult.correctCount}/{lastTestResult.totalCount} correct)
                  </span>
                </div>
              )}

              {activeTest ? (
                <form
                  onSubmit={handleCompleteTest}
                  className="bg-white border border-[#E5E3DC] rounded-2xl p-6 sm:p-8 space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-[#E5E3DC] pb-4">
                    <div>
                      <div className="text-xs font-semibold text-[#0F6B4B]">{activeTest.languageName}</div>
                      <h3 className="font-display text-2xl font-semibold text-[#18181B]">
                        {activeTest.title}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTest(null)}
                      className="text-xs text-[#52525B] hover:text-[#18181B] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="space-y-6">
                    {activeTest.questions.map((q, qIdx) => (
                      <div key={q.id} className="space-y-2.5">
                        <div className="text-sm font-semibold text-[#18181B]">
                          {qIdx + 1}. {q.prompt}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {q.options.map((opt, oIdx) => (
                            <label
                              key={oIdx}
                              className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 cursor-pointer ${
                                testAnswers[q.id] === oIdx
                                  ? 'border-[#0F6B4B] bg-[#0F6B4B]/5 font-semibold'
                                  : 'border-[#E5E3DC]'
                              }`}
                            >
                              <input
                                type="radio"
                                name={q.id}
                                checked={testAnswers[q.id] === oIdx}
                                onChange={() => setTestAnswers({ ...testAnswers, [q.id]: oIdx })}
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#0F6B4B] hover:bg-[#0B533A] text-white text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Submit Test Answers
                  </button>
                </form>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 space-y-4">
                    <h2 className="font-display text-2xl font-semibold text-[#18181B]">
                      Assigned Tutor Tests
                    </h2>
                    {visibleTests.map((test) => (
                      <div
                        key={test.id}
                        className="bg-white border border-[#E5E3DC] rounded-2xl p-5 flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="text-[11px] font-semibold text-[#0F6B4B]">
                            {test.languageName} · {test.questions.length} Questions
                          </div>
                          <h3 className="text-sm font-semibold text-[#18181B]">{test.title}</h3>
                          <p className="text-xs text-[#52525B]">{test.description}</p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTest(test);
                            setTestAnswers({});
                          }}
                          className="px-4 py-2 bg-[#0F6B4B] hover:bg-[#0B533A] text-white text-xs font-semibold rounded-xl shrink-0 cursor-pointer"
                        >
                          Start Test
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="lg:col-span-5 bg-white border border-[#E5E3DC] rounded-2xl p-6 space-y-4 h-fit">
                    <h3 className="font-display text-xl font-semibold text-[#18181B]">
                      Your Recorded Scores
                    </h3>
                    {testSubmissions.length === 0 ? (
                      <p className="text-xs text-[#71717A]">No tests completed yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {testSubmissions.map((sub) => (
                          <div
                            key={sub.id}
                            className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E3DC] flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-semibold text-[#18181B]">{sub.testTitle}</div>
                              <div className="text-[11px] text-[#71717A]">{sub.submittedAt}</div>
                            </div>
                            <div className="font-mono text-base font-semibold text-[#0F6B4B] tabular-nums">
                              {sub.scorePercent}%
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* TAB 6: RATE TUTOR & SATISFACTION */}
      {activeTab === 'rate' && (
        <div className="max-w-2xl bg-white border border-[#E5E3DC] rounded-2xl p-6 sm:p-8 space-y-5">
          <div>
            <div className="text-xs font-semibold text-[#0F6B4B]">Student Satisfaction</div>
            <h2 className="font-display text-2xl font-semibold text-[#18181B]">
              Rate Your Tutor’s Work
            </h2>
            <p className="text-xs text-[#52525B] mt-1">
              Share your experience so prospective learners and tutors can see class satisfaction.
            </p>
          </div>

          {ratingSaved && (
            <div className="p-3 rounded-xl bg-[#0F6B4B]/10 border border-[#0F6B4B]/30 text-xs text-[#0F6B4B] font-semibold">
              Thank you! Your rating has been published to the Satisfaction section.
            </div>
          )}

          <form onSubmit={handleSendRating} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-[#3F3F46] mb-1">Course & Tutor</label>
              <select
                value={ratingCourseId}
                onChange={(e) => setRatingCourseId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4D4D8] bg-white"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.languageName} — {c.tutorName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-[#3F3F46] mb-1">Star Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRatingStars(num)}
                      className="p-1.5 cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          num <= ratingStars ? 'fill-[#B45309] text-[#B45309]' : 'text-[#D4D4D8]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#3F3F46] mb-1">Satisfaction Level</label>
                <select
                  value={satisfaction}
                  onChange={(e) =>
                    setSatisfaction(e.target.value as TutorRating['satisfactionLevel'])
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4D4D8] bg-white"
                >
                  <option value="Very Satisfied">Very Satisfied</option>
                  <option value="Satisfied">Satisfied</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#3F3F46] mb-1">Your Review</label>
              <textarea
                rows={3}
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Share how the live sessions, shared images, or audio catch-up helped you..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4D4D8]"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#0F6B4B] hover:bg-[#0B533A] text-white font-semibold rounded-xl cursor-pointer"
            >
              Submit Rating
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
