import React from 'react';
import { X, Shield, Eye, Server } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[85vh]">
        
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900 shrink-0">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="text-emerald-500" /> 隐私政策 (Privacy Policy)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition bg-slate-800 rounded-full p-1">
            <X size={20}/>
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar text-slate-300 space-y-6 text-sm leading-relaxed">
          <p className="text-xs text-slate-500">生效日期：2024年3月20日</p>

          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <p className="italic text-slate-400">
                  “云上爱音乐”非常重视您的隐私。本政策旨在说明我们如何收集、使用和保护您的个人信息。
              </p>
          </div>

          <section>
            <h4 className="text-white font-bold text-base mb-2 flex items-center gap-2">
              <Server size={18} className="text-emerald-500"/> 1. 我们收集的信息
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>账号信息：</strong>用户名、密码（加密存储）、头像、手机号或邮箱（用于找回密码）。</li>
              <li><strong>使用数据：</strong>播放历史、收藏列表、搜索记录、歌单创建记录。</li>
              <li><strong>创作交互数据：</strong>您在使用创作功能时输入的提示词（Prompts）、风格偏好选择。</li>
              <li><strong>上传内容：</strong>您上传的音频文件及其元数据（标题、封面等）。</li>
            </ul>
          </section>

          <section>
            <h4 className="text-white font-bold text-base mb-2 flex items-center gap-2">
              <Eye size={18} className="text-emerald-500"/> 2. 信息的用途
            </h4>
            <p>我们收集的数据主要用于：</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 mt-1">
                <li>提供个性化的音乐推荐服务（智能电台）。</li>
                <li>处理您的音乐生成或创作请求。</li>
                <li>改善我们的服务质量和算法准确性。</li>
            </ul>
          </section>

          <section>
            <h4 className="text-white font-bold text-base mb-2 flex items-center gap-2">
              <Shield size={18} className="text-emerald-500"/> 3. 数据安全
            </h4>
            <p>
              我们采取业界标准的安全措施（如 HTTPS 加密传输、密码哈希存储）来保护您的信息。但请注意，互联网传输并非绝对安全，请勿上传高度机密的个人信息。我们不会向任何第三方出售您的个人身份信息。
            </p>
          </section>

          <section>
            <h4 className="text-white font-bold text-base mb-2">4. 未成年人保护</h4>
            <p>
              本平台不面向 10 周岁以下儿童提供服务。若您是未成年人，请在监护人陪同下使用。
            </p>
          </section>
        </div>

        <div className="p-5 border-t border-slate-800 bg-slate-900 flex justify-end">
            <button 
                onClick={onClose}
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2 rounded-lg font-bold transition"
            >
                同意并继续
            </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;