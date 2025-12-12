import React, { useState, useEffect } from 'react';
import { X, User, Lock, ArrowRight, Music, Mail, Phone, Smartphone, ChevronLeft, KeyRound, Check } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import TermsModal from './TermsModal';
import PrivacyModal from './PrivacyModal';

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, authModalTab, login, register, resetPassword, openLogin, openRegister } = useUser();
  const { showToast } = useToast();
  
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  
  // Registration specific
  const [contactType, setContactType] = useState<'phone' | 'email'>('phone');
  const [contactValue, setContactValue] = useState('');

  // Reset Password Flow
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetContact, setResetContact] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  // Policy Modals
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Reset state on open/close/tab switch
  useEffect(() => {
    if (isAuthModalOpen) {
        setIsResetMode(false);
        setResetStep(1);
        setResetContact('');
        setResetCode('');
        setNewPassword('');
        setVerificationSent(false);
        setUsername('');
        setPassword('');
        setContactValue('');
    }
  }, [isAuthModalOpen, authModalTab]);

  if (!isAuthModalOpen && !showTerms && !showPrivacy) return null;

  // Render Policy Modals if active
  if (showTerms) return <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />;
  if (showPrivacy) return <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isResetMode) {
        handleResetSubmit();
        return;
    }

    if (!username && authModalTab === 'login') return;
    if (!username && authModalTab === 'register') return;

    if (authModalTab === 'login') {
        login(username, password);
    } else {
        register(username, password, contactValue, contactType);
    }
  };

  const handleResetSubmit = () => {
      if (resetStep === 1) {
          if (!resetContact) return;
          setVerificationSent(true);
          showToast(`验证码已发送至 ${resetContact}`, 'info');
          setTimeout(() => setResetStep(2), 1000);
      } else {
          if (newPassword.length < 6) {
              showToast('新密码长度不能少于6位', 'error');
              return;
          }
          const success = resetPassword(resetContact, newPassword);
          if (success) {
              setIsResetMode(false); 
              setUsername(resetContact); 
          }
      }
  };

  const sendCode = () => {
      if (!resetContact) {
          showToast('请输入手机号或邮箱', 'error');
          return;
      }
      setVerificationSent(true);
      showToast(`验证码已发送至 ${resetContact}`, 'success');
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeAuthModal}></div>
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        
        {/* Decorative Header */}
        <div className="h-32 bg-gradient-to-br from-pink-500 to-rose-600 relative flex items-center justify-center">
            <div className="absolute top-4 right-4">
                 <button onClick={closeAuthModal} className="text-white/70 hover:text-white transition p-1 bg-black/20 rounded-full">
                    <X size={20} />
                </button>
            </div>
            <div className="text-center">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg text-pink-500">
                    <Music size={24} fill="currentColor" />
                </div>
                <h2 className="text-2xl font-bold text-white">云上爱音乐</h2>
                <p className="text-pink-100 text-sm">下一代音乐创作与发现平台</p>
            </div>
        </div>

        <div className="p-8">
            {isResetMode ? (
                // --- RESET PASSWORD MODE ---
                <div>
                     <div className="flex items-center gap-2 mb-6 cursor-pointer text-slate-400 hover:text-white transition" onClick={() => setIsResetMode(false)}>
                         <ChevronLeft size={16} />
                         <span className="text-sm font-bold">返回登录</span>
                     </div>
                     <h3 className="text-xl font-bold text-white mb-4">重置密码</h3>
                     
                     {resetStep === 1 ? (
                         <div className="space-y-4">
                             <p className="text-sm text-slate-400">请输入您注册时使用的手机号或邮箱，我们将发送验证码。</p>
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">账号</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-slate-500" size={18} />
                                    <input 
                                        type="text" 
                                        value={resetContact}
                                        onChange={(e) => setResetContact(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                                        placeholder="手机号 / 邮箱"
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={handleResetSubmit}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-4"
                            >
                                获取验证码
                            </button>
                         </div>
                     ) : (
                         <div className="space-y-4">
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">验证码</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={resetCode}
                                        onChange={(e) => setResetCode(e.target.value)}
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 text-center tracking-widest font-mono"
                                        placeholder="123456"
                                    />
                                    <button 
                                        onClick={sendCode}
                                        className="px-4 py-2 text-xs font-bold bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition"
                                    >
                                        重新发送
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">设置新密码</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
                                    <input 
                                        type="password" 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                                        placeholder="不少于 6 位"
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={handleResetSubmit}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-4"
                            >
                                <Check size={18} /> 重置并登录
                            </button>
                         </div>
                     )}
                </div>
            ) : (
                // --- LOGIN / REGISTER MODE ---
                <>
                    <div className="flex bg-slate-800 p-1 rounded-lg mb-6">
                        <button 
                            onClick={openLogin}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition ${authModalTab === 'login' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            登录
                        </button>
                        <button 
                            onClick={openRegister}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition ${authModalTab === 'register' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            注册
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {authModalTab === 'login' ? (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">账号</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-slate-500" size={18} />
                                    <input 
                                        type="text" 
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                                        placeholder="用户名 / 手机号 / 邮箱"
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Register: Username */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">用户名 (昵称)</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 text-slate-500" size={18} />
                                        <input 
                                            type="text" 
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                                            placeholder="设置您的用户名"
                                        />
                                    </div>
                                </div>

                                {/* Register: Contact Type Toggle */}
                                <div className="flex gap-4 pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                                        <input 
                                            type="radio" 
                                            name="contactType"
                                            checked={contactType === 'phone'}
                                            onChange={() => setContactType('phone')}
                                            className="accent-emerald-500"
                                        />
                                        手机号注册
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                                        <input 
                                            type="radio" 
                                            name="contactType"
                                            checked={contactType === 'email'}
                                            onChange={() => setContactType('email')}
                                            className="accent-emerald-500"
                                        />
                                        邮箱注册
                                    </label>
                                </div>

                                {/* Register: Contact Input */}
                                <div className="space-y-2">
                                    <div className="relative">
                                        {contactType === 'email' ? (
                                            <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
                                        ) : (
                                            <Smartphone className="absolute left-3 top-3 text-slate-500" size={18} />
                                        )}
                                        <input 
                                            type={contactType === 'email' ? 'email' : 'tel'} 
                                            value={contactValue}
                                            onChange={(e) => setContactValue(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                                            placeholder={contactType === 'email' ? '输入您的邮箱地址' : '输入您的手机号码'}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">密码</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                                    placeholder="不少于 6 位"
                                />
                            </div>
                            {authModalTab === 'register' && password.length > 0 && password.length < 6 && (
                                <p className="text-[10px] text-red-400 mt-1">* 密码长度至少需要 6 位</p>
                            )}
                        </div>
                        
                        {/* Forgot Password Link */}
                        {authModalTab === 'login' && (
                            <div className="flex justify-end">
                                <button 
                                    type="button"
                                    onClick={() => setIsResetMode(true)}
                                    className="text-xs text-slate-400 hover:text-emerald-400 transition"
                                >
                                    忘记密码？
                                </button>
                            </div>
                        )}

                        <button 
                            type="submit"
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-6 active:scale-[0.98]"
                        >
                            {authModalTab === 'login' ? '立即登录' : '创建账号'}
                            <ArrowRight size={18} />
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-500 mt-6">
                        登录即代表您同意我们的 
                        <button onClick={() => setShowTerms(true)} className="text-emerald-500 hover:text-emerald-400 hover:underline transition-colors mx-1 font-medium">服务条款</button> 
                        和 
                        <button onClick={() => setShowPrivacy(true)} className="text-emerald-500 hover:text-emerald-400 hover:underline transition-colors mx-1 font-medium">隐私政策</button>
                    </p>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;