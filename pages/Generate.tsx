import React from 'react';
import { Mic2, Lock, ArrowRight, CloudUpload, Music, Play, Trash2, CheckCircle, Upload } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useUser } from '../context/UserContext';
import SongCard from '../components/SongCard';

const Generate = () => {
  const { playPlaylist, uploadedSongs, setUploadModalOpen, deleteUploadedSong, showConfirm } = usePlayer();
  const { currentUser, isAuthenticated, openLogin, openApplyModal } = useUser();

  const handleUploadClick = () => {
      setUploadModalOpen(true);
  }

  const handleDeleteWork = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      showConfirm(
          '删除作品',
          '确定要删除这首原创作品吗？此操作无法撤销。',
          () => deleteUploadedSong(id),
          { isDangerous: true, confirmText: '确认删除' }
      );
  }

  // 1. Auth Check View (Not Logged In)
  if (!isAuthenticated) {
      return (
          <div className="p-8 pb-32 h-full flex items-center justify-center animate-fade-in-up">
              <div className="bg-slate-800/50 p-10 rounded-2xl border border-slate-700/50 max-w-md w-full text-center shadow-2xl backdrop-blur-md">
                   <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-500 relative">
                       <Mic2 size={48} />
                       <div className="absolute top-0 right-0 bg-slate-900 rounded-full p-1 border border-slate-700">
                           <Lock size={16} className="text-slate-400" />
                       </div>
                   </div>
                   <h2 className="text-3xl font-bold text-white mb-4">音乐人中心</h2>
                   <p className="text-slate-400 mb-8 leading-relaxed">
                       登录云上爱音乐，申请成为认证音乐人，上传并发布您的原创作品，与数百万听众分享您的旋律。
                   </p>
                   <button 
                       onClick={openLogin}
                       className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-emerald-500/20 text-lg"
                   >
                       立即登录
                   </button>
              </div>
          </div>
      )
  }

  // 2. Non-Musician View (Apply to be a Musician)
  if (currentUser?.role !== 'musician') {
      return (
        <div className="p-8 pb-32 h-full flex items-center justify-center animate-fade-in-up">
            <div className="bg-slate-800/50 p-10 rounded-2xl border border-slate-700/50 max-w-2xl w-full text-center shadow-2xl backdrop-blur-md">
                 <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/20">
                     <Mic2 size={48} className="text-white" />
                 </div>
                 
                 <h2 className="text-3xl font-bold text-white mb-2">申请成为认证音乐人</h2>
                 <p className="text-emerald-400 font-medium mb-8">加入云上爱音乐创作者计划</p>

                 <div className="grid md:grid-cols-3 gap-6 mb-10 text-left">
                     <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50">
                         <div className="mb-3 text-emerald-500"><CloudUpload size={24} /></div>
                         <h4 className="font-bold text-white mb-1">无限发布</h4>
                         <p className="text-xs text-slate-400">无限制上传您的原创音乐作品，支持高品质无损音频。</p>
                     </div>
                     <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50">
                         <div className="mb-3 text-emerald-500"><CheckCircle size={24} /></div>
                         <h4 className="font-bold text-white mb-1">官方认证</h4>
                         <p className="text-xs text-slate-400">获得专属音乐人标识，提升个人品牌影响力。</p>
                     </div>
                     <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50">
                         <div className="mb-3 text-emerald-500"><Music size={24} /></div>
                         <h4 className="font-bold text-white mb-1">流量扶持</h4>
                         <p className="text-xs text-slate-400">优秀作品将有机会获得首页推荐和官方歌单收录。</p>
                     </div>
                 </div>

                 {currentUser.musicianStatus === 'pending' ? (
                     <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-yellow-400 flex items-center justify-center gap-2">
                         <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                         <span>您的申请正在审核中，请耐心等待...</span>
                     </div>
                 ) : (
                     <button 
                        onClick={openApplyModal}
                        className="w-full md:w-auto px-12 bg-white text-slate-900 hover:bg-slate-200 font-bold py-4 rounded-full transition shadow-lg flex items-center justify-center gap-2 mx-auto"
                    >
                        立即申请 <ArrowRight size={20} />
                    </button>
                 )}
            </div>
        </div>
      )
  }

  // 3. Musician Dashboard (Upload & Manage)
  return (
    <div className="p-8 pb-32 h-full overflow-y-auto custom-scrollbar animate-fade-in-up">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                    <Mic2 className="text-emerald-500" size={40} />
                    音乐人工作台
                </h1>
                <p className="text-slate-400 text-lg">
                    管理您的原创作品，查看数据表现。
                </p>
            </div>
            <button 
                onClick={handleUploadClick}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-8 rounded-full transition shadow-lg shadow-emerald-500/20 flex items-center gap-2 hover:scale-105 active:scale-95"
            >
                <CloudUpload size={20} /> 发布新作品
            </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
                <p className="text-slate-400 text-sm font-medium mb-2">已发布作品</p>
                <div className="text-3xl font-bold text-white">{uploadedSongs.length}</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
                <p className="text-slate-400 text-sm font-medium mb-2">总播放量</p>
                <div className="text-3xl font-bold text-white">-</div>
                <p className="text-xs text-slate-500 mt-2">数据每日更新</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
                <p className="text-slate-400 text-sm font-medium mb-2">粉丝数</p>
                <div className="text-3xl font-bold text-white">{currentUser.followers}</div>
            </div>
        </div>

        {/* Uploaded Songs List */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">作品管理</h3>
                {uploadedSongs.length > 0 && (
                     <button 
                        onClick={() => playPlaylist(uploadedSongs)}
                        className="text-emerald-400 hover:text-emerald-300 text-sm font-bold flex items-center gap-1"
                    >
                        <Play size={16} fill="currentColor" /> 播放全部
                    </button>
                )}
            </div>
            
            <div className="p-6">
                {uploadedSongs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {uploadedSongs.map((song, i) => (
                             <div key={`${song.id}-${i}`} className="relative group">
                                <SongCard 
                                    song={song} 
                                    onPlay={() => playPlaylist(uploadedSongs, i)}
                                />
                                <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition z-10">
                                     <button 
                                        onClick={(e) => handleDeleteWork(e, song.id)}
                                        className="p-1.5 bg-black/60 backdrop-blur-md rounded-full text-slate-300 hover:text-red-400 hover:bg-black/80 transition"
                                        title="删除作品"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-xl bg-slate-800/20">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Upload size={24} className="text-slate-500" />
                        </div>
                        <p className="text-slate-400 font-medium mb-4">暂无发布的作品</p>
                        <button 
                            onClick={handleUploadClick}
                            className="text-emerald-500 hover:text-emerald-400 font-bold hover:underline"
                        >
                            上传第一首歌曲
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Generate;