import React, { useState } from 'react';
import confetti from 'canvas-confetti';

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: string;
  recommendedGenreTitle?: string;
}

export const TrialModal: React.FC<TrialModalProps> = ({
  isOpen,
  onClose,
  initialPlan = '개인(Individual)',
  recommendedGenreTitle
}) => {
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitted(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1DB954', '#1ed760', '#ffffff', '#d8b4e2']
      });
    } catch {
      // ignore
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#181818] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          aria-label="닫기"
        >
          ✕
        </button>

        {!isSubmitted ? (
          <div>
            <div className="flex items-center gap-2 mb-2 text-[#1DB954] text-xs font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[#1DB954]"></span>
              Spotify Premium 1개월 무료 체험
            </div>

            <h3 className="text-2xl font-extrabold tracking-tight mb-2">
              음악의 흐름을 끊지 않는 완벽한 몰입
            </h3>
            
            {recommendedGenreTitle && (
              <p className="text-sm text-neutral-300 mb-6 bg-white/5 p-3 rounded-xl border border-white/5">
                당신의 추천 장르 <strong className="text-[#1DB954]">[{recommendedGenreTitle}]</strong>의 모든 곡을 광고 없이 고음질로 감상해보세요.
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-2">
                  요금제 선택
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: '학생(Student)', price: '5,900원/월' },
                    { id: '개인(Individual)', price: '10,900원/월' },
                    { id: '듀오(Duo)', price: '16,350원/월' },
                    { id: '가족(Family)', price: '17,900원/월' },
                  ].map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        selectedPlan === plan.id
                          ? 'border-[#1DB954] bg-[#1DB954]/10 text-white'
                          : 'border-white/10 bg-black/40 text-neutral-400 hover:border-white/20'
                      }`}
                    >
                      <div className="font-bold text-sm text-white">{plan.id}</div>
                      <div className="text-xs text-neutral-400">{plan.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  이메일 주소
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-[#1DB954] text-sm"
                />
              </div>

              <div className="text-xs text-neutral-400 space-y-1 pt-1">
                <p>✓ 1개월 무료 체험 후 선택하신 요금제로 자동 결제됩니다.</p>
                <p>✓ 언제든지 위약금 없이 간편하게 해지할 수 있습니다.</p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-pulse w-full py-3.5 bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold rounded-full transition-all text-base shadow-lg"
                >
                  지금 무료 체험 시작하기
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-[#1DB954]/20 border border-[#1DB954] flex items-center justify-center text-3xl mx-auto mb-4 text-[#1DB954]">
              ✓
            </div>
            <h3 className="text-2xl font-black mb-2 text-white">무료 체험 신청 완료!</h3>
            <p className="text-sm text-neutral-300 max-w-sm mx-auto mb-6">
              <strong className="text-white">{email}</strong>로 1개월 무료 체험 초대 링크가 발송되었습니다. 지금 바로 끊김 없는 음악의 세계를 경험하세요!
            </p>
            <div className="p-4 bg-black/40 rounded-2xl border border-white/5 mb-6 text-left text-xs space-y-1 text-neutral-400">
              <div className="flex justify-between">
                <span>선택 요금제:</span>
                <span className="font-bold text-white">{selectedPlan}</span>
              </div>
              <div className="flex justify-between">
                <span>체험 기간:</span>
                <span className="font-bold text-[#1DB954]">30일간 무료</span>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-3 bg-white text-black font-bold rounded-full hover:bg-neutral-200 transition-colors"
            >
              확인 및 둘러보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
