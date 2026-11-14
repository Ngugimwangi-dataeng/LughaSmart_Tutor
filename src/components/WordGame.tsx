import React, { useState, useMemo } from 'react';
import { speakPhrase, playAudioChime } from '../utils/audio';
import { Volume2, RotateCcw, Trophy, Sparkles } from 'lucide-react';

interface WordPair {
  id: string;
  target: string;
  english: string;
  clue: string;
  langCode: string;
}

const WORD_SETS: Record<string, WordPair[]> = {
  'Kiswahili (Swahili)': [
    { id: 'sw1', target: 'Simba', english: 'Lion', clue: 'King of the savanna', langCode: 'sw-KE' },
    { id: 'sw2', target: 'Twiga', english: 'Giraffe', clue: 'Tall spotted neck', langCode: 'sw-KE' },
    { id: 'sw3', target: 'Embe', english: 'Mango', clue: 'Sweet yellow fruit', langCode: 'sw-KE' },
    { id: 'sw4', target: 'Rafiki', english: 'Friend', clue: 'Someone you play with', langCode: 'sw-KE' },
    { id: 'sw5', target: 'Nyumba', english: 'House', clue: 'Where a family lives', langCode: 'sw-KE' },
  ],
  'Chinese (Mandarin)': [
    { id: 'zh1', target: 'Māo (猫)', english: 'Cat', clue: 'Says meow', langCode: 'zh-CN' },
    { id: 'zh2', target: 'Píngguǒ (苹果)', english: 'Apple', clue: 'Crunchy red fruit', langCode: 'zh-CN' },
    { id: 'zh3', target: 'Péngyou (朋友)', english: 'Friend', clue: 'Playmate', langCode: 'zh-CN' },
    { id: 'zh4', target: 'Shuǐ (水)', english: 'Water', clue: 'Fresh drink', langCode: 'zh-CN' },
  ],
  'German (Deutsch)': [
    { id: 'de1', target: 'Hund', english: 'Dog', clue: 'Loyal pet', langCode: 'de-DE' },
    { id: 'de2', target: 'Apfel', english: 'Apple', clue: 'Orchard fruit', langCode: 'de-DE' },
    { id: 'de3', target: 'Sonne', english: 'Sun', clue: 'Shines in the sky', langCode: 'de-DE' },
    { id: 'de4', target: 'Freund', english: 'Friend', clue: 'School buddy', langCode: 'de-DE' },
  ],
  'French (Français)': [
    { id: 'fr1', target: 'Pomme', english: 'Apple', clue: 'Sweet fruit', langCode: 'fr-FR' },
    { id: 'fr2', target: 'Soleil', english: 'Sun', clue: 'Bright warm star', langCode: 'fr-FR' },
    { id: 'fr3', target: 'Chat', english: 'Cat', clue: 'Soft furry pet', langCode: 'fr-FR' },
    { id: 'fr4', target: 'Livre', english: 'Book', clue: 'Has stories inside', langCode: 'fr-FR' },
  ],
};

interface WordGameProps {
  onSaveScore: (languageName: string, score: number, pairsMatched: number) => void;
}

export const WordGame: React.FC<WordGameProps> = ({ onSaveScore }) => {
  const languages = Object.keys(WORD_SETS);
  const [selectedLang, setSelectedLang] = useState<string>(languages[0]);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string>('Pick a word on the left, then match its English meaning on the right.');

  const pairs = WORD_SETS[selectedLang];

  const shuffledEnglish = useMemo(() => {
    return [...pairs].sort((a, b) => a.english.localeCompare(b.english));
  }, [pairs]);

  const handleSelectTarget = (pair: WordPair) => {
    if (matchedIds.includes(pair.id)) return;
    setSelectedTarget(pair.id);
    speakPhrase(pair.target.replace(/\s*\(.*?\)/g, ''), pair.langCode);
    setFeedback(`Selected "${pair.target}" — now tap its English match!`);
  };

  const handleSelectEnglish = (pair: WordPair) => {
    if (!selectedTarget || matchedIds.includes(pair.id)) return;
    setAttempts((a) => a + 1);

    if (selectedTarget === pair.id) {
      const nextMatched = [...matchedIds, pair.id];
      const nextScore = score + 25;
      setMatchedIds(nextMatched);
      setScore(nextScore);
      setSelectedTarget(null);
      playAudioChime('success');
      setFeedback(`Great job! "${pair.target}" means "${pair.english}".`);

      if (nextMatched.length === pairs.length) {
        onSaveScore(selectedLang, nextScore, nextMatched.length);
      }
    } else {
      setSelectedTarget(null);
      setFeedback('Not quite — listen again and try another match!');
    }
  };

  const handleReset = (lang = selectedLang) => {
    setSelectedLang(lang);
    setSelectedTarget(null);
    setMatchedIds([]);
    setAttempts(0);
    setScore(0);
    setFeedback('Pick a word on the left, then match its English meaning on the right.');
  };

  const completed = matchedIds.length === pairs.length;

  return (
    <div className="bg-white border border-[#E5E3DC] rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#B45309]">Children’s 1-Hour Session Activity</div>
          <h3 className="font-display text-2xl font-semibold text-[#18181B]">
            Interactive Word & Picture Match Game
          </h3>
          <p className="text-xs text-[#52525B] mt-1">{feedback}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[#F3F2EE] border border-[#E5E3DC] text-xs font-mono tabular-nums">
            Score: <strong className="text-[#0F6B4B]">{score}</strong> · {matchedIds.length}/{pairs.length}
          </div>
          <button
            onClick={() => handleReset()}
            className="px-3 py-2 rounded-xl border border-[#E5E3DC] hover:bg-[#F3F2EE] text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => handleReset(lang)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedLang === lang
                ? 'bg-[#0F6B4B] text-white'
                : 'bg-[#F3F2EE] text-[#52525B] hover:text-[#18181B]'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="text-xs font-semibold text-[#71717A]">1. Tap a {selectedLang} Word (with Audio)</div>
          {pairs.map((pair) => {
            const isMatched = matchedIds.includes(pair.id);
            const isSelected = selectedTarget === pair.id;
            return (
              <button
                key={pair.id}
                onClick={() => handleSelectTarget(pair)}
                disabled={isMatched}
                className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isMatched
                    ? 'bg-[#0F6B4B]/10 border-[#0F6B4B]/40 text-[#0F6B4B]'
                    : isSelected
                    ? 'bg-[#FFFBEB] border-[#B45309] ring-1 ring-[#B45309]'
                    : 'bg-[#FAFAF8] border-[#E5E3DC] hover:border-[#0F6B4B]'
                }`}
              >
                <div>
                  <div className="font-semibold text-base text-[#18181B]">{pair.target}</div>
                  <div className="text-xs text-[#71717A]">Clue: {pair.clue}</div>
                </div>
                <Volume2 className="w-4 h-4 text-[#0F6B4B] shrink-0" />
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <div className="text-xs font-semibold text-[#71717A]">2. Tap the English Translation</div>
          {shuffledEnglish.map((pair) => {
            const isMatched = matchedIds.includes(pair.id);
            return (
              <button
                key={pair.id}
                onClick={() => handleSelectEnglish(pair)}
                disabled={isMatched}
                className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isMatched
                    ? 'bg-[#0F6B4B]/10 border-[#0F6B4B]/40 text-[#0F6B4B]'
                    : 'bg-white border-[#E5E3DC] hover:border-[#B45309]'
                }`}
              >
                <span className="font-semibold text-base text-[#18181B]">{pair.english}</span>
                {isMatched && <Sparkles className="w-4 h-4 text-[#0F6B4B]" />}
              </button>
            );
          })}
        </div>
      </div>

      {completed && (
        <div className="p-4 rounded-xl bg-[#0F6B4B]/10 border border-[#0F6B4B]/30 flex items-center justify-between text-xs text-[#0F6B4B]">
          <div className="flex items-center gap-2 font-semibold">
            <Trophy className="w-4 h-4" />
            <span>Round Complete! Score: {score} pts in {attempts} attempts — saved to your progress.</span>
          </div>
          <button
            onClick={() => handleReset()}
            className="px-3 py-1.5 bg-[#0F6B4B] text-white rounded-lg font-semibold cursor-pointer"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};
