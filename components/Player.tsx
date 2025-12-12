import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, VolumeX, ListMusic, ChevronUp, Mic2, Trash2, X, Volume1, Download, History, List, Clock, Moon, Heart, ListPlus, Tag, Calendar, Globe, MessageSquare, Send, ThumbsUp, Share2, MessageCircle, MoreHorizontal, GripVertical } from 'lucide-react';
import { PlayMode, SoundQuality, Comment } from '../types';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

interface LyricLine {
    time: number;
    text: string;
}

const parseLyrics = (lrc: string): LyricLine[] => {
    if (!lrc) return [];
    const lines = lrc.split('\n');
    const result: LyricLine[] = [];
    const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
    
    // Check if it's synced lyrics (contains timestamps)
    const hasTimestamps = lines.some(line => timeReg.test(line));

    if (!hasTimestamps) {
        // Return plain text as a single block or multiple lines with -1 time
        return lines.filter(l => l.trim()).map(text => ({ time: -1, text }));
    }
    
    for (const line of lines) {
      const match = timeReg.exec(line);
      if (match) {
        const min = parseInt(match[1]);
        const sec = parseInt(match[2]);
        const ms = parseInt(match[3].padEnd(3, '0').substring(0, 3)); 
        const time = min * 60 + sec + ms / 1000;
        const text = line.replace(timeReg, '').trim();
        if (text) {
          result.push({ time, text });
        }
      }
    }
    return result;
  };

// Mock comments generator
const generateMockComments = (songId: string): Comment[] => {
    const comments: Comment[] = [
        { id: '1', username: '音乐爱好者', avatar: 'https://picsum.photos/seed/u1/50/50', content: '这也太好听了吧！循环亿遍！', time: '2分钟前', likes: 124 },
        { id: '2', username: 'NightRunner', avatar: 'https://picsum.photos/seed/u2/50/50', content: '前奏一响，瞬间入魂。', time: '1小时前', likes: 89 },
        { id: '3', username: 'LoFi Girl', avatar: 'https://picsum.photos/seed/u3/50/50', content: '适合写作业的时候听，很专注。', time: '昨天', likes: 56 },
        { id: '4', username: '赛博朋克2077', avatar: 'https://picsum.photos/seed/u4/50/50', content: '有种穿梭在未来都市的感觉。', time: '3天前', likes: 230 },
        { id: '5', username: 'JazzCat', avatar: 'https://picsum.photos/seed/u5/50/50', content: '编曲太绝了，细节满满。', time: '1周前', likes: 45 },
        { id: '6', username: '云上听众', avatar: 'https://picsum.photos/seed/u6/50/50', content: '宝藏歌曲，发现晚了！', time: '2周前', likes: 12 }
    ];
    // Shuffle slightly based on songId hash equivalent (pseudo-random)
    return comments.sort(() => Math.random() - 0.5);
};

const Player = () => {
  const { 
    currentSong, isPlaying, volume, isMuted, progress, duration, playMode, queue, playHistory, soundQuality, playbackRate,
    playSong, togglePlay, setVolume, setPlaybackRate, toggleMute, seek, nextSong, prevSong, togglePlayMode, removeFromQueue, clearQueue, removeFromHistory, clearHistory, setSoundQuality, downloadSong,
    sleepTimer, setSleepTimer,
    toggleLike, isLiked, openAddToPlaylistModal, shareSong, reorderQueue, reorderHistory
  } = usePlayer();
  const { showToast } = useToast();
  const { currentUser, isAuthenticated, openLogin } = useUser();

  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const [showRateMenu, setShowRateMenu] = useState(false);
  const [queueTab, setQueueTab] = useState<'queue' | 'history'>('queue');
  const [fullScreenTab, setFullScreenTab] = useState<'lyrics' | 'comments'>('lyrics');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  
  // Drag and Drop state
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  // Parse lyrics
  const parsedLyrics = useMemo(() => {
    return currentSong?.lyrics ? parseLyrics(currentSong.lyrics) : [];
  }, [currentSong]);

  // Check if lyrics are synced
  const isSynced = useMemo(() => {
      return parsedLyrics.some(line => line.time >= 0);
  }, [parsedLyrics]);

  // Find active line
  const activeLineIndex = useMemo(() => {
    if (!isSynced) return -1;
    if (!parsedLyrics.length) return -1;
    let index = parsedLyrics.findIndex(line => line.time > progress);
    if (index === -1) return parsedLyrics.length - 1; 
    return Math.max(0, index - 1);
  }, [progress, parsedLyrics, isSynced]);

  // Auto scroll lyrics
  useEffect(() => {
    if (isLyricsOpen && isSynced && activeLineIndex !== -1 && lyricsContainerRef.current && fullScreenTab === 'lyrics') {
        const activeEl = lyricsContainerRef.current.children[activeLineIndex] as HTMLElement;
        if (activeEl) {
            activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  }, [activeLineIndex, isLyricsOpen, isSynced, fullScreenTab]);

  // Load comments when song changes
  useEffect(() => {
      if (currentSong) {
          setComments(generateMockComments(currentSong.id));
          setNewComment('');
      }
  }, [currentSong]);

  const handleClearList = () => {
      if (queueTab === 'queue') {
          clearQueue();
          showToast('播放列表已清空', 'info');
      } else {
          clearHistory();
          showToast('播放历史已清空', 'info');
      }
  }

  const handleRemoveFromList = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (queueTab === 'queue') {
          removeFromQueue(id);
      } else {
          removeFromHistory(id);
      }
  }

  const cycleQuality = () => {
      const order: SoundQuality[] = ['standard', 'high', 'lossless'];
      const idx = order.indexOf(soundQuality);
      const next = order[(idx + 1) % order.length];
      setSoundQuality(next);
  }

  const handlePostComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim()) return;

      if (!isAuthenticated) {
          showToast('请先登录发表评论', 'info');
          openLogin();
          return;
      }
      
      const comment: Comment = {
          id: `c-${Date.now()}`,
          username: currentUser?.username || '音乐人',
          avatar: currentUser?.avatar || 'https://picsum.photos/seed/guest/50/50',
          content: newComment,
          time: '刚刚',
          likes: 0
      };

      setComments(prev => [comment, ...prev]);
      setNewComment('');
      showToast('评论发表成功！', 'success');
  };

  const handleLikeComment = (id: string) => {
      setComments(prev => prev.map(c => {
          if (c.id === id) {
              return { ...c, likes: (c.isLiked ? c.likes - 1 : c.likes + 1), isLiked: !c.isLiked };
          }
          return c;
      }));
  };
  
  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === dropIndex) return;

    const list = queueTab === 'queue' ? [...queue] : [...playHistory];
    
    // Safety check for indices
    if (draggedItemIndex < 0 || draggedItemIndex >= list.length || dropIndex < 0 || dropIndex > list.length) {
        setDraggedItemIndex(null);
        return;
    }

    const itemToMove = list[draggedItemIndex];
    
    // Remove from old position
    list.splice(draggedItemIndex, 1);
    // Insert at new position
    list.splice(dropIndex, 0, itemToMove);

    if (queueTab === 'queue') {
        reorderQueue(list);
    } else {
        reorderHistory(list);
    }
    setDraggedItemIndex(null);
  };


  if (!currentSong) return null;

  const qualityLabels = {
      standard: 'SQ',
      high: 'HQ',
      lossless: 'HR' // Hi-Res
  };

  const listData = queueTab === 'queue' ? queue : playHistory;
  const rateOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <>
      {/* Full Screen Lyrics / Comments Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900 z-50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col overflow-hidden ${isLyricsOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}
      >
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
            <img 
                src={currentSong.coverUrl} 
                alt="bg" 
                className="w-full h-full object-cover blur-[80px] opacity-40 scale-110 animate-pulse-slow"
            />
            <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Navbar */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-2">
            <button 
                onClick={() => setIsLyricsOpen(false)}
                className="text-slate-300 hover:text-white hover:bg-white/10 p-2 rounded-full transition"
            >
                <ChevronUp className="rotate-180" size={32} />
            </button>
            <div className="flex flex-col items-center">
                <h2 className="text-white font-medium text-lg text-center max-w-[200px] truncate">{currentSong.title}</h2>
                <div className="flex items-center gap-2">
                    <p className="text-slate-400 text-sm">{currentSong.artist}</p>
                </div>
            </div>
            <div className="w-12 flex justify-end">
                <button 
                    onClick={() => shareSong(currentSong)}
                    className="text-slate-300 hover:text-white hover:bg-white/10 p-2 rounded-full transition"
                    title="分享歌曲"
                >
                    <Share2 size={24} />
                </button>
            </div> 
        </div>
        
        {/* Info Tags Bar */}
        <div className="relative z-10 flex justify-center gap-3 mt-2 mb-4 px-4 flex-wrap">
            <span className="text-[10px] bg-slate-100/10 backdrop-blur-md text-white px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {qualityLabels[soundQuality]}
            </span>
            {currentSong.language && (
                <span className="text-[10px] bg-slate-100/10 backdrop-blur-md text-slate-300 px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
                    <Globe size={10} /> {currentSong.language}
                </span>
            )}
            {currentSong.releaseYear && (
                 <span className="text-[10px] bg-slate-100/10 backdrop-blur-md text-slate-300 px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
                    <Calendar size={10} /> {currentSong.releaseYear}
                </span>
            )}
            {currentSong.tags?.map((tag, i) => (
                <span key={i} className="text-[10px] bg-slate-100/10 backdrop-blur-md text-slate-300 px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
                    <Tag size={10} /> {tag}
                </span>
            ))}
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative z-10 p-6 md:p-12 gap-8 md:gap-20 items-center justify-center max-w-7xl mx-auto w-full">
            
            {/* Left Side: Vinyl Record Animation */}
            <div className="hidden md:flex flex-1 items-center justify-center w-full max-w-[500px] relative">
                {/* Tone Arm (Needle) */}
                <div 
                    className={`absolute top-[-80px] left-[50%] w-[100px] h-[160px] z-20 origin-[16px_16px] transition-transform duration-700 ease-in-out pointer-events-none hidden lg:block`}
                    style={{ 
                        transform: isPlaying ? 'rotate(25deg)' : 'rotate(0deg)',
                        left: 'calc(50% - 10px)' 
                    }}
                >
                    <div className="w-4 h-4 bg-slate-300 rounded-full shadow-lg absolute top-0 left-0 border-2 border-slate-500"></div>
                    <div className="w-2 h-24 bg-slate-400 absolute top-2 left-1 origin-top rotate-12 rounded-full"></div>
                    <div className="w-3 h-16 bg-slate-300 absolute top-24 left-[-10px] origin-top rotate-[-25deg] rounded-md shadow-md"></div>
                    <div className="w-8 h-12 bg-slate-800 absolute top-[145px] left-[-22px] rounded-sm shadow-xl"></div>
                </div>

                <div className={`relative w-[280px] h-[280px] md:w-[350px] md:h-[350px] lg:w-[400px] lg:h-[400px] flex items-center justify-center`}>
                    {/* Vinyl Disc Container */}
                    <div 
                        className={`w-full h-full rounded-full bg-black p-2 shadow-2xl border-4 border-slate-800/50 flex items-center justify-center ${isPlaying ? 'animate-[spin_20s_linear_infinite]' : 'animate-[spin_20s_linear_infinite] [animation-play-state:paused]'}`}
                        style={{ animationDuration: `${20 / playbackRate}s` }}
                    >
                         {/* Disc Texture */}
                        <div className="absolute inset-0 rounded-full bg-[repeating-radial-gradient(#111_0,#111_2px,#222_3px,#222_4px)] opacity-80"></div>
                        {/* Album Art */}
                        <div className="w-[70%] h-[70%] rounded-full overflow-hidden relative z-10 border-4 border-black">
                            <img src={currentSong.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Right Side: Lyrics / Comments */}
            <div className="flex-1 w-full h-full max-h-[60vh] md:max-h-[70vh] relative flex flex-col">
                 
                 {/* Tabs */}
                 <div className="flex justify-center mb-6">
                     <div className="bg-white/10 p-1 rounded-full flex gap-1">
                        <button 
                            onClick={() => setFullScreenTab('lyrics')}
                            className={`px-6 py-1.5 rounded-full text-sm font-bold transition-all ${fullScreenTab === 'lyrics' ? 'bg-white text-slate-900 shadow' : 'text-slate-300 hover:text-white'}`}
                        >
                            歌词
                        </button>
                        <button 
                            onClick={() => setFullScreenTab('comments')}
                             className={`px-6 py-1.5 rounded-full text-sm font-bold transition-all ${fullScreenTab === 'comments' ? 'bg-white text-slate-900 shadow' : 'text-slate-300 hover:text-white'}`}
                        >
                            评论 <span className="text-[10px] ml-1 opacity-70">{comments.length > 99 ? '99+' : comments.length}</span>
                        </button>
                     </div>
                 </div>

                 <div className="flex-1 relative overflow-hidden rounded-2xl bg-black/10 backdrop-blur-sm border border-white/5">
                    {/* Lyrics View */}
                    <div className={`absolute inset-0 transition-opacity duration-300 ${fullScreenTab === 'lyrics' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                         <div className="absolute inset-0 mask-gradient-vertical">
                            <div 
                                ref={lyricsContainerRef}
                                className="h-full overflow-y-auto no-scrollbar py-[50%] space-y-6 text-center px-4"
                                style={{ scrollBehavior: 'smooth' }}
                            >
                                {parsedLyrics.length > 0 ? (
                                    parsedLyrics.map((line, i) => (
                                        <p 
                                            key={i} 
                                            className={`transition-all duration-300 cursor-pointer ${
                                                isSynced 
                                                    ? (i === activeLineIndex 
                                                        ? 'text-white text-2xl md:text-3xl font-bold scale-105 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' 
                                                        : 'text-slate-400/60 text-lg md:text-xl font-medium hover:text-slate-300')
                                                    : 'text-slate-300 text-lg md:text-xl leading-8' // Unsynced style
                                            }`}
                                            onClick={() => line.time !== -1 && seek(line.time)}
                                        >
                                            {line.text}
                                        </p>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                                        <Mic2 size={48} className="opacity-20" />
                                        <p className="text-xl">暂无歌词</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Comments View */}
                    <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${fullScreenTab === 'comments' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4" ref={commentsContainerRef}>
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3 group">
                                    <img src={comment.avatar} alt="av" className="w-10 h-10 rounded-full border border-white/10" />
                                    <div className="flex-1 pb-4 border-b border-white/5 group-last:border-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-slate-300 font-bold text-sm">{comment.username}</span>
                                            <span className="text-slate-500 text-xs">{comment.time}</span>
                                        </div>
                                        <p className="text-white/80 text-sm leading-relaxed mb-2">{comment.content}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <button 
                                                onClick={() => handleLikeComment(comment.id)}
                                                className={`flex items-center gap-1 text-xs transition ${comment.isLiked ? 'text-red-400' : 'text-slate-500 hover:text-slate-300'}`}
                                            >
                                                <ThumbsUp size={14} fill={comment.isLiked ? 'currentColor' : 'none'}/> 
                                                {comment.likes}
                                            </button>
                                            <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition">
                                                <MessageCircle size={14} />
                                            </button>
                                            <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition ml-auto">
                                                <MoreHorizontal size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Comment Input */}
                        <form onSubmit={handlePostComment} className="p-4 bg-white/5 border-t border-white/10">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder={isAuthenticated ? "发表你的精彩评论..." : "登录后参与评论..."}
                                    className="w-full bg-black/20 border border-white/10 rounded-full py-2.5 pl-4 pr-12 text-sm text-white focus:outline-none focus:bg-black/40 focus:border-emerald-500 transition"
                                />
                                <button 
                                    type="submit"
                                    disabled={!newComment.trim()}
                                    className="absolute right-1 top-1 p-1.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-400 disabled:opacity-50 disabled:bg-slate-700 transition"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </form>
                    </div>
                 </div>
            </div>
        </div>
      </div>

      {/* Queue Drawer */}
      {showQueue && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowQueue(false)}></div>
            <div className="fixed bottom-24 right-4 left-4 md:left-auto w-auto md:w-96 max-h-[60vh] bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl z-50 flex flex-col overflow-hidden animate-slide-up">
                {/* Tabs */}
                <div className="flex items-center border-b border-slate-700">
                    <button 
                        onClick={() => setQueueTab('queue')}
                        className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition hover:bg-white/5 ${queueTab === 'queue' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-400'}`}
                    >
                        <List size={16} /> 播放列表 ({queue.length})
                    </button>
                    <button 
                         onClick={() => setQueueTab('history')}
                        className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition hover:bg-white/5 ${queueTab === 'history' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-400'}`}
                    >
                        <History size={16} /> 历史记录 ({playHistory.length})
                    </button>
                </div>
                
                {/* Header Actions */}
                <div className="p-3 flex justify-between items-center bg-slate-900/50 border-b border-slate-700/50">
                    <span className="text-xs text-slate-400 font-medium">
                        {queueTab === 'queue' ? '当前播放队列 (可拖拽排序)' : '最近播放记录'}
                    </span>
                    <div className="flex gap-2">
                        <button onClick={handleClearList} className="text-slate-400 hover:text-white text-xs px-2 py-1 hover:bg-white/10 rounded transition">清空</button>
                        <button onClick={() => setShowQueue(false)} className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10"><X size={16}/></button>
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto p-2">
                    {listData.length > 0 ? (
                        listData.map((song, index) => {
                            const isActive = currentSong?.id === song.id && queueTab === 'queue'; // Only highlight active in queue tab mostly
                            return (
                                <div 
                                    key={`${song.id}-${index}`} 
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDrop={(e) => handleDrop(e, index)}
                                    className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition hover:bg-white/5 border border-transparent ${isActive ? 'bg-emerald-500/10' : ''} ${draggedItemIndex === index ? 'opacity-50 border-dashed border-slate-500' : ''}`}
                                    onClick={() => playSong(song)}
                                >
                                    <div className="cursor-grab text-slate-600 hover:text-slate-400" onMouseDown={e => e.stopPropagation()}>
                                         <GripVertical size={14} />
                                    </div>
                                    
                                    {isActive && <div className="w-1 h-8 bg-emerald-500 rounded-full flex-shrink-0 animate-pulse"></div>}
                                    
                                    <div className={`flex-1 min-w-0 ${isActive ? 'text-emerald-400' : 'text-slate-200'}`}>
                                        <div className="font-medium text-sm truncate">{song.title}</div>
                                        <div className="text-xs text-slate-500 truncate flex gap-2">
                                            {song.artist}
                                            {song.tags && <span className="text-slate-600">| {song.tags[0]}</span>}
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-600 font-mono group-hover:hidden">{formatTime(song.duration)}</div>
                                    <button 
                                        onClick={(e) => handleRemoveFromList(e, song.id)}
                                        className="hidden group-hover:block text-slate-500 hover:text-red-400 transition p-1"
                                        title="移除"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                             {queueTab === 'queue' ? <ListMusic size={32} className="opacity-20 mb-2"/> : <History size={32} className="opacity-20 mb-2"/>}
                             <p className="text-sm">{queueTab === 'queue' ? '播放列表为空' : '暂无播放记录'}</p>
                        </div>
                    )}
                </div>
            </div>
          </>
      )}

      {/* Bottom Player Bar */}
      <div className="h-20 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md fixed bottom-0 left-0 right-0 z-[45] flex items-center px-4 justify-between transition-all duration-300 shadow-2xl">
        
        {/* Track Info */}
        <div className="flex items-center gap-4 w-full md:w-1/3 md:min-w-[200px]">
          <div 
            className={`relative group w-12 h-12 md:w-14 md:h-14 rounded-md overflow-hidden cursor-pointer shadow-md bg-slate-800 flex-shrink-0`}
            onClick={() => setIsLyricsOpen(true)}
          >
            <img src={currentSong.coverUrl} alt="Cover" className="w-full h-full object-cover" />
             {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center backdrop-blur-[2px] transition-all">
                <ChevronUp size={24} className="text-white" />
            </div>
          </div>
          
          <div className="overflow-hidden flex flex-col justify-center flex-1 mr-2">
            <div className="flex items-center gap-2 overflow-hidden w-full">
                <div className="relative overflow-hidden w-full">
                    <h4 
                        className={`font-medium text-white cursor-pointer hover:text-emerald-400 transition-colors text-sm md:text-base whitespace-nowrap ${currentSong.title.length > 12 ? 'animate-marquee' : 'truncate'}`}
                        onClick={() => setIsLyricsOpen(true)}
                    >
                        {currentSong.title.length > 12 ? 
                            <span>{currentSong.title} &nbsp;&nbsp;&nbsp; {currentSong.title} &nbsp;&nbsp;&nbsp;</span> 
                            : currentSong.title
                        }
                    </h4>
                </div>
                
                {/* Like / Add Buttons (Desktop Only) */}
                <button 
                    onClick={() => toggleLike(currentSong.id)}
                    className={`hidden md:block transition hover:scale-110 flex-shrink-0 ${isLiked(currentSong.id) ? 'text-red-500' : 'text-slate-500 hover:text-white'}`}
                    title={isLiked(currentSong.id) ? "取消收藏" : "收藏"}
                >
                    <Heart size={16} fill={isLiked(currentSong.id) ? "currentColor" : "none"} />
                </button>
            </div>
            
            <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-slate-400 truncate hover:text-slate-300 cursor-pointer">{currentSong.artist}</p>
                {/* Quality Badge */}
                <button 
                    onClick={cycleQuality}
                    className={`hidden md:block text-[10px] px-1 py-[1px] rounded border font-bold tracking-tighter transition hover:scale-105 ${soundQuality === 'lossless' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' : soundQuality === 'high' ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-slate-500 text-slate-500'}`}
                    title="切换音质"
                >
                    {qualityLabels[soundQuality]}
                </button>
            </div>
          </div>
        </div>

        {/* Controls - Centered */}
        <div className="flex flex-col items-center flex-1 max-w-xl px-4 absolute left-1/2 -translate-x-1/2 bottom-0 w-full md:relative md:translate-x-0 md:bottom-auto">
          <div className="flex items-center gap-4 md:gap-6 mb-1 md:mb-1 absolute right-4 bottom-5 md:static">
             {/* Play Mode (Desktop) */}
            <button 
                onClick={togglePlayMode}
                className={`hidden md:block text-slate-400 hover:text-white transition ${playMode !== PlayMode.SEQUENCE ? 'text-emerald-500' : ''}`}
                title={playMode === PlayMode.LOOP ? "单曲循环" : playMode === PlayMode.SHUFFLE ? "随机播放" : "顺序播放"}
            >
              {playMode === PlayMode.SHUFFLE ? <Shuffle size={18} /> : playMode === PlayMode.LOOP ? <Repeat size={18} className="text-emerald-500"/> : <Repeat size={18} />}
            </button>

            {/* Prev (Hidden on very small mobile) */}
            <button onClick={prevSong} className="hidden sm:block text-slate-300 hover:text-white transition hover:scale-110 active:scale-95">
              <SkipBack size={24} fill="currentColor" />
            </button>

            <button 
              onClick={togglePlay} 
              className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center hover:scale-105 hover:bg-emerald-400 hover:text-white transition shadow-lg shadow-white/10"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
            </button>

            {/* Next (Hidden on very small mobile) */}
            <button onClick={nextSong} className="hidden sm:block text-slate-300 hover:text-white transition hover:scale-110 active:scale-95" title="播放下一首 (Next Song)">
              <SkipForward size={24} fill="currentColor" />
            </button>

             <div className="w-[18px] hidden md:block"></div> 
          </div>

          {/* Progress Bar (Full width on mobile top of bar, inline on desktop) */}
          <div className="w-full flex items-center gap-3 text-xs text-slate-400 font-medium font-mono absolute top-0 left-0 px-0 md:static md:px-0">
            <span className="hidden md:inline">{formatTime(progress)}</span>
            <div className="relative flex-1 h-1 md:h-1 group cursor-pointer w-full">
                 <div className="absolute inset-0 bg-slate-700/50 md:rounded-lg"></div>
                 <div 
                    className="absolute inset-y-0 left-0 bg-emerald-500 md:rounded-lg group-hover:bg-emerald-400 transition-all shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                 >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hidden md:block"></div>
                 </div>
                 <input 
                    type="range" 
                    min={0} 
                    max={duration || 100} 
                    value={progress}
                    onChange={(e) => seek(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
            </div>
            <span className="hidden md:inline">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Tools (Hidden on Mobile) */}
        <div className="hidden md:flex w-1/3 justify-end items-center gap-3 min-w-[150px]">
          {/* Simple Visualizer */}
          {isPlaying && (
              <div className="flex gap-0.5 h-4 items-end mx-2">
                 <div className="w-0.5 bg-emerald-500/80 animate-[equalize_0.8s_ease-in-out_infinite] h-[30%]"></div>
                 <div className="w-0.5 bg-emerald-500/80 animate-[equalize_1.2s_ease-in-out_infinite] h-[50%] animation-delay-200"></div>
                 <div className="w-0.5 bg-emerald-500/80 animate-[equalize_0.6s_ease-in-out_infinite] h-[80%] animation-delay-500"></div>
                 <div className="w-0.5 bg-emerald-500/80 animate-[equalize_1s_ease-in-out_infinite] h-[40%]"></div>
              </div>
          )}

          {/* Playback Rate */}
          <div className="relative">
              <button 
                onClick={() => setShowRateMenu(!showRateMenu)}
                className={`text-slate-400 hover:text-white transition p-2 rounded-full hover:bg-slate-800 ${playbackRate !== 1 ? 'text-emerald-500 bg-emerald-500/10' : ''}`}
                title="倍速播放"
              >
                  <span className="text-xs font-bold w-6 text-center block tracking-tighter">{playbackRate}x</span>
              </button>
              {showRateMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowRateMenu(false)}></div>
                    <div className="absolute bottom-full right-0 mb-2 w-24 bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden z-50 animate-fade-in-up">
                         <div className="p-2 text-xs text-center text-slate-500 border-b border-slate-700/50 font-bold">
                            播放倍速
                        </div>
                        {rateOptions.map(rate => (
                             <button
                                key={rate}
                                onClick={() => { setPlaybackRate(rate); setShowRateMenu(false); }}
                                className={`w-full text-center px-4 py-2 text-xs hover:bg-white/5 transition flex justify-between items-center ${playbackRate === rate ? 'text-emerald-500 bg-emerald-500/5' : 'text-slate-300'}`}
                             >
                                 <span className="w-full">{rate}x</span>
                             </button>
                        ))}
                    </div>
                  </>
              )}
          </div>

          {/* Sleep Timer */}
          <div className="relative">
              <button 
                onClick={() => setShowTimerMenu(!showTimerMenu)}
                className={`text-slate-400 hover:text-white transition p-2 rounded-full hover:bg-slate-800 ${sleepTimer ? 'text-emerald-500 bg-emerald-500/10' : ''}`}
                title="睡眠定时器"
              >
                  {sleepTimer ? <Moon size={18} /> : <Clock size={18} />}
              </button>
              {showTimerMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowTimerMenu(false)}></div>
                    <div className="absolute bottom-full right-0 mb-2 w-32 bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden z-50 animate-fade-in-up">
                        <div className="p-2 text-xs text-center text-slate-500 border-b border-slate-700/50 font-bold">
                            {sleepTimer ? `剩余 ${sleepTimer} 分钟` : '自动关闭'}
                        </div>
                        {[15, 30, 60, null].map(min => (
                             <button
                                key={min || 'off'}
                                onClick={() => { setSleepTimer(min); setShowTimerMenu(false); }}
                                className={`w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition flex justify-between items-center ${sleepTimer === min ? 'text-emerald-500' : 'text-slate-300'}`}
                             >
                                 {min ? `${min} 分钟` : '关闭'}
                                 {sleepTimer === min && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
                             </button>
                        ))}
                    </div>
                  </>
              )}
          </div>

          <button 
             onClick={() => downloadSong(currentSong)}
             className="text-slate-400 hover:text-white transition p-2 rounded-full hover:bg-slate-800"
             title="下载"
          >
              <Download size={18} />
          </button>
          
          <button 
             onClick={() => shareSong(currentSong)}
             className="text-slate-400 hover:text-white transition p-2 rounded-full hover:bg-slate-800"
             title="分享"
          >
              <Share2 size={18} />
          </button>

          <button 
            onClick={() => setIsLyricsOpen(!isLyricsOpen)} 
            className={`text-slate-400 hover:text-white transition p-2 rounded-full hover:bg-slate-800 ${isLyricsOpen ? 'text-emerald-500 bg-emerald-500/10' : ''}`}
            title="歌词/评论"
          >
            <MessageSquare size={18} />
          </button>

           <button 
            onClick={() => setShowQueue(!showQueue)} 
            className={`text-slate-400 hover:text-white transition p-2 rounded-full hover:bg-slate-800 ${showQueue ? 'text-emerald-500 bg-emerald-500/10' : ''}`}
            title="播放列表"
          >
            <ListMusic size={18} />
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2 group/volume w-32 ml-2">
            <button onClick={toggleMute} className="text-slate-400 hover:text-white transition p-1">
                {isMuted || volume === 0 ? <VolumeX size={20} /> : volume < 0.5 ? <Volume1 size={20} /> : <Volume2 size={20} />}
            </button>
            <div className="relative flex-1 h-8 flex items-center cursor-pointer">
                {/* Track Background */}
                <div className="absolute inset-x-0 h-1 bg-slate-700 rounded-full"></div>
                
                {/* Track Fill */}
                <div 
                    className="absolute h-1 left-0 bg-slate-400 group-hover/volume:bg-emerald-500 rounded-full transition-colors" 
                    style={{ width: `${volume * 100}%` }}
                ></div>
                
                {/* Thumb (Visible on hover) */}
                <div 
                    className="absolute h-3 w-3 bg-white rounded-full shadow-md opacity-0 group-hover/volume:opacity-100 transition-opacity pointer-events-none"
                    style={{ left: `${volume * 100}%`, transform: 'translateX(-50%)' }}
                ></div>

                {/* Input Range (Invisible but interactive) */}
                <input 
                    type="range" 
                    min={0} 
                    max={1} 
                    step={0.01} 
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="音量调节"
                />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Player;