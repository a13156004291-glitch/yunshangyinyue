import React, { useEffect, useRef } from 'react';
import { Play, SkipForward, ListPlus, Download, Share2, MessageSquare, Heart, Info } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useUser } from '../context/UserContext';

const ContextMenu = () => {
  const { contextMenu, closeContextMenu, playSong, playNext, addToQueue, openDownloadModal, openAddToPlaylistModal, shareSong, toggleLike, isLiked } = usePlayer();
  const { isOpen, x, y, target } = contextMenu;
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeContextMenu();
      }
    };
    
    if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('scroll', closeContextMenu);
    }
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('scroll', closeContextMenu);
    };
  }, [isOpen, closeContextMenu]);

  if (!isOpen || !target) return null;

  const liked = isLiked(target.id);

  // Adjust positioning to not overflow screen
  const menuWidth = 200;
  const menuHeight = 320;
  const adjustedX = x + menuWidth > window.innerWidth ? x - menuWidth : x;
  const adjustedY = y + menuHeight > window.innerHeight ? y - menuHeight : y;

  const handleAction = (action: () => void) => {
      action();
      closeContextMenu();
  };

  return (
    <div 
        ref={menuRef}
        className="fixed z-[9999] bg-slate-800 border border-slate-700 rounded-lg shadow-2xl py-1 min-w-[200px] animate-fade-in-up"
        style={{ top: adjustedY, left: adjustedX }}
        onContextMenu={(e) => e.preventDefault()}
    >
        <div className="px-4 py-2 border-b border-slate-700/50 mb-1">
            <p className="text-sm font-bold text-white truncate max-w-[180px]">{target.title}</p>
            <p className="text-xs text-slate-400 truncate max-w-[180px]">{target.artist}</p>
        </div>

        <button onClick={() => handleAction(() => playSong(target))} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-emerald-500 hover:text-white flex items-center gap-3 transition-colors">
            <Play size={16} /> 立即播放
        </button>
        <button onClick={() => handleAction(() => playNext(target))} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-emerald-500 hover:text-white flex items-center gap-3 transition-colors">
            <SkipForward size={16} /> 下一首播放
        </button>
        <button onClick={() => handleAction(() => addToQueue(target))} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-emerald-500 hover:text-white flex items-center gap-3 transition-colors">
            <ListPlus size={16} /> 添加到队列
        </button>
        
        <div className="h-px bg-slate-700 my-1 mx-2"></div>

        <button onClick={() => handleAction(() => openAddToPlaylistModal(target))} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-emerald-500 hover:text-white flex items-center gap-3 transition-colors">
            <ListPlus size={16} /> 收藏到歌单
        </button>
        <button onClick={() => handleAction(() => toggleLike(target.id))} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-emerald-500 hover:text-white flex items-center gap-3 transition-colors">
            <Heart size={16} fill={liked ? "currentColor" : "none"} className={liked ? "text-red-500" : ""} /> {liked ? '取消喜欢' : '我喜欢'}
        </button>

        <div className="h-px bg-slate-700 my-1 mx-2"></div>

        <button onClick={() => handleAction(() => openDownloadModal(target))} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-emerald-500 hover:text-white flex items-center gap-3 transition-colors">
            <Download size={16} /> 下载
        </button>
        <button onClick={() => handleAction(() => shareSong(target))} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-emerald-500 hover:text-white flex items-center gap-3 transition-colors">
            <Share2 size={16} /> 分享
        </button>
    </div>
  );
};

export default ContextMenu;