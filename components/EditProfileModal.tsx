
import React, { useState, useEffect, useRef } from 'react';
import { X, User as UserIcon, Camera, Save, Loader2 } from 'lucide-react';
import { useUser } from '../context/UserContext';

const EditProfileModal = () => {
    const { isEditProfileModalOpen, closeEditProfileModal, currentUser, updateUser } = useUser();
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditProfileModalOpen && currentUser) {
            setUsername(currentUser.username);
            setBio(currentUser.bio || '');
            setPreviewUrl(currentUser.avatar);
            setAvatarFile(null);
        }
    }, [isEditProfileModalOpen, currentUser]);

    if (!isEditProfileModalOpen || !currentUser) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 800));

        let finalAvatarUrl = currentUser.avatar;
        if (avatarFile) {
            // In a real app, upload to server/S3 and get URL
            // For demo, we use object URL, but note this will expire on refresh if not persisted differently
            finalAvatarUrl = previewUrl; 
        }

        updateUser(currentUser.id, {
            username,
            bio,
            avatar: finalAvatarUrl
        });

        setIsLoading(false);
        closeEditProfileModal();
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeEditProfileModal}></div>
            <div className="relative bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
                
                <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <UserIcon size={20} className="text-emerald-500" />
                        编辑个人资料
                    </h3>
                    <button onClick={closeEditProfileModal} className="text-slate-400 hover:text-white transition">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center">
                        <div 
                            className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-slate-600 group cursor-pointer hover:border-emerald-500 transition"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <img src={previewUrl} alt="avatar" className="w-full h-full object-cover transition duration-300 group-hover:opacity-70" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                <Camera size={24} className="text-white drop-shadow-md" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">点击更换头像</p>
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            className="hidden" 
                        />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">昵称</label>
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                                required
                                placeholder="请输入您的昵称"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">个人简介</label>
                            <textarea 
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition h-32 resize-none leading-relaxed"
                                placeholder="介绍一下你自己..."
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading || !username.trim()}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        {isLoading ? '保存中...' : '保存修改'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
