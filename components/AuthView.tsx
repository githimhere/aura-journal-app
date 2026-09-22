import React, { useState, useEffect } from 'react';
import { GlassCard } from './UIComponents';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { SignInWithApple } from '@capacitor-community/apple-sign-in';

interface Props {
  onLogin: () => void;
  isLoading: boolean;
}

export const AuthView: React.FC<Props> = ({ onLogin, isLoading: propIsLoading }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize Google Auth on web
    if (Capacitor.getPlatform() === 'web') {
      GoogleAuth.initialize({
        clientId: '582081031989-fnt9v05btcv7e6fjcnsfi399e6plc1e8.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    }
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await GoogleAuth.signIn();
      console.log('Google User:', user);
      // Create user profile based on Google data
      localStorage.setItem('user_profile', JSON.stringify({
        name: user.givenName || user.name || 'Friend',
        themeConfig: { isVantaBlack: false }
      }));
      onLogin();
    } catch (e) {
      console.error('Google Auth Error:', e);
      alert('Google Login Failed or was canceled.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    try {
      const { response } = await SignInWithApple.authorize({
        clientId: 'com.aurajournal.app',
        redirectURI: 'https://aurajournal.app',
        scopes: 'email name',
      });
      console.log('Apple User:', response);
      localStorage.setItem('user_profile', JSON.stringify({
        name: response.givenName || 'Friend',
        themeConfig: { isVantaBlack: false }
      }));
      onLogin();
    } catch (e) {
      console.error('Apple Auth Error:', e);
      alert('Apple Login Failed or was canceled.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-neu-base dark:bg-gray-900 animate-fade-in relative z-10 w-full min-h-[100dvh]">
      
      <GlassCard className="w-full max-w-md p-8 space-y-8 text-center bg-white/80 dark:bg-black/40">
        <div className="space-y-2">
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl mx-auto mb-6 shadow-xl flex items-center justify-center text-4xl animate-bounce-slight">
            ✨
          </div>
          <h1 className="text-4xl font-black text-gray-800 dark:text-white tracking-tight">
            Aura
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
            Lock in your lore. Track your vibes.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-4 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
          >
             {/* Google G Icon */}
             {isLoading ? (
               <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
             ) : (
               <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
               </svg>
             )}
             {isLoading ? 'Connecting...' : 'Continue with Google'}
          </button>

          {Capacitor.getPlatform() !== 'android' && (
            <button 
             onClick={handleAppleLogin}
             disabled={isLoading}
             className="w-full py-4 rounded-xl bg-white text-gray-700 border border-gray-200 font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all active:scale-95 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 disabled:opacity-70 disabled:pointer-events-none"
          >
             {isLoading ? (
                 <svg className="animate-spin h-5 w-5 text-white dark:text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
               ) : (
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-.93 3.69-.93.95 0 1.95.43 2.5 1.05-1.77.85-2.14 3.18-.89 4.6 1.25 1.33 1.94 1.65 1.94 1.65-.4.9-1.33 2.87-2.32 5.86zM12.91 5.26C12.91 3.5 13.91 2 15.61 2c.21 1.6-1 3.35-2.7 3.26z"/></svg>
               )}
               {isLoading ? 'Connecting...' : 'Continue with Apple'}
            </button>
          )}

          <button 
             onClick={onLogin}
             disabled={isLoading}
             className="w-full py-4 rounded-xl bg-[#1877F2] text-white font-bold flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
          >
             {isLoading ? (
               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
             ) : (
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
             )}
             {isLoading ? 'Connecting...' : 'Continue with Facebook'}
          </button>

          <button 
             onClick={onLogin}
             disabled={isLoading}
             className="w-full py-4 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white font-bold flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
          >
             {isLoading ? (
               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
             ) : (
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
             )}
             {isLoading ? 'Connecting...' : 'Continue with Instagram'}
          </button>

          <button 
             onClick={onLogin}
             disabled={isLoading}
             className="w-full py-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
          >
             {isLoading ? (
               <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
             ) : (
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
             )}
             {isLoading ? 'Connecting...' : 'Continue with Email'}
          </button>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-white/10">
          <button 
            onClick={onLogin}
            disabled={isLoading}
            className="w-full py-3 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 font-medium transition-all text-sm mb-4"
          >
            Continue without login
          </button>

          <p className="text-xs text-gray-400">
            By continuing, you agree to our Terms & Vibes Policy.
          </p>
        </div>
      </GlassCard>
    </div>
  );
};
