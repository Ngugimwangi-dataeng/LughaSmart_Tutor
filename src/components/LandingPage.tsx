import React, { useState } from 'react';
import { Course, TutorRating } from '../types';
import {
  ArrowRight,
  Clock,
  Gamepad2,
  Headphones,
  FileText,
  Video,
  Star,
  Check,
  Image as ImageIcon,
} from 'lucide-react';

interface LandingPageProps {
  courses: Course[];
  ratings: TutorRating[];
  onEnrollCourse: (course: Course) => void;
  onGoToEnrollment: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  courses,
  ratings,
  onEnrollCourse,
  onGoToEnrollment,
}) => {
  const [filter, setFilter] = useState<'all' | 'kenyan' | 'foreign' | 'adult' | 'children'>('all');

  const filteredCourses = courses.filter((c) => {
    if (filter === 'kenyan') return c.category === 'kenyan';
    if (filter === 'foreign') return c.category === 'foreign';
    if (filter === 'adult') return c.audience === 'adult';
    if (filter === 'children') return c.audience === 'children';
    return true;
  });

  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1)
      : '5.0';

  const satisfiedCount = ratings.filter(
    (r) => r.satisfactionLevel === 'Very Satisfied' || r.satisfactionLevel === 'Satisfied'
  ).length;
  const satisfactionPct =
    ratings.length > 0 ? Math.round((satisfiedCount / ratings.length) * 100) : 100;

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between bg-white border border-[#E5E3DC] rounded-2xl p-8 sm:p-12">
            <div className="space-y-6">
              <div className="text-xs font-medium text-[#0F6B4B] tracking-wide">
                Kenyan Local & Global Languages · Live Jitsi Classrooms
              </div>

              <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-[#18181B] leading-[1.12] text-balance">
                Learn Kiswahili, Kenyan Dialects, Chinese, German & French with Live Tutors.
              </h1>

              <p className="text-base text-[#52525B] leading-relaxed max-w-2xl">
                Built for international visitors, families, and busy professionals. Join 3-hour adult immersion classes or 1-hour interactive children’s sessions with word games, visual image explanations, catch-up audio recordings, and study PDFs.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-[#3F3F46]">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0F6B4B] shrink-0" />
                  <span>Pay per session or save with a Monthly Pass</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0F6B4B] shrink-0" />
                  <span>M-Pesa (Kenya) & Visa (International)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0F6B4B] shrink-0" />
                  <span>Catch-up audio & PDFs for tight schedules</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0F6B4B] shrink-0" />
                  <span>Module tests & tutor satisfaction tracking</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-8 mt-8 border-t border-[#E5E3DC]">
              <button
                onClick={() => {
                  const first = courses[0];
                  if (first) onEnrollCourse(first);
                }}
                className="px-6 py-3 bg-[#0F6B4B] hover:bg-[#0B533A] text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <span>Enroll for a Session</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onGoToEnrollment}
                className="px-5 py-3 bg-[#F3F2EE] hover:bg-[#E8E6DF] text-[#18181B] text-sm font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer"
              >
                Open My Enrollment Area
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-[#E5E3DC] rounded-2xl overflow-hidden flex flex-col">
            <div className="relative flex-1 min-h-[300px] bg-[#F3F2EE]">
              <img
                src="/src/assets/images/lughasmart_hero_banner_1794473845041.jpg"
                alt="Kenyan language tutor teaching in a sunlit Nairobi studio"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5 border-t border-[#E5E3DC] flex items-center justify-between text-xs text-[#52525B]">
              <span className="font-semibold text-[#18181B]">Nairobi & Global Live Academy</span>
              <span className="tabular-nums">{satisfactionPct}% Student Satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Adult (3-Hr) vs Children (1-Hr) Learning Sections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="mb-8 space-y-2">
          <div className="text-xs font-semibold text-[#0F6B4B]">Two Dedicated Class Formats</div>
          <h2 className="font-display text-3xl font-semibold text-[#18181B] text-balance">
            Structured for Adults and Playful for Children
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Adult Section */}
          <div className="bg-white border border-[#E5E3DC] rounded-2xl p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#52525B]">
                <span className="font-semibold text-[#0F6B4B]">Adult Classes</span>
                <span className="font-mono tabular-nums flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  3 Hours / Live Session
                </span>
              </div>
              <h3 className="font-display text-2xl font-semibold text-[#18181B]">
                Deep Conversational & Professional Fluency
              </h3>
              <p className="text-sm text-[#52525B] leading-relaxed">
                Three-hour live Jitsi workshops designed for travelers, expatriates, diplomats, and professionals learning Kiswahili, Gĩkũyũ, Maa, Chinese, German, or French.
              </p>
              <ul className="space-y-2.5 text-sm text-[#3F3F46] pt-2">
                <li className="flex items-center gap-2.5">
                  <Video className="w-4 h-4 text-[#0F6B4B] shrink-0" />
                  <span>3-hour live Jitsi classes with real-time conversation</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Headphones className="w-4 h-4 text-[#0F6B4B] shrink-0" />
                  <span>Pronunciation & catch-up audio for tight schedules</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#0F6B4B] shrink-0" />
                  <span>Downloadable PDF grammar manuals & progress tests</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-[#E5E3DC] flex items-center justify-between text-xs">
              <span className="text-[#52525B]">Monthly pass saves up to 35% vs daily enrollment</span>
              <button
                onClick={() => setFilter('adult')}
                className="font-semibold text-[#0F6B4B] hover:underline cursor-pointer"
              >
                View Adult Courses →
              </button>
            </div>
          </div>

          {/* Children Section */}
          <div className="bg-white border border-[#E5E3DC] rounded-2xl p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#52525B]">
                <span className="font-semibold text-[#B45309]">Children Sessions</span>
                <span className="font-mono tabular-nums flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  1 Hour / Interactive Session
                </span>
              </div>
              <h3 className="font-display text-2xl font-semibold text-[#18181B]">
                Word Games, Visual Flashcards & Guided Play
              </h3>
              <p className="text-sm text-[#52525B] leading-relaxed">
                Focused one-hour live classes crafted for young learners. Tutors share colorful picture boards and lead interactive word-matching games to build confidence naturally.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-[#3F3F46]">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-[#B45309] shrink-0" />
                  <span>Playable word-matching games</span>
                </div>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#B45309] shrink-0" />
                  <span>Tutor-shared visual picture cards</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-[#E5E3DC] h-44 bg-[#F3F2EE]">
              <img
                src="/src/assets/images/children_word_game_learning_1794674777766.jpg"
                alt="Wooden alphabet blocks and animal picture flashcards for children language sessions"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Courses Catalog with Per-Session & Monthly Discounted Pass */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#0F6B4B]">Kenyan & Foreign Languages</div>
            <h2 className="font-display text-3xl font-semibold text-[#18181B]">
              Choose Your Language & Pass
            </h2>
            <p className="text-sm text-[#52525B] max-w-xl">
              Enroll per session before starting class, or choose the discounted Whole-Month Pass for unlimited live sessions, audio catch-ups, and PDFs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F3F2EE] rounded-xl border border-[#E5E3DC]">
            {[
              { id: 'all', label: 'All' },
              { id: 'kenyan', label: 'Kenyan Local' },
              { id: 'foreign', label: 'Chinese · German · French' },
              { id: 'adult', label: 'Adult (3 Hr)' },
              { id: 'children', label: 'Children (1 Hr)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as typeof filter)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  filter === tab.id
                    ? 'bg-white text-[#18181B] shadow-2xs'
                    : 'text-[#52525B] hover:text-[#18181B]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <article
              key={course.id}
              className="bg-white border border-[#E5E3DC] rounded-2xl overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[16/10] bg-[#F3F2EE] overflow-hidden border-b border-[#E5E3DC]">
                  <img
                    src={course.imageUrl}
                    alt={`${course.languageName} cultural learning visual`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#52525B]">
                    <span className="font-semibold text-[#0F6B4B]">{course.languageName}</span>
                    <span className="font-mono tabular-nums">
                      {course.audience === 'adult' ? 'Adult · 3 Hr Live' : 'Children · 1 Hr Live'}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-semibold text-[#18181B] leading-snug">
                    {course.title}
                  </h3>

                  <p className="text-xs text-[#52525B] leading-relaxed">{course.description}</p>

                  <div className="text-xs text-[#71717A] pt-1">
                    <span>{course.level}</span>
                    <span className="mx-1.5">·</span>
                    <span>{course.lessonsCount} Modules</span>
                    <span className="mx-1.5">·</span>
                    <span>Tutor: {course.tutorName}</span>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 pt-4 border-t border-[#E5E3DC] space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-[#71717A]">Per Session</div>
                    <div className="font-mono font-semibold text-base text-[#18181B] tabular-nums">
                      KES {course.perSessionPriceKes.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#0F6B4B] font-medium">Monthly Unlimited</div>
                    <div className="font-mono font-semibold text-base text-[#0F6B4B] tabular-nums">
                      KES {course.monthlyPassPriceKes.toLocaleString()}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onEnrollCourse(course)}
                  className="w-full py-2.5 px-4 bg-[#0F6B4B] hover:bg-[#0B533A] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Enroll via M-Pesa or Visa
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. Cultural Heritage Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="mb-8 space-y-2">
          <div className="text-xs font-semibold text-[#0F6B4B]">Cultural Context</div>
          <h2 className="font-display text-3xl font-semibold text-[#18181B]">
            Language Grounded in Living Culture
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#E5E3DC] rounded-2xl overflow-hidden">
            <div className="aspect-[4/3] bg-[#F3F2EE]">
              <img
                src="/src/assets/images/kenyan_foreign_cultural_bridge_1794674777306.jpg"
                alt="Kenyan beadwork, coastal dhows, and collaborative seminar study"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5 space-y-1.5">
              <h3 className="font-semibold text-sm text-[#18181B]">Kenyan & Global Exchange</h3>
              <p className="text-xs text-[#52525B] leading-relaxed">
                Connect Kenyan indigenous traditions with international fluency in Mandarin, German, and French.
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#E5E3DC] rounded-2xl overflow-hidden">
            <div className="aspect-[4/3] bg-[#F3F2EE]">
              <img
                src="/src/assets/images/kenya_maasai_culture_1794473845063.jpg"
                alt="Maasai cultural heritage in the Great Rift Valley"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5 space-y-1.5">
              <h3 className="font-semibold text-sm text-[#18181B]">Rift Valley & Maa Heritage</h3>
              <p className="text-xs text-[#52525B] leading-relaxed">
                Essential respectful greetings and community vocabulary for visitors and conservation teams.
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#E5E3DC] rounded-2xl overflow-hidden">
            <div className="aspect-[4/3] bg-[#F3F2EE]">
              <img
                src="/src/assets/images/swahili_coastal_lamu_1794473845839.jpg"
                alt="Historic Swahili coastal architecture in Lamu"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5 space-y-1.5">
              <h3 className="font-semibold text-sm text-[#18181B]">Swahili Coastal Traditions</h3>
              <p className="text-xs text-[#52525B] leading-relaxed">
                Explore coastal Kiswahili expressions, hospitality, and East African trade heritage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Tutor Satisfaction & Student Ratings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-white border border-[#E5E3DC] rounded-2xl p-8 sm:p-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E5E3DC]">
            <div className="flex items-center gap-5">
              <img
                src="/src/assets/images/tutor_amina_avatar_1794473845671.jpg"
                alt="Dr. Amina Wambui, Lead Language Tutor"
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border border-[#E5E3DC]"
              />
              <div>
                <div className="text-xs font-semibold text-[#0F6B4B]">Student Satisfaction</div>
                <h2 className="font-display text-2xl font-semibold text-[#18181B]">
                  Tutor Ratings & Learner Feedback
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-8 text-sm">
              <div>
                <div className="text-xs text-[#71717A]">Average Rating</div>
                <div className="font-mono text-2xl font-semibold text-[#18181B] tabular-nums flex items-center gap-1.5">
                  <Star className="w-5 h-5 fill-[#B45309] text-[#B45309]" />
                  <span>{avgRating} / 5.0</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-[#71717A]">Satisfaction Rate</div>
                <div className="font-mono text-2xl font-semibold text-[#0F6B4B] tabular-nums">
                  {satisfactionPct}%
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ratings.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-xl bg-[#FAFAF8] border border-[#E5E3DC] flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#52525B]">
                    <span className="font-semibold text-[#18181B]">{item.languageName}</span>
                    <span className="font-mono tabular-nums text-[#B45309]">
                      {'★'.repeat(item.rating)}
                    </span>
                  </div>
                  <p className="text-xs text-[#3F3F46] leading-relaxed">"{item.comment}"</p>
                </div>
                <div className="text-[11px] text-[#71717A] flex items-center justify-between pt-2 border-t border-[#E5E3DC]">
                  <span>{item.studentName}</span>
                  <span className="text-[#0F6B4B] font-medium">{item.satisfactionLevel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
