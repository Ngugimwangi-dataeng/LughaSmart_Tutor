import React, { useState } from 'react';
import { Course, SupportedLocale } from '../types';
import { translations } from '../i18n/translations';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  BookOpen, 
  CheckCircle2, 
  ArrowLeft,
  Layers,
  Sparkles
} from 'lucide-react';

interface CurriculumPdfViewerProps {
  course: Course;
  locale: SupportedLocale;
  onBack: () => void;
  onEnrollCourse: (courseId: number) => void;
}

export const CurriculumPdfViewer: React.FC<CurriculumPdfViewerProps> = ({
  course,
  locale,
  onBack,
  onEnrollCourse,
}) => {
  const t = translations[locale];
  const [activeTab, setActiveTab] = useState<'proposal_pdf' | 'interactive_syllabus'>('proposal_pdf');

  // The local attached PDF from proposal
  const pdfFilePath = '/public/assets/aistudio/LughaSmart_System_Design___Proposal__3__c33dc71a.pdf';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Courses</span>
        </button>

        <div className="flex items-center gap-3">
          <a
            href={pdfFilePath}
            download="LughaSmart_System_Design_Proposal.pdf"
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Document</span>
          </a>

          <button
            onClick={() => onEnrollCourse(course.id)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span>Enroll in {course.language_name}</span>
          </button>
        </div>
      </div>

      {/* Course Title Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <BookOpen className="w-4 h-4" />
            <span>AUTHENTIC CURRICULUM & SYSTEM SPECIFICATION</span>
            <span aria-hidden="true">·</span>
            <span className="uppercase">{course.language_name}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {course.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
            Lead Native Instructor: <strong>{course.tutor_name}</strong> · Active Document: <code>{course.pdf_curriculum_name || 'LughaSmart_System_Design___Proposal__3__c33dc71a.pdf'}</code>
          </p>
        </div>

        {/* Tab switch */}
        <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('proposal_pdf')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'proposal_pdf'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Official Proposal PDF Embed
          </button>
          <button
            onClick={() => setActiveTab('interactive_syllabus')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'interactive_syllabus'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Curriculum Breakdown
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'proposal_pdf' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-md overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-2 font-mono">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>public/assets/aistudio/LughaSmart_System_Design___Proposal__3__c33dc71a.pdf</span>
            </span>
            <a
              href={pdfFilePath}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
            >
              <span>Open Fullscreen</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Embedded PDF iframe */}
          <div className="w-full h-[750px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
            <iframe
              src={`${pdfFilePath}#toolbar=1&navpanes=1&scrollbar=1`}
              title="LughaSmart System Design & Proposal PDF"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      ) : (
        /* Interactive Syllabus Modules */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Course Learning Modules & Phonetic Syllabus
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Curated by certified linguistic faculty at LughaSmart Nairobi Studio
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-600">UNIT 1: PHONETICS & SOCIAL GREETINGS</span>
                <span className="text-slate-400">Week 1 · 3 Lessons</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Vowel Articulation & Reverential Greetings
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Understanding the 5 pure Swahili vowels (A, E, I, O, U) without diphthongs. Master situational greetings: Habari za asubuhi, Shikamoo for elders, and everyday Jambo responses.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-600">UNIT 2: COMMERCE & TRANSPORT</span>
                <span className="text-slate-400">Week 2 · 3 Lessons</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Market Bargaining & Navigating Nairobi Transit
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Inquiring prices ("Bei gani?"), asking for discounts with respect ("Punguza kidogo mzee"), negotiating Matatu fares, asking for stops ("Nishushe hapa"), and completing Safaricom M-Pesa payments.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-600">UNIT 3: NOUN CLASSES & CONJUGATION</span>
                <span className="text-slate-400">Week 3 · 3 Lessons</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                M-WA, KI-VI Class Agreements & Time Marking
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Demystifying Bantu noun concordances. Past tense (LI-), Present continuous (NA-), Future (TA-), and negative forms (HA-).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-600">UNIT 4: CULTURAL PROVERBS & LIVING IDIOMS</span>
                <span className="text-slate-400">Week 4 · 3 Lessons</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Methali, Wisdom & Regional Idiomatic Nuances
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Exploring famous proverbs like "Haraka haraka haina baraka" and "Haba na haba hujaza kibaba" and how to employ them naturally in conversational Kenyan society.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
