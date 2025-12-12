import React, { memo } from 'react';
import { Song } from '../types';
import { Play, Pause, Sparkles, Heart, Download, Headphones, ListPlus, Tag, Share2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

interface SongCardProps {
  song: Song;
  onPlay?: () => void;
}

const SongCard: React.FC<SongCardProps> = memo(({ song, onPlay }) => {
  const { currentSong, isPlaying, playSong, isLiked, toggleLike, openDownloadModal, getSongStats, soundQuality, openAddToPlaylistModal, shareSong, showContextMenu } = usePlayer();
  const isCurrent = currentSong?.id === song.id;
  const isCurrentlyPlaying = isCurrent && isPlaying;
  const liked = isLiked(song.id);
  
  const stats = getSongStats(song);
  
  const formatCount = (num: number) => {
      if (num > 10000) return (num / 10000).toFixed(1) + 'w';
      if (num > 1000) return (num / 1000).toFixed(1) + 'k';
      return num;
  };

  const handlePlay = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onPlay) {
          onPlay();
      } else {
          playSong(song);
      }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
      showContextMenu(e, song);
  }

  const handleLike = (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleLike(song.id);
  }

  const handleDownload = (e: React.MouseEvent) => {
      e.stopPropagation();
      openDownloadModal(song);
  }

  const handleAddToPlaylist = (e: React.MouseEvent) => {
      e.stopPropagation();
      openAddToPlaylistModal(song);
  }

  const handleShare = (e: React.MouseEvent) => {
      e.stopPropagation();
      shareSong(song);
  }

  // Determine quality badge
  const showLossless = song.quality === 'lossless' || (!song.quality && parseInt(song.id) % 3 === 0);
  const showHigh = song.quality === 'high' || (!song.quality && parseInt(song.id) % 2 === 0);

  return (
    <div 
      className="group relative bg-slate-800/40 rounded-xl p-3 pb-4 hover:bg-slate-800 transition-all duration-300 cursor-pointer border border-transparent hover:border-slate-700 overflow-hidden"
      onClick={handlePlay}
      onContextMenu={handleContextMenu}
    >
      <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
        <img 
          src={song.coverUrl} 
          alt={song.title} 
          loading="lazy"
          className={`object-cover w-full h-full transition-transform duration-700 ${isCurrentlyPlaying ? 'scale-110' : 'group-hover:scale-105'}`}
        />
        
        {/* Overlay */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-all duration-300 ${isCurrentlyPlaying ? 'opacity-100 bg-black/50' : 'opacity-0 group-hover:opacity-100'}`}>
          {isCurrentlyPlaying ? (
               // Mini Equalizer Animation
               <div className="flex gap-1 items-end h-6">
                   <div className="w-1.5 bg-emerald-500 rounded-sm equalizer-bar"></div>
                   <div className="w-1.5 bg-emerald-500 rounded-sm equalizer-bar"></div>
                   <div className="w-1.5 bg-emerald-500 rounded-sm equalizer-bar"></div>
                   <div className="w-1.5 bg-emerald-500 rounded-sm equalizer-bar"></div>
               </div>
          ) : (
             <div className="bg-emerald-500 text-white rounded-full p-3 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
               <Play size={24} fill="currentColor" className="ml-1" />
             </div>
          )}
        </div>
        
        {/* Play Count Badge */}
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <Headphones size={10} /> {formatCount(stats.playCount)}
        </div>

        {/* Quality Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
            {song.isAiGenerated && (
            <div className="bg-violet-600/90 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Sparkles size={10} /> AI
            </div>
            )}
             {showLossless ? (
                 <div className="bg-yellow-600/90 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded border border-yellow-400/50 shadow-sm font-bold tracking-tighter">
                    HR
                </div>
             ) : showHigh ? (
                 <div className="bg-emerald-600/90 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded border border-emerald-400/50 shadow-sm font-bold tracking-tighter">
                    HQ
                </div>
             ) : null}
        </div>
      </div>
      
      <div className="space-y-1 relative pr-8">
        <h3 className={`font-semibold truncate text-sm md:text-base ${isCurrent ? 'text-emerald-400' : 'text-slate-100'}`}>
          {song.title}
        </h3>
        <p className="text-xs md:text-sm text-slate-400 truncate">{song.artist}</p>
        
        {/* Tags Row */}
        {song.tags && song.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
                {song.tags.slice(0, 2).map((tag, i) => (
                    <span key={i} className="text-[10px] text-slate-500 bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-700/50">
                        {tag}
                    </span>
                ))}
            </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-0 right-0 flex flex-col gap-1">
            <button 
                onClick={handleLike}
                className={`p-1 hover:scale-110 transition ${liked ? 'text-red-500' : 'text-slate-600 hover:text-slate-300'}`}
                title={liked ? "取消收藏" : "收藏"}
            >
                <Heart size={16} fill={liked ? "currentColor" : "none"} />
            </button>
            <button 
                onClick={handleAddToPlaylist}
                className="p-1 text-slate-600 hover:text-emerald-400 hover:scale-110 transition opacity-0 group-hover:opacity-100"
                title="添加到歌单"
            >
                <ListPlus size={16} />
            </button>
            <button 
                onClick={handleDownload}
                className="p-1 text-slate-600 hover:text-emerald-400 hover:scale-110 transition opacity-0 group-hover:opacity-100"
                title="下载"
            >
                <Download size={16} />
            </button>
            <button 
                onClick={handleShare}
                className="p-1 text-slate-600 hover:text-emerald-400 hover:scale-110 transition opacity-0 group-hover:opacity-100"
                title="分享"
            >
                <Share2 size={16} />
            </button>
        </div>
      </div>
    </div>
  );
});

export default SongCard;