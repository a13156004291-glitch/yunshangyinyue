
export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: number; // in seconds
  audioUrl: string;
  lyrics?: string;
  isAiGenerated?: boolean;
  tags?: string[];
  playCount?: number;
  downloadCount?: number;
  quality?: SoundQuality; // Tag for display
  language?: string; // New: Language of the song
  releaseYear?: string; // New: Release Year
  uploaderId?: string;
  createdAt?: number;
}

export interface Playlist {
  id: string;
  name: string;
  coverUrl: string;
  description: string;
  songs: Song[];
  isUserCreated?: boolean; // New flag
  creatorId?: string; // Link to user
  createdAt?: number;
}

export interface Comment {
  id: string;
  username: string;
  avatar: string;
  content: string;
  time: string;
  likes: number;
  isLiked?: boolean;
}

export enum PlayMode {
  SEQUENCE = 'SEQUENCE',
  LOOP = 'LOOP',
  SHUFFLE = 'SHUFFLE'
}

export type SoundQuality = 'standard' | 'high' | 'lossless';

export interface GenerateSongParams {
  mood: string;
  genre: string;
  theme: string;
}

// User System Types
export type UserRole = 'user' | 'musician' | 'admin';
export type ApplicationStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  username: string;
  password?: string; 
  avatar: string;
  role: UserRole;
  isVip: boolean;
  musicianStatus: ApplicationStatus;
  bio?: string;
  followers?: number;
  following?: number;
  followingIds?: string[];
  email?: string; 
  phone?: string;
  // Synced Data
  likedSongs?: string[];
  playHistory?: Song[];
}

export interface DiscountCode {
  id: string;
  code: string;
  type: 'percent' | 'fixed'; // percent (0-100), fixed (amount)
  value: number;
  active: boolean;
}

export interface SystemSettings {
  announcement: string;
  maintenanceMode: boolean;
}
