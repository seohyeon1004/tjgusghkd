import React, { useEffect } from 'react';
import { GenreRecommendation } from '../types';

interface SpotifyLandingViewProps {
  recommendedGenre?: GenreRecommendation | null;
  onOpenTrial: (plan?: string) => void;
  onBackToSurvey: () => void;
}

export const SpotifyLandingView: React.FC<SpotifyLandingViewProps> = ({
  recommendedGenre,
  onOpenTrial,
  onBackToSurvey
}) => {
  useEffect(() => {
    // Parallax & Scroll Reveal Observer
    const reveals = document.querySelectorAll('.reveal');
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const elementVisible = 80;
      const scrolled = window.scrollY;

      reveals.forEach((reveal) => {
        const elementTop = reveal.getBoundingClientRect().top;
        if (elementTop < windowHeight - elementVisible) {
          reveal.classList.add('active');
        }
      });

      const albumBg = document.querySelector('.album-bg') as HTMLElement | null;
      if (albumBg) {
        albumBg.style.backgroundPosition = `center ${scrolled * -0.22}px`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial trigger
    const timer = setTimeout(handleScroll, 150);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="relative text-white selection:bg-[#1DB954] selection:text-black">
      {/* Parallax Background Elements */}
      <div className="album-bg"></div>
      <div className="noise"></div>

      {/* Floating Sticky Context Banner if coming from survey */}
      {recommendedGenre && (
        <div className="sticky top-16 z-30 bg-[#121212]/95 border-b border-[#1DB954]/30 backdrop-blur-md px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-ping"></span>
              <span className="text-neutral-400">당신의 맞춤 바이브:</span>
              <span className="font-extrabold text-[#1ed760]">{recommendedGenre.title}</span>
              <span className="hidden md:inline text-neutral-400">· 스포티파이 프리미엄으로 100% 몰입 감상하기</span>
            </div>
            <button
              onClick={onBackToSurvey}
              className="text-xs text-neutral-300 hover:text-white underline underline-offset-4 cursor-pointer"
            >
              ← 설문 결과 다시보기
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex flex-col justify-center items-center px-4 overflow-hidden pt-20">
        <div className="hero-bg">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>

        {/* Badge: Spotify Premium */}
        <div className="z-10 mb-6 inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#1DB954]/40 bg-black/40 text-white text-sm font-bold tracking-widest backdrop-blur-md reveal active">
          <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse"></span>
          Spotify Premium
        </div>

        {/* Giant Typography */}
        <h1 className="hero-text font-black z-10 select-none">
          음악으로<br />이어지는 우리
        </h1>

        <p className="z-10 mt-8 text-[#b3b3b3] text-lg md:text-2xl font-medium tracking-wide text-center max-w-2xl reveal active">
          수천만 곡의 음악과 나만을 위한 맞춤 플레이리스트,<br />스포티파이에서 광고 없이 온전히 즐겨보세요.
        </p>

        <div className="z-10 mt-12 reveal active">
          <button
            onClick={() => onOpenTrial('개인(Individual)')}
            className="btn-pulse inline-block bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold text-lg py-4 px-10 rounded-full cursor-pointer shadow-xl"
          >
            1개월 무료 체험하기
          </button>
        </div>
      </section>

      {/* Bento Grid (Premium Features) */}
      <section className="py-28 px-6 max-w-7xl mx-auto relative z-10" id="features">
        <div className="mb-20 text-center reveal active">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">왜 프리미엄인가요?</h2>
          <p className="text-[#b3b3b3] text-lg">음악의 흐름을 끊지 않는 완벽한 몰입의 경험.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
          {/* 1. Ad-free (Large Bento Card) */}
          <div className="bento-item md:col-span-2 md:row-span-2 p-10 reveal active group">
            <div
              className="bento-bg"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.85)), url('https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            ></div>
            <div className="bento-overlay"></div>
            <div className="bento-content">
              <div>
                <h3 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-md">
                  광고 없는<br />음악 감상.
                </h3>
                <p className="text-white/90 text-lg max-w-sm drop-shadow-sm leading-relaxed">
                  중간에 끊기는 일 없이 좋아하는 아티스트의 앨범을 끝까지 완벽하게 즐기세요.
                </p>
              </div>

              {/* Abstract Wave graphic from HTML */}
              <div className="absolute -right-20 -bottom-20 opacity-30 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none">
                <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill="#1DB954"
                    d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18,95.5,-3.1C94.2,11.8,85.6,26.1,75.1,37.8C64.6,49.5,52.2,58.6,38.9,65.8C25.6,73,11.4,78.3,-3.3,83C-18,87.7,-32.8,91.8,-45.7,85.7C-58.6,79.6,-69.6,63.3,-77.4,47.4C-85.2,31.5,-89.8,16,-88.4,1.1C-87,-13.8,-79.6,-28.1,-69.5,-39.4C-59.4,-50.7,-46.6,-59,-33.6,-66.2C-20.6,-73.4,-7.4,-79.5,6.5,-90.9C20.4,-102.3,30.6,-83.6,44.7,-76.4Z"
                    transform="translate(100 100)"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* 2. Offline Downloads Card */}
          <div className="bento-item p-8 reveal active">
            <div
              className="bento-bg"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop')`,
              }}
            ></div>
            <div className="bento-overlay"></div>
            <div className="bento-content justify-end">
              <svg
                className="w-12 h-12 text-[#1DB954] mb-auto drop-shadow-md"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <div>
                <h3 className="text-2xl font-bold mb-2 drop-shadow-md">오프라인 저장</h3>
                <p className="text-white/80 text-sm drop-shadow-sm">데이터 걱정 없이 언제 어디서나 감상하세요.</p>
              </div>
            </div>
          </div>

          {/* 3. Unlimited Skips Card */}
          <div className="bento-item p-8 reveal active">
            <div
              className="bento-bg"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop')`,
              }}
            ></div>
            <div className="bento-overlay"></div>
            <div className="bento-content justify-end">
              <svg
                className="w-12 h-12 text-[#1DB954] mb-auto drop-shadow-md"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.81V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z" />
              </svg>
              <div>
                <h3 className="text-2xl font-bold mb-2 drop-shadow-md">무제한 건너뛰기</h3>
                <p className="text-white/80 text-sm drop-shadow-sm">원하는 곡만 선택해서 듣는 완전한 자유.</p>
              </div>
            </div>
          </div>

          {/* 4. High Audio Quality */}
          <div className="bento-item md:col-span-3 p-10 reveal active">
            <div
              className="bento-bg"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1600&auto=format&fit=crop')`,
                backgroundPosition: 'center 40%',
              }}
            ></div>
            <div
              className="bento-overlay"
              style={{
                background: 'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.15) 100%)',
              }}
            ></div>
            <div className="bento-content flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="max-w-xl">
                <h3 className="text-3xl font-bold mb-3 drop-shadow-md">최고급 오디오 퀄리티</h3>
                <p className="text-white/90 drop-shadow-sm text-lg">디테일이 살아있는 스튜디오급 사운드로 플레이리스트의 격을 높이세요.</p>
              </div>
              <div className="flex items-end gap-1.5 h-16 hidden sm:flex">
                <div className="w-3 bg-[#1DB954] rounded-t-sm h-full animate-[pulse_1s_ease-in-out_infinite_alternate]"></div>
                <div className="w-3 bg-[#1DB954] rounded-t-sm h-3/4 animate-[pulse_0.8s_ease-in-out_infinite_alternate]"></div>
                <div className="w-3 bg-[#1DB954] rounded-t-sm h-1/2 animate-[pulse_1.2s_ease-in-out_infinite_alternate]"></div>
                <div className="w-3 bg-[#1DB954] rounded-t-sm h-5/6 animate-[pulse_0.9s_ease-in-out_infinite_alternate]"></div>
                <div className="w-3 bg-[#1DB954] rounded-t-sm h-2/3 animate-[pulse_1.5s_ease-in-out_infinite_alternate]"></div>
                <div className="w-3 bg-[#1DB954] rounded-t-sm h-full animate-[pulse_1.1s_ease-in-out_infinite_alternate]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Pricing Section */}
      <section className="py-28 px-6 relative z-10 bg-[#121212]" id="pricing">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 reveal active">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">당신에게 맞는 요금제</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Student */}
            <div className="pricing-card rounded-3xl p-8 flex flex-col reveal active">
              <span className="inline-block bg-[#1DB954] text-black text-xs font-bold px-3 py-1 rounded-full mb-6 w-max">
                1개월 무료
              </span>
              <h3 className="text-2xl font-bold mb-2">학생(Student)</h3>
              <p className="text-[#b3b3b3] mb-6 border-b border-[#282828] pb-6">
                5,900원/월<br />계정 1개
              </p>
              <ul className="text-sm space-y-4 flex-1 mb-8">
                <li className="flex gap-3">
                  <svg className="w-5 h-5 text-[#1DB954] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  인증된 대학생을 위한 반값 할인
                </li>
                <li className="flex gap-3">
                  <svg className="w-5 h-5 text-[#1DB954] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  개인(Individual) 혜택 모두 포함
                </li>
                <li className="flex gap-3">
                  <svg className="w-5 h-5 text-[#1DB954] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  오프라인 감상 및 무제한 스킵
                </li>
              </ul>
              <button
                onClick={() => onOpenTrial('학생(Student)')}
                className="w-full py-3 rounded-full bg-transparent border-2 border-white font-bold hover:bg-white hover:text-black transition-colors cursor-pointer"
              >
                시작하기
              </button>
            </div>

            {/* 2. Individual */}
            <div className="pricing-card rounded-3xl p-8 flex flex-col reveal active">
              <span className="inline-block bg-[#1DB954] text-black text-xs font-bold px-3 py-1 rounded-full mb-6 w-max">
                1개월 무료
              </span>
              <h3 className="text-2xl font-bold mb-2">개인(Individual)</h3>
              <p className="text-[#b3b3b3] mb-6 border-b border-[#282828] pb-6">
                10,900원/월<br />계정 1개
              </p>
              <ul className="text-sm space-y-4 flex-1 mb-8">
                <li className="flex gap-3">
                  <svg className="w-5 h-5 text-[#1DB954] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  광고 없는 음악 감상
                </li>
                <li className="flex gap-3">
                  <svg className="w-5 h-5 text-[#1DB954] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  오프라인 감상
                </li>
                <li className="flex gap-3">
                  <svg className="w-5 h-5 text-[#1DB954] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  나만의 맞춤형 플레이리스트
                </li>
              </ul>
              <button
                onClick={() => onOpenTrial('개인(Individual)')}
                className="w-full py-3 rounded-full bg-transparent border-2 border-white font-bold hover:bg-white hover:text-black transition-colors cursor-pointer"
              >
                시작하기
              </button>
            </div>

            {/* 3. Duo */}
            <div className="pricing-card rounded-3xl p-8 flex flex-col reveal active">
              <span className="inline-block bg-[#1DB954] text-black text-xs font-bold px-3 py-1 rounded-full mb-6 w-max">
                1개월 무료
              </span>
              <h3 className="text-2xl font-bold mb-2">듀오(Duo)</h3>
              <p className="text-[#b3b3b3] mb-6 border-b border-[#282828] pb-6">
                16,350원/월<br />계정 2개
              </p>
              <ul className="text-sm space-y-4 flex-1 mb-8">
                <li className="flex gap-3">
                  <svg className="w-5 h-5 text-[#1DB954] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  동거인을 위한 프리미엄 계정 2개
                </li>
                <li className="flex gap-3">
                  <svg className="w-5 h-5 text-[#1DB954] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  함께 듣는 듀오 믹스 제공
                </li>
                <li className="flex gap-3">
                  <svg className="w-5 h-5 text-[#1DB954] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  각자의 계정에서 무제한 감상
                </li>
              </ul>
              <button
                onClick={() => onOpenTrial('듀오(Duo)')}
                className="w-full py-3 rounded-full bg-transparent border-2 border-white font-bold hover:bg-white hover:text-black transition-colors cursor-pointer"
              >
                시작하기
              </button>
            </div>

            {/* 4. Family (Highlight) */}
            <div
              className="pricing-card rounded-3xl p-8 flex flex-col reveal active relative overflow-hidden"
              style={{ borderColor: 'rgba(29, 185, 84, 0.6)' }}
            >
              <div className="absolute top-0 right-0 bg-[#1DB954] text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                BEST VALUE
              </div>
              <span className="inline-block bg-[#1DB954] text-black text-xs font-bold px-3 py-1 rounded-full mb-6 w-max mt-2">
                1개월 무료
              </span>
              <h3 className="text-2xl font-bold mb-2 text-[#1DB954]">가족(Family)</h3>
              <p className="text-[#b3b3b3] mb-6 border-b border-[#282828] pb-6">
                17,900원/월<br />최대 계정 6개
              </p>
              <ul className="text-sm space-y-4 flex-1 mb-8">
                <li className="flex gap-3">
                  <svg className="w-5 h-5 text-[#1DB954] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  가족을 위한 프리미엄 계정 6개
                </li>
                <li className="flex gap-3">
                  <svg className="w-5 h-5 text-[#1DB954] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  자녀를 위한 Spotify Kids 앱
                </li>
                <li className="flex gap-3">
                  <svg className="w-5 h-5 text-[#1DB954] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  유해 콘텐츠 차단 기능
                </li>
              </ul>
              <button
                onClick={() => onOpenTrial('가족(Family)')}
                className="btn-pulse w-full py-3 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold cursor-pointer"
              >
                시작하기
              </button>
            </div>
          </div>

          <div className="mt-10 text-center space-y-2 reveal active">
            <p className="text-sm text-[#b3b3b3] font-medium">
              언제든 해지할 수 있습니다.
            </p>
            <p className="text-xs text-[#b3b3b3]/80">
              이 사이트는 구글 제미나이로 만든 가상의 사이트 입니다.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-20 px-6 border-t border-[#282828]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="font-bold text-3xl tracking-tighter flex items-center gap-2">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="#1DB954">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.54.659.28 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15.001 10.62 18.66 12.84c.361.181.54.78.301 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.42-1.02.599-1.559.3z" />
            </svg>
            Spotify
          </div>
          <ul className="flex flex-wrap gap-6 text-sm font-medium text-[#b3b3b3]">
            <li className="hover:text-[#1DB954] cursor-pointer transition-colors">법률 정보</li>
            <li className="hover:text-[#1DB954] cursor-pointer transition-colors">개인정보 보호 센터</li>
            <li className="hover:text-[#1DB954] cursor-pointer transition-colors">개인정보 처리방침</li>
            <li className="hover:text-[#1DB954] cursor-pointer transition-colors">쿠키</li>
          </ul>
        </div>
      </footer>
    </div>
  );
};
