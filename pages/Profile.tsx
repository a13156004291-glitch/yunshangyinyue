
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { User, Song } from '../types';
import { MapPin, Link as LinkIcon, Calendar, Edit3, UserPlus, Mic2, Award, Music, Heart, UserCheck } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/SongCard';
import { MOCK_SONGS } from '../constants';

const Profile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { users, currentUser, openEditProfileModal, toggleFollow } = useUser();
    const { uploadedSongs, generatedSongs, playPlaylist } = usePlayer();
    
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<'creations' | 'about'>('creations');

    useEffect(() => {
        const foundUser = users.find(u => u.id === userId);
        if (foundUser) {
            setUser(foundUser);
        } else {
            // Handle not found - could redirect or show error
        }
    }, [userId, users]);

    // Filter songs for this user
    const userSongs = useMemo(() => {
        if (!user) return [];
        
        // 1. If viewing own profile, show my uploads and generations
        if (currentUser?.id === user.id) {
            return [...uploadedSongs, ...generatedSongs];
        }

        // 2. If viewing another musician, find songs where they are the artist
        // We search in MOCK_SONGS and globally uploaded songs (conceptually)
        // In this demo, uploadedSongs is local to session, so we can check it too.
        const allSongs = [...MOCK_SONGS, ...uploadedSongs, ...generatedSongs];
        return allSongs.filter(s => 
            s.artist.toLowerCase() === user.username.toLowerCase() || 
            s.artist.toLowerCase().includes(user.username.toLowerCase())
        );
    }, [user, currentUser, uploadedSongs, generatedSongs]);

    if (!user) return <div className="p-10 text-center text-slate-500">用户不存在</div>;

    const isOwnProfile = currentUser?.id === user.id;
    const isFollowing = currentUser?.followingIds?.includes(user.id);

    return (
        <div className="pb-32 animate-fade-in-up">
            {/* Header / Banner */}
            <div className="relative h-64 md:h-80 bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="absolute inset-0 bg-emerald-900/10"></div>
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-900 to-transparent"></div>
                
                <div className="absolute -bottom-16 left-6 md:left-12 flex items-end gap-6 z-10">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-slate-900 overflow-hidden shadow-2xl bg-slate-800">
                        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                    </div>
                    <div className="pb-4 mb-2">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-2">
                            {user.username}
                            {user.isVip && <Award size={24} className="text-amber-400" fill="currentColor" />}
                        </h1>
                        <div className="flex flex-wrap gap-2">
                             <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-600 text-xs text-slate-300 uppercase font-bold">
                                {user.role === 'musician' ? '音乐人' : user.role === 'admin' ? '管理员' : '用户'}
                             </span>
                             {user.role === 'musician' && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-xs text-emerald-400 uppercase font-bold flex items-center gap-1">
                                    <Mic2 size={12} /> 认证音乐人
                                </span>
                             )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="absolute bottom-6 right-6 md:right-12 z-10 flex gap-3">
                    {isOwnProfile ? (
                        <button 
                            onClick={openEditProfileModal}
                            className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 px-4 py-2 rounded-full font-medium transition flex items-center gap-2 text-sm shadow-lg"
                        >
                            <Edit3 size={16} /> 编辑资料
                        </button>
                    ) : (
                        <button 
                            onClick={() => toggleFollow(user.id)}
                            className={`px-6 py-2 rounded-full font-bold transition flex items-center gap-2 shadow-lg text-sm ${isFollowing ? 'bg-slate-700 text-slate-300 hover:bg-red-500/20 hover:text-red-400' : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20'}`}
                        >
                            {isFollowing ? (
                                <>
                                    <UserCheck size={18} /> 已关注
                                </>
                            ) : (
                                <>
                                    <UserPlus size={18} /> 关注
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-20 px-6 md:px-12 flex gap-8 border-b border-slate-800 pb-4 mb-8 text-sm">
                <div className="flex gap-1">
                    <span className="font-bold text-white text-lg">{user.followers || 0}</span>
                    <span className="text-slate-500 mt-1">粉丝</span>
                </div>
                <div className="flex gap-1">
                    <span className="font-bold text-white text-lg">{user.following || 0}</span>
                    <span className="text-slate-500 mt-1">关注</span>
                </div>
                {user.role === 'musician' && (
                    <div className="flex gap-1">
                        <span className="font-bold text-white text-lg">{userSongs.length}</span>
                        <span className="text-slate-500 mt-1">作品</span>
                    </div>
                )}
            </div>

            {/* Content Tabs */}
            <div className="px-6 md:px-12">
                <div className="flex gap-8 border-b border-slate-800 mb-8">
                     <button 
                        onClick={() => setActiveTab('creations')}
                        className={`pb-3 font-bold text-sm transition relative ${activeTab === 'creations' ? 'text-emerald-500' : 'text-slate-400 hover:text-white'}`}
                    >
                        作品与动态
                        {activeTab === 'creations' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full"></div>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('about')}
                        className={`pb-3 font-bold text-sm transition relative ${activeTab === 'about' ? 'text-emerald-500' : 'text-slate-400 hover:text-white'}`}
                    >
                        关于
                        {activeTab === 'about' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full"></div>}
                    </button>
                </div>

                {activeTab === 'about' ? (
                     <div className="max-w-2xl animate-slide-in-right">
                        <h3 className="text-lg font-bold text-white mb-4">个人简介</h3>
                        <p className="text-slate-300 leading-relaxed whitespace-pre-line mb-8 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                            {user.bio || "这个人很懒，什么都没有写。"}
                        </p>

                        <h3 className="text-lg font-bold text-white mb-4">详细信息</h3>
                        <div className="space-y-3 text-sm text-slate-400">
                             <div className="flex items-center gap-3">
                                <Calendar size={16} />
                                <span>注册于 2024年</span>
                             </div>
                             <div className="flex items-center gap-3">
                                <MapPin size={16} />
                                <span>火星, 希腊平原</span>
                             </div>
                             <div className="flex items-center gap-3">
                                <LinkIcon size={16} />
                                <span className="text-emerald-400 hover:underline cursor-pointer">nebula.music/{user.username.replace(/\s+/g, '').toLowerCase()}</span>
                             </div>
                        </div>
                     </div>
                ) : (
                    <div className="animate-slide-in-right">
                        {userSongs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {userSongs.map((song, i) => (
                                    <SongCard key={i} song={song} onPlay={() => playPlaylist(userSongs, i)} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center text-slate-500 flex flex-col items-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-800/20">
                                <Music size={48} className="mb-4 opacity-20" />
                                <p className="text-lg font-medium mb-1">暂无作品</p>
                                <p className="text-sm opacity-70">
                                    {isOwnProfile ? "快去创作或上传你的第一首音乐吧！" : "该用户暂时还没有发布公开作品。"}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
