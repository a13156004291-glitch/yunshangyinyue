
import React from 'react';
import { Settings as SettingsIcon, Volume2, Shield, User, Palette, Check, Mic2, Award, Mail, Phone, Database, LayoutDashboard } from 'lucide-react';
import { useTheme, themes, ThemeId } from '../context/ThemeContext';
import { usePlayer } from '../context/PlayerContext';
import { useUser } from '../context/UserContext';
import { SoundQuality } from '../types';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { currentTheme, setTheme } = useTheme();
  const { volume, setVolume, soundQuality, setSoundQuality, resetAllData, showConfirm } = usePlayer();
  const { currentUser, isAuthenticated, openLogin, logout, openApplyModal } = useUser();
  const navigate = useNavigate();

  const handleReset = () => {
      showConfirm(
          '重置应用数据',
          '警告：此操作将清除所有本地数据（包括上传的歌曲、创建的歌单、播放历史等）并恢复出厂设置。确定继续吗？',
          resetAllData,
          { isDangerous: true, confirmText: '彻底重置' }
      );
  };

  return (
    <div className="p-8 pb-32 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <SettingsIcon /> 设置
        </h1>

        <div className="space-y-8">
            {/* Account */}
            <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <User size={20} className="text-emerald-500" /> 账号与安全
                </h2>
                
                {isAuthenticated && currentUser ? (
                    <div className="flex flex-col md:flex-row md:items-center gap-6 mb-4">
                        <img src={currentUser.avatar} alt="avatar" className="w-20 h-20 rounded-full border-4 border-slate-700" />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="font-bold text-xl text-white">{currentUser.username}</div>
                                {currentUser.role === 'admin' && (
                                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30 flex items-center gap-1">
                                        <Shield size={10} /> 管理员
                                    </span>
                                )}
                                {currentUser.role === 'musician' && (
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                                        <Mic2 size={10} /> 音乐人
                                    </span>
                                )}
                                {currentUser.isVip && (
                                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                                        <Award size={10} /> VIP
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-slate-400 mb-2">ID: {currentUser.id}</div>
                            
                            {/* Bound Contact Info */}
                            <div className="flex gap-4 mb-2 text-sm">
                                {currentUser.email && (
                                    <div className="flex items-center gap-1 text-slate-300 bg-slate-700/50 px-2 py-1 rounded">
                                        <Mail size={14} className="text-emerald-500"/>
                                        <span>{currentUser.email}</span>
                                    </div>
                                )}
                                {currentUser.phone && (
                                    <div className="flex items-center gap-1 text-slate-300 bg-slate-700/50 px-2 py-1 rounded">
                                        <Phone size={14} className="text-emerald-500"/>
                                        <span>{currentUser.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</span>
                                    </div>
                                )}
                            </div>

                            {currentUser.role === 'admin' && (
                                <button 
                                    onClick={() => navigate('/admin')}
                                    className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 mt-2 shadow-lg shadow-red-500/20"
                                >
                                    <LayoutDashboard size={14} /> 进入后台管理
                                </button>
                            )}

                            {currentUser.role === 'user' && currentUser.musicianStatus === 'none' && (
                                <button 
                                    onClick={openApplyModal}
                                    className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 mt-2"
                                >
                                    申请成为音乐人 &rarr;
                                </button>
                            )}
                             {currentUser.musicianStatus === 'pending' && (
                                <span className="text-xs text-yellow-400 mt-2 block">音乐人资格审核中...</span>
                            )}
                        </div>
                        <button 
                            onClick={logout}
                            className="px-4 py-2 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition text-sm"
                        >
                            退出登录
                        </button>
                    </div>
                ) : (
                     <div className="flex flex-col items-center justify-center py-6 text-center">
                        <p className="text-slate-400 mb-4">登录以同步您的偏好设置和收藏。</p>
                        <button 
                            onClick={openLogin}
                            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg transition font-bold"
                        >
                            立即登录
                        </button>
                    </div>
                )}
            </section>

            {/* Appearance - Functional */}
             <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                 <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Palette size={20} className="text-emerald-500" /> 外观与主题
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(Object.entries(themes) as [ThemeId, typeof themes[ThemeId]][]).map(([key, theme]) => (
                        <button
                            key={key}
                            onClick={() => setTheme(key)}
                            className={`relative h-24 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all duration-300 group overflow-hidden ${currentTheme === key ? 'border-emerald-500 bg-slate-900 shadow-lg shadow-emerald-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'}`}
                        >
                            <div className={`w-8 h-8 rounded-full shadow-md ${theme.preview} flex items-center justify-center`}>
                                {currentTheme === key && <Check size={16} className="text-white" />}
                            </div>
                            <span className={`text-sm font-bold ${currentTheme === key ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                {theme.name}
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Playback */}
            <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                 <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Volume2 size={20} className="text-emerald-500" /> 播放与音质
                </h2>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-300">在线播放音质</span>
                        <select 
                            value={soundQuality}
                            onChange={(e) => setSoundQuality(e.target.value as SoundQuality)}
                            className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-sm outline-none text-slate-300 focus:border-emerald-500 transition cursor-pointer"
                        >
                            <option value="standard">标准 (128k)</option>
                            <option value="high">极高 (320k)</option>
                            <option value="lossless">无损 (FLAC)</option>
                        </select>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-300">淡入淡出效果</span>
                        <div className="w-10 h-6 bg-emerald-500 rounded-full relative cursor-pointer opacity-90 hover:opacity-100 transition">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-slate-300">默认音量</span>
                        <div className="w-32">
                             <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.1" 
                                value={volume} 
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                        </div>
                    </div>
                    
                    {/* Shortcuts Legend */}
                    <div className="pt-4 border-t border-slate-700/50">
                        <h3 className="text-sm font-bold text-slate-400 mb-3">键盘快捷键</h3>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                             <div className="flex justify-between"><span>空格 (Space)</span> <span>播放/暂停</span></div>
                             <div className="flex justify-between"><span>左/右箭头</span> <span>快退/快进</span></div>
                             <div className="flex justify-between"><span>上/下箭头</span> <span>音量调节</span></div>
                             <div className="flex justify-between"><span>/ (Slash)</span> <span>聚焦搜索</span></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* System Reset */}
            <section className="bg-red-900/10 rounded-xl p-6 border border-red-500/20">
                 <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                    <Database size={20} /> 危险区域
                </h2>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-slate-300 font-medium">重置应用数据</p>
                        <p className="text-xs text-slate-500 mt-1">清除所有缓存、播放历史和本地上传，恢复出厂设置。</p>
                    </div>
                    <button 
                        onClick={handleReset}
                        className="px-4 py-2 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition text-sm font-bold"
                    >
                        重置所有数据
                    </button>
                </div>
            </section>

            <div className="text-center text-slate-500 text-sm mt-12 pb-4">
                云上爱音乐 v1.5.0 &bull; Powered by Gemini
            </div>
        </div>
    </div>
  );
};

export default Settings;
