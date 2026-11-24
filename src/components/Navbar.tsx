import React, { useEffect, useRef, useState } from 'react';

interface NavbarProps {
  currentView: 'survey' | 'result' | 'spotify';
  onNavigate: (view: 'survey' | 'result' | 'spotify') => void;
  onOpenTrial: () => void;
  hasResult: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenTrial,
  hasResult
}) => {
  const [activeAnchor, setActiveAnchor] = useState<'features' | 'pricing' | null>(null);
  const scrollLockUntilRef = useRef(0);

  useEffect(() => {
    if (currentView !== 'spotify') {
      setActiveAnchor(null);
      return;
    }

    const updateActiveByScroll = () => {
      if (performance.now() < scrollLockUntilRef.current) return;

      const pricingEl = document.getElementById('pricing');
      const featuresEl = document.getElementById('features');
      const triggerY = window.innerHeight * 0.35;
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40;

      if (atBottom || (pricingEl && pricingEl.getBoundingClientRect().top <= triggerY)) {
        setActiveAnchor('pricing');
      } else if (featuresEl && featuresEl.getBoundingClientRect().top <= triggerY) {
        setActiveAnchor('features');
      } else {
        setActiveAnchor(null);
      }
    };

    window.addEventListener('scroll', updateActiveByScroll, { passive: true });
    const timer = window.setTimeout(updateActiveByScroll, 120);

    return () => {
      window.removeEventListener('scroll', updateActiveByScroll);
      window.clearTimeout(timer);
    };
  }, [currentView]);

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: 'features' | 'pricing'
  ) => {
    e.preventDefault();
    scrollLockUntilRef.current = performance.now() + 700;
    setActiveAnchor(sectionId);
    if (currentView !== 'spotify') {
      onNavigate('spotify');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-40 px-6 py-4 flex items-center justify-between border-b border-white/5 bg-black/75 backdrop-blur-md">
      {/* Zone 1: Single Brand element */}
      <button
        onClick={() => onNavigate('survey')}
        className="flex items-center gap-2.5 text-white font-bold text-xl tracking-tighter hover:opacity-90 transition-opacity focus:outline-none"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="#1DB954" className="shrink-0">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.54.659.28 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15.001 10.62 18.66 12.84c.361.181.54.78.301 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.42-1.02.599-1.559.3z"/>
        </svg>
        <span className="text-white text-lg tracking-tight font-extrabold">Spotify</span>
      </button>

      {/* Zone 2: 4-5 single-line navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        <button
          onClick={() => onNavigate('survey')}
          className={`transition-colors whitespace-nowrap cursor-pointer ${
            currentView === 'survey' ? 'text-[#1DB954] font-semibold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          취향 테스트
        </button>
        {hasResult && (
          <button
            onClick={() => onNavigate('result')}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              currentView === 'result' ? 'text-[#1DB954] font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            맞춤 장르 결과
          </button>
        )}
        <button
          onClick={() => {
            scrollLockUntilRef.current = performance.now() + 700;
            setActiveAnchor(null);
            onNavigate('spotify');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`transition-colors whitespace-nowrap cursor-pointer ${
            currentView === 'spotify' && activeAnchor === null
              ? 'text-[#1DB954] font-semibold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          스포티파이 프리미엄
        </button>
        <a
          href="#features"
          onClick={(e) => handleAnchorClick(e, 'features')}
          className={`transition-colors whitespace-nowrap cursor-pointer ${
            currentView === 'spotify' && activeAnchor === 'features'
              ? 'text-[#1DB954] font-semibold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          프리미엄 혜택
        </a>
        <a
          href="#pricing"
          onClick={(e) => handleAnchorClick(e, 'pricing')}
          className={`transition-colors whitespace-nowrap cursor-pointer ${
            currentView === 'spotify' && activeAnchor === 'pricing'
              ? 'text-[#1DB954] font-semibold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          요금제 안내
        </a>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3">
        {currentView === 'spotify' ? (
          <button
            onClick={onOpenTrial}
            className="btn-pulse px-4 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs md:text-sm rounded-full transition-all whitespace-nowrap"
          >
            1개월 무료 체험
          </button>
        ) : (
          <button
            onClick={() => onNavigate('spotify')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs md:text-sm rounded-full transition-all whitespace-nowrap border border-white/10"
          >
            프리미엄 광고 보기
          </button>
        )}
      </div>
    </header>
  );
};
