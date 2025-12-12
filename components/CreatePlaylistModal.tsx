import React, { useState, useEffect } from 'react';
import { X, Music, Edit } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const CreatePlaylistModal = () => {
    const { isCreatePlaylistModalOpen, setCreatePlaylistModalOpen, createPlaylist, editPlaylistTarget, updatePlaylist } = usePlayer();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (isCreatePlaylistModalOpen) {
            if (editPlaylistTarget) {
                setName(editPlaylistTarget.name);
                setDescription(editPlaylistTarget.description || '');
            } else {
                setName('');
                setDescription('');
            }
        }
    }, [isCreatePlaylistModalOpen, editPlaylistTarget]);

    if (!isCreatePlaylistModalOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            if (editPlaylistTarget) {
                updatePlaylist(editPlaylistTarget.id, name, description);
            } else {
                createPlaylist(name, description);
            }
            setName('');
            setDescription('');
        }
    };

    const isEdit = !!editPlaylistTarget;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCreatePlaylistModalOpen(false)}></div>
            <div className="relative bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl animate-fade-in-up">
                <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {isEdit ? <Edit size={20} className="text-emerald-500" /> : <Music size={20} className="text-emerald-500" />}
                        {isEdit ? '编辑歌单信息' : '新建歌单'}
                    </h3>
                    <button onClick={() => setCreatePlaylistModalOpen(false)} className="text-slate-400 hover:text-white transition">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">歌单名称</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="输入歌单标题..."
                            autoFocus
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">描述 (可选)</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="描述一下这个歌单..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition resize-none h-24"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={!name.trim()}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isEdit ? '保存修改' : '创建'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatePlaylistModal;