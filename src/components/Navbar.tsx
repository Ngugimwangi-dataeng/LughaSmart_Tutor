import React from 'react';
import { UserRole, SupportedLocale } from '../types';
import { translations } from '../i18n/translations';
import { ShieldCheck, Smartphone, Monitor } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  locale: SupportedLocale;
  setLocale: (loc: SupportedLocale) => void;
  viewMode: 'web' | 'mobile';
  setViewMode: (mode: 'web' | 'mobile') => void;
  onOpenCheckout: (courseId?: number) => void;
  onOpenDatabase: () => void;
  onOpenScalability: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUserRole,
  setCurrentUserRole,
  locale,
  setLocale,
  viewMode,
  setViewMode,
  onOpenCheckout,
  onOpenDatabase,
  onOpenScalability,
}) => {
  const t = translations[locale];

  return (
    <>
      {/* Top Bar Contract: Exactly 3 Zones, 1 row */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          
          {/* Zone 1: Single text element wordmark in display face */}
          <button
            onClick={() => setCurrentTab('courses')}
            className="text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 flex items-center gap-2 text-left"
          >
            <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
              LS
            </span>
            <span>{t.brandName}</span>
          </button>

          {/* Zone 2: 4-5 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setCurrentTab('courses')}
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 py-1 ${
                currentTab === 'courses' ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600' : ''
              }`}
            >
              {t.navCourses}
            </button>

            <button
              onClick={() => setCurrentTab('student_dashboard')}
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 py-1 ${
                currentTab === 'student_dashboard' ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600' : ''
              }`}
            >
              {t.navStudentDashboard}
            </button>

            <button
              onClick={() => setCurrentTab('audio_studio')}
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 py-1 ${
                currentTab === 'audio_studio' ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600' : ''
              }`}
            >
              {t.navAudioStudio}
            </button>

            <button
              onClick={() => setCurrentTab('live_session')}
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 py-1 ${
                currentTab === 'live_session' ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600' : ''
              }`}
            >
              {t.navLiveSession}
            </button>

            <button
              onClick={() => setCurrentTab('tutor_console')}
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 py-1 flex items-center gap-1 ${
                currentTab === 'tutor_console' ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600' : ''
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t.navTutorConsole}</span>
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenCheckout()}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
            >
              {t.enrollNow}
            </button>
          </div>
        </div>
      </header>

      {/* Control Utility Toolbar below header for testing all requested modalities */}
      <div className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/60 text-xs py-2 px-4 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Role switcher & RBAC testing */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
              {t.switchRole}:
            </span>
            <div className="inline-flex items-center p-0.5 bg-slate-200 dark:bg-slate-900 rounded-lg">
              <button
                onClick={() => setCurrentUserRole('student')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  currentUserRole === 'student'
                    ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t.viewAsStudent} (John Miller)
              </button>
              <button
                onClick={() => {
                  setCurrentUserRole('tutor');
                  setCurrentTab('tutor_console');
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  currentUserRole === 'tutor'
                    ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t.viewAsTutor} (Dr. Amina Wambui)
              </button>
            </div>
          </div>

          {/* Form Factor Toggle: Web Desktop vs Native Mobile Application */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center p-0.5 bg-slate-200 dark:bg-slate-900 rounded-lg">
              <button
                onClick={() => setViewMode('web')}
                className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-all ${
                  viewMode === 'web'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>{t.viewModeWeb}</span>
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-all ${
                  viewMode === 'mobile'
                    ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{t.viewModeMobile}</span>
              </button>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-[11px]">Lang:</span>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as SupportedLocale)}
                className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-0.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="en">English (US/UK)</option>
                <option value="sw">Kiswahili (Kenya)</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="zh">中文 (Mandarin)</option>
              </select>
            </div>

            {/* Architecture inspection tools */}
            <div className="hidden lg:flex items-center gap-2 border-l border-slate-300 dark:border-slate-700 pl-3">
              <button
                onClick={onOpenDatabase}
                className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium underline-offset-2 hover:underline"
              >
                {t.navDatabase}
              </button>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <button
                onClick={onOpenScalability}
                className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium underline-offset-2 hover:underline"
              >
                {t.navScalability}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
