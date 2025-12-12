import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { Song, PlayMode, SoundQuality, Playlist } from '../types';
import { useToast } from './ToastContext';
import { useUser } from './UserContext';

interface SongStats { [id: string]: { plays: number; downloads: number; } }
interface ConfirmDialogState { isOpen: boolean; title: string; message: string; confirmText?: string; cancelText?: string; isDangerous?: boolean; onConfirm: () => void; }
interface ContextMenuState { isOpen: boolean; x: number; y: number; target: Song | null; }

interface PlayerContextType {
  currentSong: Song | null; isPlaying: boolean; volume: number; isMuted: boolean; progress: number; duration: number; playMode: PlayMode; soundQuality: SoundQuality; playbackRate: number;
  queue: Song[]; likedSongs: string[]; playHistory: Song[]; generatedSongs: Song[]; uploadedSongs: Song[]; userPlaylists: Playlist[];
  isUploadModalOpen: boolean; downloadSongTarget: Song | null; isCreatePlaylistModalOpen: boolean; editPlaylistTarget: Playlist | null; addToPlaylistTarget: Song | null; isShareModalOpen: boolean; shareTarget: Song | null; closeShareModal: () => void;
  mobileMenuOpen: boolean; setMobileMenuOpen: (isOpen: boolean) => void; searchHistory: string[]; addSearchHistory: (term: string) => void; clearSearchHistory: () => void; removeSearchHistoryItem: (term: string) => void;
  sleepTimer: number | null; setSleepTimer: (minutes: number | null) => void; 
  confirmDialog: ConfirmDialogState; showConfirm: (title: string, message: string, onConfirm: () => void, options?: any) => void; closeConfirm: () => void;
  contextMenu: ContextMenuState; showContextMenu: (e: React.MouseEvent, song: Song) => void; closeContextMenu: () => void;
  playSong: (song: Song) => void; playNext: (song: Song) => void; togglePlay: () => void; setVolume: (vol: number) => void; setPlaybackRate: (rate: number) => void; toggleMute: () => void; seek: (time: number) => void;
  nextSong: () => void; prevSong: () => void; addToQueue: (song: Song) => void; removeFromQueue: (songId: string) => void; reorderQueue: (newQueue: Song[]) => void; clearQueue: () => void;
  playPlaylist: (songs: Song[], startIndex?: number) => void; togglePlayMode: () => void; setSoundQuality: (quality: SoundQuality) => void;
  toggleLike: (songId: string) => void; isLiked: (songId: string) => boolean; shareSong: (song: Song) => void;
  addGeneratedSong: (song: Song) => void; addUploadedSong: (song: Song) => void; deleteUploadedSong: (songId: string) => void;
  clearHistory: () => void; removeFromHistory: (songId: string) => void; reorderHistory: (newHistory: Song[]) => void;
  setUploadModalOpen: (isOpen: boolean) => void; openDownloadModal: (song: Song) => void; closeDownloadModal: () => void; downloadSong: (song: Song, quality?: SoundQuality) => void; getSongStats: (song: Song) => { playCount: number, downloadCount: number };
  setCreatePlaylistModalOpen: (isOpen: boolean) => void; openEditPlaylistModal: (playlist: Playlist) => void; openAddToPlaylistModal: (song: Song) => void; closeAddToPlaylistModal: () => void;
  createPlaylist: (name: string, description?: string) => void; updatePlaylist: (id: string, name: string, description?: string) => void; deletePlaylist: (id: string) => void; addSongToPlaylist: (playlistId: string, song: Song) => void; removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  resetAllData: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const { currentUser, syncUserData } = useUser();
  
  // Local Settings
  const [volume, setVolumeState] = useState(() => parseFloat(localStorage.getItem('nebula_volume') || '0.5'));
  const [soundQuality, setSoundQualityState] = useState<SoundQuality>(() => (localStorage.getItem('nebula_quality') as SoundQuality) || 'high');
  const [playbackRate, setPlaybackRateState] = useState(() => parseFloat(localStorage.getItem('nebula_rate') || '1.0'));
  const [playMode, setPlayMode] = useState<PlayMode>(() => (localStorage.getItem('nebula_play_mode') as PlayMode) || PlayMode.SEQUENCE);

  // Sync Data
  const [likedSongs, setLikedSongs] = useState<string[]>([]);
  const [playHistory, setPlayHistory] = useState<Song[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  
  // Local Data
  const [queue, setQueue] = useState<Song[]>(() => { try { return JSON.parse(localStorage.getItem('nebula_queue') || '[]'); } catch { return []; } });
  const [currentSong, setCurrentSong] = useState<Song | null>(() => { try { return JSON.parse(localStorage.getItem('nebula_current_song') || 'null'); } catch { return null; } });
  const [uploadedSongs, setUploadedSongs] = useState<Song[]>([]);
  const [generatedSongs, setGeneratedSongs] = useState<Song[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  // UI States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [downloadSongTarget, setDownloadSongTarget] = useState<Song | null>(null);
  const [isCreatePlaylistModalOpen, setCreatePlaylistModalOpen] = useState(false);
  const [editPlaylistTarget, setEditPlaylistTarget] = useState<Playlist | null>(null);
  const [addToPlaylistTarget, setAddToPlaylistTarget] = useState<Song | null>(null);
  const [sleepTimer, setSleepTimerState] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState<Song | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ isOpen: false, x: 0, y: 0, target: null });

  // Refs for audio and state access inside event listeners
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playModeRef = useRef(playMode);
  const queueRef = useRef(queue);
  const currentSongRef = useRef(currentSong);

  // Sync refs
  useEffect(() => { playModeRef.current = playMode; }, [playMode]);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { currentSongRef.current = currentSong; }, [currentSong]);

  // --- INIT DATA ---
  useEffect(() => {
      fetch('/api/songs').then(r => r.json()).then(data => {
          if (Array.isArray(data)) setUploadedSongs(data);
      }).catch(console.warn);
  }, []);

  useEffect(() => {
      if (currentUser) {
          setLikedSongs(currentUser.likedSongs || []);
          setPlayHistory(currentUser.playHistory || []);
          fetch(`/api/playlists?userId=${currentUser.id}`).then(r => r.json()).then(data => {
              if (Array.isArray(data)) setUserPlaylists(data);
          }).catch(console.error);
      } else {
          setLikedSongs([]);
          setPlayHistory([]);
          setUserPlaylists([]);
      }
  }, [currentUser]);

  // --- AUDIO LOGIC ---
  const getNextSong = () => {
      const q = queueRef.current;
      const curr = currentSongRef.current;
      if (!q.length) return null;
      if (!curr) return q[0];
      const idx = q.findIndex(s => s.id === curr.id);
      return q[(idx + 1) % q.length] || q[0];
  };

  const getPrevSong = () => {
      const q = queueRef.current;
      const curr = currentSongRef.current;
      if (!q.length) return null;
      if (!curr) return q[0];
      const idx = q.findIndex(s => s.id === curr.id);
      return q[(idx - 1 + q.length) % q.length] || q[0];
  };

  const safePlay = useCallback(() => { 
      audioRef.current?.play().catch(e => console.error("Playback prevented:", e)); 
  }, []);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.crossOrigin = "anonymous";
    audioRef.current.volume = volume;
    audioRef.current.playbackRate = playbackRate;
    
    const audio = audioRef.current;

    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    
    const handleEnded = () => {
        const mode = playModeRef.current;
        if (mode === PlayMode.LOOP) {
            audio.currentTime = 0;
            safePlay();
        } else {
            const next = getNextSong();
            if (next) {
                setCurrentSong(next);
                setIsPlaying(true);
            } else {
                setIsPlaying(false);
            }
        }
    };

    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => { setIsPlaying(true); });
        navigator.mediaSession.setActionHandler('pause', () => { setIsPlaying(false); });
        navigator.mediaSession.setActionHandler('previoustrack', () => { 
            const prev = getPrevSong();
            if(prev) setCurrentSong(prev); 
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => { 
            const next = getNextSong();
            if(next) setCurrentSong(next); 
        });
    }

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
        audio.pause();
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
    };
  }, []); 

  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = volume;
        localStorage.setItem('nebula_volume', volume.toString());
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.playbackRate = playbackRate;
        localStorage.setItem('nebula_rate', playbackRate.toString());
    }
  }, [playbackRate]);

  useEffect(() => {
      localStorage.setItem('nebula_quality', soundQuality);
  }, [soundQuality]);

  useEffect(() => {
      localStorage.setItem('nebula_play_mode', playMode);
  }, [playMode]);

  useEffect(() => {
      localStorage.setItem('nebula_queue', JSON.stringify(queue));
  }, [queue]);

  useEffect(() => {
      localStorage.setItem('nebula_current_song', JSON.stringify(currentSong));
      if (currentSong && audioRef.current) {
          if (audioRef.current.src !== currentSong.audioUrl) {
              audioRef.current.src = currentSong.audioUrl;
              audioRef.current.load();
              if (isPlaying) safePlay();
              
              if (currentUser) {
                  setPlayHistory(prev => {
                      const newHistory = [currentSong, ...prev.filter(s => s.id !== currentSong.id)].slice(0, 50);
                      syncUserData({ playHistory: newHistory });
                      return newHistory;
                  });
              } else {
                  setPlayHistory(prev => [currentSong, ...prev.filter(s => s.id !== currentSong.id)].slice(0, 50));
              }
              
              document.title = `▶ ${currentSong.title} - ${currentSong.artist}`;
              if ('mediaSession' in navigator) {
                  navigator.mediaSession.metadata = new MediaMetadata({
                      title: currentSong.title,
                      artist: currentSong.artist,
                      album: currentSong.album,
                      artwork: [{ src: currentSong.coverUrl, sizes: '512x512', type: 'image/jpeg' }]
                  });
              }
          }
      }
  }, [currentSong]);

  useEffect(() => {
      if (audioRef.current) {
          if (isPlaying) safePlay();
          else audioRef.current.pause();
      }
      document.title = isPlaying && currentSong ? `▶ ${currentSong.title} - ${currentSong.artist}` : '云上爱音乐';
  }, [isPlaying]);

  // --- ACTIONS ---

  const togglePlay = useCallback(() => {
      if (!currentSongRef.current) return;
      setIsPlaying(p => !p);
  }, []);

  const nextSong = useCallback(() => {
      const next = getNextSong();
      if (next) setCurrentSong(next);
  }, []);

  const prevSong = useCallback(() => {
      const prev = getPrevSong();
      if (prev) setCurrentSong(prev);
  }, []);

  const playSong = useCallback((s: Song) => {
      if (currentSong?.id === s.id) {
          togglePlay();
      } else {
          setCurrentSong(s);
          setIsPlaying(true);
          setQueue(prev => {
              if (prev.some(q => q.id === s.id)) return prev;
              return [s, ...prev];
          });
      }
  }, [currentSong, togglePlay]);

  const playNext = useCallback((s: Song) => {
      setQueue(prev => {
          // If queue empty, just play it
          if (prev.length === 0) return [s];
          
          const filtered = prev.filter(item => item.id !== s.id);
          const currentIdx = currentSong ? filtered.findIndex(item => item.id === currentSong.id) : -1;
          
          if (currentIdx === -1) return [s, ...filtered];
          
          // Insert after current
          const newQ = [...filtered];
          newQ.splice(currentIdx + 1, 0, s);
          return newQ;
      });
      showToast('已添加到下一首播放', 'success');
  }, [currentSong, showToast]);

  const playPlaylist = useCallback((songs: Song[], idx = 0) => {
      setQueue(songs);
      setCurrentSong(songs[idx]);
      setIsPlaying(true);
  }, []);

  const togglePlayMode = useCallback(() => setPlayMode(p => 
      p === PlayMode.SEQUENCE ? PlayMode.LOOP : 
      p === PlayMode.LOOP ? PlayMode.SHUFFLE : 
      PlayMode.SEQUENCE
  ), []);

  const seek = useCallback((t: number) => { if(audioRef.current) audioRef.current.currentTime = t; }, []);
  const toggleMute = useCallback(() => {
      setIsMuted(prev => {
          const next = !prev;
          if (audioRef.current) audioRef.current.muted = next;
          return next;
      });
  }, []);

  const toggleLike = useCallback((id: string) => {
      if (!currentUser) return showToast('请先登录', 'info');
      setLikedSongs(prev => {
          const isLiked = prev.includes(id);
          const newLiked = isLiked ? prev.filter(i => i !== id) : [...prev, id];
          syncUserData({ likedSongs: newLiked });
          showToast(isLiked ? '已取消收藏' : '已收藏', 'success');
          return newLiked;
      });
  }, [currentUser, syncUserData, showToast]);

  const isLiked = useCallback((id: string) => likedSongs.includes(id), [likedSongs]);

  const createPlaylist = useCallback(async (name: string, description: string = '') => {
      if (!currentUser) return showToast('请先登录', 'info');
      const newPl: Playlist = {
          id: `p-${Date.now()}`,
          name, description,
          coverUrl: 'https://picsum.photos/300/300',
          songs: [],
          isUserCreated: true,
          creatorId: currentUser.id,
          createdAt: Date.now()
      };
      setUserPlaylists(prev => [newPl, ...prev]);
      setCreatePlaylistModalOpen(false);
      await fetch('/api/playlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPl)
      });
      showToast('创建成功', 'success');
  }, [currentUser, showToast]);

  const updatePlaylist = useCallback(async (id: string, name: string, description: string) => {
      setUserPlaylists(prev => prev.map(p => p.id === id ? { ...p, name, description } : p));
      setCreatePlaylistModalOpen(false);
      await fetch(`/api/playlists/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description })
      });
      showToast('更新成功', 'success');
  }, [showToast]);

  const deletePlaylist = useCallback(async (id: string) => {
      setUserPlaylists(prev => prev.filter(p => p.id !== id));
      await fetch(`/api/playlists/${id}`, { method: 'DELETE' });
      showToast('删除成功', 'info');
  }, [showToast]);

  const addSongToPlaylist = useCallback(async (pid: string, song: Song) => {
      const pl = userPlaylists.find(p => p.id === pid);
      if (pl && !pl.songs.some(s => s.id === song.id)) {
          const newSongs = [...pl.songs, song];
          const newCover = pl.songs.length === 0 ? song.coverUrl : pl.coverUrl;
          setUserPlaylists(prev => prev.map(p => p.id === pid ? { ...p, songs: newSongs, coverUrl: newCover } : p));
          setAddToPlaylistTarget(null);
          await fetch(`/api/playlists/${pid}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ songs: newSongs, coverUrl: newCover })
          });
          showToast('已添加', 'success');
      }
  }, [userPlaylists, showToast]);

  const removeSongFromPlaylist = useCallback(async (pid: string, sid: string) => {
      const pl = userPlaylists.find(p => p.id === pid);
      if (pl) {
          const newSongs = pl.songs.filter(s => s.id !== sid);
          setUserPlaylists(prev => prev.map(p => p.id === pid ? { ...p, songs: newSongs } : p));
          await fetch(`/api/playlists/${pid}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ songs: newSongs })
          });
          showToast('已移除', 'info');
      }
  }, [userPlaylists, showToast]);

  const downloadSong = useCallback((s: Song, quality?: SoundQuality) => { 
      if ((quality === 'high' || quality === 'lossless') && !currentUser?.isVip) {
          showToast('该音质仅限VIP下载', 'info');
          setDownloadSongTarget(null);
          return;
      }
      window.open(s.audioUrl); 
      showToast(`开始下载 (${quality || '标准'})`, 'success'); 
  }, [currentUser, showToast]);

  const addUploadedSong = useCallback((s: Song) => setUploadedSongs(p => [s, ...p]), []);
  const deleteUploadedSong = useCallback(async (id: string) => { await fetch(`/api/songs/${id}`, {method:'DELETE'}); setUploadedSongs(p => p.filter(s=>s.id!==id)); }, []);
  const resetAllData = () => { localStorage.clear(); window.location.reload(); };
  const getSongStats = () => ({ playCount: 0, downloadCount: 0 });

  // Modal Controls
  const openEditPlaylistModal = useCallback((playlist: Playlist) => { setEditPlaylistTarget(playlist); setCreatePlaylistModalOpen(true); }, []);
  const openAddToPlaylistModal = useCallback((song: Song) => setAddToPlaylistTarget(song), []);
  const closeAddToPlaylistModal = useCallback(() => setAddToPlaylistTarget(null), []);
  const closeShareModal = useCallback(() => setShareModalOpen(false), []);
  const openDownloadModal = useCallback((song: Song) => setDownloadSongTarget(song), []);
  const closeDownloadModal = useCallback(() => setDownloadSongTarget(null), []);
  const showConfirm = useCallback((title: string, message: string, onConfirm: () => void, options: any = {}) => {
      setConfirmDialog({ isOpen: true, title, message, onConfirm, ...options });
  }, []);
  const closeConfirm = useCallback(() => setConfirmDialog(p => ({ ...p, isOpen: false })), []);

  // Context Menu
  const showContextMenu = useCallback((e: React.MouseEvent, song: Song) => {
      e.preventDefault();
      setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, target: song });
  }, []);
  const closeContextMenu = useCallback(() => setContextMenu(p => ({ ...p, isOpen: false })), []);

  return (
    <PlayerContext.Provider value={{
      currentSong, isPlaying, volume, isMuted, progress, duration, playMode, queue, likedSongs, playHistory, generatedSongs, uploadedSongs, userPlaylists, soundQuality, playbackRate,
      isUploadModalOpen, downloadSongTarget, isCreatePlaylistModalOpen, editPlaylistTarget, addToPlaylistTarget, mobileMenuOpen, isShareModalOpen, shareTarget, searchHistory, sleepTimer, confirmDialog, contextMenu,
      setMobileMenuOpen, setUploadModalOpen, setCreatePlaylistModalOpen, openEditPlaylistModal, openAddToPlaylistModal, closeAddToPlaylistModal, closeShareModal, openDownloadModal, closeDownloadModal, showConfirm, closeConfirm, showContextMenu, closeContextMenu,
      playSong, playNext, togglePlay, setVolume: setVolumeState, setPlaybackRate: setPlaybackRateState, toggleMute, seek, nextSong, prevSong, addToQueue: (s)=>setQueue(p=>[...p,s]), removeFromQueue: (id)=>setQueue(p=>p.filter(s=>s.id!==id)), reorderQueue: setQueue, clearQueue: ()=>setQueue([]), playPlaylist, togglePlayMode, setSoundQuality: setSoundQualityState,
      toggleLike, isLiked, shareSong: (s)=> { setShareTarget(s); setShareModalOpen(true); }, addGeneratedSong: (s)=>setGeneratedSongs(p=>[s,...p]), addUploadedSong, deleteUploadedSong,
      clearHistory: ()=>setPlayHistory([]), removeFromHistory: (id)=>setPlayHistory(p=>p.filter(s=>s.id!==id)), reorderHistory: setPlayHistory, downloadSong, getSongStats,
      createPlaylist, updatePlaylist, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist,
      addSearchHistory: (t)=>setSearchHistory(p=>[t,...p]), clearSearchHistory: ()=>setSearchHistory([]), removeSearchHistoryItem: (t)=>setSearchHistory(p=>p.filter(i=>i!==t)),
      setSleepTimer: setSleepTimerState, resetAllData
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within a PlayerProvider');
  return context;
};