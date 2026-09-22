export type EntryType = 'photo' | 'text' | 'audio';

export interface JournalEntry {
  id: string;
  timestamp: number;
  editedTimestamp?: number; // New field for edit history
  type: EntryType;
  imageBase64?: string;
  audioBase64?: string;
  mediaMimeType?: string; // NEW: Stores the specific audio format (e.g., audio/mp4 for iOS)
  note: string; 
  mood?: 'happy' | 'neutral' | 'sad';
  folderId?: string; // Added folder support
}

export interface UserProfile {
  name: string;
  age: string;
  email?: string;
  hasOnboarded: boolean;
}

export interface ThemeConfig {
  bgColor: string;
  accentColor: string;
  isVantaBlack: boolean;
}

export interface Folder {
  id: string;
  name: string;
  icon: string;
}

export interface WeeklyInsight {
  overallMood: string;
  summary: string;
  positivityScore: number;
  suggestedActivities: Array<{
    title: string;
    description: string;
    icon: string;
    type: 'active' | 'relaxing' | 'social';
  }>;
  generatedDate: number;
}

export enum ViewState {
  LOGIN = 'LOGIN', // Added Login State
  ONBOARDING = 'ONBOARDING',
  FEED = 'FEED',
  CAPTURE_MENU = 'CAPTURE_MENU',
  CAPTURE_PHOTO = 'CAPTURE_PHOTO',
  CAPTURE_TEXT = 'CAPTURE_TEXT',
  CAPTURE_AUDIO = 'CAPTURE_AUDIO',
  INSIGHTS = 'INSIGHTS',
  SETTINGS = 'SETTINGS',
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}
