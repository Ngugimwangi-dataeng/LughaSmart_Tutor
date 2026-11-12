import React from 'react';
import { User, Enrollment, Course, AudioSubmission, SupportedLocale } from '../types';
import { translations } from '../i18n/translations';
import { 
  Award, 
  TrendingUp, 
  Receipt, 
  CheckCircle2, 
  ShieldCheck, 
  Volume2, 
  FileText,
  Calendar
} from 'lucide-react';

interface StudentProgressProps {
  user: User;
  enrollments: Enrollment[];
  courses: Course[];
  audioSubmissions: AudioSubmission[];
  locale: SupportedLocale;
  onOpenReceipt: (enrollment: Enrollment) => void;
}

export const StudentProgress: React.FC<StudentProgressProps> = ({
  user,
  enrollments,
  courses,
  audioSubmissions,
  locale,
  onOpenReceipt,
}) => {
  const t = translations[locale];
  const paidEnrollments = enrollments.filter(e => e.payment_status === 'completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
            Endpoint Pathway: /student/progress
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Academic Progress & Verified Payment History
          </h1>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Student ID: <span className="font-mono font-semibold text-slate-900 dark:text-white">STU-00{user.id}</span>
        </div>
      </div>

      {/* KPI Cards Row (Tabular Figures) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
            Enrolled Languages
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {paidEnrollments.length}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active Curricula</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
            Vocabulary Mastered
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            184
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1 font-medium">
            <Award className="w-3.5 h-3.5" />
            <span>Colloquial & Business</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
            Phonetic Accuracy Avg
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            92.8%
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-2 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Native Tone Match</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
            Live 1-on-1 Sessions
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            4 <span className="text-xs text-slate-400 font-normal">/ 12</span>
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>Next session today</span>
          </div>
        </div>

      </div>

      {/* Verified Payment Receipts History */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <span>Payment & Transaction Audit History</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Safaricom Daraja M-Pesa STK Push receipts and Visa/Mastercard 3D Secure authorizations
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Transaction Ref</th>
                <th className="py-3 px-4 font-semibold">Course Program</th>
                <th className="py-3 px-4 font-semibold">Payment Gateway</th>
                <th className="py-3 px-4 font-semibold">Amount (KES)</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Enrolled Timestamp</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {paidEnrollments.map((enr) => {
                const course = enr.course || courses.find(c => c.id === enr.course_id);
                return (
                  <tr key={enr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                      {enr.transaction_ref || `TX_REF_${enr.id}9382`}
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {course ? course.title : `Course #${enr.course_id}`}
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                      <span className="font-semibold uppercase text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {enr.payment_method === 'mpesa' ? 'Safaricom M-Pesa' : 'Visa / Mastercard'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-extrabold text-slate-900 dark:text-white tabular-nums">
                      KES {course ? course.price_kes.toLocaleString() : '4,500.00'}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-500">
                      {enr.enrolled_at}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => onOpenReceipt(enr)}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-xs transition-colors"
                      >
                        View Receipt
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audio Pronunciation Submissions & Tutor Feedback Log */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-purple-600" />
            <span>Pronunciation Audits & Tutor Feedback</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Voice recordings submitted to native language instructors with acoustic feedback
          </p>
        </div>

        <div className="space-y-4">
          {audioSubmissions.map((sub) => (
            <div
              key={sub.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-purple-600 uppercase">{sub.language}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{sub.submitted_at}</span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  "{sub.phrase}"
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 italic">
                  Tutor Notes: {sub.feedback || 'Review pending from instructor.'}
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-medium">Acoustic Score</div>
                  <div className="text-xl font-extrabold text-emerald-600 tabular-nums">
                    {sub.accuracy_score}%
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 text-xs font-bold">
                  Passed
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
