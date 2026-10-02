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
import { FirebaseConnectionModal } from './components/FirebaseConnectionModal';
import { Cloud, CloudOff, Database } from 'lucide-react';

type AppView = 'home' | 'vote' | 'guide' | 'admin';

const MainAppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);

  const { currentSession, currentAdmin, isFirebaseEnabled, isFirebaseConnected } = useVoting();

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Institutional Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Connection Safety Indicator Sub-Banner */}
      <div
        className={`px-4 sm:px-8 py-2 text-xs border-b flex flex-wrap items-center justify-between gap-2 transition-colors ${
          isFirebaseEnabled
            ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
            : 'bg-amber-50 text-amber-950 border-amber-200'
        }`}
      >
        <div className="flex items-center gap-2">
          {isFirebaseEnabled ? (
            <>
              <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <Cloud className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                <strong>Mode Database Cloud Aktif (Firebase ON):</strong> Data tersimpan secara online ke Google Cloud Firestore ({isFirebaseConnected ? '🟢 Terhubung Real-Time' : '🟡 Menghubungkan...'}).
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <CloudOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                <strong>Mode Uji Coba Aman (Firebase OFF):</strong> Aplikasi berjalan lokal (Sandbox). Anda bebas mencoba mencoblos, simulasi suara, atau mereset tanpa memengaruhi database cloud.
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowFirebaseModal(true)}
          className={`text-[11px] font-black px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
            isFirebaseEnabled
              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300'
              : 'bg-amber-200/80 hover:bg-amber-300 text-amber-950 border-amber-400'
          }`}
        >
          <Database className="w-3 h-3" />
          <span>{isFirebaseEnabled ? 'Atur Database' : 'Nyalakan / Atur Firebase'}</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

      {/* Firebase Database Connection Modal */}
      {showFirebaseModal && (
        <FirebaseConnectionModal onClose={() => setShowFirebaseModal(false)} />
      )}

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
