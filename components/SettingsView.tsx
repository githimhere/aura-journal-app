import React from 'react';
import { UserProfile, ThemeConfig } from '../types';
import { NeuInput, GlassCard, NeuSwitch } from './UIComponents';
import { Capacitor } from '@capacitor/core';

interface Props {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  themeConfig: ThemeConfig;
  onUpdateTheme: (t: ThemeConfig) => void;
  onBack: () => void;
}

export const SettingsView: React.FC<Props> = ({ 
  profile, onUpdateProfile, 
  themeConfig, onUpdateTheme,
  onBack 
}) => {
  
  // --- Profile Handlers ---
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateProfile({ ...profile, name: e.target.value });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateProfile({ ...profile, email: e.target.value });
  };

  // --- Theme Handlers ---
  const handleColorChange = (key: keyof ThemeConfig, value: string) => {
    onUpdateTheme({ ...themeConfig, [key]: value });
  };

  const toggleVanta = (checked: boolean) => {
    onUpdateTheme({ ...themeConfig, isVantaBlack: checked });
  };

  // --- Cloud Sync Handler ---
  const handleSync = (platform: 'apple' | 'google') => {
    alert(`Syncing with ${platform === 'apple' ? 'iCloud' : 'Google Drive'}... \n(This is a demo, but your vibes are safe locally!)`);
  };

  return (
    <div className="h-full overflow-y-auto p-6 pb-32 animate-fade-in space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-4 pt-2">
        <button onClick={onBack} className="p-2 rounded-full bg-white/20 backdrop-blur-md shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-800 dark:text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 className="text-2xl font-black text-gray-800 dark:text-white">Control Center ⚙️</h2>
      </div>

      {/* 1. Profile Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-gray-600 dark:text-gray-300 px-1">Identity</h3>
        <GlassCard className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Display Name</label>
            <NeuInput value={profile.name} onChange={handleNameChange} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Email (Optional)</label>
            <NeuInput value={profile.email || ''} onChange={handleEmailChange} placeholder="you@example.com" type="email" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Age (Locked)</label>
            <NeuInput value={profile.age} disabled className="opacity-70" />
          </div>
        </GlassCard>
      </section>

      {/* 2. Appearance / Theme */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-gray-600 dark:text-gray-300 px-1">Drip Check 🎨</h3>
        <GlassCard className="p-6 space-y-6">
          
          {/* Vanta Black Toggle */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
            <div>
              <span className="block font-bold text-gray-800 dark:text-white">Vanta Black Mode</span>
              <span className="text-xs text-gray-500">Pitch black for AMOLED screens</span>
            </div>
            <NeuSwitch checked={themeConfig.isVantaBlack} onChange={toggleVanta} />
          </div>

          {/* Custom Colors */}
          {!themeConfig.isVantaBlack && (
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">Background</label>
                <div className="flex items-center gap-2 bg-neu-base dark:bg-gray-800 p-2 rounded-xl shadow-inner">
                  <input 
                    type="color" 
                    value={themeConfig.bgColor} 
                    onChange={(e) => handleColorChange('bgColor', e.target.value)}
                    className="w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono text-gray-600 dark:text-gray-300">{themeConfig.bgColor || 'Default'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">Accent</label>
                <div className="flex items-center gap-2 bg-neu-base dark:bg-gray-800 p-2 rounded-xl shadow-inner">
                  <input 
                    type="color" 
                    value={themeConfig.accentColor} 
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono text-gray-600 dark:text-gray-300">{themeConfig.accentColor || 'Default'}</span>
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      </section>

      {/* 3. Support */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-gray-600 dark:text-gray-300 px-1">Support 💬</h3>
        <GlassCard className="p-6">
           <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
             Have questions, feedback, or need help with Aura? Let us know!
           </p>
           <a 
             href="https://forms.gle/SAfH8FFaRvvdkmuo6"
             target="_blank"
             rel="noopener noreferrer"
             className="flex items-center justify-center gap-3 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all"
           >
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
             </svg>
             Contact Support
           </a>
        </GlassCard>
      </section>

    </div>
  );
};
