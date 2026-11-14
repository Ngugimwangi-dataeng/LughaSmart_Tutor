import React, { useState } from 'react';
import {
  Course,
  Enrollment,
  SharedMaterial,
  LanguageTest,
  AudioSubmission,
  TutorRating,
  WordGameScore,
  UserProfile,
  DailyLiveSession,
  ClassEmailNotification,
  SecurityAuditLog,
} from '../types';
import { playAudioChime } from '../utils/audio';
import {
  ShieldAlert,
  Users,
  Image as ImageIcon,
  FileUp,
  ClipboardPlus,
  Volume2,
  Star,
  Check,
  Ban,
  Video,
  Calendar,
  Mail,
  Receipt,
  Download,
  Send,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';

interface TutorWorkspaceProps {
  currentUser: UserProfile | null;
  users: UserProfile[];
  auditLogs: SecurityAuditLog[];
  courses: Course[];
  enrollments: Enrollment[];
  liveSessions: DailyLiveSession[];
  emailNotifications: ClassEmailNotification[];
  materials: SharedMaterial[];
  tests: LanguageTest[];
  audioSubmissions: AudioSubmission[];
  ratings: TutorRating[];
  wordGameScores: WordGameScore[];
  onVerifyEnrollment: (enrollmentId: string, status: 'completed' | 'revoked') => void;
  onAddOrUpdateLiveSession: (session: Omit<DailyLiveSession, 'id' | 'updatedAt'>) => void;
  onUpdateSessionStatus: (sessionId: string, status: DailyLiveSession['status']) => void;
  onSendClassEmail: (email: Omit<ClassEmailNotification, 'id' | 'sentAt'>) => void;
  onAddMaterial: (material: Omit<SharedMaterial, 'id' | 'createdAt'>) => void;
  onCreateTest: (test: Omit<LanguageTest, 'id' | 'createdAt'>) => void;
  onFeedbackAudio: (submissionId: string, feedback: string) => void;
  onToggleUserSuspended: (uid: string) => void;
  onCreateTutorAccount: (params: {
    fullName: string;
    email: string;
    password: string;
    adminPin: string;
  }) => void;
}

export const TutorWorkspace: React.FC<TutorWorkspaceProps> = ({
  currentUser,
  users,
  auditLogs,
  courses,
  enrollments,
  liveSessions,
  emailNotifications,
  materials,
  tests,
  audioSubmissions,
  ratings,
  wordGameScores,
  onVerifyEnrollment,
  onAddOrUpdateLiveSession,
  onUpdateSessionStatus,
  onSendClassEmail,
  onAddMaterial,
  onCreateTest,
  onFeedbackAudio,
  onToggleUserSuspended,
  onCreateTutorAccount,
}) => {
  const [section, setSection] = useState<
    'students' | 'live_schedule' | 'reports' | 'materials' | 'tests' | 'feedback' | 'admin_security'
  >('students');

  // Daily Live Session Form
  const todayStr = new Date().toISOString().slice(0, 10);
  const [sessCourseId, setSessCourseId] = useState(courses[0]?.id || 'swahili-adult-101');
  const [sessDate, setSessDate] = useState(todayStr);
  const [sessStart, setSessStart] = useState('18:00 EAT');
  const [sessEnd, setSessEnd] = useState('21:00 EAT');
  const [sessTopic, setSessTopic] = useState('');
  const [sessNotice, setSessNotice] = useState<string | null>(null);

  // Email Student Class-Time Update Modal/Panel
  const [emailTarget, setEmailTarget] = useState<Enrollment | 'all_course' | null>(null);
  const [emailCourseId, setEmailCourseId] = useState(courses[0]?.id || 'swahili-adult-101');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailClassTime, setEmailClassTime] = useState(`${todayStr} · 18:00 - 21:00 EAT`);
  const [emailBody, setEmailBody] = useState('');
  const [emailSentBanner, setEmailSentBanner] = useState<string | null>(null);

  // Daily Transaction Reports Date Filter
  const [reportDateFilter, setReportDateFilter] = useState<string>(todayStr);

  // Material Sharing Form (Images / PDFs / Audio)
  const [matCourseId, setMatCourseId] = useState(courses[0]?.id || 'swahili-adult-101');
  const [matType, setMatType] = useState<'image' | 'pdf' | 'audio'>('image');
  const [matTitle, setMatTitle] = useState('');
  const [matDesc, setMatDesc] = useState('');
  const [matUrl, setMatUrl] = useState(
    '/src/assets/images/nairobi_market_visual_lesson_1794674778595.jpg'
  );
  const [matFileName, setMatFileName] = useState('visual_explanation_card.jpg');
  const [matNotice, setMatNotice] = useState<string | null>(null);

  // Test Creation Form
  const [testCourseId, setTestCourseId] = useState(courses[0]?.id || 'swahili-adult-101');
  const [testTitle, setTestTitle] = useState('');
  const [qPrompt, setQPrompt] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [correctIdx, setCorrectIdx] = useState(0);
  const [testNotice, setTestNotice] = useState<string | null>(null);

  // Audio feedback input
  const [audioNotes, setAudioNotes] = useState<Record<string, string>>({});

  // Admin: Provision new Tutor/Admin state
  const [newTutorName, setNewTutorName] = useState('');
  const [newTutorEmail, setNewTutorEmail] = useState('');
  const [newTutorPass, setNewTutorPass] = useState('');
  const [newTutorPin, setNewTutorPin] = useState('');
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  // STRICT RBAC ENFORCEMENT — Tutor is also System Admin; students have zero access
  if (!currentUser || currentUser.role !== 'tutor' || !currentUser.isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white border border-red-200 rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="text-xs font-mono font-semibold text-red-600">
            403 FORBIDDEN · TUTOR ACCESS REQUIRED
          </div>
          <h1 className="font-display text-2xl font-semibold text-[#18181B]">
            Students Have No Access to Tutor Tools
          </h1>
          <p className="text-sm text-[#52525B] max-w-md mx-auto">
            For system and information security, only registered and authenticated tutors can view enrolled student lists, daily transaction reports, or live session controls.
          </p>
        </div>
      </div>
    );
  }

  const handleCreateLiveSession = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find((c) => c.id === sessCourseId) || courses[0];
    onAddOrUpdateLiveSession({
      courseId: course.id,
      languageName: course.languageName,
      audience: course.audience,
      sessionDate: sessDate,
      startTimeEat: sessStart.trim() || '18:00 EAT',
      endTimeEat: sessEnd.trim() || (course.audience === 'adult' ? '21:00 EAT' : '19:00 EAT'),
      topic: sessTopic.trim() || `${course.languageName} Daily Live Class`,
      jitsiRoomUrl: `https://meet.jit.si/${course.jitsiRoomName}`,
      status: 'scheduled',
      tutorName: currentUser.fullName,
    });
    setSessTopic('');
    playAudioChime('success');
    setSessNotice(`Daily live session published for ${sessDate}.`);
    setTimeout(() => setSessNotice(null), 3500);
  };

  const openEmailComposer = (target: Enrollment | 'all_course') => {
    setEmailTarget(target);
    if (target === 'all_course') {
      const c = courses.find((x) => x.id === emailCourseId) || courses[0];
      setEmailSubject(`Class Time Update: ${c.languageName} Live Jitsi Session`);
      setEmailBody(
        `Hello! Your ${c.languageName} live session will be held at ${emailClassTime} via Jitsi: https://meet.jit.si/${c.jitsiRoomName}`
      );
    } else {
      setEmailCourseId(target.courseId);
      setEmailSubject(`Class Time Update for ${target.languageName}`);
      setEmailBody(
        `Hello ${target.studentName}, your ${target.languageName} live session is scheduled for ${emailClassTime}. Join on Jitsi: ${target.jitsiRoomUrl}`
      );
    }
  };

  const handleDispatchEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTarget || !emailSubject.trim() || !emailBody.trim()) return;

    if (emailTarget === 'all_course') {
      const recipients = enrollments.filter(
        (enr) => enr.courseId === emailCourseId && enr.paymentStatus === 'completed'
      );
      const course = courses.find((c) => c.id === emailCourseId) || courses[0];
      recipients.forEach((enr) => {
        onSendClassEmail({
          courseId: course.id,
          languageName: course.languageName,
          recipientEmail: enr.studentEmail,
          recipientName: enr.studentName,
          subject: emailSubject.trim(),
          messageBody: emailBody.trim(),
          classTimeInfo: emailClassTime.trim(),
          sentByName: currentUser.fullName,
        });
      });
      setEmailSentBanner(`Sent class time email update to ${recipients.length} enrolled student(s).`);
    } else {
      onSendClassEmail({
        courseId: emailTarget.courseId,
        languageName: emailTarget.languageName,
        recipientEmail: emailTarget.studentEmail,
        recipientName: emailTarget.studentName,
        subject: emailSubject.trim(),
        messageBody: emailBody.trim(),
        classTimeInfo: emailClassTime.trim(),
        sentByName: currentUser.fullName,
      });
      setEmailSentBanner(`Class time email sent to ${emailTarget.studentName} (${emailTarget.studentEmail}).`);
    }

    setEmailTarget(null);
    playAudioChime('success');
    setTimeout(() => setEmailSentBanner(null), 4000);
  };

  // Daily Transaction Report calculations
  const filteredTransactions = enrollments.filter((e) =>
    reportDateFilter === 'all' ? true : e.enrolledAt.startsWith(reportDateFilter)
  );
  const completedTx = filteredTransactions.filter((e) => e.paymentStatus === 'completed');
  const totalRevenueKes = completedTx.reduce((sum, e) => sum + e.amountKes, 0);
  const mpesaTotalKes = completedTx
    .filter((e) => e.paymentMethod === 'mpesa')
    .reduce((sum, e) => sum + e.amountKes, 0);
  const visaTotalKes = completedTx
    .filter((e) => e.paymentMethod === 'visa')
    .reduce((sum, e) => sum + e.amountKes, 0);

  const handleExportCsv = () => {
    const header = [
      'Date',
      'TransactionRef',
      'StudentName',
      'StudentEmail',
      'Language',
      'PlanType',
      'PaymentMethod',
      'AmountKES',
      'Status',
    ];
    const rows = filteredTransactions.map((e) => [
      e.enrolledAt,
      e.transactionRef,
      `"${e.studentName}"`,
      e.studentEmail,
      `"${e.languageName}"`,
      e.planType,
      e.paymentMethod,
      String(e.amountKes),
      e.paymentStatus,
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LughaSmart_Transactions_${reportDateFilter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMatFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setMatUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePublishMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim()) return;
    const course = courses.find((c) => c.id === matCourseId) || courses[0];

    onAddMaterial({
      courseId: course.id,
      languageName: course.languageName,
      materialType: matType,
      title: matTitle.trim(),
      description: matDesc.trim() || `Shared for ${course.languageName} learners.`,
      fileName: matFileName.trim() || `${matType}_resource`,
      mediaUrl:
        matType === 'audio'
          ? matDesc.trim() || matTitle.trim()
          : matUrl.trim() ||
            '/public/assets/aistudio/LughaSmart_System_Design___Proposal__3__c33dc71a.pdf',
      durationLabel: matType === 'audio' ? '08:30 min' : undefined,
      tutorUid: currentUser.uid,
      tutorName: currentUser.fullName,
    });

    setMatTitle('');
    setMatDesc('');
    playAudioChime('success');
    setMatNotice(`Published ${matType.toUpperCase()} resource to enrolled students.`);
    setTimeout(() => setMatNotice(null), 3500);
  };

  const handlePublishTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTitle.trim() || !qPrompt.trim() || !optA.trim() || !optB.trim()) return;
    const course = courses.find((c) => c.id === testCourseId) || courses[0];
    const options = [optA.trim(), optB.trim(), optC.trim()].filter(Boolean);

    onCreateTest({
      courseId: course.id,
      languageName: course.languageName,
      audience: course.audience,
      title: testTitle.trim(),
      description: `Tutor-published assessment for ${course.languageName}`,
      tutorUid: currentUser.uid,
      questions: [
        {
          id: `q-${Date.now()}`,
          prompt: qPrompt.trim(),
          options,
          correctIndex: Math.min(correctIdx, options.length - 1),
        },
      ],
    });

    setTestTitle('');
    setQPrompt('');
    setOptA('');
    setOptB('');
    setOptC('');
    playAudioChime('success');
    setTestNotice(`Test published to ${course.languageName} students.`);
    setTimeout(() => setTestNotice(null), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div className="bg-white border border-[#E5E3DC] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="text-xs font-semibold text-[#0F6B4B]">
            Tutor & System Administrator · {currentUser.fullName} ({currentUser.email})
          </div>
          <h1 className="font-display text-3xl font-semibold text-[#18181B]">
            Tutor & Admin Operations Console
          </h1>
          <p className="text-sm text-[#52525B] mt-1">
            Manage daily live Jitsi sessions, email enrolled students with class times, audit daily transaction reports, and enforce platform security.
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs shrink-0">
          <div>
            <div className="text-[#71717A]">Enrolled Students</div>
            <div className="font-mono text-2xl font-semibold text-[#18181B] tabular-nums">
              {enrollments.length}
            </div>
          </div>
          <div>
            <div className="text-[#71717A]">Daily Live Classes</div>
            <div className="font-mono text-2xl font-semibold text-[#0F6B4B] tabular-nums">
              {liveSessions.length}
            </div>
          </div>
          <div>
            <div className="text-[#71717A]">Today’s Revenue</div>
            <div className="font-mono text-2xl font-semibold text-[#18181B] tabular-nums">
              KES {totalRevenueKes.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Tutor Section Selector */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#F3F2EE] border border-[#E5E3DC] rounded-xl w-fit">
        {[
          { id: 'students', label: 'Enrolled Students & Email', icon: Users },
          { id: 'live_schedule', label: 'Daily Live Sessions', icon: Calendar },
          { id: 'reports', label: 'Daily Transaction Reports', icon: Receipt },
          { id: 'materials', label: 'Share Images, PDFs & Audio', icon: ImageIcon },
          { id: 'tests', label: 'Create & Share Tests', icon: ClipboardPlus },
          { id: 'feedback', label: 'Audio Review & Ratings', icon: Star },
          { id: 'admin_security', label: 'Admin & Security', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSection(tab.id as typeof section)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                section === tab.id
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

      {emailSentBanner && (
        <div className="p-3.5 rounded-xl bg-[#0F6B4B]/10 border border-[#0F6B4B]/30 text-xs text-[#0F6B4B] font-semibold">
          {emailSentBanner}
        </div>
      )}

      {/* SECTION 1: ENROLLED STUDENTS, MODULE COVERAGE & EMAIL CLASS TIME UPDATES */}
      {section === 'students' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E3DC] rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E3DC]">
              <div>
                <h2 className="font-display text-xl font-semibold text-[#18181B]">
                  Enrolled Students & Module Coverage
                </h2>
                <p className="text-xs text-[#52525B]">
                  View enrolled learners, send individual or cohort class-time emails, and manage access.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={emailCourseId}
                  onChange={(e) => setEmailCourseId(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#D4D4D8] text-xs bg-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.languageName} ({c.audience === 'adult' ? '3-Hr' : '1-Hr'})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => openEmailComposer('all_course')}
                  className="px-3.5 py-2 bg-[#0F6B4B] hover:bg-[#0B533A] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Course Students</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E5E3DC] text-[#71717A]">
                    <th className="py-3 px-4 font-semibold">Student & Email</th>
                    <th className="py-3 px-4 font-semibold">Language & Track</th>
                    <th className="py-3 px-4 font-semibold">Pass & Payment</th>
                    <th className="py-3 px-4 font-semibold">Modules Covered</th>
                    <th className="py-3 px-4 font-semibold">Test Avg</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E3DC]">
                  {enrollments.map((enr) => {
                    const course = courses.find((c) => c.id === enr.courseId);
                    const totalMods = course?.modules.length || enr.totalModules;
                    const covered = enr.completedModuleIds.length;
                    return (
                      <tr key={enr.id}>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-[#18181B]">{enr.studentName}</div>
                          <div className="font-mono text-[11px] text-[#52525B]">{enr.studentEmail}</div>
                          <div className="text-[11px] text-[#71717A]">
                            {enr.isReadyForClass ? 'Ready in live queue' : 'Offline'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-[#18181B]">{enr.languageName}</div>
                          <div className="text-[11px] text-[#52525B]">
                            {enr.audience === 'adult' ? 'Adult 3-Hr Live' : 'Children 1-Hr Interactive'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-[#0F6B4B]">
                            {enr.planType === 'monthly_pass' ? 'Monthly Unlimited' : 'Per-Session'}
                          </div>
                          <div className="font-mono text-[11px] text-[#52525B] tabular-nums">
                            {enr.paymentMethod.toUpperCase()} · KES {enr.amountKes.toLocaleString()}
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono tabular-nums">
                          <span className="font-semibold text-[#18181B]">
                            {covered} / {totalMods}
                          </span>{' '}
                          <span className="text-[#71717A]">
                            ({Math.round((covered / totalMods) * 100)}%)
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono font-semibold text-[#0F6B4B] tabular-nums">
                          {enr.testScoreAvg}%
                        </td>
                        <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => openEmailComposer(enr)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#E5E3DC] hover:bg-[#F3F2EE] text-[#18181B] rounded-lg font-semibold cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5 text-[#0F6B4B]" />
                            <span>Email Time</span>
                          </button>
                          <a
                            href={enr.jitsiRoomUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0F6B4B] text-white rounded-lg font-semibold"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Jitsi</span>
                          </a>
                          {enr.paymentStatus === 'completed' ? (
                            <button
                              onClick={() => onVerifyEnrollment(enr.id, 'revoked')}
                              title="Revoke access"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-[#E5E3DC] hover:bg-red-50 text-[#52525B] hover:text-red-600 rounded-lg cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onVerifyEnrollment(enr.id, 'completed')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#0F6B4B] text-white rounded-lg cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Verify</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Email Composer Drawer / Panel */}
          {emailTarget && (
            <form
              onSubmit={handleDispatchEmail}
              className="bg-white border border-[#0F6B4B] rounded-2xl p-6 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-semibold text-[#18181B]">
                  {emailTarget === 'all_course'
                    ? 'Send Class-Time Email to Enrolled Cohort'
                    : `Send Class-Time Email to ${emailTarget.studentName} (${emailTarget.studentEmail})`}
                </h3>
                <button
                  type="button"
                  onClick={() => setEmailTarget(null)}
                  className="text-[#52525B] hover:text-[#18181B] cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#3F3F46] mb-1">Email Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D4D4D8]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#3F3F46] mb-1">
                    Scheduled Class Date & Time
                  </label>
                  <input
                    type="text"
                    value={emailClassTime}
                    onChange={(e) => setEmailClassTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D4D4D8] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#3F3F46] mb-1">Message</label>
                <textarea
                  rows={3}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D4D4D8]"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0F6B4B] hover:bg-[#0B533A] text-white font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Class Update Email</span>
                </button>
                {emailTarget !== 'all_course' && (
                  <a
                    href={`mailto:${emailTarget.studentEmail}?subject=${encodeURIComponent(
                      emailSubject
                    )}&body=${encodeURIComponent(emailBody)}`}
                    className="px-4 py-2.5 border border-[#E5E3DC] hover:bg-[#F3F2EE] text-[#18181B] font-medium rounded-xl"
                  >
                    Open in Mail Client
                  </a>
                )}
              </div>
            </form>
          )}

          {/* Sent Email History */}
          <div className="bg-white border border-[#E5E3DC] rounded-2xl p-6 space-y-3">
            <h3 className="font-display text-lg font-semibold text-[#18181B]">
              Recent Class-Time Emails Sent ({emailNotifications.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {emailNotifications.slice(0, 6).map((mail) => (
                <div
                  key={mail.id}
                  className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E3DC] text-xs space-y-1"
                >
                  <div className="flex justify-between text-[11px] text-[#71717A]">
                    <span>
                      To: <strong className="text-[#18181B]">{mail.recipientEmail}</strong>
                    </span>
                    <span className="font-mono">{mail.sentAt}</span>
                  </div>
                  <div className="font-semibold text-[#0F6B4B]">{mail.subject}</div>
                  <div className="text-[#52525B] line-clamp-2">{mail.messageBody}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: DAILY LIVE SESSIONS MANAGER */}
      {section === 'live_schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form
            onSubmit={handleCreateLiveSession}
            className="lg:col-span-5 bg-white border border-[#E5E3DC] rounded-2xl p-6 space-y-4 text-xs h-fit"
          >
            <h2 className="font-display text-xl font-semibold text-[#18181B]">
              Post Daily Live Session Schedule
            </h2>
            <p className="text-[#52525B]">
              Publish or update daily live Jitsi classes. Enrolled students see updates immediately.
            </p>

            {sessNotice && (
              <div className="p-3 rounded-xl bg-[#0F6B4B]/10 border border-[#0F6B4B]/30 text-[#0F6B4B] font-semibold">
                {sessNotice}
              </div>
            )}

            <div>
              <label className="block font-medium text-[#3F3F46] mb-1">Course</label>
              <select
                value={sessCourseId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSessCourseId(id);
                  const found = courses.find((c) => c.id === id);
                  if (found) {
                    setSessStart(found.audience === 'adult' ? '18:00 EAT' : '10:00 EAT');
                    setSessEnd(found.audience === 'adult' ? '21:00 EAT' : '11:00 EAT');
                  }
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-[#D4D4D8] bg-white"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.languageName} — {c.audience === 'adult' ? 'Adult 3-Hr' : 'Children 1-Hr'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#3F3F46] mb-1">Session Date</label>
              <input
                type="date"
                value={sessDate}
                onChange={(e) => setSessDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#D4D4D8] font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-[#3F3F46] mb-1">Start Time</label>
                <input
                  type="text"
                  value={sessStart}
                  onChange={(e) => setSessStart(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D4D4D8] font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-[#3F3F46] mb-1">End Time</label>
                <input
                  type="text"
                  value={sessEnd}
                  onChange={(e) => setSessEnd(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D4D4D8] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#3F3F46] mb-1">Today’s Lesson Topic</label>
              <input
                type="text"
                value={sessTopic}
                onChange={(e) => setSessTopic(e.target.value)}
                placeholder="e.g. Conversational Greetings & Pronunciation Lab"
                className="w-full px-3 py-2.5 rounded-xl border border-[#D4D4D8]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0F6B4B] hover:bg-[#0B533A] text-white font-semibold rounded-xl cursor-pointer"
            >
              Publish Daily Live Session
            </button>
          </form>

          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-display text-xl font-semibold text-[#18181B]">
              Active Daily Live Sessions ({liveSessions.length})
            </h3>
            {liveSessions.map((sess) => (
              <div
                key={sess.id}
                className="bg-white border border-[#E5E3DC] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#52525B]">
                    <span className="font-semibold text-[#0F6B4B]">{sess.languageName}</span>
                    <span>·</span>
                    <span className="font-mono">
                      {sess.sessionDate} · {sess.startTimeEat} – {sess.endTimeEat}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-[#18181B]">{sess.topic}</div>
                  <div className="text-[11px] font-mono text-[#71717A]">{sess.jitsiRoomUrl}</div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={sess.status}
                    onChange={(e) =>
                      onUpdateSessionStatus(sess.id, e.target.value as DailyLiveSession['status'])
                    }
                    className="px-2.5 py-1.5 rounded-lg border border-[#D4D4D8] bg-white font-medium"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="live_now">Live Now</option>
                    <option value="completed">Completed</option>
                  </select>
                  <a
                    href={sess.jitsiRoomUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-[#0F6B4B] text-white rounded-lg font-semibold"
                  >
                    Launch Jitsi
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: DAILY TRANSACTION REPORTS */}
      {section === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E3DC] rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#18181B]">
                  Daily Transaction Report
                </h2>
                <p className="text-xs text-[#52525B]">
                  Daily breakdown of M-Pesa and Visa enrollment payments across Per-Session and Monthly Passes.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <input
                  type="date"
                  value={reportDateFilter === 'all' ? todayStr : reportDateFilter}
                  onChange={(e) => setReportDateFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#D4D4D8] font-mono"
                />
                <button
                  onClick={() => setReportDateFilter('all')}
                  className={`px-3 py-2 rounded-xl border font-medium cursor-pointer ${
                    reportDateFilter === 'all'
                      ? 'bg-[#0F6B4B] text-white border-[#0F6B4B]'
                      : 'border-[#E5E3DC] text-[#52525B]'
                  }`}
                >
                  All Dates
                </button>
                <button
                  onClick={handleExportCsv}
                  className="px-3.5 py-2 bg-[#18181B] text-white rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E3DC]">
                <div className="text-xs text-[#71717A]">Total Completed Revenue</div>
                <div className="font-mono text-2xl font-semibold text-[#0F6B4B] tabular-nums mt-1">
                  KES {totalRevenueKes.toLocaleString()}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E3DC]">
                <div className="text-xs text-[#71717A]">M-Pesa (Kenya)</div>
                <div className="font-mono text-2xl font-semibold text-[#18181B] tabular-nums mt-1">
                  KES {mpesaTotalKes.toLocaleString()}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E3DC]">
                <div className="text-xs text-[#71717A]">Visa (International)</div>
                <div className="font-mono text-2xl font-semibold text-[#18181B] tabular-nums mt-1">
                  KES {visaTotalKes.toLocaleString()}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E3DC]">
                <div className="text-xs text-[#71717A]">Completed Enrollments</div>
                <div className="font-mono text-2xl font-semibold text-[#18181B] tabular-nums mt-1">
                  {completedTx.length}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E5E3DC] text-[#71717A]">
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Transaction Ref</th>
                    <th className="py-3 px-4 font-semibold">Student</th>
                    <th className="py-3 px-4 font-semibold">Course</th>
                    <th className="py-3 px-4 font-semibold">Plan</th>
                    <th className="py-3 px-4 font-semibold">Method</th>
                    <th className="py-3 px-4 font-semibold">Amount (KES)</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E3DC]">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-[#71717A]">
                        No transactions recorded for {reportDateFilter}.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="py-3.5 px-4 font-mono">{tx.enrolledAt}</td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-[#18181B]">
                          {tx.transactionRef}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#18181B]">{tx.studentName}</div>
                          <div className="text-[11px] text-[#71717A]">{tx.studentEmail}</div>
                        </td>
                        <td className="py-3.5 px-4">{tx.languageName}</td>
                        <td className="py-3.5 px-4">
                          {tx.planType === 'monthly_pass' ? 'Monthly Pass' : 'Per Session'}
                        </td>
                        <td className="py-3.5 px-4 uppercase font-mono">{tx.paymentMethod}</td>
                        <td className="py-3.5 px-4 font-mono font-semibold tabular-nums">
                          {tx.amountKes.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#0F6B4B] capitalize">
                          {tx.paymentStatus}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: SHARE IMAGES, UPLOAD PDFS & AUDIO */}
      {section === 'materials' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form
            onSubmit={handlePublishMaterial}
            className="lg:col-span-5 bg-white border border-[#E5E3DC] rounded-2xl p-6 space-y-4 text-xs h-fit"
          >
            <h2 className="font-display text-xl font-semibold text-[#18181B]">
              Share Resource with Students
            </h2>

            {matNotice && (
              <div className="p-3 rounded-xl bg-[#0F6B4B]/10 border border-[#0F6B4B]/30 text-[#0F6B4B] font-semibold">
                {matNotice}
              </div>
            )}

            <div>
              <label className="block font-medium text-[#3F3F46] mb-1">Resource Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['image', 'pdf', 'audio'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setMatType(t)}
                    className={`py-2 rounded-lg border font-semibold uppercase cursor-pointer ${
                      matType === t
                        ? 'border-[#0F6B4B] bg-[#0F6B4B]/5 text-[#0F6B4B]'
                        : 'border-[#E5E3DC] text-[#52525B]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#3F3F46] mb-1">Target Course</label>
              <select
                value={matCourseId}
                onChange={(e) => setMatCourseId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#D4D4D8] bg-white"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.languageName} — {c.audience === 'adult' ? 'Adult 3-Hr' : 'Kids 1-Hr'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#3F3F46] mb-1">Title</label>
              <input
                type="text"
                value={matTitle}
                onChange={(e) => setMatTitle(e.target.value)}
                placeholder="e.g. Market Fruits Visual Explanation"
                className="w-full px-3 py-2.5 rounded-xl border border-[#D4D4D8]"
              />
            </div>

            {matType === 'image' && (
              <div>
                <label className="block font-medium text-[#3F3F46] mb-1">
                  Upload Image from Computer (or keep default)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileSelect}
                  className="w-full text-xs text-[#52525B]"
                />
              </div>
            )}

            <div>
              <label className="block font-medium text-[#3F3F46] mb-1">
                {matType === 'audio' ? 'Spoken Script / Audio Notes' : 'Explanation / Description'}
              </label>
              <textarea
                rows={3}
                value={matDesc}
                onChange={(e) => setMatDesc(e.target.value)}
                placeholder="Explain what students will learn from this resource..."
                className="w-full px-3 py-2.5 rounded-xl border border-[#D4D4D8]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0F6B4B] hover:bg-[#0B533A] text-white font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileUp className="w-4 h-4" />
              <span>Share with Students</span>
            </button>
          </form>

          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-display text-xl font-semibold text-[#18181B]">
              Currently Shared Library ({materials.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {materials.map((m) => (
                <div
                  key={m.id}
                  className="bg-white border border-[#E5E3DC] rounded-2xl p-4 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#0F6B4B] uppercase">{m.materialType}</span>
                    <span className="text-[#71717A]">{m.languageName}</span>
                  </div>
                  <div className="font-semibold text-sm text-[#18181B]">{m.title}</div>
                  <p className="text-[#52525B] line-clamp-2">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: CREATE & SHARE TESTS */}
      {section === 'tests' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form
            onSubmit={handlePublishTest}
            className="lg:col-span-6 bg-white border border-[#E5E3DC] rounded-2xl p-6 space-y-4 text-xs"
          >
            <h2 className="font-display text-xl font-semibold text-[#18181B]">
              Create & Share Language Test
            </h2>

            {testNotice && (
              <div className="p-3 rounded-xl bg-[#0F6B4B]/10 border border-[#0F6B4B]/30 text-[#0F6B4B] font-semibold">
                {testNotice}
              </div>
            )}

            <div>
              <label className="block font-medium text-[#3F3F46] mb-1">Course</label>
              <select
                value={testCourseId}
                onChange={(e) => setTestCourseId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#D4D4D8] bg-white"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.languageName} — {c.audience === 'adult' ? 'Adult' : 'Children'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#3F3F46] mb-1">Test Title</label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="e.g. Module 3 Vocabulary & Etiquette Quiz"
                className="w-full px-3 py-2.5 rounded-xl border border-[#D4D4D8]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#3F3F46] mb-1">Question Prompt</label>
              <input
                type="text"
                value={qPrompt}
                onChange={(e) => setQPrompt(e.target.value)}
                placeholder="e.g. How do you say 'Good morning' in French?"
                className="w-full px-3 py-2.5 rounded-xl border border-[#D4D4D8]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={optA}
                onChange={(e) => setOptA(e.target.value)}
                placeholder="Option A"
                className="px-3 py-2 rounded-xl border border-[#D4D4D8]"
              />
              <input
                type="text"
                value={optB}
                onChange={(e) => setOptB(e.target.value)}
                placeholder="Option B"
                className="px-3 py-2 rounded-xl border border-[#D4D4D8]"
              />
              <input
                type="text"
                value={optC}
                onChange={(e) => setOptC(e.target.value)}
                placeholder="Option C"
                className="px-3 py-2 rounded-xl border border-[#D4D4D8]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#3F3F46] mb-1">Correct Option</label>
              <select
                value={correctIdx}
                onChange={(e) => setCorrectIdx(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-[#D4D4D8] bg-white"
              >
                <option value={0}>Option A</option>
                <option value={1}>Option B</option>
                <option value={2}>Option C</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0F6B4B] hover:bg-[#0B533A] text-white font-semibold rounded-xl cursor-pointer"
            >
              Publish Test to Students
            </button>
          </form>

          <div className="lg:col-span-6 space-y-4">
            <h3 className="font-display text-xl font-semibold text-[#18181B]">
              Published Tests & Word Game Activity
            </h3>
            {tests.map((t) => (
              <div key={t.id} className="bg-white border border-[#E5E3DC] rounded-2xl p-4 text-xs">
                <div className="font-semibold text-[#0F6B4B]">{t.languageName}</div>
                <div className="font-semibold text-sm text-[#18181B] mt-0.5">{t.title}</div>
                <div className="text-[#52525B] mt-1">{t.questions.length} question(s)</div>
              </div>
            ))}

            {wordGameScores.length > 0 && (
              <div className="bg-white border border-[#E5E3DC] rounded-2xl p-4 space-y-2 text-xs">
                <div className="font-semibold text-[#B45309]">Children’s Word Game Scores</div>
                {wordGameScores.map((wg) => (
                  <div key={wg.id} className="flex justify-between text-[#3F3F46]">
                    <span>
                      {wg.studentName} · {wg.languageName}
                    </span>
                    <span className="font-mono font-semibold tabular-nums">{wg.score} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 6: AUDIO PRONUNCIATION REVIEW & SATISFACTION RATINGS */}
      {section === 'feedback' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-[#E5E3DC] rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-xl font-semibold text-[#18181B] flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-[#0F6B4B]" />
              <span>Student Pronunciation Recordings</span>
            </h2>
            {audioSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E3DC] space-y-2 text-xs"
              >
                <div className="flex justify-between">
                  <span className="font-semibold text-[#18181B]">
                    {sub.studentName} · {sub.language}
                  </span>
                  <span className="font-mono font-semibold text-[#0F6B4B] tabular-nums">
                    {sub.accuracyScore}%
                  </span>
                </div>
                <div className="font-medium text-[#18181B]">"{sub.phrase}"</div>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={audioNotes[sub.id] ?? sub.tutorFeedback}
                    onChange={(e) => setAudioNotes({ ...audioNotes, [sub.id]: e.target.value })}
                    placeholder="Write pronunciation feedback..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-[#D4D4D8] bg-white"
                  />
                  <button
                    onClick={() => {
                      onFeedbackAudio(sub.id, audioNotes[sub.id] ?? sub.tutorFeedback);
                      playAudioChime('success');
                    }}
                    className="px-3 py-1.5 bg-[#0F6B4B] text-white rounded-lg font-semibold cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-[#E5E3DC] rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-xl font-semibold text-[#18181B] flex items-center gap-2">
              <Star className="w-5 h-5 text-[#B45309]" />
              <span>Student Satisfaction Ratings ({ratings.length})</span>
            </h2>
            {ratings.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E3DC] space-y-1.5 text-xs"
              >
                <div className="flex justify-between">
                  <span className="font-semibold text-[#18181B]">
                    {r.studentName} · {r.languageName}
                  </span>
                  <span className="font-mono text-[#B45309]">{'★'.repeat(r.rating)}</span>
                </div>
                <div className="text-[#0F6B4B] font-medium">{r.satisfactionLevel}</div>
                <p className="text-[#3F3F46]">"{r.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 7: SYSTEM ADMIN, USER ACCESS & SECURITY AUDIT LOG */}
      {section === 'admin_security' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Provision New Tutor/Admin (Admin Only) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (
                  !newTutorName.trim() ||
                  !newTutorEmail.includes('@') ||
                  newTutorPass.length < 6 ||
                  newTutorPin.trim().length < 4
                ) {
                  setAdminNotice('Provide full name, valid email, 6+ char password, and 4+ digit PIN.');
                  return;
                }
                onCreateTutorAccount({
                  fullName: newTutorName.trim(),
                  email: newTutorEmail.trim().toLowerCase(),
                  password: newTutorPass,
                  adminPin: newTutorPin.trim(),
                });
                setNewTutorName('');
                setNewTutorEmail('');
                setNewTutorPass('');
                setNewTutorPin('');
                playAudioChime('success');
                setAdminNotice('Authorized new Tutor & Admin account.');
                setTimeout(() => setAdminNotice(null), 4000);
              }}
              className="lg:col-span-5 bg-white border border-[#E5E3DC] rounded-2xl p-6 space-y-4 text-xs h-fit"
            >
              <div className="flex items-center gap-2 text-[#0F6B4B] font-semibold">
                <UserPlus className="w-4 h-4" />
                <span>Admin Provisioning</span>
              </div>
              <h2 className="font-display text-xl font-semibold text-[#18181B]">
                Authorize New Tutor / Admin Account
              </h2>
              <p className="text-[#52525B]">
                Tutor accounts cannot be created from the student registration page. Only an authenticated Admin can authorize staff access.
              </p>

              {adminNotice && (
                <div className="p-3 rounded-xl bg-[#0F6B4B]/10 border border-[#0F6B4B]/30 text-[#0F6B4B] font-semibold">
                  {adminNotice}
                </div>
              )}

              <div>
                <label className="block font-medium text-[#3F3F46] mb-1">Tutor Full Name</label>
                <input
                  type="text"
                  value={newTutorName}
                  onChange={(e) => setNewTutorName(e.target.value)}
                  placeholder="e.g. Prof. Kamau Njoroge"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D4D4D8]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#3F3F46] mb-1">Staff Email</label>
                <input
                  type="email"
                  value={newTutorEmail}
                  onChange={(e) => setNewTutorEmail(e.target.value)}
                  placeholder="kamau@lughasmart.ac.ke"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D4D4D8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#3F3F46] mb-1">Password</label>
                  <input
                    type="password"
                    value={newTutorPass}
                    onChange={(e) => setNewTutorPass(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D4D4D8]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#3F3F46] mb-1">Security PIN</label>
                  <input
                    type="password"
                    value={newTutorPin}
                    onChange={(e) => setNewTutorPin(e.target.value)}
                    placeholder="6-digit PIN"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D4D4D8] font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#18181B] hover:bg-[#27272A] text-white font-semibold rounded-xl cursor-pointer"
              >
                Create Tutor Admin Account
              </button>
            </form>

            {/* User Directory & Suspension Control */}
            <div className="lg:col-span-7 bg-white border border-[#E5E3DC] rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-[#18181B]">
                  Registered Accounts & Access Control ({users.length})
                </h2>
                <p className="text-xs text-[#52525B]">
                  Suspend or restore student accounts to immediately block unauthorized or suspicious logins.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E5E3DC] text-[#71717A]">
                      <th className="py-2.5 px-3 font-semibold">User</th>
                      <th className="py-2.5 px-3 font-semibold">Role</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Admin Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E3DC]">
                    {users.map((u) => (
                      <tr key={u.uid}>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#18181B]">{u.fullName}</div>
                          <div className="font-mono text-[11px] text-[#71717A]">{u.email}</div>
                        </td>
                        <td className="py-3 px-3">
                          {u.role === 'tutor' ? (
                            <span className="font-semibold text-[#0F6B4B]">Tutor / Admin</span>
                          ) : (
                            <span className="text-[#52525B]">Student</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {u.isSuspended ? (
                            <span className="text-red-600 font-semibold">Suspended</span>
                          ) : (
                            <span className="text-[#0F6B4B] font-semibold">Active</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {u.role === 'student' ? (
                            <button
                              onClick={() => onToggleUserSuspended(u.uid)}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                                u.isSuspended
                                  ? 'border-[#0F6B4B] text-[#0F6B4B] hover:bg-[#0F6B4B]/5'
                                  : 'border-red-200 text-red-600 hover:bg-red-50'
                              }`}
                            >
                              {u.isSuspended ? 'Reactivate' : 'Suspend'}
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#71717A] font-mono">Protected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Security Audit Log */}
          <div className="bg-white border border-[#E5E3DC] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold text-[#18181B]">
                  Security & Unauthorized Access Audit Log ({auditLogs.length})
                </h3>
                <p className="text-xs text-[#52525B]">
                  Records blocked student attempts on the Tutor/Admin portal, failed logins, and admin actions.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E5E3DC] text-[#71717A]">
                    <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                    <th className="py-2.5 px-3 font-semibold">Actor</th>
                    <th className="py-2.5 px-3 font-semibold">Action & Endpoint</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E3DC]">
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-3 px-3 font-mono text-[11px] text-[#52525B] whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-mono text-[11px] text-[#18181B]">{log.actorEmail}</div>
                        <div className="text-[11px] text-[#71717A]">{log.actorRole}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <div className="font-semibold text-[#18181B]">{log.action}</div>
                        <div className="text-[#71717A]">{log.endpoint}</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold">
                        <span
                          className={
                            log.httpStatus >= 400 ? 'text-red-600' : 'text-[#0F6B4B]'
                          }
                        >
                          {log.httpStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#3F3F46]">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
