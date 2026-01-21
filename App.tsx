
import React, { useState, useEffect } from 'react';
import { UserProfile, SwimSession, ChatMessage } from './types';
import Onboarding from './views/Onboarding';
import Home from './views/Home';
import SwimLog from './views/SwimLog';
import Progress from './views/Progress';
import AiCoach from './views/AiCoach';
import AiNutrition from './views/AiNutrition';
import AiDrylands from './views/AiDrylands';
import Profile from './views/Profile';
import { 
  HomeIcon, 
  ClipboardDocumentListIcon, 
  ChartBarIcon, 
  UserCircleIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  BeakerIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<SwimSession[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastSaved, setLastSaved] = useState<number>(Date.now());
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('swimflow_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.sessions) setSessions(parsed.sessions || []);
        if (parsed.chatHistory) setChatHistory(parsed.chatHistory || []);
        if (parsed.lastSaved) setLastSaved(parsed.lastSaved);
        if (parsed.activeTab) setActiveTab(parsed.activeTab);
      } catch (e) {
        console.error("Critical: Storage read error", e);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized && profile) {
      try {
        const dataToSave = JSON.stringify({
          profile,
          sessions,
          chatHistory,
          activeTab,
          lastSaved: Date.now()
        });
        localStorage.setItem('swimflow_data', dataToSave);
        setLastSaved(Date.now());
        
        setShowSaveIndicator(true);
        const timer = setTimeout(() => setShowSaveIndicator(false), 2000);
        return () => clearTimeout(timer);
      } catch (e) {
        console.error("Device storage failed:", e);
      }
    }
  }, [profile, sessions, chatHistory, activeTab, isInitialized]);

  const updateProfile = (p: UserProfile) => setProfile(p);
  const addSession = (s: SwimSession) => setSessions(prev => [s, ...prev]);
  const updateChat = (newHistory: ChatMessage[]) => {
    setChatHistory(newHistory.slice(-50));
  };
  
  const handleImport = (data: any) => {
    if (data.profile) setProfile(data.profile);
    if (data.sessions) setSessions(data.sessions);
    if (data.chatHistory) setChatHistory(data.chatHistory);
    if (data.activeTab) setActiveTab(data.activeTab);
  };

  if (!isInitialized) return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!profile || !profile.isOnboarded) {
    return <Onboarding onComplete={updateProfile} />;
  }

  const renderContent = () => {
    const content = (() => {
      switch (activeTab) {
        case 'home': return <Home profile={profile} sessions={sessions} onNavigate={setActiveTab} />;
        case 'log': return <SwimLog sessions={sessions} onAdd={addSession} profile={profile} />;
        case 'progress': return <Progress sessions={sessions} profile={profile} />;
        case 'coach': return (
          <div className="max-w-4xl mx-auto">
            <button onClick={() => setActiveTab('home')} className="mb-4 flex items-center text-sky-600 font-bold text-sm transition-transform active:scale-95 md:hidden">
              <ChevronLeftIcon className="h-4 w-4 mr-1" /> Coaching Hub
            </button>
            <AiCoach profile={profile} sessions={sessions} chatHistory={chatHistory} onUpdateChat={updateChat} />
          </div>
        );
        case 'nutrition': return (
          <div className="max-w-4xl mx-auto">
            <button onClick={() => setActiveTab('home')} className="mb-4 flex items-center text-emerald-600 font-bold text-sm transition-transform active:scale-95 md:hidden">
              <ChevronLeftIcon className="h-4 w-4 mr-1" /> Coaching Hub
            </button>
            <AiNutrition profile={profile} />
          </div>
        );
        case 'drylands': return (
          <div className="max-w-4xl mx-auto">
            <button onClick={() => setActiveTab('home')} className="mb-4 flex items-center text-indigo-600 font-bold text-sm transition-transform active:scale-95 md:hidden">
              <ChevronLeftIcon className="h-4 w-4 mr-1" /> Coaching Hub
            </button>
            <AiDrylands profile={profile} />
          </div>
        );
        case 'profile': return (
          <div className="max-w-2xl mx-auto">
            <Profile 
              profile={profile} 
              sessions={sessions} 
              chatHistory={chatHistory}
              lastSaved={lastSaved}
              onUpdate={updateProfile} 
              onImport={handleImport}
            />
          </div>
        );
        default: return <Home profile={profile} sessions={sessions} onNavigate={setActiveTab} />;
      }
    })();

    return <div key={activeTab} className="page-transition w-full">{content}</div>;
  };

  const navItems = [
    { id: 'home', icon: HomeIcon, label: 'Dashboard' },
    { id: 'log', icon: ClipboardDocumentListIcon, label: 'Logs' },
    { id: 'progress', icon: ChartBarIcon, label: 'Stats' },
    { id: 'coach', icon: ChatBubbleLeftRightIcon, label: 'Coach' },
    { id: 'profile', icon: UserCircleIcon, label: 'Profile' },
  ] as const;

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col md:flex-row relative overflow-hidden">
      {/* Dynamic Save Indicator */}
      {showSaveIndicator && (
        <div className="fixed top-4 right-4 md:right-8 z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-emerald-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-xl border border-white/20">
            <CheckCircleIcon className="h-3 w-3" />
            Saved
          </div>
        </div>
      )}

      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex flex-col w-64 lg:w-72 bg-white border-r border-sky-100 p-6 z-50 overflow-y-auto">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-100">
            <span className="text-xl">🏊‍♂️</span>
          </div>
          <span className="font-black text-xl text-slate-800 tracking-tight">SwimFlow</span>
        </div>

        <div className="space-y-2 flex-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-4">Main Menu</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all text-sm ${
                activeTab === item.id 
                  ? 'bg-sky-50 text-sky-600 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'stroke-[2.5]' : ''}`} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-4">Coaching Hub</p>
          <button onClick={() => setActiveTab('nutrition')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all text-sm ${activeTab === 'nutrition' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-slate-50'}`}>
            <BeakerIcon className="h-5 w-5" />
            Fueling Plan
          </button>
          <button onClick={() => setActiveTab('drylands')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all text-sm ${activeTab === 'drylands' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
            <SparklesIcon className="h-5 w-5" />
            Dryland Routine
          </button>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-50">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-sky-100 border-2 border-white shadow-sm">
              {profile.profilePicture ? (
                <img src={profile.profilePicture} className="w-full h-full object-cover" alt="User" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-sky-600">{profile.name.charAt(0)}</div>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-bold text-slate-800 text-sm truncate">{profile.name}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{profile.swimmingLevel} Athlete</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto pt-[calc(env(safe-area-inset-top)+1rem)] md:pt-8 px-4 md:px-8 lg:px-12 scroll-smooth">
        <div className="max-w-5xl mx-auto pb-32 md:pb-12">
          {renderContent()}

          {/* Desktop specific Coach Hub (Visible only on Home tab on tablet/desktop) */}
          {activeTab === 'home' && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6 px-1">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Coaching Hub</h2>
                  <p className="text-slate-500 text-sm">Personalized guidance by Coach Blue</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <button onClick={() => setActiveTab('coach')} className="group bg-white p-6 rounded-[32px] border border-sky-100 flex items-center gap-4 text-left shadow-sm hover:shadow-md hover:border-sky-300 active:scale-[0.98] transition-all">
                  <div className="w-14 h-14 bg-sky-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-sky-100 transition-transform group-hover:scale-110">💬</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">Coach Blue Chat</h3>
                    <p className="text-xs text-slate-400">Technique & strategy tips</p>
                  </div>
                </button>
                <button onClick={() => setActiveTab('nutrition')} className="group bg-white p-6 rounded-[32px] border border-emerald-100 flex items-center gap-4 text-left shadow-sm hover:shadow-md hover:border-emerald-300 active:scale-[0.98] transition-all">
                  <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-emerald-100 transition-transform group-hover:scale-110">🥗</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">Athlete Fueling</h3>
                    <p className="text-xs text-slate-400">Meal plans & hydration</p>
                  </div>
                </button>
                <button onClick={() => setActiveTab('drylands')} className="group bg-white p-6 rounded-[32px] border border-indigo-100 flex items-center gap-4 text-left shadow-sm hover:shadow-md hover:border-indigo-300 active:scale-[0.98] transition-all">
                  <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-100 transition-transform group-hover:scale-110">🏋️</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">Dryland Routine</h3>
                    <p className="text-xs text-slate-400">Strength & mobility</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-sky-100 z-[60] shadow-[0_-10px_40px_rgba(0,0,0,0.02)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full transition-all active:scale-90 ${
                activeTab === item.id ? 'text-sky-600' : 'text-slate-400'
              }`}
            >
              <item.icon className={`h-6 w-6 transition-transform ${activeTab === item.id ? 'scale-110 stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] mt-1 font-bold tracking-tight ${activeTab === item.id ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default App;
