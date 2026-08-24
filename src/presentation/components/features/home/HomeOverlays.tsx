import { OnboardingAlert } from '@presentation/components/reusables';
import { AuthModal, SurveyDeck } from '@presentation/components/features';
import { MarketSurvey } from '@domain/entities';

interface HomeOverlaysProps {
  currentStep: string | null;
  showAuthModal: boolean;
  onAuthModalClose: () => void;
  onAction: () => void;
  onDismiss: () => void;
  isLoggedIn: boolean;
  pendingSurveys: MarketSurvey[];
  refreshSurveys: () => void;
}

const HomeOverlays: React.FC<HomeOverlaysProps> = ({
  currentStep, showAuthModal, onAuthModalClose, onAction, onDismiss,
  isLoggedIn, pendingSurveys, refreshSurveys,
}) => (
  <>
    <OnboardingAlert type={currentStep || 'login'} isOpen={!!currentStep} onAction={onAction} onDismiss={onDismiss} />
    <AuthModal isOpen={showAuthModal} onClose={onAuthModalClose} initialMode="register" />

    <div className="purple-blob w-80 h-80 bg-primary-200/20 -top-20 -left-20" />
    <div className="purple-blob w-96 h-96 bg-pink-200/10 top-1/3 -right-32" />
    <div className="purple-blob w-64 h-64 bg-primary-300/10 bottom-0 left-1/4" />

    {isLoggedIn && pendingSurveys.length > 0 && (
      <SurveyDeck surveys={pendingSurveys} onRefresh={refreshSurveys} />
    )}
  </>
);

export default HomeOverlays;
