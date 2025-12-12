
import React, { useState } from 'react';
import { FEATURED_PLAYLISTS } from '../constants';
import { usePlayer } from '../context/PlayerContext';
import { useUser } from '../context/UserContext';
import { Disc, History, Music, Cloud, Upload, Trash2, Play, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import SongCard from '../components/SongCard';
import { useToast } from '../context/ToastContext';

type TabType = 'playlists' | 'history' | 'local';

const Library = () => {
  const [activeTab, setActiveTab] = useState<TabType>('playlists');
  const { playHistory, uploadedSongs, userPlaylists, clearHistory, playPlaylist, setUploadModalOpen, deleteUploadedSong, setCreatePlaylistModalOpen, deletePlaylist, openEditPlaylistModal, showConfirm } = usePlayer();
  const { showToast } = useToast();
  const { currentUser } = useUser();

  const isAdmin = currentUser?.role === 'admin';

  const handleClearHistory = () => {
      showConfirm(
          '清空历史',
          '确定要清空所有播放记录吗？此操作无法撤销。',
          () => {
              clearHistory();
              showToast('播放历史已清空', 'info');
          },
          { isDangerous: true, confirmText: '清空' }
      );
  };

  const handleDeleteLocal = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      showConfirm(
          '移除歌曲',
          '确定要从本地列表移除这首歌曲吗？',
          () => deleteUploadedSong(id),
          { isDangerous: true, confirmText: '移除' }
      );
  };

  const handleDeletePlaylist = (e: React.MouseEvent, id: string, name: string) => {
      e.preventDefault();
      e.stopPropagation();
      showConfirm(
          '删除歌单',
          `确定要删除歌单 "${name}" 吗？此操作无法撤销。`,
          () => deletePlaylist(id),
          { isDangerous: true, confirmText: '删除' }
      );
  }

  const handleEditPlaylist = (e: React.MouseEvent, playlist: any) => {
      e.preventDefault();
      e.stopPropagation();
      openEditPlaylistModal(playlist);
  }

  return (
    <div className="p-8 pb-32">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-3xl font-bold text-white">音乐库</h1>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-6 mb-8 border-b border-slate-800 overflow-x-auto no-scrollbar">
        <button 
            onClick={() => setActiveTab('playlists')}
            className={`pb-3 px-2 font-medium transition relative whitespace-nowrap ${activeTab === 'playlists' ? 'text-emerald-500' : 'text-slate-400 hover:text-white'}`}
        >
            <div className="flex items-center gap-2">
                <Music size={18} /> 我的歌单
            </div>
            {activeTab === 'playlists' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full"></div>}
        </button>
        <button 
            onClick={() => setActiveTab('local')}
            className={`pb-3 px-2 font-medium transition relative whitespace-nowrap ${activeTab === 'local' ? 'text-emerald-500' : 'text-slate-400 hover:text-white'}`}
        >
             <div className="flex items-center gap-2">
                <Cloud size={18} /> 本地/云盘
            </div>
            {activeTab === 'local' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full"></div>}
        </button>
        <button 
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-2 font-medium transition relative whitespace-nowrap ${activeTab === 'history' ? 'text-emerald-500' : 'text-slate-400 hover:text-white'}`}
        >
             <div className="flex items-center gap-2">
                <History size={18} /> 最近播放
            </div>
            {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full"></div>}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'playlists' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {/* Create New Playlist Card */}
            <div 
                onClick={() => setCreatePlaylistModalOpen(true)}
                className="border-2 border-dashed border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center min-h-[120px] text-slate-500 hover:border-emerald-500/50 hover:text-emerald-500 cursor-pointer transition bg-slate-800/20 group"
            >
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-2 group-hover:bg-emerald-500/10 transition">
                    <span className="text-2xl font-light">+</span>
                </div>
                <span className="font-medium">新建歌单</span>
            </div>

            {/* User Playlists */}
            {userPlaylists.map(playlist => (
                <div key={playlist.id} className="relative group z-0">
                    <Link to={`/playlist/${playlist.id}`} className="bg-slate-800 p-4 rounded-xl flex gap-4 hover:bg-slate-700 transition cursor-pointer border border-transparent hover:border-emerald-500/30 h-full">
                        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden relative">
                            <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                            <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center">
                                <Play className="text-white" fill="currentColor" size={24}/>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center min-w-0 flex-1">
                            <h3 className="font-bold text-lg text-white mb-1 truncate pr-16">{playlist.name}</h3>
                            <p className="text-sm text-slate-400">{playlist.songs.length} 首歌曲</p>
                            <p className="text-xs text-emerald-500 mt-1">自建歌单</p>
                        </div>
                    </Link>
                    
                    {/* Management Buttons - Visible on Mobile, Hover on Desktop */}
                    <div className="absolute top-2 right-2 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition z-20">
                         <button 
                            onClick={(e) => handleEditPlaylist(e, playlist)}
                            className="p-2 bg-black/60 backdrop-blur-md rounded-full text-slate-300 hover:text-emerald-400 hover:bg-black/80 transition"
                            title="编辑歌单"
                        >
                            <Edit size={16} />
                        </button>
                        <button 
                            onClick={(e) => handleDeletePlaylist(e, playlist.id, playlist.name)}
                            className="p-2 bg-black/60 backdrop-blur-md rounded-full text-slate-300 hover:text-red-400 hover:bg-black/80 transition"
                            title="删除歌单"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}

            {/* Featured Playlists */}
            {FEATURED_PLAYLISTS.map(playlist => (
                <div key={playlist.id} className="relative group z-0">
                    <Link to={`/playlist/${playlist.id}`} className="bg-slate-800 p-4 rounded-xl flex gap-4 hover:bg-slate-700 transition cursor-pointer group border border-transparent hover:border-slate-600 h-full">
                        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden relative">
                            <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                        </div>
                        <div className="flex flex-col justify-center min-w-0 flex-1">
                            <h3 className="font-bold text-lg text-white mb-1 truncate">{playlist.name}</h3>
                            <p className="text-sm text-slate-400 line-clamp-1">{playlist.songs.length} 首歌曲</p>
                            <p className="text-xs text-slate-500 mt-1">官方推荐</p>
                        </div>
                    </Link>
                    
                    {/* Admin Actions for Featured Playlists */}
                    {isAdmin && (
                        <div className="absolute top-2 right-2 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition z-20">
                            <button 
                                onClick={(e) => handleDeletePlaylist(e, playlist.id, playlist.name)}
                                className="p-2 bg-black/60 backdrop-blur-md rounded-full text-red-400 hover:text-red-300 hover:bg-black/80 transition"
                                title="删除歌单 (Admin)"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
      )}

      {activeTab === 'local' && (
          <div className="animate-fade-in-up">
              <div className="flex justify-between items-center mb-4">
                 <p className="text-slate-400 text-sm">本地上传仅限当前浏览器会话</p>
                 {uploadedSongs.length > 0 && (
                    <button 
                        onClick={() => playPlaylist(uploadedSongs)}
                        className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white px-4 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-2"
                    >
                        <Play size={16} fill="currentColor" /> 播放全部
                    </button>
                 )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {/* Upload Button Card */}
                <div 
                    onClick={() => setUploadModalOpen(true)}
                    className="aspect-square bg-slate-800/40 rounded-xl border-2 border-dashed border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 cursor-pointer transition flex flex-col items-center justify-center text-slate-400 hover:text-emerald-500 group"
                >
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-lg group-hover:shadow-emerald-500/20">
                        <Upload size={28} />
                    </div>
                    <span className="font-bold">上传音乐</span>
                    <span className="text-xs text-slate-500 mt-1">支持 MP3, WAV</span>
                </div>

                {uploadedSongs.map((song, i) => (
                    <div key={`${song.id}-${i}`} className="relative group">
                        <SongCard 
                            song={song} 
                            onPlay={() => playPlaylist(uploadedSongs, i)}
                        />
                        <button 
                            onClick={(e) => handleDeleteLocal(e, song.id)}
                            className="absolute top-2 left-2 p-1.5 bg-black/60 backdrop-blur-md rounded-full text-slate-300 hover:text-red-400 hover:bg-black/80 transition opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10"
                            title="删除"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
              </div>

              {uploadedSongs.length === 0 && (
                   <div className="text-center py-12 text-slate-500">
                       <p className="text-sm">您的云盘是空的，上传本地音乐开始收听吧。</p>
                   </div>
              )}
          </div>
      )}

      {activeTab === 'history' && (
          <div>
              {playHistory.length > 0 ? (
                  <>
                     <div className="flex justify-end mb-4">
                        <button 
                            onClick={handleClearHistory}
                            className="text-slate-500 hover:text-red-400 text-sm flex items-center gap-1 transition"
                        >
                            <Trash2 size={16} /> 清空记录
                        </button>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-fade-in-up">
                        {playHistory.map((song, i) => (
                            <SongCard 
                                key={`${song.id}-${i}`} 
                                song={song} 
                                onPlay={() => playPlaylist(playHistory, i)}
                            />
                        ))}
                     </div>
                  </>
              ) : (
                   <div className="text-center py-20 text-slate-500">
                       <Disc size={48} className="mx-auto mb-4 opacity-20" />
                       <p>暂无播放记录，快去听听歌吧！</p>
                   </div>
              )}
          </div>
      )}
    </div>
  );
};

export default Library;
