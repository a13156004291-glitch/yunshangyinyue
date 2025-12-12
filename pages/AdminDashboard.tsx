import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { usePlayer } from '../context/PlayerContext';
import { Shield, Check, X, User, AlertCircle, Clock, Trash2, RotateCcw, BarChart3, Users, Mic2, Crown, LayoutDashboard, Settings, Ticket, Plus, Edit3, Music } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '../types';

const AdminDashboard = () => {
  const { currentUser, users, reviewMusicianApplication, deleteUser, adminResetUserPassword, updateUser, discountCodes, createDiscountCode, deleteDiscountCode, systemSettings, updateSystemSettings } = useUser();
  const { showConfirm, uploadedSongs, deleteUploadedSong, playSong } = usePlayer();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'marketing' | 'settings' | 'music'>('overview');
  
  // Marketing Form State
  const [newCode, setNewCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState(10);

  // Settings Form State
  const [announcement, setAnnouncement] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
      if (systemSettings) {
          setAnnouncement(systemSettings.announcement);
          setMaintenanceMode(systemSettings.maintenanceMode);
      }
  }, [systemSettings]);

  // Route protection
  if (!currentUser || currentUser.role !== 'admin') {
      return <Navigate to="/" replace />;
  }

  const pendingApplications = users.filter(u => u.musicianStatus === 'pending');
  const allUsers = users.filter(u => u.id !== currentUser.id); // Exclude self
  const musicians = users.filter(u => u.role === 'musician');
  const vips = users.filter(u => u.isVip);

  const handleDeleteUser = (userId: string, username: string) => {
      showConfirm(
          '删除用户',
          `确定要永久删除用户 "${username}" 吗？此操作无法撤销。`,
          () => deleteUser(userId),
          { isDangerous: true, confirmText: '确认删除' }
      );
  };

  const handleResetPassword = (userId: string, username: string) => {
      showConfirm(
          '重置密码',
          `确定要将用户 "${username}" 的密码重置为 "password123" 吗？`,
          () => adminResetUserPassword(userId),
          { confirmText: '重置' }
      );
  };
  
  const handleToggleVip = (userId: string, currentStatus: boolean) => {
      updateUser(userId, { isVip: !currentStatus });
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
      updateUser(userId, { role: newRole });
  };

  const handleEditUserInfo = (userId: string, currentName: string, currentBio: string) => {
      // For simplicity in this demo, using prompt. In a real app, use a modal.
      const newName = prompt("修改用户昵称:", currentName);
      if (newName !== null && newName !== currentName) {
          updateUser(userId, { username: newName });
      }
      
      const newBio = prompt("修改用户简介:", currentBio || "");
      if (newBio !== null && newBio !== currentBio) {
          updateUser(userId, { bio: newBio });
      }
  };

  const handleDeleteSong = (songId: string, songTitle: string) => {
      showConfirm(
          '删除歌曲',
          `确定要永久删除/下架歌曲 "${songTitle}" 吗？此操作无法撤销。`,
          () => deleteUploadedSong(songId),
          { isDangerous: true, confirmText: '确认删除' }
      );
  };

  const handleCreateCode = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCode.trim()) return;
      createDiscountCode(newCode, discountType, discountValue);
      setNewCode('');
      setDiscountValue(10);
  };

  const handleUpdateSettings = () => {
      updateSystemSettings({ announcement, maintenanceMode });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
      <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl flex items-center gap-4">
          <div className={`p-4 rounded-full ${color} bg-opacity-20 text-white`}>
              <Icon size={24} className={color.replace('bg-', 'text-')} />
          </div>
          <div>
              <p className="text-slate-400 text-sm font-medium">{label}</p>
              <p className="text-2xl font-bold text-white">{value}</p>
          </div>
      </div>
  );

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto animate-fade-in-up">
        {/* Header */}
        <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-xl text-red-500 shadow-lg shadow-red-500/10">
                    <Shield size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">后台管理系统</h1>
                    <p className="text-slate-400 text-sm mt-1">超级管理员: {currentUser.username}</p>
                </div>
            </div>
            <div className="flex gap-2">
                 <button 
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 ${activeTab === 'overview' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                 >
                     <LayoutDashboard size={16} /> 概览
                 </button>
                 <button 
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 ${activeTab === 'users' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                 >
                     <Users size={16} /> 用户管理
                 </button>
                 <button 
                    onClick={() => setActiveTab('music')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 ${activeTab === 'music' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                 >
                     <Music size={16} /> 音乐管理
                 </button>
                 <button 
                    onClick={() => setActiveTab('marketing')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 ${activeTab === 'marketing' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                 >
                     <Ticket size={16} /> 营销中心
                 </button>
                 <button 
                    onClick={() => setActiveTab('settings')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 ${activeTab === 'settings' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                 >
                     <Settings size={16} /> 系统设置
                 </button>
            </div>
        </div>

        {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in-up">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={Users} label="总用户数" value={users.length} color="bg-blue-500" />
                    <StatCard icon={Crown} label="VIP 会员" value={vips.length} color="bg-amber-500" />
                    <StatCard icon={Mic2} label="认证音乐人" value={musicians.length} color="bg-emerald-500" />
                    <StatCard icon={Clock} label="待审核申请" value={pendingApplications.length} color="bg-violet-500" />
                </div>

                {/* Pending Applications Section */}
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Clock className="text-violet-500" /> 待审核音乐人申请
                        </h2>
                        <span className="text-xs font-bold bg-violet-500/20 text-violet-300 px-2 py-1 rounded-full">
                            {pendingApplications.length} 待处理
                        </span>
                    </div>

                    <div className="p-6">
                        {pendingApplications.length > 0 ? (
                            <div className="grid gap-4">
                                {pendingApplications.map(user => (
                                    <div key={user.id} className="bg-slate-900 border border-slate-700 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm hover:border-violet-500/50 transition">
                                        <div className="relative">
                                            <img src={user.avatar} alt={user.username} className="w-16 h-16 rounded-full object-cover border-2 border-slate-600" />
                                            <div className="absolute -bottom-1 -right-1 bg-violet-500 text-white rounded-full p-1 border border-slate-900">
                                                <Mic2 size={12} />
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-bold text-white">{user.username}</h3>
                                                <div className="flex gap-2 text-xs">
                                                     <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-400">ID: {user.id}</span>
                                                </div>
                                            </div>
                                            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 mt-2">
                                                <p className="text-sm text-slate-300 italic">"{user.bio}"</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 w-full md:w-auto">
                                            <button 
                                                onClick={() => reviewMusicianApplication(user.id, true)}
                                                className="flex-1 md:flex-none px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-bold transition flex items-center justify-center gap-2"
                                            >
                                                <Check size={18} /> 通过
                                            </button>
                                            <button 
                                                onClick={() => reviewMusicianApplication(user.id, false)}
                                                className="flex-1 md:flex-none px-6 py-2 bg-slate-700 hover:bg-red-500 text-white rounded-lg font-bold transition flex items-center justify-center gap-2"
                                            >
                                                <X size={18} /> 拒绝
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-slate-500 flex flex-col items-center">
                                <Check size={48} className="mb-4 text-emerald-500 opacity-20" />
                                <p>所有申请已处理完毕</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'users' && (
            <div className="animate-fade-in-up">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
                         <h2 className="font-bold text-white">用户列表</h2>
                         <div className="text-xs text-slate-400">共 {allUsers.length} 位用户</div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-900/50 text-xs uppercase font-bold text-slate-500">
                                <tr>
                                    <th className="px-6 py-3">用户</th>
                                    <th className="px-6 py-3">权限/角色</th>
                                    <th className="px-6 py-3">VIP</th>
                                    <th className="px-6 py-3">粉丝数</th>
                                    <th className="px-6 py-3 text-right">控制台</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {allUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-700/20 transition group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={user.avatar} alt="" className="w-10 h-10 rounded-full bg-slate-700" />
                                                <div>
                                                    <div className="font-bold text-white flex items-center gap-2">
                                                        {user.username}
                                                        <button 
                                                            onClick={() => handleEditUserInfo(user.id, user.username, user.bio || '')}
                                                            className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition"
                                                            title="编辑用户信息"
                                                        >
                                                            <Edit3 size={12} />
                                                        </button>
                                                    </div>
                                                    <div className="text-xs opacity-70">{user.email || user.phone || '无联系方式'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select 
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                                className={`bg-slate-900 border border-slate-600 text-xs rounded px-2 py-1 outline-none focus:border-emerald-500 cursor-pointer ${
                                                    user.role === 'admin' ? 'text-red-400' :
                                                    user.role === 'musician' ? 'text-emerald-400' : 'text-slate-300'
                                                }`}
                                            >
                                                <option value="user">普通用户</option>
                                                <option value="musician">认证音乐人</option>
                                                <option value="admin">管理员</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => handleToggleVip(user.id, user.isVip)}
                                                className={`px-2 py-0.5 rounded text-xs font-bold border transition ${user.isVip ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/10' : 'text-slate-500 border-slate-700 hover:text-amber-400 hover:border-amber-500/50'}`}
                                            >
                                                {user.isVip ? '已开通' : '未开通'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 font-mono">
                                            {user.followers || 0}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleResetPassword(user.id, user.username)}
                                                    className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 rounded-lg transition"
                                                    title="重置密码"
                                                >
                                                    <RotateCcw size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteUser(user.id, user.username)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                                                    title="删除用户"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'music' && (
            <div className="animate-fade-in-up">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
                         <h2 className="font-bold text-white flex items-center gap-2"><Music size={18}/> 平台歌曲管理</h2>
                         <div className="text-xs text-slate-400">共 {uploadedSongs.length} 首上传作品</div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-900/50 text-xs uppercase font-bold text-slate-500">
                                <tr>
                                    <th className="px-6 py-3">歌曲信息</th>
                                    <th className="px-6 py-3">歌手/上传者</th>
                                    <th className="px-6 py-3">时长</th>
                                    <th className="px-6 py-3">品质</th>
                                    <th className="px-6 py-3 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {uploadedSongs.length > 0 ? uploadedSongs.map(song => (
                                    <tr key={song.id} className="hover:bg-slate-700/20 transition group cursor-pointer" onClick={() => playSong(song)}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                                                    <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                                        <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[8px] border-l-white border-b-[4px] border-b-transparent ml-0.5"></div>
                                                    </div>
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-white truncate max-w-[150px]">{song.title}</div>
                                                    <div className="text-xs opacity-70 truncate max-w-[150px]">{song.album}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-300 hover:text-emerald-400 transition">{song.artist}</span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">
                                            {formatTime(song.duration)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {song.quality === 'lossless' && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/30">HR</span>}
                                            {song.quality === 'high' && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">HQ</span>}
                                            {(!song.quality || song.quality === 'standard') && <span className="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">SQ</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteSong(song.id, song.title); }}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                                                title="下架/删除歌曲"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            暂无用户上传的歌曲
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'marketing' && (
            <div className="animate-fade-in-up grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Code Form */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 h-fit">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Plus className="text-emerald-500" /> 创建优惠码
                    </h3>
                    <form onSubmit={handleCreateCode} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">优惠码代码</label>
                            <input 
                                type="text" 
                                value={newCode}
                                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                                placeholder="例如: VIP2024"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 uppercase font-mono tracking-wider"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">类型</label>
                                <select 
                                    value={discountType}
                                    onChange={(e) => setDiscountType(e.target.value as any)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                >
                                    <option value="percent">折扣 (%)</option>
                                    <option value="fixed">直减 (元)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">数值</label>
                                <input 
                                    type="number" 
                                    value={discountValue}
                                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                    min="1"
                                />
                            </div>
                        </div>
                        <button 
                            type="submit"
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-emerald-500/20 mt-2"
                        >
                            创建优惠码
                        </button>
                    </form>
                </div>

                {/* Code List */}
                <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
                         <h2 className="font-bold text-white flex items-center gap-2"><Ticket size={18}/> 有效优惠码</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-900/50 text-xs uppercase font-bold text-slate-500">
                                <tr>
                                    <th className="px-6 py-3">代码</th>
                                    <th className="px-6 py-3">优惠内容</th>
                                    <th className="px-6 py-3">状态</th>
                                    <th className="px-6 py-3 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {discountCodes.length > 0 ? discountCodes.map(code => (
                                    <tr key={code.id} className="hover:bg-slate-700/20 transition">
                                        <td className="px-6 py-4 font-mono font-bold text-emerald-400 tracking-wider">
                                            {code.code}
                                        </td>
                                        <td className="px-6 py-4">
                                            {code.type === 'percent' ? `-${code.value}% 折扣` : `立减 ¥${code.value}`}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-xs border border-emerald-500/20">生效中</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => deleteDiscountCode(code.id)}
                                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded transition"
                                                title="删除"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                            暂无优惠码
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'settings' && (
             <div className="animate-fade-in-up space-y-6">
                 <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                     <h3 className="text-xl font-bold text-white mb-4">系统公告</h3>
                     <textarea 
                        value={announcement}
                        onChange={(e) => setAnnouncement(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-white focus:outline-none focus:border-emerald-500 h-32"
                        placeholder="发布全站公告..."
                     ></textarea>
                     <div className="mt-4 flex justify-end">
                         <button onClick={handleUpdateSettings} className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2 rounded-lg font-bold transition">发布公告 / 保存设置</button>
                     </div>
                 </div>

                 <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                     <h3 className="text-xl font-bold text-white mb-4">系统维护</h3>
                     <div className="flex items-center justify-between">
                         <div>
                             <p className="text-white font-medium">维护模式</p>
                             <p className="text-sm text-slate-400">开启后普通用户将无法访问网站，仅管理员可登录。</p>
                         </div>
                         <div 
                            className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer ${maintenanceMode ? 'bg-emerald-500' : 'bg-slate-700'}`}
                            onClick={() => { setMaintenanceMode(!maintenanceMode); handleUpdateSettings(); }} // In real world you might want to confirm before update here
                         >
                             <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${maintenanceMode ? 'translate-x-6' : ''}`}></div>
                         </div>
                     </div>
                 </div>
             </div>
        )}
    </div>
  );
};

export default AdminDashboard;
