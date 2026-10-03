import React, { useState } from 'react';
import { VotingProvider, useVoting } from './context/VotingContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PublicHome } from './components/PublicHome';
import { VoterLogin } from './components/VoterLogin';
import { VotingChamber } from './components/VotingChamber';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { GuideModal } from './components/GuideModal';

type AppView = 'home' | 'vote' | 'guide' | 'admin';

const MainAppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const { currentSession, currentAdmin } = useVoting();

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900 font-sans selection:bg-blue-600 selection:text-white print:bg-white print:min-h-0 print:p-0">
      {/* Institutional Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 print:p-0 print:m-0 print:max-w-none">
        {/* VIEW: HOME */}
        {currentView === 'home' && (
          <PublicHome
            onGoToVote={() => setCurrentView('vote')}
            onOpenGuide={() => setIsGuideOpen(true)}
            onGoToAdmin={() => setCurrentView('admin')}
          />
        )}

        {/* VIEW: VOTE (STUDENT VOTING CHAMBER OR LOGIN) */}
        {currentView === 'vote' && (
          <div>
            {currentSession ? (
              <VotingChamber onFinishVoting={() => setCurrentView('home')} />
            ) : (
              <VoterLogin
                onSuccessLogin={() => setCurrentView('vote')}
                onOpenGuide={() => setIsGuideOpen(true)}
              />
            )}
          </div>
        )}

        {/* VIEW: ADMIN (PANEL PANITIA / OPERATOR TPS) */}
        {currentView === 'admin' && (
          <div>
            {currentAdmin ? (
              <AdminDashboard />
            ) : (
              <AdminLogin onSuccess={() => setCurrentView('admin')} />
            )}
          </div>
        )}
      </main>

      {/* Guide & Rules Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onGoToVote={() => {
          setIsGuideOpen(false);
          setCurrentView('vote');
        }}
      />

      {/* Footer */}
      <Footer
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenAdmin={() => setCurrentView('admin')}
      />
    </div>
  );
};

export default function App() {
  return (
    <VotingProvider>
      <MainAppContent />
    </VotingProvider>
  );
}
