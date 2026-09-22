import React, { useState, useEffect } from 'react';
import { ViewState, JournalEntry, WeeklyInsight, UserProfile, EntryType, ThemeConfig, Folder } from './types';
import { Feed } from './components/Feed';
import { CaptureView } from './components/CaptureView';
import { WeeklyInsightView } from './components/WeeklyInsightView';
import { SettingsView } from './components/SettingsView';
import { ThemeToggle } from './components/ThemeToggle';
import { NeuButton, GlassCard, NeuModal } from './components/UIComponents';
import { Onboarding } from './components/Onboarding';
import { AuthView } from './components/AuthView';
import { analyzeWeeklyMood } from './services/geminiService';

function App() {
  const [view, setView] = useState<ViewState>(ViewState.LOGIN); // Default to Login
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [insight, setInsight] = useState<WeeklyInsight | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // UI States
  const [roastMessage, setRoastMessage] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // New State for Features
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    bgColor: '',
    accentColor: '',
    isVantaBlack: false
  });
  const [folders, setFolders] = useState<Folder[]>([]);

  // --- Initialization & Storage ---
  useEffect(() => {
    // Load Theme Mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Load Data
    const savedEntries = localStorage.getItem('journal_entries');
    if (savedEntries) setEntries(JSON.parse(savedEntries));

    const savedInsight = localStorage.getItem('weekly_insight');
    if (savedInsight) setInsight(JSON.parse(savedInsight));

    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));

    // Load Settings & Folders
    const savedThemeConfig = localStorage.getItem('theme_config');
    if (savedThemeConfig) setThemeConfig(JSON.parse(savedThemeConfig));

    const savedFolders = localStorage.getItem('user_folders');
    if (savedFolders) setFolders(JSON.parse(savedFolders));

    // Auth Check
    const isAuthenticated = localStorage.getItem('is_authenticated');
    if (isAuthenticated === 'true') {
      if (savedProfile) {
        setView(ViewState.FEED);
      } else {
        setView(ViewState.ONBOARDING);
      }
    } else {
      setView(ViewState.LOGIN);
    }

  }, []);

  // --- Persistence Helpers ---
  const updateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('user_profile', JSON.stringify(profile));
  };

  const updateThemeConfig = (config: ThemeConfig) => {
    setThemeConfig(config);
    localStorage.setItem('theme_config', JSON.stringify(config));

    // BUG FIX: If user enables Vanta Black, ensure we switch to Dark Mode automatically
    if (config.isVantaBlack && !isDarkMode) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  const updateFolders = (newFolders: Folder[]) => {
    setFolders(newFolders);
    localStorage.setItem('user_folders', JSON.stringify(newFolders));
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const handleLogin = () => {
    setIsAuthLoading(true);
    // Simulate network delay for realistic feel
    setTimeout(() => {
      localStorage.setItem('is_authenticated', 'true');
      setIsAuthLoading(false);
      if (userProfile) {
        setView(ViewState.FEED);
      } else {
        setView(ViewState.ONBOARDING);
      }
    }, 1500);
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    updateProfile(profile);
    setView(ViewState.FEED);
  };

  // Helper to invalidate insight when data changes
  const invalidateInsight = () => {
    setInsight(null);
    localStorage.removeItem('weekly_insight');
  };

  // Updated to accept mediaMimeType for robust audio handling
  const saveEntry = (type: EntryType, content: string | null, note: string, audioBase64?: string, mediaMimeType?: string) => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type,
      imageBase64: content || undefined,
      audioBase64: audioBase64 || undefined,
      mediaMimeType, // NEW: Save the detected mime type
      note,
      mood: 'neutral'
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem('journal_entries', JSON.stringify(updated));
    invalidateInsight(); // Force refresh of analysis
    setView(ViewState.FEED);
  };

  const moveEntryToFolder = (entryId: string, folderId: string | undefined) => {
    const updatedEntries = entries.map(e => {
      if (e.id === entryId) {
        return { ...e, folderId };
      }
      return e;
    });
    setEntries(updatedEntries);
    localStorage.setItem('journal_entries', JSON.stringify(updatedEntries));
  };

  const updateEntry = (updatedEntry: JournalEntry) => {
    const updatedList = entries.map(e => e.id === updatedEntry.id ? updatedEntry : e);
    setEntries(updatedList);
    localStorage.setItem('journal_entries', JSON.stringify(updatedList));
    invalidateInsight(); // Force refresh of analysis
  };

  const deleteEntry = (id: string) => {
    const updatedList = entries.filter(e => e.id !== id);
    setEntries(updatedList);
    localStorage.setItem('journal_entries', JSON.stringify(updatedList));
    invalidateInsight(); // Force refresh of analysis
  };

  const generateInsight = async () => {
    if (entries.length === 0) {
      const messages = [
        "Bestie, the lore is empty. Go touch grass and document it. 🌱",
        "No receipts found. Go snap something iconic right now. 📸",
        "The vibes are nonexistent. We can't analyze the void. 🌑",
        "Main character energy missing. Go yap about your day first. 🗣️",
        "404: Vibes not found. Go live a little and come back. 💅",
        "It's giving... nothing. Add some entries to get roasted (or toasted). 🔥"
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setRoastMessage(randomMsg);
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await analyzeWeeklyMood(entries);
      setInsight(result);
      localStorage.setItem('weekly_insight', JSON.stringify(result));
    } catch (error) {
      console.error(error);
      alert("Failed to generate insight. Try adding more details to your entries.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = userProfile?.name || 'Friend';
    if (hour < 12) return `Good Morning, ${name}! ☀️`;
    if (hour < 18) return `Good Afternoon, ${name}! 🌤️`;
    return `Good Evening, ${name}! 🌙`;
  };

  // --- Dynamic Style Generation ---
  const getDynamicStyles = () => {
    // Light mode always forces default Neumorphism colors
    if (!isDarkMode) return {};

    if (themeConfig.isVantaBlack) {
      return {
        backgroundColor: '#000000',
        color: '#ffffff',
      };
    }
    if (themeConfig.bgColor) {
      return {
        backgroundColor: themeConfig.bgColor,
      };
    }
    return {};
  };

  // --- Render Capture Menu ---
  const renderCaptureMenu = () => (
    <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
        <GlassCard className="p-6 space-y-6 rounded-3xl bg-white/90 dark:bg-gray-900/90">
          <div className="text-center">
            <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">{getGreeting()}</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Ready to lock in the memory?</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <button onClick={() => setView(ViewState.CAPTURE_PHOTO)} className="flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">📸</div>
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Snap</span>
            </button>
            <button onClick={() => setView(ViewState.CAPTURE_TEXT)} className="flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">📝</div>
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Yap</span>
            </button>
            <button onClick={() => setView(ViewState.CAPTURE_AUDIO)} className="flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">🎤</div>
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Rant</span>
            </button>
          </div>
        </GlassCard>
        <div className="flex justify-center">
           <button 
             onClick={() => setView(ViewState.FEED)}
             className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-lg"
           >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
               <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (view) {
      case ViewState.LOGIN:
        return <AuthView onLogin={handleLogin} isLoading={isAuthLoading} />;
      case ViewState.ONBOARDING:
        return <Onboarding onComplete={handleOnboardingComplete} />;
      case ViewState.CAPTURE_PHOTO:
      case ViewState.CAPTURE_TEXT:
      case ViewState.CAPTURE_AUDIO:
        return <CaptureView mode={view} onSave={saveEntry} onCancel={() => setView(ViewState.FEED)} />;
      case ViewState.INSIGHTS:
        return <WeeklyInsightView insight={insight} isLoading={isAnalyzing} onGenerate={generateInsight} />;
      case ViewState.SETTINGS:
        return userProfile ? (
          <SettingsView 
            profile={userProfile} 
            onUpdateProfile={updateProfile}
            themeConfig={themeConfig}
            onUpdateTheme={updateThemeConfig}
            onBack={() => setView(ViewState.FEED)}
          />
        ) : null;
      case ViewState.FEED:
      case ViewState.CAPTURE_MENU:
      default:
        return (
          <Feed 
            entries={entries} 
            folders={folders}
            onUpdateFolders={updateFolders}
            onMoveEntry={moveEntryToFolder}
            onUpdateEntry={updateEntry}
            onDeleteEntry={deleteEntry}
            userName={userProfile?.name || 'Friend'} 
          />
        );
    }
  };

  const isCaptureMode = [ViewState.CAPTURE_PHOTO, ViewState.CAPTURE_TEXT, ViewState.CAPTURE_AUDIO, ViewState.CAPTURE_MENU].includes(view);
  const isSettingsMode = view === ViewState.SETTINGS;
  const isAuthMode = view === ViewState.LOGIN || view === ViewState.ONBOARDING;

  return (
    <div 
      className="relative h-[100dvh] w-full bg-neu-base dark:bg-gray-900 text-gray-800 dark:text-gray-100 overflow-hidden flex flex-col font-sans transition-colors duration-500"
      style={getDynamicStyles()}
    >
      
      {/* --- Liquid Background Elements (Hidden in Vanta Black) --- */}
      {(!themeConfig.isVantaBlack || !isDarkMode) && (
        <>
          <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[50%] bg-gradient-to-br from-indigo-200/40 to-purple-300/40 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full blur-3xl animate-blob pointer-events-none z-0"></div>
          <div className="fixed bottom-[-10%] right-[-10%] w-[70%] h-[60%] bg-gradient-to-tl from-blue-200/40 to-pink-300/40 dark:from-blue-900/20 dark:to-pink-900/20 rounded-full blur-3xl animate-blob animation-delay-2000 pointer-events-none z-0"></div>
        </>
      )}
      
      {/* --- Top Bar --- */}
      {!isAuthMode && !isSettingsMode && (
        <header className="relative z-10 px-6 pt-6 pb-2 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-2xl font-black tracking-tight drop-shadow-sm" style={{ color: themeConfig.accentColor || undefined }}>
              Aura
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">
              {view === ViewState.FEED ? 'The Lore' : view === ViewState.INSIGHTS ? 'Insights' : 'Create'}
            </p>
          </div>
          <div className="flex gap-3">
            <ThemeToggle isDarkMode={isDarkMode} toggle={toggleTheme} />
            <NeuButton onClick={() => setView(ViewState.SETTINGS)} className="rounded-full w-12 h-12 !p-0 flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </NeuButton>
          </div>
        </header>
      )}

      {/* --- Main Content Area --- */}
      <main className="relative z-10 flex-1 overflow-hidden">
        {renderContent()}
      </main>

      {/* --- Capture Overlay --- */}
      {view === ViewState.CAPTURE_MENU && renderCaptureMenu()}

      {/* --- Roast / Vibe Check Modal --- */}
      <NeuModal 
        isOpen={!!roastMessage} 
        onClose={() => setRoastMessage(null)}
        title="Vibe Check Failed 💀"
      >
        <div className="text-center space-y-4">
          <div className="text-5xl animate-bounce-slight">💅</div>
          <p className="text-gray-700 dark:text-gray-300 font-medium text-lg leading-relaxed">
            {roastMessage}
          </p>
          <NeuButton onClick={() => setRoastMessage(null)} variant="primary" className="w-full">
            Okay, I'll fix it
          </NeuButton>
        </div>
      </NeuModal>

      {/* --- Bottom Navigation (Sticky Glass) --- */}
      {!isAuthMode && !isCaptureMode && !isSettingsMode && (
        <div className="relative z-20 shrink-0 pb-8 pt-2 px-6">
           <nav className="bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl p-2 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] flex justify-around items-center">
              
              <NavButton 
                active={view === ViewState.INSIGHTS} 
                onClick={() => setView(ViewState.INSIGHTS)}
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 00-1.423 1.423z" /></svg>}
                label="Vibes"
                accentColor={themeConfig.accentColor}
              />

              <div className="-mt-12">
                <button 
                  onClick={() => setView(ViewState.CAPTURE_MENU)}
                  className="rounded-full w-16 h-16 p-0 flex items-center justify-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-[0_10px_20px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_20px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform duration-300"
                  style={{ backgroundColor: themeConfig.accentColor || undefined, color: themeConfig.accentColor ? '#fff' : undefined }}
                  aria-label="Add Entry"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                   </svg>
                </button>
              </div>

              <NavButton 
                active={view === ViewState.FEED} 
                onClick={() => setView(ViewState.FEED)}
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>}
                label="Lore"
                accentColor={themeConfig.accentColor}
              />

           </nav>
        </div>
      )}

      {/* Footer Signature - Global Fixed */}
      <div className="fixed bottom-1 left-0 right-0 w-full text-center pointer-events-none z-50">
        <p className="font-cursive text-gray-400/50 dark:text-gray-600/50 text-[10px]">
          Made with love and care by Vish
        </p>
      </div>

    </div>
  );
}

const NavButton = ({ active, onClick, icon, label, accentColor }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, accentColor?: string }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 transition-colors duration-300 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
    style={active && accentColor ? { color: accentColor } : {}}
  >
    {icon}
    <span className="text-[10px] font-bold">{label}</span>
  </button>
)

export default App;
