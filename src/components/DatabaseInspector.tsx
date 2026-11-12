import React, { useState } from 'react';
import { User, Course, Enrollment } from '../types';
import { 
  Database, 
  Terminal, 
  Play, 
  Copy, 
  Check, 
  DollarSign, 
  Layers, 
  Server,
  X
} from 'lucide-react';

interface DatabaseInspectorProps {
  users: User[];
  courses: Course[];
  enrollments: Enrollment[];
  onClose: () => void;
}

export const DatabaseInspector: React.FC<DatabaseInspectorProps> = ({
  users,
  courses,
  enrollments,
  onClose,
}) => {
  const [activeQuery, setActiveQuery] = useState<'users' | 'courses' | 'enrollments' | 'join'>('enrollments');
  const [copied, setCopied] = useState(false);

  const postgresSchema = `-- LUGHA SMART POSTGRESQL SCHEMA (As specified in Proposal Architecture)

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('student', 'tutor')) DEFAULT 'student',
  reset_token VARCHAR(255) DEFAULT NULL,
  reset_token_expiry TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  language_name VARCHAR(50) NOT NULL,
  description TEXT,
  price_kes DECIMAL(10, 2) NOT NULL,
  course_type VARCHAR(20) CHECK (course_type IN ('pdf', 'audio', 'live')) NOT NULL
);

CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES users(id) ON DELETE CASCADE,
  course_id INT REFERENCES courses(id) ON DELETE CASCADE,
  payment_status VARCHAR(20) DEFAULT 'pending',
  is_ready_for_class BOOLEAN DEFAULT FALSE,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(postgresSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                PostgreSQL Architecture & Proposal Budget
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Database Schema & Live Query Inspector
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* SQL Query Sandbox Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-600" />
                <span>Interactive Live SQL Query Execution</span>
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                Engine: PostgreSQL 16.2 / Connection: PgBouncer
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveQuery('enrollments')}
                className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-all ${
                  activeQuery === 'enrollments'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                SELECT * FROM enrollments;
              </button>
              <button
                onClick={() => setActiveQuery('join')}
                className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-all ${
                  activeQuery === 'join'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                SELECT * FROM enrollments JOIN users...
              </button>
              <button
                onClick={() => setActiveQuery('users')}
                className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-all ${
                  activeQuery === 'users'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                SELECT * FROM users;
              </button>
              <button
                onClick={() => setActiveQuery('courses')}
                className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-all ${
                  activeQuery === 'courses'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                SELECT * FROM courses;
              </button>
            </div>

            {/* Results Table */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-950 text-slate-200 font-mono text-[11px]">
              <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400">
                <span>Query Result Output</span>
                <span className="text-emerald-400">● Status: 200 OK (0.42 ms)</span>
              </div>

              <div className="overflow-x-auto p-2">
                {activeQuery === 'enrollments' && (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="p-2">id</th>
                        <th className="p-2">student_id</th>
                        <th className="p-2">course_id</th>
                        <th className="p-2">payment_status</th>
                        <th className="p-2">is_ready_for_class</th>
                        <th className="p-2">enrolled_at</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {enrollments.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-900/60">
                          <td className="p-2 font-bold text-white">{e.id}</td>
                          <td className="p-2 text-indigo-400">{e.student_id}</td>
                          <td className="p-2 text-indigo-400">{e.course_id}</td>
                          <td className="p-2 text-emerald-400 font-semibold">{e.payment_status}</td>
                          <td className="p-2">
                            <span className={e.is_ready_for_class ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                              {e.is_ready_for_class ? 'TRUE (READY)' : 'FALSE'}
                            </span>
                          </td>
                          <td className="p-2 text-slate-400">{e.enrolled_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeQuery === 'join' && (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="p-2">enrollment_id</th>
                        <th className="p-2">student_name</th>
                        <th className="p-2">course_title</th>
                        <th className="p-2">language</th>
                        <th className="p-2">payment_status</th>
                        <th className="p-2">is_ready</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {enrollments.map((e) => {
                        const u = users.find(x => x.id === e.student_id);
                        const c = courses.find(x => x.id === e.course_id);
                        return (
                          <tr key={e.id} className="hover:bg-slate-900/60">
                            <td className="p-2 font-bold text-white">{e.id}</td>
                            <td className="p-2 text-indigo-300">{u?.full_name || 'Student'}</td>
                            <td className="p-2 text-white">{c?.title}</td>
                            <td className="p-2 text-amber-400">{c?.language_name}</td>
                            <td className="p-2 text-emerald-400 font-bold">{e.payment_status}</td>
                            <td className="p-2 text-emerald-300">{e.is_ready_for_class ? 'TRUE' : 'FALSE'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                {activeQuery === 'users' && (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="p-2">id</th>
                        <th className="p-2">full_name</th>
                        <th className="p-2">email</th>
                        <th className="p-2">role</th>
                        <th className="p-2">created_at</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-900/60">
                          <td className="p-2 font-bold text-white">{u.id}</td>
                          <td className="p-2 text-white">{u.full_name}</td>
                          <td className="p-2 text-slate-400">{u.email}</td>
                          <td className="p-2 font-bold uppercase text-emerald-400">{u.role}</td>
                          <td className="p-2 text-slate-500">{u.created_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeQuery === 'courses' && (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="p-2">id</th>
                        <th className="p-2">title</th>
                        <th className="p-2">language_name</th>
                        <th className="p-2">price_kes</th>
                        <th className="p-2">course_type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {courses.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-900/60">
                          <td className="p-2 font-bold text-white">{c.id}</td>
                          <td className="p-2 text-white">{c.title}</td>
                          <td className="p-2 text-amber-400">{c.language_name}</td>
                          <td className="p-2 text-emerald-400 font-bold tabular-nums">KES {c.price_kes}</td>
                          <td className="p-2 uppercase text-purple-400 font-semibold">{c.course_type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* DDL Schema View */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">DDL Schema Specification (from Proposal PDF)</span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-slate-950 text-slate-300 font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed">
              {postgresSchema}
            </pre>
          </div>

          {/* Implementation Budget (KES) from Page 2 of Proposal */}
          <div className="space-y-3 pt-2">
            <div className="font-bold text-slate-900 dark:text-white">
              Official Proposal Implementation Budget Breakdown (Page 2)
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500">
                  <tr>
                    <th className="py-2.5 px-4">Item Description</th>
                    <th className="py-2.5 px-4">Details & Allocation</th>
                    <th className="py-2.5 px-4 text-right">Cost (KES)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">Hosting & Domain Setup</td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">Cloud VPS (Render/DigitalOcean) + Custom `.co.ke` domain for 1 year</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold">15,000</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">Payment Integration</td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">Safaricom Daraja API setup & Webhook callback listener configuration</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold">3,000</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">Core System Development</td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">Python Flask backend, PostgreSQL schema, strict RBAC & Frontend UI</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold">45,000</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">Operational Contingency</td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">Buffer fund for initial setup adjustments</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold">5,000</td>
                  </tr>
                  <tr className="bg-emerald-50 dark:bg-emerald-950/40 font-bold text-emerald-900 dark:text-emerald-300">
                    <td className="py-3 px-4" colSpan={2}>Total Project Budget Estimate</td>
                    <td className="py-3 px-4 text-right font-mono text-sm">KES 68,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
