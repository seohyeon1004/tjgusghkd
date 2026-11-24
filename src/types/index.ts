export interface SurveyOption {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
  genreWeight: Record<string, number>;
}

export interface SurveyQuestion {
  id: number;
  question: string;
  description: string;
  options: SurveyOption[];
}

export interface SoundMetrics {
  energy: number;
  chill: number;
  melody: number;
  dance: number;
}

export type AudioMoodType = 'bubblegum' | 'lofi' | 'citypop' | 'edm' | 'acoustic';

export interface TrackPreview {
  title: string;
  artist: string;
  duration: string;
  tempo: string;
  searchQuery?: string;
  metrics?: SoundMetrics;
  mood?: AudioMoodType;
}

export interface ArtistPreview {
  name: string;
  representativeTrack: string;
  tempo: string;
  searchQuery: string;
  metrics?: SoundMetrics;
  mood?: AudioMoodType;
}

export interface GenreRecommendation {
  id: string;
  title: string;
  koreanName: string;
  tagline: string;
  matchScore: number;
  badge: string;
  accentColor: string;
  glowColor: string;
  tags: string[];
  description: string;
  reason: string;
  spotifyBenefit: string;
  artists: string[];
  artistPreviews: ArtistPreview[];
  tracks: TrackPreview[];
  metrics: SoundMetrics;
  audioMood: AudioMoodType;
}
