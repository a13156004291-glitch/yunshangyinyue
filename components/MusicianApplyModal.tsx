import React, { useState } from 'react';
import { X, Mic2, FileText, CheckCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';

const MusicianApplyModal = () => {
  const { isApplyModalOpen, closeApplyModal, applyForMusician, currentUser } = useUser();
  const [artistName, setArtistName] = useState(currentUser?.username || '');
  const [bio, setBio] = useState('');
  const [genre, setGenre] = useState('');

  if (!isApplyModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (artistName && bio) {
        applyForMusician(artistName, bio);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeApplyModal}></div>
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Mic2 className="text-emerald-500" /> 申请成为音乐人
            </h2>
            <button onClick={closeApplyModal} className="text-slate-400 hover:text-white transition">
                <X size={24} />
            </button>
        </div>

        <div className="p-8">
            <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex gap-3">
                <div className="mt-0.5"><CheckCircle size={18} className="text-emerald-500" /></div>
                <div className="text-sm text-emerald-100">
                    <p className="font-bold mb-1">成为音乐人权益：</p>
                    <ul className="list-disc pl-4 space-y-1 text-emerald-100/70">
                        <li>无限上传原创音乐作品</li>
                        <li>使用高级 AI 音乐生成工具</li>
                        <li>获得 "音乐人" 专属认证标识</li>
                        <li>作品优先推荐至首页和排行榜</li>
                    </ul>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">艺名 / 音乐人名称</label>
                    <input 
                        type="text" 
                        value={artistName}
                        onChange={(e) => setArtistName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">主要流派</label>
                    <input 
                        type="text" 
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        placeholder="例如：流行, 电子, 摇滚..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">个人简介 / 音乐理念</label>
                    <textarea 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none h-32"
                        placeholder="向听众介绍一下你自己..."
                        required
                    />
                </div>

                <div className="pt-2">
                    <button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                    >
                        提交申请
                    </button>
                    <p className="text-center text-xs text-slate-500 mt-4">
                        提交即代表您承诺上传的内容不侵犯他人版权
                    </p>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default MusicianApplyModal;
