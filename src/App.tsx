import React, { useEffect, useState } from 'react';
import {
  Course,
  Enrollment,
  SharedMaterial,
  LanguageTest,
  TestSubmission,
  AudioSubmission,
  TutorRating,
  WordGameScore,
  UserProfile,
  PaymentMethod,
  PlanType,
  DailyLiveSession,
  ClassEmailNotification,
  SecurityAuditLog,
} from './types';
import {
  SEED_COURSES,
  SEED_ENROLLMENTS,
  SEED_MATERIALS,
  SEED_TESTS,
  SEED_TEST_SUBMISSIONS,
  SEED_AUDIO_SUBMISSIONS,
  SEED_RATINGS,
  SEED_LIVE_SESSIONS,
  SEED_EMAIL_NOTIFICATIONS,
} from './data/seedData';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { StudentEnrollmentArea } from './components/StudentEnrollmentArea';
import { TutorWorkspace } from './components/TutorWorkspace';
import { TutorAdminGate } from './components/TutorAdminGate';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';

const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'demo-student-1',
    fullName: 'John Miller',
    email: 'john.miller@example.com',
    password: 'password123',
    role: 'student',
    isAdmin: false,
    isSuspended: false,
    createdAt: '2026-11-01',
  },
  {
    uid: 'tutor-amina-01',
    fullName: 'Dr. Amina Wambui',
    email: 'amina.wambui@lughasmart.ac.ke',
    password: 'password123',
    role: 'tutor',
    isAdmin: true,
    isSuspended: false,
    adminPin: '202688',
    createdAt: '2026-01-15',
  },
];

const INITIAL_AUDIT_LOGS: SecurityAuditLog[] = [
  {
    id: 'audit-init-1',
    timestamp: '2026-11-14 08:00',
    actorEmail: 'amina.wambui@lughasmart.ac.ke',
    actorRole: 'tutor_admin',
    endpoint: '/tutor-admin',
    action: 'SYSTEM_BOOT_POLICY',
    httpStatus: 200,
    details: 'Isolated Tutor & Admin portal enabled. Student RBAC isolation enforced.',
  },
];

function isTutorAdminUrl(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.hash === '#/tutor-admin' ||
    window.location.pathname === '/tutor-admin'
  );
}

export default function App() {
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeView, setActiveView] = useState<'landing' | 'enrollment' | 'tutor' | 'tutor_gate'>(
    () => (isTutorAdminUrl() ? 'tutor_gate' : 'landing')
  );
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [pendingEnrollCourse, setPendingEnrollCourse] = useState<Course | null>(null);
  const [checkoutCourse, setCheckoutCourse] = useState<Course | null>(null);
  const [checkoutCompleted, setCheckoutCompleted] = useState(false);

  const [courses] = useState<Course[]>(SEED_COURSES);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(SEED_ENROLLMENTS);
  const [liveSessions, setLiveSessions] = useState<DailyLiveSession[]>(SEED_LIVE_SESSIONS);
  const [emailNotifications, setEmailNotifications] = useState<ClassEmailNotification[]>(
    SEED_EMAIL_NOTIFICATIONS
  );
  const [materials, setMaterials] = useState<SharedMaterial[]>(SEED_MATERIALS);
  const [tests, setTests] = useState<LanguageTest[]>(SEED_TESTS);
  const [testSubmissions, setTestSubmissions] = useState<TestSubmission[]>(SEED_TEST_SUBMISSIONS);
  const [audioSubmissions, setAudioSubmissions] = useState<AudioSubmission[]>(SEED_AUDIO_SUBMISSIONS);
  const [ratings, setRatings] = useState<TutorRating[]>(SEED_RATINGS);
  const [wordGameScores, setWordGameScores] = useState<WordGameScore[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>(INITIAL_AUDIT_LOGS);

  const userRole = currentUser?.role || 'student';

  const appendAuditLog = ({
    actorEmail,
    actorRole,
    endpoint = '/tutor-admin',
    action,
    httpStatus,
    details,
  }: {
    actorEmail: string;
    actorRole: string;
    endpoint?: string;
    action: string;
    httpStatus: number;
    details: string;
  }) => {
    setAuditLogs((prev) => [
      {
        id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        actorEmail,
        actorRole,
        endpoint,
        action,
        httpStatus,
        details,
      },
      ...prev,
    ]);
  };

  // Sync isolated #/tutor-admin route and block any student probe
  useEffect(() => {
    const syncRoute = () => {
      if (isTutorAdminUrl()) {
        if (currentUser && currentUser.role === 'tutor' && currentUser.isAdmin) {
          setActiveView('tutor');
        } else {
          if (currentUser && currentUser.role === 'student') {
            appendAuditLog({
              actorEmail: currentUser.email,
              actorRole: 'student',
              endpoint: '/tutor-admin',
              action: 'UNAUTHORIZED_ADMIN_PROBE',
              httpStatus: 403,
              details: `Blocked student (${currentUser.fullName}) from accessing isolated Tutor/Admin portal.`,
            });
          }
          setActiveView('tutor_gate');
        }
      }
    };

    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('popstate', syncRoute);
    return () => {
      window.removeEventListener('hashchange', syncRoute);
      window.removeEventListener('popstate', syncRoute);
    };
  }, [currentUser]);

  const openIsolatedTutorPortal = () => {
    if (window.location.hash !== '#/tutor-admin') {
      window.location.hash = '#/tutor-admin';
    }
    if (currentUser && currentUser.role === 'tutor' && currentUser.isAdmin) {
      setActiveView('tutor');
    } else {
      if (currentUser && currentUser.role === 'student') {
        appendAuditLog({
          actorEmail: currentUser.email,
          actorRole: 'student',
          endpoint: '/tutor-admin',
          action: 'UNAUTHORIZED_ADMIN_PROBE',
          httpStatus: 403,
          details: `Blocked student (${currentUser.fullName}) from accessing isolated Tutor/Admin portal.`,
        });
      }
      setActiveView('tutor_gate');
    }
  };

  const clearAdminHashAndGoLanding = () => {
    if (window.location.hash === '#/tutor-admin') {
      window.history.replaceState(null, '', window.location.pathname || '/');
    }
    setActiveView('landing');
  };

  // Enforce student registration & login before enrollment
  const handleRequestEnroll = (course: Course) => {
    if (!currentUser) {
      setPendingEnrollCourse(course);
      setAuthNotice('Please register or log in as a Student first to enroll in a course.');
      setShowAuthModal(true);
      return;
    }
    if (currentUser.role === 'tutor') {
      return;
    }
    setCheckoutCompleted(false);
    setCheckoutCourse(course);
  };

  const handleNavigate = (view: 'landing' | 'enrollment' | 'tutor') => {
    if (view === 'landing') {
      clearAdminHashAndGoLanding();
      return;
    }
    if (view === 'enrollment') {
      if (window.location.hash === '#/tutor-admin') {
        window.history.replaceState(null, '', window.location.pathname || '/');
      }
      if (!currentUser) {
        setAuthNotice('Please register or log in to view your Enrollment Area.');
        setShowAuthModal(true);
        return;
      }
      if (currentUser.role === 'tutor') {
        setActiveView('tutor');
        return;
      }
      setActiveView('enrollment');
      return;
    }
    if (view === 'tutor') {
      if (!currentUser || currentUser.role !== 'tutor' || !currentUser.isAdmin) {
        if (currentUser && currentUser.role === 'student') {
          appendAuditLog({
            actorEmail: currentUser.email,
            actorRole: 'student',
            endpoint: '/tutor-admin',
            action: 'UNAUTHORIZED_DASHBOARD_ACCESS',
            httpStatus: 403,
            details: `Student ${currentUser.email} attempted to open Tutor/Admin console.`,
          });
        }
        setActiveView('tutor_gate');
        return;
      }
      setActiveView('tutor');
    }
  };

  const handleRegisterStudent = (newUser: UserProfile) => {
    setRegisteredUsers((prev) => [...prev, newUser]);
    appendAuditLog({
      actorEmail: newUser.email,
      actorRole: 'student',
      endpoint: '/api/auth/register',
      action: 'STUDENT_REGISTERED',
      httpStatus: 201,
      details: `New student registered: ${newUser.fullName}.`,
    });
  };

  const handleStudentLoginSuccess = (user: UserProfile) => {
    if (user.role !== 'student') return;
    setCurrentUser(user);
    setAuthNotice(null);

    if (pendingEnrollCourse) {
      setCheckoutCompleted(false);
      setCheckoutCourse(pendingEnrollCourse);
      setPendingEnrollCourse(null);
    } else {
      setActiveView('enrollment');
    }
  };

  const handleAdminLoginSuccess = (adminUser: UserProfile) => {
    if (adminUser.role !== 'tutor' || !adminUser.isAdmin) return;
    setPendingEnrollCourse(null);
    setCheckoutCourse(null);
    setCurrentUser(adminUser);
    setActiveView('tutor');
  };

  const handleSignOut = () => {
    if (currentUser?.role === 'tutor') {
      appendAuditLog({
        actorEmail: currentUser.email,
        actorRole: 'tutor_admin',
        endpoint: '/tutor-admin',
        action: 'ADMIN_SIGN_OUT',
        httpStatus: 200,
        details: `Administrator ${currentUser.fullName} signed out.`,
      });
    }
    setCurrentUser(null);
    setPendingEnrollCourse(null);
    setCheckoutCourse(null);
    clearAdminHashAndGoLanding();
  };

  const handleToggleUserSuspended = (uid: string) => {
    if (!currentUser || currentUser.role !== 'tutor' || !currentUser.isAdmin) return;
    setRegisteredUsers((prev) =>
      prev.map((u) => {
        if (u.uid !== uid || u.role === 'tutor') return u;
        const nextSuspended = !u.isSuspended;
        appendAuditLog({
          actorEmail: currentUser.email,
          actorRole: 'tutor_admin',
          endpoint: '/tutor-admin/users',
          action: nextSuspended ? 'STUDENT_SUSPENDED' : 'STUDENT_REACTIVATED',
          httpStatus: 200,
          details: `${nextSuspended ? 'Suspended' : 'Reactivated'} student account ${u.email}.`,
        });
        return { ...u, isSuspended: nextSuspended };
      })
    );
  };

  const handleCreateTutorAccount = ({
    fullName,
    email,
    password,
    adminPin,
  }: {
    fullName: string;
    email: string;
    password: string;
    adminPin: string;
  }) => {
    if (!currentUser || currentUser.role !== 'tutor' || !currentUser.isAdmin) return;
    if (registeredUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) return;
    const newTutor: UserProfile = {
      uid: `tutor-${Date.now()}`,
      fullName,
      email,
      password,
      role: 'tutor',
      isAdmin: true,
      isSuspended: false,
      adminPin,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setRegisteredUsers((prev) => [...prev, newTutor]);
    appendAuditLog({
      actorEmail: currentUser.email,
      actorRole: 'tutor_admin',
      endpoint: '/tutor-admin/provision',
      action: 'TUTOR_ADMIN_PROVISIONED',
      httpStatus: 201,
      details: `Authorized new Tutor & Admin account for ${email}.`,
    });
  };

  const handleCompleteEnrollment = ({
    course,
    planType,
    amountKes,
    paymentMethod,
    transactionRef,
  }: {
    course: Course;
    planType: PlanType;
    amountKes: number;
    paymentMethod: PaymentMethod;
    transactionRef: string;
  }) => {
    if (!currentUser || currentUser.role !== 'student') return;

    const newEnrollment: Enrollment = {
      id: `enr-${Date.now()}`,
      studentUid: currentUser.uid,
      studentName: currentUser.fullName,
      studentEmail: currentUser.email,
      courseId: course.id,
      courseTitle: course.title,
      languageName: course.languageName,
      audience: course.audience,
      planType,
      amountKes,
      paymentMethod,
      transactionRef,
      paymentStatus: 'completed',
      jitsiRoomUrl: `https://meet.jit.si/${course.jitsiRoomName}`,
      preferredSlot:
        course.audience === 'adult'
          ? 'Tue & Thu · 18:00 - 21:00 EAT (3-Hr Adult Session)'
          : 'Sat · 10:00 - 11:00 EAT (1-Hr Children Interactive)',
      isReadyForClass: true,
      modulesCompletedCount: 0,
      totalModules: course.modules.length,
      completedModuleIds: [],
      testScoreAvg: 0,
      enrolledAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    setEnrollments((prev) => {
      const existingIdx = prev.findIndex(
        (e) => e.courseId === course.id && e.studentUid === currentUser.uid
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = {
          ...copy[existingIdx],
          planType,
          amountKes,
          paymentMethod,
          transactionRef,
          paymentStatus: 'completed',
          updatedAt: new Date().toISOString().slice(0, 10),
        };
        return copy;
      }
      return [newEnrollment, ...prev];
    });
    setCheckoutCompleted(true);
    appendAuditLog({
      actorEmail: currentUser.email,
      actorRole: 'student',
      endpoint: '/api/payments/checkout',
      action: 'PAYMENT_COMPLETED',
      httpStatus: 200,
      details: `${paymentMethod.toUpperCase()} KES ${amountKes} (${transactionRef}) for ${course.languageName}.`,
    });
  };

  const handleToggleReady = (enrollmentId: string) => {
    setEnrollments((prev) =>
      prev.map((e) => (e.id === enrollmentId ? { ...e, isReadyForClass: !e.isReadyForClass } : e))
    );
  };

  const handleToggleModuleComplete = (enrollmentId: string, moduleId: string) => {
    setEnrollments((prev) =>
      prev.map((e) => {
        if (e.id !== enrollmentId) return e;
        const exists = e.completedModuleIds.includes(moduleId);
        const nextIds = exists
          ? e.completedModuleIds.filter((id) => id !== moduleId)
          : [...e.completedModuleIds, moduleId];
        return {
          ...e,
          completedModuleIds: nextIds,
          modulesCompletedCount: nextIds.length,
        };
      })
    );
  };

  const handleSubmitTest = (
    test: LanguageTest,
    selectedAnswers: Record<string, number>
  ): TestSubmission => {
    const student = currentUser!;
    let correct = 0;
    test.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) correct += 1;
    });
    const scorePercent = Math.round((correct / test.questions.length) * 100);

    const submission: TestSubmission = {
      id: `ts-${Date.now()}`,
      testId: test.id,
      testTitle: test.title,
      courseId: test.courseId,
      languageName: test.languageName,
      studentUid: student.uid,
      studentName: student.fullName,
      scorePercent,
      correctCount: correct,
      totalCount: test.questions.length,
      submittedAt: new Date().toISOString().slice(0, 10),
    };

    setTestSubmissions((prev) => [submission, ...prev]);
    setEnrollments((prev) =>
      prev.map((e) =>
        e.courseId === test.courseId && e.studentUid === student.uid
          ? { ...e, testScoreAvg: scorePercent }
          : e
      )
    );
    return submission;
  };

  const handleSubmitAudio = (courseId: string, language: string, phrase: string, score: number) => {
    if (!currentUser) return;
    const sub: AudioSubmission = {
      id: `aud-${Date.now()}`,
      studentUid: currentUser.uid,
      studentName: currentUser.fullName,
      courseId,
      language,
      phrase,
      accuracyScore: score,
      tutorFeedback: '',
      submittedAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setAudioSubmissions((prev) => [sub, ...prev]);
  };

  const handleSubmitRating = (ratingData: Omit<TutorRating, 'id' | 'createdAt'>) => {
    setRatings((prev) => [
      {
        ...ratingData,
        id: `rat-${Date.now()}`,
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
  };

  const handleSaveWordGameScore = (languageName: string, score: number, pairsMatched: number) => {
    if (!currentUser) return;
    setWordGameScores((prev) => [
      {
        id: `wg-${Date.now()}`,
        studentUid: currentUser.uid,
        studentName: currentUser.fullName,
        languageName,
        score,
        pairsMatched,
        playedAt: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
  };

  const handleVerifyEnrollment = (enrollmentId: string, status: 'completed' | 'revoked') => {
    if (!currentUser || currentUser.role !== 'tutor' || !currentUser.isAdmin) return;
    setEnrollments((prev) =>
      prev.map((e) => (e.id === enrollmentId ? { ...e, paymentStatus: status } : e))
    );
    appendAuditLog({
      actorEmail: currentUser.email,
      actorRole: 'tutor_admin',
      endpoint: '/tutor-admin/enrollments',
      action: status === 'revoked' ? 'ENROLLMENT_REVOKED' : 'ENROLLMENT_VERIFIED',
      httpStatus: 200,
      details: `Updated enrollment ${enrollmentId} payment status to ${status}.`,
    });
  };

  const handleAddOrUpdateLiveSession = (
    sessData: Omit<DailyLiveSession, 'id' | 'updatedAt'>
  ) => {
    if (!currentUser || currentUser.role !== 'tutor' || !currentUser.isAdmin) return;
    setLiveSessions((prev) => [
      {
        ...sessData,
        id: `sess-${Date.now()}`,
        updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      },
      ...prev,
    ]);
  };

  const handleUpdateSessionStatus = (sessionId: string, status: DailyLiveSession['status']) => {
    if (!currentUser || currentUser.role !== 'tutor' || !currentUser.isAdmin) return;
    setLiveSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, status, updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') }
          : s
      )
    );
  };

  const handleSendClassEmail = (emailData: Omit<ClassEmailNotification, 'id' | 'sentAt'>) => {
    if (!currentUser || currentUser.role !== 'tutor' || !currentUser.isAdmin) return;
    setEmailNotifications((prev) => [
      {
        ...emailData,
        id: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        sentAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      },
      ...prev,
    ]);
  };

  const handleAddMaterial = (mat: Omit<SharedMaterial, 'id' | 'createdAt'>) => {
    if (!currentUser || currentUser.role !== 'tutor' || !currentUser.isAdmin) return;
    setMaterials((prev) => [
      {
        ...mat,
        id: `mat-${Date.now()}`,
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
  };

  const handleCreateTest = (test: Omit<LanguageTest, 'id' | 'createdAt'>) => {
    if (!currentUser || currentUser.role !== 'tutor' || !currentUser.isAdmin) return;
    setTests((prev) => [
      {
        ...test,
        id: `test-${Date.now()}`,
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
  };

  const handleFeedbackAudio = (submissionId: string, feedback: string) => {
    if (!currentUser || currentUser.role !== 'tutor' || !currentUser.isAdmin) return;
    setAudioSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? { ...s, tutorFeedback: feedback } : s))
    );
  };

  const activeStudentEnrollments = enrollments.filter(
    (e) => currentUser && e.studentUid === currentUser.uid
  );

  const isVerifiedAdmin = Boolean(
    currentUser && currentUser.role === 'tutor' && currentUser.isAdmin
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#18181B] flex flex-col">
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        userRole={userRole}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthNotice(null);
          setShowAuthModal(true);
        }}
        onSignOut={handleSignOut}
        onEnrollNow={() => handleRequestEnroll(courses[0])}
      />

      <main className="flex-1">
        {activeView === 'landing' && (
          <LandingPage
            courses={courses}
            ratings={ratings}
            onEnrollCourse={handleRequestEnroll}
            onGoToEnrollment={() => handleNavigate('enrollment')}
          />
        )}

        {activeView === 'enrollment' && currentUser && currentUser.role === 'student' && (
          <StudentEnrollmentArea
            currentUser={currentUser}
            courses={courses}
            enrollments={activeStudentEnrollments}
            liveSessions={liveSessions}
            emailNotifications={emailNotifications}
            materials={materials}
            tests={tests}
            testSubmissions={testSubmissions}
            audioSubmissions={audioSubmissions}
            onEnrollCourse={handleRequestEnroll}
            onToggleReady={handleToggleReady}
            onToggleModuleComplete={handleToggleModuleComplete}
            onSubmitTest={handleSubmitTest}
            onSubmitAudio={handleSubmitAudio}
            onSubmitRating={handleSubmitRating}
            onSaveWordGameScore={handleSaveWordGameScore}
          />
        )}

        {/* Separate isolated Tutor & Admin Authentication Portal */}
        {activeView === 'tutor_gate' && (
          <TutorAdminGate
            currentUser={currentUser}
            registeredUsers={registeredUsers}
            onAdminLoginSuccess={handleAdminLoginSuccess}
            onLogSecurityEvent={({ actorEmail, actorRole, action, httpStatus, details }) =>
              appendAuditLog({
                actorEmail,
                actorRole,
                endpoint: '/tutor-admin',
                action,
                httpStatus,
                details,
              })
            }
            onBackToLanding={clearAdminHashAndGoLanding}
          />
        )}

        {/* Tutor & Admin Console strictly mounted ONLY when verified Tutor/Admin session exists */}
        {activeView === 'tutor' && isVerifiedAdmin && (
          <TutorWorkspace
            currentUser={currentUser}
            users={registeredUsers}
            auditLogs={auditLogs}
            courses={courses}
            enrollments={enrollments}
            liveSessions={liveSessions}
            emailNotifications={emailNotifications}
            materials={materials}
            tests={tests}
            audioSubmissions={audioSubmissions}
            ratings={ratings}
            wordGameScores={wordGameScores}
            onVerifyEnrollment={handleVerifyEnrollment}
            onAddOrUpdateLiveSession={handleAddOrUpdateLiveSession}
            onUpdateSessionStatus={handleUpdateSessionStatus}
            onSendClassEmail={handleSendClassEmail}
            onAddMaterial={handleAddMaterial}
            onCreateTest={handleCreateTest}
            onFeedbackAudio={handleFeedbackAudio}
            onToggleUserSuspended={handleToggleUserSuspended}
            onCreateTutorAccount={handleCreateTutorAccount}
          />
        )}
      </main>

      {checkoutCourse && currentUser && currentUser.role === 'student' && (
        <CheckoutModal
          course={checkoutCourse}
          onClose={() => {
            setCheckoutCourse(null);
            if (checkoutCompleted) {
              setActiveView('enrollment');
            }
          }}
          onCompleteEnrollment={handleCompleteEnrollment}
        />
      )}

      {showAuthModal && (
        <AuthModal
          registeredUsers={registeredUsers}
          initialNotice={authNotice}
          onClose={() => {
            setShowAuthModal(false);
            setAuthNotice(null);
          }}
          onRegisterStudent={handleRegisterStudent}
          onStudentLoginSuccess={handleStudentLoginSuccess}
        />
      )}

      <footer className="border-t border-[#E5E3DC] bg-white py-6 text-xs text-[#71717A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-semibold text-[#18181B]">LughaSmart Language Academy</span>
            <span className="mx-2">·</span>
            <span>Kenyan Local & Global Languages</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Adult 3-Hr & Children 1-Hr Live Jitsi Sessions</span>
            <span>·</span>
            <span>M-Pesa & Visa</span>
            {/* Hidden from authenticated students so students have zero visibility into Tutor/Admin portal */}
            {(!currentUser || isVerifiedAdmin) && (
              <>
                <span>·</span>
                <button
                  onClick={openIsolatedTutorPortal}
                  className="text-[#71717A] hover:text-[#18181B] underline-offset-2 hover:underline cursor-pointer"
                >
                  Staff & Admin Portal
                </button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
