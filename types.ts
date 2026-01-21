
export enum SwimmingLevel {
  BEGINNER = 'Beginner',
  COMPETITIVE = 'Competitive',
  ELITE = 'Elite'
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Prefer not to say'
}

export interface UserProfile {
  name: string;
  email: string;
  password?: string;
  age: number;
  gender: Gender;
  swimmingLevel: SwimmingLevel;
  isOnboarded: boolean;
  weight: number; // in kg
  height: number; // in cm
  targetWeight?: number; // Added for weight loss goals
  profilePicture?: string; // Base64 string for the avatar
}

export interface DrylandExercise {
  name: string;
  sets: string;
  reps: string;
  description: string;
  benefit: string;
  focusArea: string; // e.g., "Core", "Shoulders", "Lats"
  restTime: number; // in seconds
  steps: string[]; // Detailed instructions
  videoUrl?: string; // Optional YouTube or reference link
}

export interface SwimSession {
  id: string;
  date: string;
  stroke: string;
  distance: number; // in meters
  time: number; // in seconds
  feeling: 'Energized' | 'Good' | 'Tired' | 'Exhausted';
  notes: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type AppState = {
  profile: UserProfile;
  sessions: SwimSession[];
  chatHistory: ChatMessage[];
};
