
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FEATURED_PLAYLISTS } from '../constants';
import { Playlist } from '../types';
import { Play, Clock3, Heart, MoreHorizontal, Trash2, MinusCircle, Edit2, Download } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { playSong, playPlaylist, currentSong, isLiked, toggleLike, userPlaylists, deletePlaylist, removeSongFromPlaylist, openEditPlaylistModal, openDownloadModal, showConfirm } = usePlayer();
  const { showToast } = useToast();
  const { currentUser } = useUser();

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    // Check user playlists first
    const userPl = userPlaylists.find(p => p.id === id);
    if (userPl) {
        setPlaylist(userPl);
        return;
    }

    // Check featured playlists
    const found = FEATURED_PLAYLISTS.find(p => p.id === id);
    if (found) {
        setPlaylist(found);
    } else {
        // Fallback or 404 handling
        navigate('/');
    }
  }, [id, navigate, userPlaylists]);

  const handleDeletePlaylist = () => {
      showConfirm(
          '删除歌单',
          `确定要删除歌单 "${playlist?.name}" 吗？此操作无法撤销。`,
          () => {
              if (playlist?.id) deletePlaylist(playlist.id);
              navigate('/library');
          },
          { isDangerous: true, confirmText: '删除' }
      );
  };

  const handleRemoveSong = (e: React.MouseEvent, songId: string) => {
      e.stopPropagation();
      if (playlist?.id) removeSongFromPlaylist(playlist.id, songId);
  };

  const handleDownload = (e: React.MouseEvent, song: any) => {
      e.stopPropagation();
      openDownloadModal(song);
  };

  const handleFavPlaylist = () => {
      showToast('已收藏歌单', 'success');
  }

  if (!playlist) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canEdit = playlist.isUserCreated || isAdmin;

  return (
    <div className="pb-32" onClick={() => setMenuOpen(false)}>
      {/* Header */}
      <div className="relative h-80 flex items-end p-8 bg-gradient-to-b from-slate-800 to-slate-900/50">
        <div className="absolute inset-0 overflow-hidden z-0">
             <img src={playlist.coverUrl} alt="bg" className="w-full h-full object-cover blur-3xl opacity-30" />
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900"></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-end w-full">
            <div className="w-48 h-48 shadow-2xl rounded-xl overflow-hidden flex-shrink-0 group relative">
                <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 text-center md:text-left space-y-4">
                <div className="flex items-center justify-center md:justify-start gap-3">
                    <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider">歌单</span>
                    {playlist.isUserCreated && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">自建</span>}
                    {isAdmin && !playlist.isUserCreated && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">系统 (Admin可控)</span>}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white">{playlist.name}</h1>
                <p className="text-slate-300 max-w-2xl">{playlist.description}</p>
                
                <div className="flex items-center gap-4 justify-center md:justify-start pt-2">
                    <button 
                        onClick={() => playPlaylist(playlist.songs)}
                        disabled={playlist.songs.length === 0}
                        className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition hover:scale-105 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Play fill="currentColor" size={20} /> 播放全部
                    </button>
                    {canEdit ? (
                        <>
                            <button 
                                onClick={() => openEditPlaylistModal(playlist)}
                                className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-full transition border border-slate-600"
                                title="编辑信息"
                            >
                                <Edit2 size={20} />
                            </button>
                            <button 
                                onClick={handleDeletePlaylist}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 p-3 rounded-full transition"
                                title="删除歌单"
                            >
                                <Trash2 size={20} />
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={handleFavPlaylist}
                            className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-full transition border border-slate-600 hover:text-red-500 hover:border-red-500/50"
                        >
                            <Heart size={20} />
                        </button>
                    )}
                    <div className="relative">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                            className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-full transition border border-slate-600"
                        >
                            <MoreHorizontal size={20} />
                        </button>
                        {menuOpen && (
                            <div className="absolute top-full left-0 mt-2 w-32 bg-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden z-20 animate-fade-in-up">
                                <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white">分享</button>
                                <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white">举报</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Song List */}
      <div className="px-6 md:px-12 mt-8">
        <div className="grid grid-cols-[auto_4fr_3fr_1fr] gap-4 text-sm text-slate-500 border-b border-slate-800 pb-3 uppercase tracking-wider font-medium">
            <div className="w-8 text-center">#</div>
            <div>标题</div>
            <div className="hidden md:block">专辑</div>
            <div className="text-right"><Clock3 size={16} className="inline" /></div>
        </div>
        
        <div className="mt-2 space-y-1">
            {playlist.songs.length > 0 ? playlist.songs.map((song, index) => {
                const isActive = currentSong?.id === song.id;
                return (
                    <div 
                        key={`${song.id}-${index}`} 
                        onClick={() => playSong(song)}
                        className={`group grid grid-cols-[auto_4fr_3fr_1fr] gap-4 items-center p-3 rounded-lg hover:bg-white/5 cursor-pointer transition ${isActive ? 'bg-white/10' : ''}`}
                    >
                        <div className="w-8 text-center text-slate-500 flex justify-center">
                            {isActive ? <span className="text-emerald-500 animate-pulse">♫</span> : <span className="group-hover:hidden">{index + 1}</span>}
                            <Play size={14} className="hidden group-hover:block text-white" fill="currentColor"/>
                        </div>
                        <div className="flex items-center gap-4 min-w-0">
                            <img src={song.coverUrl} className="w-10 h-10 rounded object-cover" alt="" />
                            <div className="min-w-0">
                                <div className={`font-medium truncate ${isActive ? 'text-emerald-400' : 'text-white'}`}>{song.title}</div>
                                <div className="text-xs text-slate-400 truncate group-hover:text-slate-300">{song.artist}</div>
                            </div>
                        </div>
                        <div className="hidden md:block text-slate-400 text-sm truncate">{song.album}</div>
                        
                        <div className="flex items-center justify-end gap-4">
                            {/* Download Button */}
                            <button 
                                onClick={(e) => handleDownload(e, song)}
                                className="text-slate-500 hover:text-emerald-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"
                                title="下载"
                            >
                                <Download size={18} />
                            </button>

                            {canEdit ? (
                                <button 
                                    onClick={(e) => handleRemoveSong(e, song.id)}
                                    className="text-slate-500 hover:text-red-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"
                                    title="从歌单移除"
                                >
                                    <MinusCircle size={18} />
                                </button>
                            ) : (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}
                                    className={`opacity-100 md:opacity-0 md:group-hover:opacity-100 transition ${isLiked(song.id) ? 'text-red-500 opacity-100' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <Heart size={16} fill={isLiked(song.id) ? "currentColor" : "none"} />
                                </button>
                            )}
                            <span className="text-sm text-slate-500 font-mono min-w-[40px] text-right">{formatTime(song.duration)}</span>
                        </div>
                    </div>
                );
            }) : (
                <div className="py-12 text-center text-slate-500">
                    歌单还是空的，快去添加喜欢的歌曲吧！
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetail;
