import React, { useState, useEffect, useRef } from 'react';
import { X, Copy, Share2, Check, Download, QrCode, ExternalLink, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useToast } from '../context/ToastContext';

const ShareModal = () => {
  const { isShareModalOpen, closeShareModal, shareTarget } = usePlayer();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [lyricQuote, setLyricQuote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (shareTarget && shareTarget.lyrics) {
        // Extract a meaningful line from lyrics (simple logic: find longest line in first few lines)
        const lines = shareTarget.lyrics.split('\n')
            .map(l => l.replace(/\[.*?\]/g, '').trim()) // Remove timestamps
            .filter(l => l.length > 5 && l.length < 20); // Filter suitable length
        
        if (lines.length > 0) {
            // Pick a random line from the candidates
            setLyricQuote(lines[Math.floor(Math.random() * Math.min(5, lines.length))]);
        } else {
            setLyricQuote('云上爱音乐，发现好音乐');
        }
    } else {
        setLyricQuote('云上爱音乐，发现好音乐');
    }
  }, [shareTarget]);

  if (!isShareModalOpen || !shareTarget) return null;

  const shareLink = `${window.location.origin}/#/song/${shareTarget.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareLink)}&bgcolor=1e293b&color=10b981`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`来听听这就歌《${shareTarget.title}》\n${shareLink}`);
    setCopied(true);
    showToast('链接已复制到剪贴板', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveImage = () => {
      setIsSaving(true);
      // Simulate image generation and download
      setTimeout(() => {
          setIsSaving(false);
          showToast('音乐卡片已保存到相册', 'success');
          closeShareModal();
      }, 1500);
  };

  const socialApps = [
      { id: 'wechat', name: '微信', icon: <QrCode size={24}/>, color: 'text-[#07c160]', bg: 'bg-[#07c160]/10' },
      { id: 'moments', name: '朋友圈', icon: <ImageIcon size={24}/>, color: 'text-[#07c160]', bg: 'bg-[#07c160]/10' },
      { id: 'weibo', name: '微博', icon: <ExternalLink size={24}/>, color: 'text-[#ff8200]', bg: 'bg-[#ff8200]/10' },
      { id: 'qq', name: 'QQ', icon: <ExternalLink size={24}/>, color: 'text-[#12b7f5]', bg: 'bg-[#12b7f5]/10' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeShareModal}></div>
      
      <div className="relative w-full max-w-4xl grid md:grid-cols-2 gap-0 bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up border border-slate-700">
        
        {/* Left: Visual Card Preview */}
        <div className="relative p-8 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
             {/* Ambient Background */}
             <div className="absolute inset-0 z-0">
                 <img src={shareTarget.coverUrl} className="w-full h-full object-cover opacity-30 blur-3xl scale-125" alt="" />
                 <div className="absolute inset-0 bg-slate-900/40"></div>
             </div>

             {/* The Card */}
             <div className="relative z-10 w-full max-w-sm bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 transform transition hover:scale-[1.02] duration-500">
                 <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg">
                     <img src={shareTarget.coverUrl} className="w-full h-full object-cover" alt={shareTarget.title} />
                     <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-white font-bold tracking-widest border border-white/10">
                         CLOUD MUSIC
                     </div>
                 </div>
                 
                 <div className="text-center space-y-1">
                     <h3 className="text-xl font-bold text-white leading-tight">{shareTarget.title}</h3>
                     <p className="text-emerald-400 text-sm">{shareTarget.artist}</p>
                 </div>

                 <div className="relative py-4">
                     <span className="absolute top-0 left-0 text-4xl text-slate-700 font-serif leading-none">“</span>
                     <p className="text-slate-300 text-sm text-center italic font-serif px-6 leading-relaxed">
                         {lyricQuote}
                     </p>
                     <span className="absolute bottom-0 right-0 text-4xl text-slate-700 font-serif leading-none">”</span>
                 </div>

                 <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                     <div className="flex flex-col">
                         <span className="text-[10px] text-slate-500 uppercase tracking-wider">Scan to listen</span>
                         <span className="text-xs font-bold text-white">云上爱音乐</span>
                     </div>
                     <div className="bg-white p-1 rounded-lg">
                         <img src={qrCodeUrl} alt="QR" className="w-12 h-12" />
                     </div>
                 </div>
             </div>
        </div>

        {/* Right: Actions */}
        <div className="bg-slate-900 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Share2 size={20} className="text-emerald-500" />
                    分享歌曲
                </h3>
                <button onClick={closeShareModal} className="text-slate-400 hover:text-white transition bg-slate-800 rounded-full p-1">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 space-y-6">
                <div className="grid grid-cols-4 gap-4">
                    {socialApps.map(app => (
                        <button key={app.id} className="flex flex-col items-center gap-2 group" onClick={() => showToast(`已唤起${app.name}分享`, 'success')}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${app.bg} ${app.color}`}>
                                {app.icon}
                            </div>
                            <span className="text-xs text-slate-400 group-hover:text-white transition">{app.name}</span>
                        </button>
                    ))}
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">歌曲链接</label>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-slate-950 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 truncate font-mono">
                            {shareLink}
                        </div>
                        <button 
                            onClick={handleCopy}
                            className={`px-3 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                        >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            {copied ? '已复制' : '复制'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
                <button 
                    onClick={handleSaveImage}
                    disabled={isSaving}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                    {isSaving ? (
                        <span className="animate-pulse">正在生成图片...</span>
                    ) : (
                        <>
                            <Download size={20} /> 保存分享卡片
                        </>
                    )}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ShareModal;