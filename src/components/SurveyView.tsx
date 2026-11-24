import React, { useState } from 'react';
import { SURVEY_QUESTIONS } from '../data/surveyData';
import { playClickSound } from '../utils/audioSynth';

interface SurveyViewProps {
  onComplete: (answers: Record<number, string>) => void;
  onSkipToSpotify: () => void;
}

export const SurveyView: React.FC<SurveyViewProps> = ({ onComplete, onSkipToSpotify }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const currentQuestion = SURVEY_QUESTIONS[currentStepIndex];
  const progressPercent = Math.round(((currentStepIndex + 1) / SURVEY_QUESTIONS.length) * 100);

  const handleSelectOption = (optionId: string) => {
    playClickSound();
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionId
    }));
  };

  const handleNext = () => {
    if (!answers[currentQuestion.id]) return;

    if (currentStepIndex < SURVEY_QUESTIONS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Analyze results with exciting audio-visual loading state
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        onComplete(answers);
      }, 1400);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  if (isAnalyzing) {
    return (
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 overflow-hidden pt-20">
        <div className="hero-bg">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
        </div>
        <div className="noise"></div>

        <div className="relative z-10 text-center max-w-md mx-auto p-8 rounded-3xl bg-neutral-900/80 border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="flex justify-center items-end gap-1.5 h-12 mb-6">
            <span className="w-2.5 bg-[#1DB954] rounded-t-sm h-full animate-[pulse_0.6s_ease-in-out_infinite_alternate]"></span>
            <span className="w-2.5 bg-[#1DB954] rounded-t-sm h-3/4 animate-[pulse_0.9s_ease-in-out_infinite_alternate]"></span>
            <span className="w-2.5 bg-[#d8b4e2] rounded-t-sm h-1/2 animate-[pulse_1.2s_ease-in-out_infinite_alternate]"></span>
            <span className="w-2.5 bg-[#1DB954] rounded-t-sm h-5/6 animate-[pulse_0.7s_ease-in-out_infinite_alternate]"></span>
            <span className="w-2.5 bg-[#1ed760] rounded-t-sm h-2/3 animate-[pulse_1.0s_ease-in-out_infinite_alternate]"></span>
            <span className="w-2.5 bg-[#1DB954] rounded-t-sm h-full animate-[pulse_0.8s_ease-in-out_infinite_alternate]"></span>
          </div>

          <h3 className="text-2xl font-black text-white mb-2">
            음악 취향 DNA 분석 중...
          </h3>
          <p className="text-sm text-neutral-400">
            당신의 답변을 조합하여 스포티파이 데이터베이스 속 최적의 맞춤 장르를 추출하고 있습니다.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex flex-col justify-between px-4 sm:px-6 pt-24 pb-12 overflow-hidden max-w-4xl mx-auto">
      <div className="hero-bg">
        <div className="orb orb-1 opacity-25"></div>
        <div className="orb orb-2 opacity-25"></div>
      </div>
      <div className="noise"></div>

      {/* Top Header Card */}
      <div className="relative z-10 text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#1DB954]/40 bg-black/60 text-white text-xs font-bold tracking-wider backdrop-blur-md mb-4">
          <span className="w-2 h-2 rounded-full bg-[#1DB954]"></span>
          SPOTIFY VIBE DISCOVERY
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-3">
          당신에게 어울리는 음악 장르는?
        </h1>
        <p className="text-neutral-400 text-sm md:text-base max-w-lg mx-auto">
          간단한 {SURVEY_QUESTIONS.length}가지 질문으로 나의 일상과 마음에 꼭 맞는 사운드스케이프를 찾고, 스포티파이 프리미엄의 특별한 추천을 확인해보세요.
        </p>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mt-6">
          <div className="flex justify-between items-center text-xs text-neutral-400 mb-2 font-medium">
            <span>질문 {currentStepIndex + 1} / {SURVEY_QUESTIONS.length}</span>
            <span className="text-[#1DB954] font-semibold">{progressPercent}% 완료</span>
          </div>
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div
              className="h-full bg-[#1DB954] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question & Options Area */}
      <div className="relative z-10 max-w-2xl w-full mx-auto my-auto">
        <div className="bg-[#121212]/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="mb-6">
            <span className="text-xs font-bold tracking-widest text-[#1DB954] uppercase block mb-1">
              QUESTION 0{currentQuestion.id}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5">
              {currentQuestion.question}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              {currentQuestion.description}
            </p>
          </div>

          {/* Options Grid */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelectOption(option.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 group cursor-pointer ${
                    isSelected
                      ? 'border-[#1DB954] bg-[#1DB954]/15 shadow-[0_0_20px_rgba(29,185,84,0.18)]'
                      : 'border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/20'
                  }`}
                >
                  <span className="text-2xl shrink-0 transition-transform group-hover:scale-110">
                    {option.icon}
                  </span>
                  <div className="flex-1">
                    <div className={`font-bold text-sm sm:text-base mb-0.5 ${isSelected ? 'text-[#1ed760]' : 'text-white'}`}>
                      {option.label}
                    </div>
                    <div className="text-xs text-neutral-400 leading-relaxed">
                      {option.sublabel}
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isSelected ? 'border-[#1DB954] bg-[#1DB954] text-black font-bold text-xs' : 'border-neutral-600'
                  }`}>
                    {isSelected && '✓'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-white/5">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                currentStepIndex === 0
                  ? 'opacity-0 pointer-events-none'
                  : 'text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10'
              }`}
            >
              이전 질문
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className={`px-8 py-3 rounded-full font-bold text-sm transition-all shadow-md ${
                answers[currentQuestion.id]
                  ? 'btn-pulse bg-[#1DB954] hover:bg-[#1ed760] text-black cursor-pointer'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              {currentStepIndex === SURVEY_QUESTIONS.length - 1 ? '맞춤 장르 추천받기' : '다음 질문'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer skip link */}
      <div className="relative z-10 text-center mt-8">
        <button
          onClick={onSkipToSpotify}
          className="text-xs text-neutral-400 hover:text-[#1DB954] transition-colors underline underline-offset-4"
        >
          설문 없이 바로 스포티파이 프리미엄 광고 사이트 둘러보기 →
        </button>
      </div>
    </section>
  );
};
