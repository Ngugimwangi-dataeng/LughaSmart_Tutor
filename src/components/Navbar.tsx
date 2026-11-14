import React from 'react';
import { UserProfile, UserRole } from '../types';
import { Lock, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  activeView: 'landing' | 'enrollment' | 'tutor' | 'tutor_gate';
  onNavigate: (view: 'landing' | 'enrollment' | 'tutor') => void;
  userRole: UserRole;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onEnrollNow: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  userRole,
  currentUser,
  onOpenAuth,
  onSignOut,
  onEnrollNow,
}) => {
  const isVerifiedAdmin = Boolean(
    currentUser && currentUser.role === 'tutor' && currentUser.isAdmin
  );

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAF8]/95 backdrop-blur-md border-b border-[#E5E3DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Wordmark */}
        <button
          onClick={() => onNavigate('landing')}
          className="font-display text-xl font-semibold tracking-tight text-[#18181B] whitespace-nowrap shrink-0 cursor-pointer"
        >
          LughaSmart
        </button>

        {/* Zone 2: Strict role-isolated navigation (Students never see Tutor/Admin links) */}
        <nav className="flex items-center gap-6 text-sm font-medium text-[#52525B]">
          <button
            onClick={() => onNavigate('landing')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer ${
              activeView === 'landing'
                ? 'text-[#0F6B4B] font-semibold border-b-2 border-[#0F6B4B]'
                : 'hover:text-[#18181B]'
            }`}
          >
            Landing Page
          </button>

          {!isVerifiedAdmin && (
            <button
              onClick={() => onNavigate('enrollment')}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer ${
                activeView === 'enrollment'
                  ? 'text-[#0F6B4B] font-semibold border-b-2 border-[#0F6B4B]'
                  : 'hover:text-[#18181B]'
              }`}
            >
              My Enrollment
            </button>
          )}

          {isVerifiedAdmin && (
            <button
              onClick={() => onNavigate('tutor')}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeView === 'tutor'
                  ? 'text-[#0F6B4B] font-semibold border-b-2 border-[#0F6B4B]'
                  : 'hover:text-[#18181B]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#0F6B4B]" />
              <span>Tutor & Admin Console</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Account Status */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#52525B] whitespace-nowrap">
                {isVerifiedAdmin ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0F6B4B]" />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-[#52525B]" />
                )}
                <span>
                  {isVerifiedAdmin
                    ? `Admin · ${currentUser.fullName.split(' ')[0]}`
                    : currentUser.fullName.split(' ')[0]}
                </span>
              </span>
              <button
                onClick={onSignOut}
                className="px-3.5 py-2 text-xs font-medium text-[#52525B] hover:text-[#18181B] border border-[#E5E3DC] rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{userRole === 'tutor' ? 'Sign Out Admin' : 'Sign Out'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-2 text-xs font-medium text-[#18181B] hover:bg-[#F3F2EE] border border-[#E5E3DC] rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-[#0F6B4B]" />
                <span>Student Sign In</span>
              </button>
              <button
                onClick={onEnrollNow}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0F6B4B] hover:bg-[#0B533A] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Enroll Now
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
