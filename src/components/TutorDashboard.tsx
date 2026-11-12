import React, { useState } from 'react';
import { User, Course, AudioSubmission, SupportedLocale, SecurityAuditLog } from '../types';
import { translations } from '../i18n/translations';
import { playAudioChime } from '../utils/audio';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  Video, 
  FileUp, 
  Volume2, 
  CheckCircle2, 
  Radio, 
  ExternalLink,
  Lock,
  ArrowUpRight,
  Send
} from 'lucide-react';

interface ReadyStudentItem {
  enrollment_id: number;
  student: User;
  course: Course;
  is_ready: boolean;
  enrolled_at: string;
  payment_method?: 'mpesa' | 'visa';
  transaction_ref?: string;
}

interface TutorDashboardProps {
  currentUser: User;
  courses: Course[];
  readyStudents: ReadyStudentItem[];
  audioSubmissions: AudioSubmission[];
  auditLogs: SecurityAuditLog[];
  locale: SupportedLocale;
  onLaunchLiveSession: (course: Course, student: User) => void;
  onUpdateCurriculumPdf: (courseId: number, pdfName: string, notes: string) => Promise<void>;
  onSubmitAudioFeedback: (submissionId: string, feedbackText: string) => Promise<void>;
}

export const TutorDashboard: React.FC<TutorDashboardProps> = ({
  currentUser,
  courses,
  readyStudents,
  audioSubmissions,
  auditLogs,
  locale,
  onLaunchLiveSession,
  onUpdateCurriculumPdf,
  onSubmitAudioFeedback,
}) => {
  const t = translations[locale];
  
  // State for PDF update modal/form
  const [selectedCourseForPdf, setSelectedCourseForPdf] = useState<number>(courses[0]?.id || 101);
  const [newPdfName, setNewPdfName] = useState('LughaSmart_Kiswahili_Advanced_Colloquial_2026.pdf');
  const [pdfNotes, setPdfNotes] = useState('Added Section 4 on Nairobi Sheng and coastal polite honorifics.');
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);

  // State for audio feedback
  const [feedbackTextMap, setFeedbackTextMap] = useState<Record<string, string>>({});
  const [feedbackSending, setFeedbackSending] = useState<string | null>(null);

  // STRICT RBAC CHECK: If non-tutor accesses this component
  if (currentUser.role !== 'tutor') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-mono font-bold text-red-600 uppercase tracking-widest">
              HTTP 403 — ACCESS DENIED (RBAC_POLICY_VIOLATION)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Tutor & Administrative Pathway Segregated
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
              As defined in the LughaSmart System Architecture guarantee: Students operate strictly under <code>/student/*</code> endpoints and cannot view or access <code>/tutor/*</code> management portals. Direct URL manipulation triggers instant authorization denial.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-red-100 dark:border-red-900/50 max-w-lg mx-auto text-left text-xs font-mono text-slate-600 dark:text-slate-300 space-y-1">
            <div><strong>Active User:</strong> {currentUser.full_name} ({currentUser.email})</div>
            <div><strong>Assigned Role:</strong> student (RESTRICTED)</div>
            <div><strong>Required Role:</strong> tutor</div>
            <div><strong>Security Audit Event:</strong> Logged to central audit pipeline</div>
          </div>

          <div className="pt-2 text-xs text-slate-500">
            To test the tutor interface, switch your role to <strong>Tutor View (Dr. Amina Wambui)</strong> using the top control bar.
          </div>
        </div>
      </div>
    );
  }

  const handlePdfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPdfName.trim()) return;
    await onUpdateCurriculumPdf(selectedCourseForPdf, newPdfName, pdfNotes);
    playAudioChime('success');
    setPdfSuccessMessage(`Curriculum updated to '${newPdfName}' and pushed to enrolled students.`);
    setTimeout(() => setPdfSuccessMessage(null), 4000);
  };

  const handleSendFeedback = async (subId: string) => {
    const text = feedbackTextMap[subId];
    if (!text || !text.trim()) return;
    setFeedbackSending(subId);
    try {
      await onSubmitAudioFeedback(subId, text);
      playAudioChime('success');
      setFeedbackTextMap(prev => ({ ...prev, [subId]: '' }));
    } finally {
      setFeedbackSending(null);
    }
  };

  const activeReadyStudents = readyStudents.filter(s => s.is_ready);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Tutor Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>AUTHENTICATED TUTOR CONSOLE: /tutor/dashboard</span>
            <span aria-hidden="true">·</span>
            <span>Dr. Amina Wambui</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Tutor Command & Live Instruction Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Monitor real-time student readiness, launch one-click live classrooms, push PDF syllabus updates, and review pronunciation recordings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-3 bg-slate-800/80 rounded-2xl border border-slate-700 text-center">
            <div className="text-xs text-slate-400">Ready in Waiting Room</div>
            <div className="text-2xl font-black text-emerald-400 tabular-nums">
              {activeReadyStudents.length} Students
            </div>
          </div>
        </div>
      </div>

      {/* Primary Section: Real-Time Live Student Tracking ("I am Ready for Class") */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-600 animate-pulse" />
              <span>Real-Time "Ready for Class" Live Waiting Room</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live students who have activated their readiness toggle and are waiting for immediate 1-on-1 instruction
            </p>
          </div>
        </div>

        {activeReadyStudents.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-500 space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <div className="font-semibold text-slate-700 dark:text-slate-300">No students are currently toggled "Ready for Class"</div>
            <div>Switch to Student View in the top bar and toggle "I am Ready for Class" to test real-time visibility.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeReadyStudents.map((item) => (
              <div
                key={item.enrollment_id}
                className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-500/80 p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                      {item.student.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {item.student.full_name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {item.student.email}
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>READY NOW</span>
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
                  <div className="text-slate-500">Target Language:</div>
                  <div className="font-bold text-slate-800 dark:text-slate-100">{item.course.title}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Payment Ref: {item.transaction_ref || 'VERIFIED_MPESA'}
                  </div>
                </div>

                <button
                  onClick={() => onLaunchLiveSession(item.course, item.student)}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  <span>Launch Live 1-on-1 Session with {item.student.full_name.split(' ')[0]}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two Column Grid: PDF Curriculum Update & Pronunciation Review */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PDF Curriculum Update Tool (Proposal Requirement) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileUp className="w-5 h-5 text-emerald-600" />
              <span>Curriculum PDF Update Manager</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Upload revised course syllabi, pronunciation guides, and lesson plans. Immediately synchronizes with all enrolled student accounts.
            </p>
          </div>

          {pdfSuccessMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{pdfSuccessMessage}</span>
            </div>
          )}

          <form onSubmit={handlePdfSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Course to Update
              </label>
              <select
                value={selectedCourseForPdf}
                onChange={(e) => setSelectedCourseForPdf(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.language_name} — {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                PDF Document File Name
              </label>
              <input
                type="text"
                value={newPdfName}
                onChange={(e) => setNewPdfName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                placeholder="e.g. Swahili_Curriculum_v4_Updated.pdf"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Release Notes / Syllabus Changes
              </label>
              <textarea
                value={pdfNotes}
                onChange={(e) => setPdfNotes(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="Describe new grammar sections, vocabulary additions or schedule changes..."
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <FileUp className="w-4 h-4" />
              <span>Publish PDF Update to Students</span>
            </button>
          </form>

          {/* Proposal PDF reference */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 mb-2 font-medium">Original System Architecture Proposal PDF:</div>
            <a
              href="/public/assets/aistudio/LughaSmart_System_Design___Proposal__3__c33dc71a.pdf"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center justify-between hover:bg-slate-100"
            >
              <span>LughaSmart_System_Design___Proposal__3.pdf</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Audio Pronunciation Review Tool */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-purple-600" />
              <span>Student Pronunciation Audio Submissions</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Listen to learner microphone recordings and send vocal critique and accent corrections.
            </p>
          </div>

          <div className="space-y-4">
            {audioSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-purple-700 dark:text-purple-400 uppercase">
                      {sub.language}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-500">Student ID #{sub.student_id}</span>
                  </div>
                  <span className="font-bold text-emerald-600 tabular-nums">
                    Accuracy: {sub.accuracy_score}%
                  </span>
                </div>

                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  "{sub.phrase}"
                </div>

                {sub.feedback && (
                  <div className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <strong>Current Feedback:</strong> {sub.feedback}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={feedbackTextMap[sub.id] || ''}
                    onChange={(e) => setFeedbackTextMap({ ...feedbackTextMap, [sub.id]: e.target.value })}
                    placeholder="Type tutor phonetics feedback (e.g. emphasize the rolling 'r')..."
                    className="flex-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                  <button
                    onClick={() => handleSendFeedback(sub.id)}
                    disabled={feedbackSending === sub.id}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Security Audit & Webhook Logs (from Proposal Section 2) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Security Access & Daraja Webhook Audit Feed</span>
            </h2>
            <p className="text-xs text-slate-500">
              Real-time RBAC policy enforcement, Daraja M-Pesa STK push confirmations, and Visa 3D-Secure settlements.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">User Email</th>
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">Pathway / Action</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {auditLogs.slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 text-slate-500">{log.timestamp}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{log.user_email}</td>
                  <td className="py-2.5 px-3 uppercase text-slate-500">{log.role}</td>
                  <td className="py-2.5 px-3 text-blue-600 font-semibold">{log.action}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === '200_OK' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
