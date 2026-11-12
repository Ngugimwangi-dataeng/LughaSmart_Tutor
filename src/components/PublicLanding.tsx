import React, { useState } from 'react';
import { Course, SupportedLocale } from '../types';
import { translations } from '../i18n/translations';
import { speakPhrase } from '../utils/audio';
import { 
  BookOpen, 
  Headphones, 
  Video, 
  Volume2, 
  CreditCard, 
  CheckCircle2, 
  Globe2, 
  Sparkles,
  ArrowRight,
  FileText
} from 'lucide-react';

interface PublicLandingProps {
  courses: Course[];
  locale: SupportedLocale;
  onEnroll: (courseId: number) => void;
  onViewCurriculum: (course: Course) => void;
  onGoToStudentDashboard: () => void;
}

export const PublicLanding: React.FC<PublicLandingProps> = ({
  courses,
  locale,
  onEnroll,
  onViewCurriculum,
  onGoToStudentDashboard,
}) => {
  const t = translations[locale];
  const [filterType, setFilterType] = useState<'all' | 'live' | 'audio' | 'pdf'>('all');
  const [playingPhrase, setPlayingPhrase] = useState<string | null>(null);

  const filteredCourses = filterType === 'all' 
    ? courses 
    : courses.filter(c => c.course_type === filterType);

  const sampleGreetings = [
    { lang: 'Kiswahili', phrase: 'Hujambo! Karibu Kenya.', translation: 'Hello! Welcome to Kenya.', phonetics: 'hoo-JAHM-boh, kah-REE-boo KEHN-yah' },
    { lang: 'Gĩkũyũ', phrase: 'Wĩmwega mũno! Nĩ wega.', translation: 'Are you very well? Thank you.', phonetics: 'wee-MWEH-gah MOO-noh! nee WEH-gah' },
    { lang: 'Dholuo', phrase: 'Nang’o! Oriti ahinya.', translation: 'How are you! Goodbye and stay well.', phonetics: 'NAHNG-oh! oh-REE-tee ah-HEEN-yah' },
    { lang: 'Maa (Maasai)', phrase: 'Supa! Ashe oleng.', translation: 'Greetings! Thank you very much.', phonetics: 'SOO-pah! AH-sheh OH-lehng' }
  ];

  const handlePlayAudio = async (text: string) => {
    setPlayingPhrase(text);
    await speakPhrase(text);
    setPlayingPhrase(null);
  };

  return (
    <div className="space-y-16 py-6 pb-20">
      
      {/* Hero Section: 2-Column Split Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xs">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <Globe2 className="w-4 h-4" />
              <span>INDIGENOUS & NATIONAL KENYAN LANGUAGES</span>
              <span aria-hidden="true">·</span>
              <span>CERTIFIED NATIVE TUTORS</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Master Authentic Kenyan Languages with Dedicated One-on-One Tutors.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Designed specifically for international expats, diplomats, travelers, and diaspora returnees. Learn Kiswahili, Kikuyu, Luo, Kalenjin, Luhya, Kamba, and Maasai through live interactive classes, native pronunciation audio studios, and verified downloadable curriculum PDFs.
            </p>

            {/* Value bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant Safaricom M-Pesa & Visa Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Real-Time "Ready for Class" Live Waiting Room</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>End-to-End Encrypted Live Sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Voice Pronunciation Waveform Feedback</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => onEnroll(101)}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                <span>{t.enrollNow}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={onGoToStudentDashboard}
                className="px-5 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm rounded-xl transition-all"
              >
                {t.navStudentDashboard}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
              <img
                src="/src/assets/images/lughasmart_hero_banner_1794473845041.jpg"
                alt="Kenyan language tutor instructing an international learner in Nairobi studio"
                referrerPolicy="no-referrer"
                className="w-full h-80 sm:h-96 object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">Live 1-on-1 Swahili Session</span>
                  <span>Nairobi Studio · Verified</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Soundboard: Native Greetings & Pronunciations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100 dark:bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">
                Interactive Audio Sampler
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Listen to Native Kenyan Greetings
              </h2>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Click any phrase to hear authentic tonal cadence
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sampleGreetings.map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/80 shadow-2xs hover:border-emerald-500 transition-all cursor-pointer group"
                onClick={() => handlePlayAudio(item.phrase)}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">{item.lang}</span>
                  <Volume2 className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    playingPhrase === item.phrase ? 'text-emerald-600 animate-pulse' : 'text-slate-400'
                  }`} />
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  "{item.phrase}"
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 italic mb-2">
                  {item.phonetics}
                </div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {item.translation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Catalog & Teaching Modalities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
              Verified Curriculum Offerings
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Curated Language Programs
            </h2>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setFilterType('live')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                filterType === 'live'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Live Tutoring</span>
            </button>
            <button
              onClick={() => setFilterType('audio')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                filterType === 'audio'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Audio Pronunciation</span>
            </button>
            <button
              onClick={() => setFilterType('pdf')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                filterType === 'pdf'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>PDF Curriculum</span>
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    {course.language_name}
                  </span>
                  <span className="flex items-center gap-1">
                    {course.course_type === 'live' && <Video className="w-3.5 h-3.5 text-blue-500" />}
                    {course.course_type === 'audio' && <Headphones className="w-3.5 h-3.5 text-purple-500" />}
                    {course.course_type === 'pdf' && <FileText className="w-3.5 h-3.5 text-amber-500" />}
                    <span className="capitalize">{course.course_type} Modality</span>
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                  {course.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {course.description}
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <span>{course.level}</span>
                  <span aria-hidden="true">·</span>
                  <span>{course.lessons_count} {t.lessons}</span>
                  <span aria-hidden="true">·</span>
                  <span>{course.duration_weeks} Weeks</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                      KES {course.price_kes.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 ml-1.5 tabular-nums">
                      (~${(course.price_kes / 130).toFixed(0)} USD)
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Tutor: <span className="font-medium text-slate-800 dark:text-slate-200">{course.tutor_name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onViewCurriculum(course)}
                    className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{t.viewCurriculum}</span>
                  </button>

                  <button
                    onClick={() => onEnroll(course.id)}
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{t.enrollNow}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cultural Heritage & Language Context */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                Cultural Immersion
              </span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Maasai Pastoral Heritage & Wildlife Conservation
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Connect deeply with the Maa language spoken across the Great Rift Valley. Essential for international researchers, safari lodge managers, and NGO teams collaborating with pastoral communities.
              </p>
            </div>
            <div className="mt-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <img
                src="/src/assets/images/kenya_maasai_culture_1794473845063.jpg"
                alt="Maasai cultural community in the Great Rift Valley"
                referrerPolicy="no-referrer"
                className="w-full h-52 object-cover"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                Coastal Heritage
              </span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Swahili Coastal Dialects & Lamu Trade Architecture
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Kiswahili is the gateway language to over 200 million speakers in Eastern Africa. From classic poetry to modern business Nairobi Sheng, our curriculum prepares you for fluency.
              </p>
            </div>
            <div className="mt-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <img
                src="/src/assets/images/swahili_coastal_lamu_1794473845839.jpg"
                alt="Swahili historic architecture in Lamu and Mombasa"
                referrerPolicy="no-referrer"
                className="w-full h-52 object-cover"
              />
            </div>
          </div>

        </div>
      </section>

      {/* Tutor Profile Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            <div className="md:col-span-4 flex justify-center">
              <div className="w-44 h-44 rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-xl">
                <img
                  src="/src/assets/images/tutor_amina_avatar_1794473845671.jpg"
                  alt="Dr. Amina Wambui - Senior Kenyan Language Linguist"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="md:col-span-8 space-y-4">
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Senior Academic Lead
              </div>
              <h3 className="text-3xl font-extrabold text-white">
                Dr. Amina Wambui
              </h3>
              <div className="text-xs text-slate-400">
                Ph.D. in Bantu Linguistics, University of Nairobi · 12 Years Tutoring Expatriates & Diplomats
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                "Our teaching methodology bridges cognitive linguistics with indigenous cultural idioms. Foreign learners don't just memorize grammar tables; they master natural cadence, tone inflection, and social etiquette to communicate with warmth and respect across Kenya."
              </p>
              <div className="flex items-center gap-6 pt-2 text-xs text-slate-300">
                <div>
                  <span className="font-bold text-lg text-white tabular-nums">1,400+</span>
                  <div className="text-slate-400">Foreign Students Taught</div>
                </div>
                <div>
                  <span className="font-bold text-lg text-white tabular-nums">99.4%</span>
                  <div className="text-slate-400">Oral Fluency Rating</div>
                </div>
                <div>
                  <span className="font-bold text-lg text-white tabular-nums">7</span>
                  <div className="text-slate-400">Indigenous Dialects Covered</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
