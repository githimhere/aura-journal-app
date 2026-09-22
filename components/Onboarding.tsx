import React, { useState } from 'react';
import { UserProfile } from '../types';
import { NeuButton, NeuInput, GlassCard } from './UIComponents';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  const handleSubmit = () => {
    if (name.trim() && age.trim()) {
      onComplete({
        name: name.trim(),
        age: age.trim(),
        hasOnboarded: true
      });
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 animate-fade-in relative z-50">
      <GlassCard className="w-full max-w-md p-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            Aura Journal
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Your daily vibe check & AI companion.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600 dark:text-gray-300 ml-1">
              What should we call you?
            </label>
            <NeuInput 
              placeholder="Your Name or Nickname" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600 dark:text-gray-300 ml-1">
              How old are you?
            </label>
            <NeuInput 
              type="number" 
              placeholder="Age" 
              value={age} 
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
        </div>

        <NeuButton 
          onClick={handleSubmit} 
          disabled={!name || !age}
          variant="primary" 
          className="w-full py-4 text-lg rounded-2xl"
        >
          Let's Start 🚀
        </NeuButton>
      </GlassCard>
    </div>
  );
};
