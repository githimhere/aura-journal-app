import React from 'react';
import { WeeklyInsight } from '../types';
import { GlassCard, NeuButton } from './UIComponents';

interface Props {
  insight: WeeklyInsight | null;
  isLoading: boolean;
  onGenerate: () => void;
}

export const WeeklyInsightView: React.FC<Props> = ({ insight, isLoading, onGenerate }) => {
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center space-y-8 animate-fade-in">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 bg-purple-400 rounded-full opacity-50 animate-blob filter blur-xl"></div>
          <div className="absolute inset-0 bg-blue-400 rounded-full opacity-50 animate-blob animation-delay-2000 filter blur-xl"></div>
          <div className="absolute inset-0 bg-pink-400 rounded-full opacity-50 animate-blob animation-delay-4000 filter blur-xl"></div>
          <div className="relative bg-white/20 dark:bg-black/20 backdrop-blur-lg w-full h-full rounded-full flex items-center justify-center border border-white/30">
            <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Analyzing your week...</h2>
        <p className="text-gray-600 dark:text-gray-300">Connecting patterns in your photos and notes to find the best recommendations for you.</p>
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center space-y-6 animate-fade-in">
         <div className="w-40 h-40 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl mb-4 relative overflow-hidden">
             <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
             <span className="text-6xl">✨</span>
         </div>
         
         <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Weekly Aura Check</h2>
         <p className="text-gray-600 dark:text-gray-300 max-w-sm">
           Ready to see how your week went? Our AI will analyze your photos and notes to suggest activities that match your vibe.
         </p>
         
         <NeuButton onClick={onGenerate} variant="primary" className="w-full max-w-xs py-4 text-lg">
           Analyze My Week
         </NeuButton>
      </div>
    );
  }

  const moodColors = insight.positivityScore > 70 
    ? 'from-yellow-200 to-orange-100 dark:from-yellow-900 dark:to-orange-900' 
    : insight.positivityScore > 40 
      ? 'from-blue-200 to-cyan-100 dark:from-blue-900 dark:to-cyan-900'
      : 'from-indigo-200 to-purple-100 dark:from-indigo-900 dark:to-purple-900';

  return (
    <div className="pb-48 pt-4 px-4 space-y-6 animate-fade-in overflow-y-auto h-full">
      
      {/* Top Header with Regenerate Button */}
      <div className="flex justify-between items-center mb-2 px-1">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Latest Vibe</h3>
        <button 
          onClick={onGenerate}
          className="text-xs font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Regenerate
        </button>
      </div>

      {/* Summary Card */}
      <GlassCard className={`p-6 bg-gradient-to-br ${moodColors}`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{insight.overallMood}</h2>
            <p className="text-sm font-medium opacity-60 text-gray-900 dark:text-gray-200">
               {new Date(insight.generatedDate).toLocaleDateString()}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-white/40 dark:bg-black/20 flex items-center justify-center font-bold text-xl text-gray-800 dark:text-white border border-white/30">
            {insight.positivityScore}
          </div>
        </div>
        <p className="text-gray-700 dark:text-gray-100 leading-relaxed">
          {insight.summary}
        </p>
      </GlassCard>

      <h3 className="text-xl font-bold text-gray-800 dark:text-white px-2">Recommended for You</h3>

      {/* Suggestions */}
      <div className="space-y-4">
        {insight.suggestedActivities.map((activity, idx) => (
          <GlassCard key={idx} className="p-5 flex items-start gap-4 group hover:bg-white/40 transition-colors">
            <div className="text-4xl bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl shadow-inner">
              {activity.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-lg font-bold text-gray-800 dark:text-white">{activity.title}</h4>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold border ${
                  activity.type === 'active' ? 'border-orange-400 text-orange-500' :
                  activity.type === 'relaxing' ? 'border-teal-400 text-teal-500' :
                  'border-purple-400 text-purple-500'
                }`}>
                  {activity.type}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {activity.description}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Extra bottom padding handled by container pb-48 */}
    </div>
  );
};
