import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, Lock, User as UserIcon, UserPlus, LogIn } from 'lucide-react';

interface AuthModalProps {
  registeredUsers: UserProfile[];
  initialNotice?: string | null;
  onClose: () => void;
  onRegisterStudent: (user: UserProfile) => void;
  onStudentLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  registeredUsers,
  initialNotice,
  onClose,
  onRegisterStudent,
  onStudentLoginSuccess,
}) => {
  const [authTab, setAuthTab] = useState<'login' | 'register'>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters for account security.');
      return;
    }

    if (authTab === 'register') {
      if (!fullName.trim()) {
        setError('Please enter your full name to register.');
        return;
      }
      if (registeredUsers.some((u) => u.email.toLowerCase() === normalizedEmail)) {
        setError('An account with this email already exists. Please log in instead.');
        return;
      }

      const newStudent: UserProfile = {
        uid: `student-${Date.now()}`,
        fullName: fullName.trim(),
        email: normalizedEmail,
        password,
        role: 'student',
        isAdmin: false,
        isSuspended: false,
        createdAt: new Date().toISOString().slice(0, 10),
      };

      onRegisterStudent(newStudent);
      onStudentLoginSuccess(newStudent);
      onClose();
      return;
    }

    // Student Login ONLY — never authenticate tutor/admin accounts here
    const matched = registeredUsers.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.role === 'student'
    );
    if (!matched) {
      setError('Invalid student credentials or account not registered.');
      return;
    }
    if (matched.isSuspended) {
      setError('This student account has been suspended by the Administrator.');
      return;
    }
    if (matched.password && matched.password !== password) {
      setError('Incorrect password. Please try again.');
      return;
    }

    onStudentLoginSuccess(matched);
    onClose();
  };

  const handleDemoStudent = () => {
    const found = registeredUsers.find((u) => u.role === 'student' && !u.isSuspended);
    if (found) {
      onStudentLoginSuccess(found);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
      <div className="bg-white border border-[#E5E3DC] rounded-2xl shadow-xl max-w-md w-full overflow-hidden max-h-[92vh] flex flex-col">
        <div className="px-6 py-5 border-b border-[#E5E3DC] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F6B4B]">
              <Lock className="w-3.5 h-3.5" />
              <span>Student Account Portal</span>
            </div>
            <h2 className="font-display text-xl font-semibold text-[#18181B] mt-0.5">
              {authTab === 'register' ? 'Create Student Account' : 'Student Sign In'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close student sign in modal"
            className="w-8 h-8 rounded-lg bg-[#F3F2EE] text-[#52525B] hover:text-[#18181B] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {initialNotice && (
            <div className="p-3 rounded-xl bg-[#0F6B4B]/10 border border-[#0F6B4B]/30 text-xs text-[#0F6B4B] font-medium">
              {initialNotice}
            </div>
          )}

          {/* Register vs Login Switch */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#F3F2EE] rounded-xl border border-[#E5E3DC]">
            <button
              type="button"
              onClick={() => {
                setAuthTab('register');
                setError(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                authTab === 'register' ? 'bg-white text-[#18181B] shadow-2xs' : 'text-[#52525B]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthTab('login');
                setError(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                authTab === 'login' ? 'bg-white text-[#18181B] shadow-2xs' : 'text-[#52525B]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          </div>

          <p className="text-xs text-[#52525B] leading-relaxed">
            Register and log in before enrolling in a class. Your student account gives private access to your Enrollment Area, live Jitsi links, audio recordings, and PDFs.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {authTab === 'register' && (
              <div>
                <label className="block font-medium text-[#3F3F46] mb-1">Student Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4D4D8] focus:outline-none focus:ring-2 focus:ring-[#0F6B4B]"
                />
              </div>
            )}

            <div>
              <label className="block font-medium text-[#3F3F46] mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4D4D8] focus:outline-none focus:ring-2 focus:ring-[#0F6B4B]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#3F3F46] mb-1">Password (min 6 chars)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4D4D8] focus:outline-none focus:ring-2 focus:ring-[#0F6B4B]"
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0F6B4B] hover:bg-[#0B533A] text-white font-semibold rounded-xl transition-colors cursor-pointer"
            >
              {authTab === 'register' ? 'Register Student Account' : 'Log In to My Enrollment'}
            </button>
          </form>

          <div className="pt-4 border-t border-[#E5E3DC] space-y-2">
            <button
              type="button"
              onClick={handleDemoStudent}
              className="w-full py-2 px-3 rounded-xl bg-[#F3F2EE] hover:bg-[#E8E6DF] text-xs font-medium text-[#18181B] flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#0F6B4B]" />
              <span>Try Demo Student Account (John Miller)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
