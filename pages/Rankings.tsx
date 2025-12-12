import React, { useState } from 'react';
import { MOCK_SONGS } from '../constants';
import { usePlayer } from '../context/PlayerContext';
import { Song } from '../types';
import { Trophy, TrendingUp, TrendingDown, Minus, Download, Play, Music, Crown, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Rankings = () => {
  const { generatedSongs, uploadedSongs, getSongStats, playSong, playPlaylist, toggleLike, isLiked, openDownloadModal } = usePlayer();
  const [activeTab, setActiveTab] = useState<'hot' | 'download'>('hot');

  // Combine all songs
  const allSongs = [...MOCK_SONGS, ...generatedSongs, ...uploadedSongs];

  // Sort by play count
  const sortedByPlays = [...allSongs].sort((a, b) => {
      return getSongStats(b).playCount - getSongStats(a).playCount;
  });

  // Sort by download count
  const sortedByDownloads = [...allSongs].sort((a, b) => {
      return getSongStats(b).downloadCount - getSongStats(a).downloadCount;
  });

  const displaySongs = activeTab === 'hot' ? sortedByPlays : sortedByDownloads;

  const getRankColor = (rank: number) => {
      if (rank === 0) return 'text-yellow-400';
      if (rank === 1) return 'text-slate-300';
      if (rank === 2) return 'text-amber-600';
      return 'text-slate-500';
  };

  const getRankIcon = (rank: number) => {
      if (rank === 0) return <Crown size={20} fill="currentColor" className="text-yellow-500 drop-shadow-[0_2px_4px_rgba(234,179,8,0.5)]" />;
      if (rank <= 2) return <Trophy size={18} fill="currentColor" />;
      return <span className="font-mono font-bold text-lg">{rank + 1}</span>;
  };

  // Simulate trend (Random for demo purpose)
  const getTrendIcon = (id: string, index: number) => {
      const hash = id.charCodeAt(0) + index;
      if (hash % 3 === 0) return <div className="flex items-center text-red-500 text-[10px] gap-0.5"><TrendingUp size={12} /> <span className="font-mono">{hash % 5 + 1}</span></div>;
      if (hash % 3 === 1) return <div className="flex items-center text-emerald-500 text-[10px] gap-0.5"><TrendingDown size={12} /> <span className="font-mono">{hash % 3 + 1}</span></div>;
      return <div className="flex items-center text-slate-500 text-[10px]"><Minus size={12} /></div>;
  };

  return (
    <div className="p-8 pb-32">
        <div className="flex items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <TrendingUp className="text-red-500" size={32} />
                排行榜
            </h1>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            {/* Tab Switcher */}
            <div className="flex gap-4 bg-slate-800/50 p-1 rounded-xl w-fit">
                <button 
                    onClick={() => setActiveTab('hot')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'hot' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <Trophy size={18} /> 飙升榜 (播放)
                </button>
                <button 
                    onClick={() => setActiveTab('download')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'download' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <Download size={18} /> 下载榜
                </button>
            </div>

            {/* Play All Button */}
            <button 
                onClick={() => playPlaylist(displaySongs.slice(0, 50))}
                disabled={displaySongs.length === 0}
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition hover:scale-105 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Play fill="currentColor" size={18} /> 播放 Top 50
            </button>
        </div>

        {/* List */}
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm">
            <div className="grid grid-cols-[80px_auto_1fr] md:grid-cols-[80px_4fr_3fr_1fr_100px] gap-4 p-4 border-b border-slate-700/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <div className="text-center">排名</div>
                <div>歌曲</div>
                <div className="hidden md:block">歌手</div>
                <div className="hidden md:block text-right">趋势</div>
                <div className="text-right pr-4">{activeTab === 'hot' ? '播放量' : '下载量'}</div>
            </div>

            <div className="divide-y divide-slate-700/30">
                {displaySongs.slice(0, 50).map((song, index) => {
                    const stats = getSongStats(song);
                    const count = activeTab === 'hot' ? stats.playCount : stats.downloadCount;
                    const liked = isLiked(song.id);
                    
                    return (
                        <div 
                            key={song.id} 
                            onClick={() => playSong(song)}
                            className={`group relative grid grid-cols-[80px_auto_1fr] md:grid-cols-[80px_4fr_3fr_1fr_100px] gap-4 p-4 items-center hover:bg-white/5 transition cursor-pointer ${index < 3 ? 'bg-white/[0.02]' : ''}`}
                        >
                            {/* Rank */}
                            <div className={`flex flex-col items-center justify-center ${getRankColor(index)}`}>
                                {getRankIcon(index)}
                                {index <= 2 && <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter scale-90 opacity-80">Top {index + 1}</span>}
                            </div>

                            {/* Song Info */}
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 group-hover:shadow-lg transition">
                                    <img src={song.coverUrl} className="w-full h-full object-cover" alt={song.title} />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                        <Play size={20} className="text-white" fill="currentColor" />
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <div className={`font-bold text-base truncate ${index <= 2 ? 'text-white' : 'text-slate-200'}`}>{song.title}</div>
                                    <div className="md:hidden text-xs text-slate-500 truncate">{song.artist}</div>
                                </div>
                            </div>

                            {/* Artist (Desktop) */}
                            <div className="hidden md:block text-slate-400 text-sm truncate">{song.artist}</div>

                             {/* Trend (Desktop) */}
                             <div className="hidden md:flex justify-end items-center px-4">
                                {getTrendIcon(song.id, index)}
                             </div>

                            {/* Count (Hidden on hover) */}
                            <div className="text-right pr-4 font-mono font-medium text-slate-300 group-hover:opacity-0 transition-opacity duration-300">
                                {count.toLocaleString()}
                            </div>

                            {/* Actions (Visible on hover) */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}
                                    className={`p-2 rounded-full hover:bg-slate-700/80 transition ${liked ? 'text-red-500' : 'text-slate-400 hover:text-white'}`}
                                    title={liked ? "取消收藏" : "收藏"}
                                >
                                    <Heart size={18} fill={liked ? "currentColor" : "none"} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); openDownloadModal(song); }}
                                    className="p-2 rounded-full hover:bg-slate-700/80 text-slate-400 hover:text-emerald-400 transition"
                                    title="下载"
                                >
                                    <Download size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {displaySongs.length === 0 && (
                    <div className="py-20 text-center text-slate-500 flex flex-col items-center">
                        <Music size={48} className="mb-4 opacity-20" />
                        <p>暂无数据</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default Rankings;