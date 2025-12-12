import React, { useState } from 'react';
import { SoundQuality } from '../types';
import { Download, Check, X, Crown } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useUser } from '../context/UserContext';

const DownloadModal = () => {
    const { downloadSongTarget, closeDownloadModal, downloadSong } = usePlayer();
    const { currentUser } = useUser();
    const [selectedQuality, setSelectedQuality] = useState<SoundQuality>('high');

    if (!downloadSongTarget) return null;

    const handleDownload = () => {
        downloadSong(downloadSongTarget, selectedQuality);
        // Note: Modal will be closed by PlayerContext if download is blocked for VIP
        // But if allowed, we close it here. If blocked, context also sets target to null.
        // It's safe to call close here as well for success case.
        if (!((selectedQuality === 'high' || selectedQuality === 'lossless') && !currentUser?.isVip)) {
             closeDownloadModal();
        }
    };

    const getSize = (q: SoundQuality, duration: number) => {
        // Estimate size: 128kbps = ~1MB/min, 320kbps = ~2.4MB/min, Flac = ~7MB/min
        const minutes = (duration || 180) / 60;
        if (q === 'standard') return (minutes * 1).toFixed(1) + ' MB';
        if (q === 'high') return (minutes * 2.4).toFixed(1) + ' MB';
        if (q === 'lossless') return (minutes * 7).toFixed(1) + ' MB';
        return 'Unknown';
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeDownloadModal}></div>
             <div className="relative bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
                <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Download size={20} className="text-emerald-500" />
                        下载歌曲
                    </h3>
                     <button onClick={closeDownloadModal} className="text-slate-400 hover:text-white transition bg-slate-800 rounded-full p-1">
                        <X size={18}/>
                     </button>
                </div>
                
                <div className="p-6 space-y-6 bg-slate-900/50">
                    <div className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                        <img src={downloadSongTarget.coverUrl} className="w-14 h-14 rounded-lg object-cover shadow-sm" alt="" />
                        <div className="min-w-0">
                            <div className="font-bold text-white truncate">{downloadSongTarget.title}</div>
                            <div className="text-xs text-slate-400 truncate">{downloadSongTarget.artist}</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider ml-1">选择音质</p>
                        
                        {(['standard', 'high', 'lossless'] as SoundQuality[]).map((q) => {
                             const isVipOnly = q === 'high' || q === 'lossless';
                             const isLocked = isVipOnly && !currentUser?.isVip;

                             return (
                                <div 
                                    key={q}
                                    onClick={() => setSelectedQuality(q)}
                                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                                        selectedQuality === q 
                                            ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                                            : 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600'
                                    }`}
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-medium text-sm ${selectedQuality === q ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                {q === 'standard' && '标准音质'}
                                                {q === 'high' && '极高音质'}
                                                {q === 'lossless' && '无损音质'}
                                            </span>
                                            {isVipOnly && (
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5 font-bold ${isLocked ? 'bg-slate-700 text-slate-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                    <Crown size={10} fill={isLocked ? "none" : "currentColor"} /> VIP
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-mono">
                                            {q === 'standard' && 'MP3 - 128kbit/s'}
                                            {q === 'high' && 'MP3 - 320kbit/s'}
                                            {q === 'lossless' && 'FLAC - Hi-Res Audio'}
                                            {' • '}
                                            {getSize(q, downloadSongTarget.duration)}
                                        </span>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedQuality === q ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                                        {selectedQuality === q && <Check size={12} className="text-white" />}
                                    </div>
                                </div>
                             );
                        })}
                    </div>

                    <button 
                        onClick={handleDownload}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        {(selectedQuality === 'high' || selectedQuality === 'lossless') && !currentUser?.isVip ? (
                            <>
                                <Crown size={18} /> 开通 VIP 下载
                            </>
                        ) : (
                            <>
                                立即下载
                            </>
                        )}
                    </button>
                </div>
             </div>
        </div>
    );
};

export default DownloadModal;