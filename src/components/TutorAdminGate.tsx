import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ShieldAlert, ShieldCheck, Lock, KeyRound, ArrowLeft } from 'lucide-react';

interface TutorAdminGateProps {
  currentUser: UserProfile | null;
  registeredUsers: UserProfile[];
  onAdminLoginSuccess: (adminUser: UserProfile) => void;
  onLogSecurityEvent: (params: {
    actorEmail: string;
    actorRole: string;
    action: string;
    httpStatus: number;
    details: string;
  }) => void;
  onBackToLanding: () => void;
}

export const TutorAdminGate: React.FC<TutorAdminGateProps> = ({
  currentUser,
  registeredUsers,
  onAdminLoginSuccess,
  onLogSecurityEvent,
  onBackToLanding,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  // HARD SECURITY GUARD: If a student session is active, never show the admin login form or tutor console.
  if (currentUser && currentUser.role === 'student') {
    return (
      <div className="max-w-xl mx-auto px-4 py-20">
        <div className="bg-white border border-red-200 rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="text-xs font-mono font-semibold text-red-600">
            403 UNAUTHORIZED · ACCESS DENIED
          </div>
          <h1 className="font-display text-2xl font-semibold text-[#18181B]">
            Restricted Tutor & Administrator Area
          </h1>
          <p className="text-sm text-[#52525B] leading-relaxed">
            Student accounts do not have permission to view or access the Tutor & Admin portal. This access attempt has been recorded in the security audit log.
          </p>
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#18181B] text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Landing Page</span>
          </button>
        </div>
      </div>
    );
  }

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const now = Date.now();
    if (lockedUntil && now < lockedUntil) {
      const secs = Math.ceil((lockedUntil - now) / 1000);
      setError(`Too many failed attempts. Portal locked for ${secs}s.`);
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const matched = registeredUsers.find(
      (u) =>
        u.email.toLowerCase() === normalizedEmail &&
        u.role === 'tutor' &&
        u.isAdmin === true
    );

    const validPassword = matched && matched.password === password;
    const validPin = matched && matched.adminPin === adminPin.trim();

    if (!matched || !validPassword || !validPin) {
      const nextFails = failedAttempts + 1;
      setFailedAttempts(nextFails);
      if (nextFails >= 5) {
        setLockedUntil(Date.now() + 30_000);
        setFailedAttempts(0);
      }
      onLogSecurityEvent({
        actorEmail: normalizedEmail || 'anonymous',
        actorRole: 'unauthenticated',
        action: 'ADMIN_LOGIN_FAILED',
        httpStatus: 401,
        details: `Failed Tutor/Admin authentication attempt for ${normalizedEmail || 'empty email'}.`,
      });
      setError('Invalid Tutor/Admin email, password, or security PIN.');
      return;
    }

    setFailedAttempts(0);
    setLockedUntil(null);
    onLogSecurityEvent({
      actorEmail: matched.email,
      actorRole: 'tutor_admin',
      action: 'ADMIN_LOGIN_SUCCESS',
      httpStatus: 200,
      details: `Authenticated Tutor & System Administrator (${matched.fullName}) via isolated portal.`,
    });
    onAdminLoginSuccess(matched);
  };

  return (
    <div className="min-h-[78vh] flex items-center justify-center px-4 py-12 bg-[#F3F2EE]/60">
      <div className="bg-white border border-[#E5E3DC] rounded-2xl shadow-lg max-w-md w-full overflow-hidden">
        <div className="px-6 py-5 bg-[#18181B] text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#6EE7B7]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ISOLATED TUTOR & ADMIN GATEWAY</span>
            </div>
            <h1 className="font-display text-xl font-semibold mt-1">
              Tutor & System Admin Sign In
            </h1>
          </div>
          <Lock className="w-5 h-5 text-[#A1A1AA]" />
        </div>

        <form onSubmit={handleAdminSubmit} className="p-6 space-y-4 text-xs">
          <p className="text-[#52525B] leading-relaxed">
            Restricted administrative portal. Tutor authorization, student roster access, and financial transaction reports require verified Admin credentials and a 6-digit Security PIN.
          </p>

          <div>
            <label className="block font-medium text-[#3F3F46] mb-1">Admin / Tutor Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tutor-admin@lughasmart.ac.ke"
              autoComplete="username"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4D4D8] focus:outline-none focus:ring-2 focus:ring-[#0F6B4B]"
            />
          </div>

          <div>
            <label className="block font-medium text-[#3F3F46] mb-1">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter administrator password"
              autoComplete="current-password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4D4D8] focus:outline-none focus:ring-2 focus:ring-[#0F6B4B]"
            />
          </div>

          <div>
            <label className="block font-medium text-[#3F3F46] mb-1 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#0F6B4B]" />
              <span>Admin Security PIN</span>
            </label>
            <input
              type="password"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              placeholder="6-digit security PIN"
              maxLength={12}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4D4D8] font-mono focus:outline-none focus:ring-2 focus:ring-[#0F6B4B]"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#18181B] hover:bg-[#27272A] text-white font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Verify & Enter Tutor Admin Console
          </button>

          <button
            type="button"
            onClick={onBackToLanding}
            className="w-full py-2 text-[#52525B] hover:text-[#18181B] font-medium flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Landing Page</span>
          </button>
        </form>
      </div>
    </div>
  );
};
