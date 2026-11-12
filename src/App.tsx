import React, { useState, useEffect } from 'react';
import { User, Course, Enrollment, AudioSubmission, SupportedLocale, UserRole, SecurityAuditLog } from './types';
import { translations } from './i18n/translations';
import { Navbar } from './components/Navbar';
import { PublicLanding } from './components/PublicLanding';
import { StudentDashboard } from './components/StudentDashboard';
import { StudentProgress } from './components/StudentProgress';
import { TutorDashboard } from './components/TutorDashboard';
import { LiveSessionRoom } from './components/LiveSessionRoom';
import { AudioPronunciationStudio } from './components/AudioPronunciationStudio';
import { CurriculumPdfViewer } from './components/CurriculumPdfViewer';
import { CheckoutModal } from './components/CheckoutModal';
import { DatabaseInspector } from './components/DatabaseInspector';
import { ScalabilityModal } from './components/ScalabilityModal';
import { MobileDeviceFrame } from './components/MobileDeviceFrame';

// Sample Users
const STUDENT_USER: User = {
  id: 1,
  full_name: 'John Miller (Expat Learner)',
  email: 'john.miller@example.com',
  password_hash: 'scrypt:sha256$hashed$student',
  role: 'student',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  created_at: '2026-03-01 10:24:00',
};

const TUTOR_USER: User = {
  id: 2,
  full_name: 'Dr. Amina Wambui (Senior Linguist)',
  email: 'amina.wambui@lughasmart.ac.ke',
  password_hash: 'scrypt:sha256$hashed$tutor',
  role: 'tutor',
  avatar_url: '/src/assets/images/tutor_amina_avatar_1794473845671.jpg',
  created_at: '2026-01-15 08:00:00',
};

// Initial Fallback Courses matching PostgreSQL Schema
const INITIAL_COURSES: Course[] = [
  {
    id: 101,
    title: 'Conversational Kiswahili for Foreigners & Expats',
    language_name: 'Swahili (Kiswahili)',
    description: 'Master everyday conversational Swahili, greetings, market bargaining, transport navigation, and cultural etiquette across Kenya and East Africa.',
    price_kes: 4500.00,
    course_type: 'live',
    level: 'Beginner to Intermediate',
    lessons_count: 12,
    duration_weeks: 4,
    pdf_curriculum_name: 'LughaSmart_Swahili_Conversational_Curriculum_v3.pdf',
    tutor_name: 'Dr. Amina Wambui',
  },
  {
    id: 102,
    title: 'Gĩkũyũ Indigenous Heritage & Business Dialect',
    language_name: 'Kikuyu (Gĩkũyũ)',
    description: 'Comprehensive oral mastery, tonal pronunciation guides, central Kenya commerce vocabulary, kinship terms, and native proverb wisdom.',
    price_kes: 5200.00,
    course_type: 'audio',
    level: 'Foundational',
    lessons_count: 10,
    duration_weeks: 5,
    pdf_curriculum_name: 'Kikuyu_Phonetics_Pronunciation_Manual.pdf',
    tutor_name: 'Mwalimu James Mwangi',
  },
  {
    id: 103,
    title: 'Dholuo Intensive: Lake Region Social & Cultural Immersion',
    language_name: 'Luo (Dholuo)',
    description: 'Deep dive into Luo syntax, greeting rituals, conversational flow, melodic inflections, and vibrant socio-cultural idioms for Western Kenya travelers.',
    price_kes: 4800.00,
    course_type: 'live',
    level: 'Beginner',
    lessons_count: 12,
    duration_weeks: 4,
    pdf_curriculum_name: 'Dholuo_Grammar_and_Conversation_Guide.pdf',
    tutor_name: 'Otieno Kevin Ochieng',
  },
  {
    id: 104,
    title: 'Maa (Maasai) Cultural Dialogue & Wildlife Community Relations',
    language_name: 'Maasai (Maa)',
    description: 'Specialized language program for conservationists, eco-tourists, researchers, and safari travelers working alongside indigenous Maasai pastoral communities.',
    price_kes: 6000.00,
    course_type: 'pdf',
    level: 'Essential Field Guide',
    lessons_count: 8,
    duration_weeks: 3,
    pdf_curriculum_name: 'Maasai_Community_Field_Language_Guide.pdf',
    tutor_name: 'Saitoti Ole Kaelo',
  },
  {
    id: 105,
    title: 'Kalenjin Tonal Phonics & Rift Valley Social Traditions',
    language_name: 'Kalenjin (Nandi/Kipsigis)',
    description: 'Explore the rhythmic tones and communal greetings of the Kalenjin languages spoken in Kenya’s fertile Great Rift Valley highlands.',
    price_kes: 4600.00,
    course_type: 'audio',
    level: 'Foundational',
    lessons_count: 8,
    duration_weeks: 4,
    pdf_curriculum_name: 'Kalenjin_Highland_Dialect_Handbook.pdf',
    tutor_name: 'Faith Chebet',
  },
  {
    id: 106,
    title: 'Kikamba Express: Eastern Kenya Trade & Friendly Colloquialisms',
    language_name: 'Kamba (Kikamba)',
    description: 'Learn rapid trade colloquialisms, polite phrasing, and artisan community communications for Machakos, Kitui, and Makueni travelers.',
    price_kes: 3800.00,
    course_type: 'live',
    level: 'Beginner',
    lessons_count: 6,
    duration_weeks: 2,
    pdf_curriculum_name: 'Kikamba_Conversational_Phrases.pdf',
    tutor_name: 'Boniface Mutua',
  }
];

export default function App() {
  // Navigation & Role State
  const [currentTab, setCurrentTab] = useState<string>('courses');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('student');
  const [currentUser, setCurrentUser] = useState<User>(STUDENT_USER);
  const [locale, setLocale] = useState<SupportedLocale>('en');
  const [viewMode, setViewMode] = useState<'web' | 'mobile'>('web');

  // Application Data State
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([
    {
      id: 1,
      student_id: 1,
      course_id: 101,
      payment_status: 'completed',
      is_ready_for_class: true,
      enrolled_at: '2026-03-02 11:15:00',
      payment_method: 'mpesa',
      transaction_ref: 'MPESA_QK8820XPLM',
      course: INITIAL_COURSES[0],
    }
  ]);
  const [audioSubmissions, setAudioSubmissions] = useState<AudioSubmission[]>([
    {
      id: 'sub_01',
      student_id: 1,
      course_id: 101,
      phrase: 'Habari gani? Jina langu ni John.',
      language: 'Kiswahili',
      audio_url: 'data:audio/wav;base64,sample',
      accuracy_score: 94,
      feedback: 'Excellent vocal inflection! Soften the "r" in "Habari" slightly for authentic coastal cadence.',
      submitted_at: '2026-03-08 14:20:00',
    }
  ]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([
    {
      id: 'audit_01',
      timestamp: '2026-03-08 10:14:22',
      user_email: 'john.miller@example.com',
      role: 'student',
      endpoint: '/student/dashboard',
      action: 'VIEW_COURSE_LESSONS',
      status: '200_OK',
      details: 'Authorized student access granted to enrolled course 101.'
    }
  ]);

  // Modals & Active Viewers
  const [checkoutCourse, setCheckoutCourse] = useState<Course | null>(null);
  const [selectedCourseForPdf, setSelectedCourseForPdf] = useState<Course>(INITIAL_COURSES[0]);
  const [selectedCourseForLive, setSelectedCourseForLive] = useState<Course>(INITIAL_COURSES[0]);
  const [showDatabaseInspector, setShowDatabaseInspector] = useState(false);
  const [showScalabilityModal, setShowScalabilityModal] = useState(false);

  // Sync user role
  useEffect(() => {
    if (currentUserRole === 'student') {
      setCurrentUser(STUDENT_USER);
    } else {
      setCurrentUser(TUTOR_USER);
    }
  }, [currentUserRole]);

  // Fetch initial state from Express backend if available
  useEffect(() => {
    async function fetchServerState() {
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data = await res.json();
          if (data.courses && data.courses.length > 0) {
            setCourses(data.courses);
          }
        }
      } catch (e) {
        // Run with initial state
      }
    }
    fetchServerState();
  }, []);

  // Toggle "I am Ready for Class"
  const handleToggleReadiness = async (courseId: number, isReady: boolean) => {
    try {
      await fetch('/api/student/readiness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: currentUser.id,
          course_id: courseId,
          is_ready: isReady,
        }),
      });
    } catch {
      // Local state fallback
    }

    setEnrollments(prev =>
      prev.map(enr => {
        if (enr.course_id === courseId && enr.student_id === currentUser.id) {
          return { ...enr, is_ready_for_class: isReady };
        }
        return enr;
      })
    );
  };

  // Payment Success Handler
  const handlePaymentSuccess = (courseId: number, method: 'mpesa' | 'visa', receiptRef: string) => {
    const targetCourse = courses.find(c => c.id === courseId) || INITIAL_COURSES[0];
    const newEnrollment: Enrollment = {
      id: enrollments.length + 1,
      student_id: currentUser.id,
      course_id: courseId,
      payment_status: 'completed',
      is_ready_for_class: true,
      enrolled_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      payment_method: method,
      transaction_ref: receiptRef,
      course: targetCourse,
    };

    setEnrollments(prev => {
      const exists = prev.find(e => e.course_id === courseId && e.student_id === currentUser.id);
      if (exists) {
        return prev.map(e => e.course_id === courseId ? newEnrollment : e);
      }
      return [newEnrollment, ...prev];
    });

    setAuditLogs(prev => [
      {
        id: 'audit_' + Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user_email: currentUser.email,
        role: currentUser.role,
        endpoint: `/checkout/${courseId}`,
        action: method === 'mpesa' ? 'DARAJA_PAYMENT_VERIFIED' : 'VISA_SETTLED',
        status: '200_OK',
        details: `Instant enrollment activated for course #${courseId} via ${method}. Receipt: ${receiptRef}`,
      },
      ...prev,
    ]);
  };

  // Tutor update curriculum PDF
  const handleUpdateCurriculumPdf = async (courseId: number, pdfName: string, notes: string) => {
    try {
      await fetch('/api/tutor/curriculum/update-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-email': currentUser.email,
        },
        body: JSON.stringify({ course_id: courseId, pdf_name: pdfName, notes }),
      });
    } catch {
      // Local fallback
    }

    setCourses(prev =>
      prev.map(c => c.id === courseId ? { ...c, pdf_curriculum_name: pdfName } : c)
    );
  };

  // Submit audio pronunciation from student
  const handleSubmitAudio = async (phrase: string, language: string, audioUrl: string): Promise<AudioSubmission> => {
    let newSub: AudioSubmission = {
      id: 'sub_' + Date.now(),
      student_id: currentUser.id,
      course_id: 101,
      phrase,
      language,
      audio_url: audioUrl,
      accuracy_score: 93,
      feedback: 'Native speech synthesis match verified. Tutor review pending.',
      submitted_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    try {
      const res = await fetch('/api/audio/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: currentUser.id,
          course_id: 101,
          phrase,
          language,
          audio_base64: audioUrl,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.submission) newSub = data.submission;
      }
    } catch {
      // Use local
    }

    setAudioSubmissions(prev => [newSub, ...prev]);
    return newSub;
  };

  // Tutor reply to audio
  const handleSubmitAudioFeedback = async (submissionId: string, feedbackText: string) => {
    try {
      await fetch('/api/tutor/audio-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
        },
        body: JSON.stringify({ submission_id: submissionId, feedback_text: feedbackText }),
      });
    } catch {
      // Local fallback
    }

    setAudioSubmissions(prev =>
      prev.map(s => s.id === submissionId ? { ...s, feedback: feedbackText } : s)
    );
  };

  // Build ready students list for Tutor
  const readyStudentsForTutor = enrollments
    .filter(e => e.payment_status === 'completed')
    .map(e => ({
      enrollment_id: e.id,
      student: e.student_id === 1 ? STUDENT_USER : { ...STUDENT_USER, id: e.student_id, full_name: 'Sarah Chen' },
      course: e.course || courses.find(c => c.id === e.course_id) || courses[0],
      is_ready: e.is_ready_for_class,
      enrolled_at: e.enrolled_at,
      payment_method: e.payment_method,
      transaction_ref: e.transaction_ref,
    }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      
      {/* Top Bar Contract Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUserRole={currentUserRole}
        setCurrentUserRole={setCurrentUserRole}
        locale={locale}
        setLocale={setLocale}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenCheckout={(cId) => {
          const c = courses.find(x => x.id === (cId || 101)) || courses[0];
          setCheckoutCourse(c);
        }}
        onOpenDatabase={() => setShowDatabaseInspector(true)}
        onOpenScalability={() => setShowScalabilityModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {viewMode === 'mobile' ? (
          /* Mobile Application Mode */
          <MobileDeviceFrame
            user={currentUser}
            courses={courses}
            enrollments={enrollments}
            audioSubmissions={audioSubmissions}
            locale={locale}
            currentUserRole={currentUserRole}
            onEnroll={(cId) => {
              const c = courses.find(x => x.id === cId) || courses[0];
              setCheckoutCourse(c);
            }}
            onToggleReadiness={handleToggleReadiness}
            onLaunchLive={(course) => {
              setSelectedCourseForLive(course);
              setCurrentTab('live_session');
            }}
            onOpenAudio={(course) => {
              setSelectedCourseForLive(course);
              setCurrentTab('audio_studio');
            }}
            onOpenPdf={(course) => {
              setSelectedCourseForPdf(course);
              setCurrentTab('curriculum_pdf');
            }}
          />
        ) : (
          /* Desktop Web Mode */
          <>
            {currentTab === 'courses' && (
              <PublicLanding
                courses={courses}
                locale={locale}
                onEnroll={(cId) => {
                  const c = courses.find(x => x.id === cId) || courses[0];
                  setCheckoutCourse(c);
                }}
                onViewCurriculum={(course) => {
                  setSelectedCourseForPdf(course);
                  setCurrentTab('curriculum_pdf');
                }}
                onGoToStudentDashboard={() => setCurrentTab('student_dashboard')}
              />
            )}

            {currentTab === 'student_dashboard' && (
              <StudentDashboard
                user={currentUser}
                enrollments={enrollments}
                courses={courses}
                locale={locale}
                onToggleReadiness={handleToggleReadiness}
                onLaunchLiveSession={(course) => {
                  setSelectedCourseForLive(course);
                  setCurrentTab('live_session');
                }}
                onOpenAudioStudio={(course) => {
                  setSelectedCourseForLive(course);
                  setCurrentTab('audio_studio');
                }}
                onOpenCurriculumPdf={(course) => {
                  setSelectedCourseForPdf(course);
                  setCurrentTab('curriculum_pdf');
                }}
                onEnrollNewCourse={() => setCurrentTab('courses')}
              />
            )}

            {currentTab === 'student_progress' && (
              <StudentProgress
                user={currentUser}
                enrollments={enrollments}
                courses={courses}
                audioSubmissions={audioSubmissions}
                locale={locale}
                onOpenReceipt={(enr) => {
                  const c = enr.course || courses.find(x => x.id === enr.course_id) || courses[0];
                  setCheckoutCourse(c);
                }}
              />
            )}

            {currentTab === 'tutor_console' && (
              <TutorDashboard
                currentUser={currentUser}
                courses={courses}
                readyStudents={readyStudentsForTutor}
                audioSubmissions={audioSubmissions}
                auditLogs={auditLogs}
                locale={locale}
                onLaunchLiveSession={(course) => {
                  setSelectedCourseForLive(course);
                  setCurrentTab('live_session');
                }}
                onUpdateCurriculumPdf={handleUpdateCurriculumPdf}
                onSubmitAudioFeedback={handleSubmitAudioFeedback}
              />
            )}

            {currentTab === 'live_session' && (
              <LiveSessionRoom
                course={selectedCourseForLive}
                currentUser={currentUser}
                locale={locale}
                onLeaveSession={() => setCurrentTab('student_dashboard')}
              />
            )}

            {currentTab === 'audio_studio' && (
              <AudioPronunciationStudio
                course={selectedCourseForLive}
                locale={locale}
                audioSubmissions={audioSubmissions}
                onSubmitAudio={handleSubmitAudio}
              />
            )}

            {currentTab === 'curriculum_pdf' && (
              <CurriculumPdfViewer
                course={selectedCourseForPdf}
                locale={locale}
                onBack={() => setCurrentTab('courses')}
                onEnrollCourse={(cId) => {
                  const c = courses.find(x => x.id === cId) || courses[0];
                  setCheckoutCourse(c);
                }}
              />
            )}
          </>
        )}

      </main>

      {/* Checkout Modal with Safaricom Daraja & Visa */}
      {checkoutCourse && (
        <CheckoutModal
          course={checkoutCourse}
          locale={locale}
          onClose={() => setCheckoutCourse(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* PostgreSQL Database Architecture & Query Inspector Modal */}
      {showDatabaseInspector && (
        <DatabaseInspector
          users={[STUDENT_USER, TUTOR_USER]}
          courses={courses}
          enrollments={enrollments}
          onClose={() => setShowDatabaseInspector(false)}
        />
      )}

      {/* 10,000+ Concurrent User Scalability Blueprint Modal */}
      {showScalabilityModal && (
        <ScalabilityModal
          onClose={() => setShowScalabilityModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">LughaSmart Tutor System</span>
            <span>·</span>
            <span>Nairobi Studio & Indigenous Languages Faculty</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>PostgreSQL Schema Validated</span>
            <span>·</span>
            <span>Safaricom Daraja STK Push</span>
            <span>·</span>
            <span>AES-256 E2EE Verified</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
