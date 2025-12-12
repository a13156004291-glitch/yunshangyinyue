import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Music, Image as ImageIcon, Loader2, CloudUpload, Tag, Globe, Calendar, Lock, ArrowRight, Mic2, AlertTriangle, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';
import { Song, SoundQuality } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [language, setLanguage] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [quality, setQuality] = useState<SoundQuality>('high');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const { addUploadedSong } = usePlayer();
  const { showToast } = useToast();
  const { currentUser, isAuthenticated, openLogin, openApplyModal } = useUser();

  useEffect(() => {
     if(isOpen) {
         if (isAuthenticated) setArtist(currentUser?.username || '');
         setIsAgreed(false);
         setLyrics('');
         setFile(null);
         setCoverFile(null);
         setTitle('');
         setTagsInput('');
         setUploadProgress(0);
         setLanguage('');
         setReleaseYear('');
     }
  }, [isOpen, isAuthenticated, currentUser]);

  if (!isOpen) return null;

  if (!isAuthenticated) {
       return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
             <div className="relative bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center animate-fade-in-up">
                 <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><Lock size={32} /></div>
                 <h3 className="text-xl font-bold text-white mb-2">需要登录</h3>
                 <p className="text-slate-400 mb-6">请先登录以使用上传功能。</p>
                 <button onClick={() => { onClose(); openLogin(); }} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition">去登录</button>
                 <button onClick={onClose} className="mt-4 text-sm text-slate-500 hover:text-white">取消</button>
             </div>
        </div>
       )
  }

  if (currentUser?.role !== 'musician') {
       return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
             <div className="relative bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center animate-fade-in-up">
                 <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500"><Mic2 size={32} /></div>
                 <h3 className="text-xl font-bold text-white mb-2">仅限音乐人</h3>
                 <p className="text-slate-400 mb-6">发布作品需要音乐人认证。</p>
                 <button onClick={() => { onClose(); openApplyModal(); }} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">申请成为音乐人 <ArrowRight size={18} /></button>
                 <button onClick={onClose} className="mt-4 text-sm text-slate-500 hover:text-white">取消</button>
             </div>
        </div>
       )
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  const processFile = (selectedFile: File) => {
    if (selectedFile.type.startsWith('audio/')) {
        setFile(selectedFile);
        const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");
        setTitle(fileName);
    } else {
        showToast('请上传有效的音频文件', 'error');
    }
  };

  const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
        const objectUrl = URL.createObjectURL(file);
        const audio = new Audio(objectUrl);
        audio.onloadedmetadata = () => { URL.revokeObjectURL(objectUrl); resolve(audio.duration); };
        audio.onerror = () => resolve(0);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !isAgreed) return;

    setIsUploading(true);
    setUploadProgress(10); // Start progress

    try {
      // 1. Get Duration locally before upload
      const duration = await getAudioDuration(file);
      setUploadProgress(20);

      // 2. Prepare FormData
      const formData = new FormData();
      formData.append('audio', file);
      if (coverFile) formData.append('cover', coverFile);
      
      formData.append('title', title);
      formData.append('artist', artist);
      formData.append('album', '原创作品');
      formData.append('duration', duration.toString());
      formData.append('quality', quality);
      formData.append('language', language || '未知');
      formData.append('releaseYear', releaseYear || new Date().getFullYear().toString());
      formData.append('lyrics', lyrics);
      
      const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);
      formData.append('tags', JSON.stringify(tags));
      if (currentUser) formData.append('uploaderId', currentUser.id);

      // 3. Upload via Fetch
      const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      setUploadProgress(100);
      
      // 4. Update Context with returned Song object
      const newSong: Song = await response.json();
      addUploadedSong(newSong);
      
      showToast('上传成功！所有用户均可听到您的作品', 'success');
      onClose();

    } catch (error) {
      console.error(error);
      showToast('上传失败，请检查网络或文件大小', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!isUploading ? onClose : undefined}></div>
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-800 shrink-0">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CloudUpload className="text-emerald-500" /> 上传音乐 (Server)
            </h2>
            {!isUploading && (
                <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                    <X size={24} />
                </button>
            )}
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                
                {/* File Drop Zone */}
                <div 
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${dragActive ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/50'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                >
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="audio/*" 
                        onChange={(e) => e.target.files && processFile(e.target.files[0])} 
                        className="hidden" 
                        disabled={isUploading}
                    />
                    
                    {file ? (
                        <div className="flex flex-col items-center justify-center gap-2 text-emerald-400">
                            <Music size={32} />
                            <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">{formatFileSize(file.size)}</span>
                        </div>
                    ) : (
                        <div className="space-y-2 text-slate-400">
                            <Upload className="mx-auto text-slate-500" size={32} />
                            <p className="text-sm font-medium">点击或拖拽音频文件到此处</p>
                            <p className="text-xs text-slate-500">支持 MP3, WAV, FLAC</p>
                        </div>
                    )}
                </div>

                {/* Metadata Inputs */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">歌曲标题</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50" required disabled={isUploading} />
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">歌手 / 艺术家</label>
                            <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50" required disabled={isUploading} />
                        </div>
                    </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1"><Globe size={12}/> 语言</label>
                            <input type="text" value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50" disabled={isUploading} />
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1"><Calendar size={12}/> 发行年份</label>
                            <input type="text" value={releaseYear} onChange={(e) => setReleaseYear(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50" disabled={isUploading} />
                        </div>
                    </div>
                     
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1"><Tag size={12}/> 风格标签</label>
                        <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50" disabled={isUploading} />
                    </div>

                    <div>
                         <label className="block text-xs font-medium text-slate-400 mb-1">音质标识</label>
                         <select value={quality} onChange={(e) => setQuality(e.target.value as SoundQuality)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-50" disabled={isUploading}>
                            <option value="standard">标准 (Standard)</option>
                            <option value="high">极高 (HQ)</option>
                            <option value="lossless">无损 (Lossless)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1"><FileText size={12}/> 歌词 (支持 LRC)</label>
                        <textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} placeholder="[00:00.00] 歌词..." className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 min-h-[100px] resize-y font-mono leading-relaxed disabled:opacity-50" disabled={isUploading} />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div 
                        className={`w-16 h-16 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center cursor-pointer overflow-hidden transition ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-emerald-500'}`}
                        onClick={() => !isUploading && coverInputRef.current?.click()}
                    >
                        {coverFile ? <img src={URL.createObjectURL(coverFile)} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-slate-500" />}
                    </div>
                    <div className="flex-1">
                         <p className="text-sm text-slate-300">封面图片</p>
                         <input ref={coverInputRef} type="file" accept="image/*" onChange={(e) => e.target.files && setCoverFile(e.target.files[0])} className="hidden" disabled={isUploading} />
                    </div>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-xs">
                    <label className="flex items-start gap-2 cursor-pointer group">
                        <div className="relative flex items-center mt-0.5">
                            <input type="checkbox" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} className="peer h-4 w-4 rounded bg-slate-700 text-emerald-500 focus:ring-emerald-500/30 cursor-pointer appearance-none checked:bg-emerald-500 transition-colors" disabled={isUploading} />
                            <ShieldCheck size={10} className="absolute left-[3px] top-[3px] text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                        </div>
                        <span className={`leading-tight transition-colors ${isAgreed ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                            我承诺内容合法合规，并愿承担一切法律后果。
                        </span>
                    </label>
                </div>

                {isUploading ? (
                    <div className="space-y-2">
                        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>上传至服务器...</span><span>{uploadProgress}%</span>
                        </div>
                    </div>
                ) : (
                    <button type="submit" disabled={!file || !title || !isAgreed} className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition ${!file || !title || !isAgreed ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20'}`}>
                        <CloudUpload size={20} /> 确认上传
                    </button>
                )}
            </form>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;