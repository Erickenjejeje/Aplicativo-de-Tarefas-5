import { useState, useEffect } from 'react';
import { ScreenRoadmap } from './components/ScreenRoadmap';
import { ScreenHome } from './components/ScreenHome';
import { ScreenAI } from './components/ScreenAI';
import { ScreenProfile } from './components/ScreenProfile';
import { ScreenFocus } from './components/ScreenFocus';
import { ScreenNotifications } from './components/ScreenNotifications';
import { PhoneFrame } from './components/PhoneFrame';
import { AuthUI } from './components/AuthUI';
import { useProfile } from './hooks/useProfile';
import { useReminderScheduler } from './hooks/useReminderScheduler';

function NamePrompt() {
  const { updateProfile } = useProfile();
  const [nameInput, setNameInput] = useState('');

  const handleSave = () => {
    if (nameInput.trim()) {
      updateProfile({ name: nameInput.trim() });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
       <div className="w-full text-left max-w-[400px] bg-white rounded-[32px] p-8 shadow-2xl relative">
          <h2 className="text-[#101010] text-[28px] font-bold leading-tight mb-2">Bem-vindo(a)! 🎉</h2>
          <p className="text-gray-500 font-medium text-[15px] leading-relaxed mb-8">
            Para personalizar sua experiência, como gostaria de ser chamado?
          </p>
          <div className="flex flex-col gap-4">
             <input 
               type="text" 
               value={nameInput}
               onChange={(e) => setNameInput(e.target.value)}
               autoFocus
               placeholder="Digite seu nome..."
               className="w-full bg-[#F4F5F9] border border-transparent shadow-sm rounded-2xl px-5 py-4 text-[16px] font-bold text-[#151515] outline-none focus:border-[#5284FF] focus:bg-white transition"
             />
             <button 
               onClick={handleSave}
               disabled={!nameInput.trim()}
               className="w-full bg-[#101010] text-white px-8 py-4 rounded-2xl text-[15px] font-bold shadow-lg hover:bg-black transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
             >
               Começar a usar
             </button>
          </div>
       </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'home' | 'ai' | 'profile' | 'focus' | 'notifications'>('home');
  const { user, profile, isLoadingProfile } = useProfile();
  const [showInitialAuth, setShowInitialAuth] = useState(false);

  // Initialize reminder scheduler
  useReminderScheduler();

  useEffect(() => {
    // Only show once per session or initialization if user is not loaded
    const hasSeenAuth = sessionStorage.getItem('@app_has_seen_auth');
    if (!user && !hasSeenAuth) {
      const timer = setTimeout(() => {
        setShowInitialAuth(true);
      }, 500); // slight delay to wait for initial auth check
      return () => clearTimeout(timer);
    } else if (user) {
      setShowInitialAuth(false);
      sessionStorage.setItem('@app_has_seen_auth', 'true');
    }
  }, [user]);

  const handleCloseAuth = () => {
    setShowInitialAuth(false);
    sessionStorage.setItem('@app_has_seen_auth', 'true');
  };

  return (
    <>
      {/* Desktop view: 3 phones parallel like the Dribbble shot */}
      <div className="hidden lg:flex flex-row items-center justify-center gap-10 w-full min-h-screen p-8 bg-[#E3E5EB] overflow-x-auto">
        <div className="transform translate-y-6 shrink-0 transition-transform duration-500 hover:translate-y-4">
          <PhoneFrame>
             <ScreenRoadmap onBack={() => setActiveTab('home')} onNavigate={setActiveTab} />
          </PhoneFrame>
        </div>
        <div className="transform -translate-y-4 shrink-0 transition-transform duration-500 hover:-translate-y-6">
          <PhoneFrame>
             {activeTab === 'profile' ? (
                <ScreenProfile onBack={() => setActiveTab('home')} />
             ) : activeTab === 'focus' ? (
                <ScreenFocus onNavigate={setActiveTab} />
             ) : activeTab === 'notifications' ? (
                <ScreenNotifications onBack={() => setActiveTab('home')} onNavigate={setActiveTab} />
             ) : (
                <ScreenHome onNavigate={setActiveTab} />
             )}
          </PhoneFrame>
        </div>
        <div className="transform translate-y-14 shrink-0 transition-transform duration-500 hover:translate-y-10">
          <PhoneFrame>
             <ScreenAI onBack={() => setActiveTab('home')} />
          </PhoneFrame>
        </div>
      </div>

      {/* Mobile view: single interactive phone layout */}
      <div className="lg:hidden w-full h-[100dvh] bg-black flex items-center justify-center">
         <div className="w-full h-full max-w-[480px] bg-white relative overflow-hidden shadow-2xl">
            {activeTab === 'roadmap' && <ScreenRoadmap onBack={() => setActiveTab('home')} onNavigate={setActiveTab} />}
            {activeTab === 'home' && <ScreenHome onNavigate={setActiveTab} />}
            {activeTab === 'focus' && <ScreenFocus onNavigate={setActiveTab} />}
            {activeTab === 'ai' && <ScreenAI onBack={() => setActiveTab('home')} />}
            {activeTab === 'profile' && <ScreenProfile onBack={() => setActiveTab('home')} />}
            {activeTab === 'notifications' && <ScreenNotifications onBack={() => setActiveTab('home')} onNavigate={setActiveTab} />}
         </div>
      </div>

      {showInitialAuth && (
        <div className="fixed inset-0 z-[100] bg-white animate-in slide-in-from-bottom-[100%] duration-300">
           <AuthUI onClose={handleCloseAuth} isModal={true} />
        </div>
      )}

      {!isLoadingProfile && user && profile.name === 'anônimo' && <NamePrompt />}
    </>
  );
}
