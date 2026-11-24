import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Music2, Pause, Play, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GenreRecommendation, SoundMetrics } from '../types';
import {
  getClosestGenreForMetrics,
  getSoundMatchedCatalog,
} from '../data/surveyData';
import {
  PREVIEW_DURATION_SEC,
  PreviewTrackItem,
  previewEngine,
} from '../utils/audioPreviewEngine';
import { playClickSound } from '../utils/audioSynth';
import { TrackPreviewPlayer } from './TrackPreviewPlayer';
import { PullToRefreshTracks } from './PullToRefreshTracks';
import { JellySlider } from './JellySlider';

interface RecommendationViewProps {
  recommendation: GenreRecommendation;
  onExploreSpotify: () => void;
  onRetakeSurvey: () => void;
}

const TRACKS_PER_BATCH = 4;
const ARTISTS_PER_BATCH = 5;

const formatSec = (sec: number) => {
  const whole = Math.max(0, Math.floor(sec));
  const m = Math.floor(whole / 60);
  const s = whole % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const RecommendationView: React.FC<RecommendationViewProps> = ({
  recommendation,
  onExploreSpotify,
  onRetakeSurvey,
}) => {
  const [refreshStep, setRefreshStep] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [profileMetrics, setProfileMetrics] = useState<SoundMetrics>(recommendation.metrics);
  const [appliedMetrics, setAppliedMetrics] = useState<SoundMetrics>(recommendation.metrics);

  const isMetricsEqual = (a: SoundMetrics, b: SoundMetrics) =>
    a.energy === b.energy &&
    a.chill === b.chill &&
    a.melody === b.melody &&
    a.dance === b.dance;

  const isProfileModified = !isMetricsEqual(profileMetrics, recommendation.metrics);
  const isAppliedCustom = !isMetricsEqual(appliedMetrics, recommendation.metrics);
  const hasPendingMetricChanges = !isMetricsEqual(profileMetrics, appliedMetrics);

  const liveClosestGenre = useMemo(
    () => getClosestGenreForMetrics(profileMetrics),
    [profileMetrics]
  );

  const matchedCatalog = useMemo(
    () => getSoundMatchedCatalog(appliedMetrics, recommendation, isAppliedCustom),
    [appliedMetrics, recommendation, isAppliedCustom]
  );

  // Full pools (either survey genre or sound-profile matched tracks/artists)
  const allTrackItems: Array<PreviewTrackItem & { durationLabel: string; matchScore: number }> = useMemo(
    () =>
      matchedCatalog.tracks.map((track) => ({
        id: track.id,
        title: track.title,
        artist: track.artist,
        tempo: track.tempo,
        mood: track.mood,
        searchQuery: track.searchQuery,
        kind: 'track' as const,
        durationLabel: track.duration,
        matchScore: track.matchScore,
      })),
    [matchedCatalog]
  );

  const allArtistItems: Array<PreviewTrackItem & { matchScore: number }> = useMemo(
    () =>
      matchedCatalog.artists.map((ap) => ({
        id: ap.id,
        title: ap.representativeTrack,
        artist: ap.name,
        tempo: ap.tempo,
        mood: ap.mood,
        searchQuery: ap.searchQuery,
        kind: 'artist' as const,
        matchScore: ap.matchScore,
      })),
    [matchedCatalog]
  );

  const totalBatches = Math.max(
    1,
    Math.ceil(allTrackItems.length / TRACKS_PER_BATCH),
    Math.ceil(allArtistItems.length / ARTISTS_PER_BATCH)
  );

  // Current rotated batch of 4 tracks & 5 artists
  const visibleTracks = useMemo(() => {
    const batchIdx = refreshStep % totalBatches;
    const start = (batchIdx * TRACKS_PER_BATCH) % allTrackItems.length;
    const picked: Array<PreviewTrackItem & { durationLabel: string; matchScore: number }> = [];
    for (let i = 0; i < Math.min(TRACKS_PER_BATCH, allTrackItems.length); i++) {
      picked.push(allTrackItems[(start + i) % allTrackItems.length]);
    }
    return picked;
  }, [allTrackItems, refreshStep, totalBatches]);

  const visibleArtists = useMemo(() => {
    const batchIdx = refreshStep % totalBatches;
    const start = (batchIdx * ARTISTS_PER_BATCH) % allArtistItems.length;
    const picked: Array<PreviewTrackItem & { matchScore: number }> = [];
    for (let i = 0; i < Math.min(ARTISTS_PER_BATCH, allArtistItems.length); i++) {
      picked.push(allArtistItems[(start + i) % allArtistItems.length]);
    }
    return picked;
  }, [allArtistItems, refreshStep, totalBatches]);

  const visiblePlaylist = useMemo(
    () => [...visibleTracks, ...visibleArtists],
    [visibleTracks, visibleArtists]
  );

  const [activeItem, setActiveItem] = useState<PreviewTrackItem>(allTrackItems[0]);
  const [playbackState, setPlaybackState] = useState<'idle' | 'loading' | 'playing' | 'paused'>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(PREVIEW_DURATION_SEC);
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null);

  // Reset when survey recommendation changes
  useEffect(() => {
    setRefreshStep(0);
    setProfileMetrics(recommendation.metrics);
    setAppliedMetrics(recommendation.metrics);
    const defaultCatalog = getSoundMatchedCatalog(recommendation.metrics, recommendation, false);
    const first = defaultCatalog.tracks[0];
    setActiveItem({
      id: first.id,
      title: first.title,
      artist: first.artist,
      tempo: first.tempo,
      mood: first.mood,
      searchQuery: first.searchQuery,
      kind: 'track',
    });
    setPlaybackState('idle');
    setCurrentTime(0);
    setDuration(PREVIEW_DURATION_SEC);
    setArtworkUrl(null);
    previewEngine.stop();
  }, [recommendation]);

  // Wire previewEngine callbacks and confetti celebration
  useEffect(() => {
    previewEngine.setCallbacks({
      onTimeUpdate: (time, dur) => {
        setCurrentTime(time);
        setDuration(dur);
      },
      onStateChange: (state) => {
        setPlaybackState(state);
      },
      onSourceResolved: (_source, art) => {
        setArtworkUrl(art);
      },
      onEnded: () => {
        setPlaybackState('idle');
        setCurrentTime(0);
      },
    });

    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.5 },
        colors: [recommendation.accentColor, '#1DB954', '#ffffff', recommendation.glowColor],
      });
    } catch {
      // ignore
    }

    return () => {
      previewEngine.stop();
    };
  }, [recommendation]);

  const handleRefreshRecommendations = () => {
    playClickSound();
    setIsSpinning(true);
    window.setTimeout(() => setIsSpinning(false), 450);

    let nextFirstTrack: PreviewTrackItem;

    if (hasPendingMetricChanges) {
      const nextCustom = !isMetricsEqual(profileMetrics, recommendation.metrics);
      const nextCatalog = getSoundMatchedCatalog(profileMetrics, recommendation, nextCustom);
      setAppliedMetrics(profileMetrics);
      setRefreshStep(0);
      const t = nextCatalog.tracks[0];
      nextFirstTrack = {
        id: t.id,
        title: t.title,
        artist: t.artist,
        tempo: t.tempo,
        mood: t.mood,
        searchQuery: t.searchQuery,
        kind: 'track',
      };
    } else {
      const nextStep = refreshStep + 1;
      setRefreshStep(nextStep);
      const nextBatchIdx = nextStep % totalBatches;
      const nextStart = (nextBatchIdx * TRACKS_PER_BATCH) % allTrackItems.length;
      nextFirstTrack = allTrackItems[nextStart];
    }

    previewEngine.stop();
    setActiveItem(nextFirstTrack);
    setPlaybackState('idle');
    setCurrentTime(0);
    setDuration(PREVIEW_DURATION_SEC);
    setArtworkUrl(null);
  };

  const handleResetMetrics = () => {
    playClickSound();
    setProfileMetrics(recommendation.metrics);
    setAppliedMetrics(recommendation.metrics);
    setRefreshStep(0);
    const defaultCatalog = getSoundMatchedCatalog(recommendation.metrics, recommendation, false);
    const first = defaultCatalog.tracks[0];
    previewEngine.stop();
    setActiveItem({
      id: first.id,
      title: first.title,
      artist: first.artist,
      tempo: first.tempo,
      mood: first.mood,
      searchQuery: first.searchQuery,
      kind: 'track',
    });
    setPlaybackState('idle');
    setCurrentTime(0);
    setDuration(PREVIEW_DURATION_SEC);
    setArtworkUrl(null);
  };

  const handleSelectAndPlay = (item: PreviewTrackItem) => {
    if (activeItem.id === item.id) {
      if (playbackState === 'playing') {
        previewEngine.pause();
      } else if (playbackState === 'paused') {
        previewEngine.resume();
      } else {
        void previewEngine.play(item, 0);
      }
      return;
    }

    setActiveItem(item);
    setArtworkUrl(null);
    void previewEngine.play(item, 0);
  };

  const handleToggleCurrent = () => {
    if (playbackState === 'playing') {
      previewEngine.pause();
    } else if (playbackState === 'paused') {
      previewEngine.resume();
    } else if (playbackState === 'idle') {
      void previewEngine.play(activeItem, currentTime);
    }
  };

  const handlePrev = () => {
    const idx = visiblePlaylist.findIndex((x) => x.id === activeItem.id);
    const prevIdx = idx <= 0 ? visiblePlaylist.length - 1 : idx - 1;
    const prevItem = visiblePlaylist[prevIdx];
    setActiveItem(prevItem);
    setArtworkUrl(null);
    void previewEngine.play(prevItem, 0);
  };

  const handleNext = () => {
    const idx = visiblePlaylist.findIndex((x) => x.id === activeItem.id);
    const nextIdx = idx < 0 || idx >= visiblePlaylist.length - 1 ? 0 : idx + 1;
    const nextItem = visiblePlaylist[nextIdx];
    setActiveItem(nextItem);
    setArtworkUrl(null);
    void previewEngine.play(nextItem, 0);
  };

  const isPlayingActive = playbackState === 'playing';
  const isLoadingActive = playbackState === 'loading';
  const currentBatchNumber = (refreshStep % totalBatches) + 1;

  return (
    <section className="relative min-h-screen px-4 sm:px-6 pt-24 pb-16 overflow-hidden max-w-5xl mx-auto">
      {/* Background Orbs */}
      <div className="hero-bg">
        <div className="orb orb-1" style={{ backgroundColor: recommendation.accentColor, opacity: 0.35 }}></div>
        <div className="orb orb-2" style={{ backgroundColor: recommendation.glowColor, opacity: 0.3 }}></div>
      </div>
      <div className="noise"></div>

      <div className="relative z-10">
        {/* Top Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-black/60 text-white text-xs font-bold tracking-widest backdrop-blur-md mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: recommendation.accentColor }}></span>
            {recommendation.badge}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
            당신만을 위한 맞춤 음악 장르
          </h1>
          <p className="text-neutral-300 text-base sm:text-lg max-w-xl mx-auto">
            {recommendation.tagline}
          </p>
        </div>

        {/* Main Hero Card */}
        <div className="bg-[#121212]/90 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl mb-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between border-b border-white/10 pb-8">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="px-3 py-1 rounded-full text-xs font-black uppercase text-black"
                  style={{ backgroundColor: recommendation.accentColor }}
                >
                  취향 일치도 {recommendation.matchScore}%
                </span>
                <span className="text-xs text-neutral-400 font-medium">
                  스포티파이 바이브 알고리즘 매칭 완료
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {recommendation.title}
              </h2>
              <div className="text-lg font-bold text-[#1DB954]">
                {recommendation.koreanName}
              </div>

              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                {recommendation.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                {recommendation.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs text-neutral-300 bg-white/5 border border-white/10 px-3 py-1 rounded-lg"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick 30s Genre Signature Preview Card (Synced with Player) */}
            <div className="w-full lg:w-auto shrink-0 bg-black/60 border border-white/10 p-5 rounded-2xl flex flex-col items-center justify-center text-center min-w-[230px]">
              <div className="text-xs font-semibold text-neutral-400 mb-1">
                대표곡 30초 미리듣기
              </div>
              <div className="text-sm font-bold text-white truncate max-w-[200px]">
                {activeItem.title}
              </div>
              <div className="text-xs text-neutral-400 truncate max-w-[200px] mb-3">
                {activeItem.artist}
              </div>

              {/* Audio Wave Bars */}
              <div className="flex items-end justify-center gap-1.5 h-10 mb-3">
                {[40, 75, 100, 60, 90, 50, 85].map((height, i) => (
                  <span
                    key={i}
                    className="w-2 rounded-t-sm transition-all duration-300"
                    style={{
                      height: isPlayingActive ? `${height}%` : '22%',
                      backgroundColor: isPlayingActive ? recommendation.accentColor : '#404040',
                      animation: isPlayingActive ? `pulse 0.7s infinite alternate ease-in-out ${i * 0.1}s` : 'none',
                    }}
                  ></span>
                ))}
              </div>

              <button
                type="button"
                onClick={handleToggleCurrent}
                className="btn-pulse w-full py-2.5 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer bg-white text-black hover:bg-[#1DB954]"
              >
                {isLoadingActive ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>불러오는 중...</span>
                  </>
                ) : isPlayingActive ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>일시정지 ({formatSec(currentTime)})</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>30초 미리듣기</span>
                  </>
                )}
              </button>
              <span className="text-[11px] font-mono tabular-nums text-neutral-500 mt-2">
                {formatSec(currentTime)} / {formatSec(duration)}
              </span>
            </div>
          </div>

          {/* Sound Profile Metrics & Interactive 30s Preview Player + Tracks/Artists */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
            {/* Left: Sound Metrics (5 cols) */}
            <div className="lg:col-span-5">
              <div className="flex items-center justify-between gap-2 mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[#1DB954] rounded-full"></span>
                  사운드 프로필 분석
                </h3>
                {isProfileModified && (
                  <button
                    type="button"
                    onClick={handleResetMetrics}
                    className="text-xs font-medium text-neutral-400 hover:text-white transition-colors underline underline-offset-4 cursor-pointer"
                  >
                    초기화
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {(
                  [
                    { key: 'energy', label: '에너지 지수 (Energy)', value: profileMetrics.energy, color: '#1DB954' },
                    { key: 'chill', label: '편안함 & 칠 (Chill)', value: profileMetrics.chill, color: '#38bdf8' },
                    { key: 'melody', label: '멜로디 중독성 (Melody)', value: profileMetrics.melody, color: '#d8b4e2' },
                    { key: 'dance', label: '댄서빌리티 (Dance)', value: profileMetrics.dance, color: '#f43f5e' },
                  ] as const
                ).map((metric) => (
                  <JellySlider
                    key={metric.key}
                    label={metric.label}
                    value={metric.value}
                    min={0}
                    max={100}
                    suffix="%"
                    accentColor={metric.color}
                    onValueChange={(nextVal) =>
                      setProfileMetrics((prev) => ({
                        ...prev,
                        [metric.key]: nextVal,
                      }))
                    }
                  />
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-neutral-300 leading-relaxed">
                <span className="font-bold text-white block mb-1">
                  {isProfileModified ? '커스텀 사운드 매칭 안내' : '추천 산출 근거'}
                </span>
                {isProfileModified ? (
                  <span>
                    조절하신 수치(에너지 {profileMetrics.energy}% · 칠 {profileMetrics.chill}% · 멜로디 {profileMetrics.melody}% · 댄스 {profileMetrics.dance}%)는{' '}
                    <strong className="text-[#1ed760]">{liveClosestGenre.title}</strong> 성향과 가장 가깝습니다.{' '}
                    {hasPendingMetricChanges
                      ? '오른쪽 새로고침 버튼을 누르면 이 수치에 딱 맞는 노래로 변경됩니다.'
                      : '현재 조절된 수치에 맞춘 추천 트랙이 표시되고 있습니다.'}
                  </span>
                ) : (
                  recommendation.reason
                )}
              </div>
            </div>

            {/* Right: Representative Tracks & Artists with 30s Waveform Player + Refresh Button (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#d8b4e2] rounded-full"></span>
                    대표 아티스트 & 추천 트랙
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {isAppliedCustom
                      ? `조절된 사운드 맞춤 추천 (${matchedCatalog.closestGenre.title}) · 세트 ${currentBatchNumber} / ${totalBatches}`
                      : `곡이나 아티스트를 눌러 30초 미리듣기 · 세트 ${currentBatchNumber} / ${totalBatches}`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRefreshRecommendations}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                    hasPendingMetricChanges
                      ? 'bg-[#1DB954] hover:bg-[#1ed760] text-black border-[#1DB954] shadow-[0_0_20px_rgba(29,185,84,0.35)]'
                      : 'bg-white/10 hover:bg-[#1DB954] text-white hover:text-black border-white/15 hover:border-[#1DB954]'
                  }`}
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 transition-transform duration-500 ${
                      isSpinning ? 'rotate-360' : ''
                    }`}
                  />
                  <span>{hasPendingMetricChanges ? '수치 맞춤 새로고침' : '다른 곡 새로고침'}</span>
                </button>
              </div>

              {/* Kokonut UI-inspired Interactive 30s Waveform Player */}
              <TrackPreviewPlayer
                activeTrack={activeItem}
                playbackState={playbackState}
                currentTime={currentTime}
                duration={duration}
                artworkUrl={artworkUrl}
                accentColor={recommendation.accentColor}
                onTogglePlay={handleToggleCurrent}
                onStop={() => previewEngine.stop()}
                onSeek={(sec) => previewEngine.seek(sec)}
                onPrev={handlePrev}
                onNext={handleNext}
              />

              {/* Pull-to-Refresh Recommended Tracks List (Pull down or click to play 30s preview) */}
              <PullToRefreshTracks
                tracks={visibleTracks}
                activeTrackId={activeItem.id}
                isPlayingActive={isPlayingActive}
                isLoadingActive={isLoadingActive}
                accentColor={recommendation.accentColor}
                refreshKey={`${appliedMetrics.energy}-${appliedMetrics.chill}-${appliedMetrics.melody}-${appliedMetrics.dance}-${refreshStep}`}
                onSelectTrack={handleSelectAndPlay}
                onRefresh={handleRefreshRecommendations}
              />

              {/* Representative Artists Interactive 30s Previews */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Music2 className="w-3.5 h-3.5 text-[#1DB954]" />
                    주요 아티스트 대표곡 30초 미리듣기
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {visibleArtists.map((artistItem) => {
                    const isCurrent = activeItem.id === artistItem.id;
                    const isArtistPlaying = isCurrent && isPlayingActive;
                    const isArtistLoading = isCurrent && isLoadingActive;

                    return (
                      <button
                        key={artistItem.id}
                        type="button"
                        onClick={() => handleSelectAndPlay(artistItem)}
                        className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer group ${
                          isCurrent
                            ? 'bg-white/10 border-[#1DB954]/60 text-white'
                            : 'bg-black/35 border-white/10 text-neutral-300 hover:bg-white/5 hover:border-white/25 hover:text-white'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">
                            {artistItem.artist}
                          </div>
                          <div className="text-[11px] text-neutral-400 truncate">
                            {artistItem.title} · 30s
                          </div>
                        </div>
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isCurrent
                              ? 'bg-[#1DB954] text-black'
                              : 'bg-white/10 text-white group-hover:bg-[#1DB954] group-hover:text-black'
                          }`}
                        >
                          {isArtistLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : isArtistPlaying ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current translate-x-[0.5px]" />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The Core Requirement: Spotify Premium Callout & "더 알아보기" Button */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-black border-2 border-[#1DB954]/50 rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#1DB954]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/40 text-[#1ed760] font-bold text-xs">
              SPOTIFY PREMIUM BENEFIT
            </span>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              추천받은 장르를 100% 온전히 즐기는 방법
            </h3>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              {recommendation.spotifyBenefit}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* PRIMARY ACTION: "더 알아보기" BUTTON */}
              <button
                type="button"
                onClick={onExploreSpotify}
                className="btn-pulse w-full sm:w-auto px-10 py-4 bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold text-base rounded-full shadow-[0_0_30px_rgba(29,185,84,0.4)] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>더 알아보기</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              <button
                type="button"
                onClick={onRetakeSurvey}
                className="w-full sm:w-auto px-6 py-4 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white font-semibold text-sm rounded-full border border-white/10 transition-colors cursor-pointer"
              >
                설문 다시 하기
              </button>
            </div>
            <p className="text-xs text-neutral-400 pt-2">
              클릭 시 스포티파이 프리미엄 특별 프로모션 광고 사이트로 이동합니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
