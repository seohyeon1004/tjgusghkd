import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { SurveyView } from './components/SurveyView';
import { RecommendationView } from './components/RecommendationView';
import { SpotifyLandingView } from './components/SpotifyLandingView';
import { TrialModal } from './components/TrialModal';
import { calculateRecommendation } from './data/surveyData';
import { GenreRecommendation } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'survey' | 'result' | 'spotify'>('survey');
  const [recommendation, setRecommendation] = useState<GenreRecommendation | null>(null);
  const [isTrialOpen, setIsTrialOpen] = useState(false);
  const [trialPlan, setTrialPlan] = useState('개인(Individual)');

  const handleSurveyComplete = (answers: Record<number, string>) => {
    const rec = calculateRecommendation(answers);
    setRecommendation(rec);
    setCurrentView('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreSpotify = () => {
    setCurrentView('spotify');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetakeSurvey = () => {
    setCurrentView('survey');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTrial = (plan: string = '개인(Individual)') => {
    setTrialPlan(plan);
    setIsTrialOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-white relative font-sans">
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenTrial={() => handleOpenTrial('개인(Individual)')}
        hasResult={recommendation !== null}
      />

      <main>
        {currentView === 'survey' && (
          <SurveyView
            onComplete={handleSurveyComplete}
            onSkipToSpotify={() => {
              setCurrentView('spotify');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'result' && recommendation && (
          <RecommendationView
            recommendation={recommendation}
            onExploreSpotify={handleExploreSpotify}
            onRetakeSurvey={handleRetakeSurvey}
          />
        )}

        {currentView === 'spotify' && (
          <SpotifyLandingView
            recommendedGenre={recommendation}
            onOpenTrial={handleOpenTrial}
            onBackToSurvey={() => {
              if (recommendation) {
                setCurrentView('result');
              } else {
                setCurrentView('survey');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      <TrialModal
        isOpen={isTrialOpen}
        onClose={() => setIsTrialOpen(false)}
        initialPlan={trialPlan}
        recommendedGenreTitle={recommendation?.title}
      />
    </div>
  );
}
