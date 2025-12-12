import React from 'react';
import { X, Music, ListPlus, Plus } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const AddToPlaylistModal = () => {
    const { addToPlaylistTarget, closeAddToPlaylistModal, userPlaylists, addSongToPlaylist, setCreatePlaylistModalOpen } = usePlayer();

    if (!addToPlaylistTarget) return null;

    const handleCreateNew = () => {
        closeAddToPlaylistModal();
        setCreatePlaylistModalOpen(true);
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeAddToPlaylistModal}></div>
            <div className="relative bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
                <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <ListPlus size={20} className="text-emerald-500" />
                        添加到歌单
                    </h3>
                    <button onClick={closeAddToPlaylistModal} className="text-slate-400 hover:text-white transition">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* Create New Option */}
                    <div 
                        onClick={handleCreateNew}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition group"
                    >
                        <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center border border-dashed border-slate-600 group-hover:border-emerald-500 transition">
                            <Plus size={24} className="text-slate-400 group-hover:text-emerald-500" />
                        </div>
                        <span className="font-medium text-slate-300 group-hover:text-white">新建歌单</span>
                    </div>

                    {userPlaylists.length > 0 && <div className="h-px bg-slate-800 mx-3 my-2"></div>}

                    {/* User Playlists */}
                    {userPlaylists.map(playlist => (
                        <div 
                            key={playlist.id}
                            onClick={() => addSongToPlaylist(playlist.id, addToPlaylistTarget)}
                            className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition"
                        >
                            <img src={playlist.coverUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-white truncate">{playlist.name}</h4>
                                <p className="text-xs text-slate-500">{playlist.songs.length} 首歌曲</p>
                            </div>
                        </div>
                    ))}
                    
                    {userPlaylists.length === 0 && (
                        <div className="text-center py-8 text-slate-500 text-sm">
                            暂无歌单，点击新建创建第一个歌单
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddToPlaylistModal;