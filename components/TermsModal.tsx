import React from 'react';
import { X, Shield, Scale, FileText, AlertTriangle } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[85vh]">
        
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900 shrink-0">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Scale className="text-emerald-500" /> 服务条款 (Terms of Service)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition bg-slate-800 rounded-full p-1">
            <X size={20}/>
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar text-slate-300 space-y-6 text-sm leading-relaxed">
          <p className="text-xs text-slate-500">最后更新日期：2024年3月20日</p>

          <section>
            <h4 className="text-white font-bold text-base mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 1. 服务概览
            </h4>
            <p>
              欢迎使用“云上爱音乐”（以下简称“本平台”）。本平台提供基于 Google Gemini AI 的音乐辅助创作、音乐播放、上传及社交分享服务。使用本平台即表示您同意遵守本条款。
            </p>
          </section>

          <section>
            <h4 className="text-white font-bold text-base mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 2. AI 生成内容免责与权利
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>本平台提供的 AI 音乐生成功能基于大语言模型技术，生成的内容具有随机性。平台不对生成内容的准确性、完整性或艺术价值做任何保证。</li>
              <li><strong>所有权归属：</strong>除非法律另有规定，您通过本平台 AI 工具创作的内容，其权益归属于创作用户。但您授予平台在全球范围内免费、永久、不可撤销的使用权，用于展示、推广或改进算法。</li>
              <li><strong>合规性：</strong>您不得诱导 AI 生成仇恨言论、色情暴力、政治敏感或侵犯他人知识产权的内容。</li>
            </ul>
          </section>

          <section>
            <h4 className="text-white font-bold text-base mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 3. 用户上传内容规范
            </h4>
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-2">
                <h5 className="text-red-400 font-bold flex items-center gap-2 mb-1"><AlertTriangle size={16}/> 严禁上传以下内容：</h5>
                <ul className="list-disc pl-5 text-red-300/80 text-xs">
                    <li>未经授权的他人版权音乐作品。</li>
                    <li>含有反动、淫秽、侮辱、诽谤等违反当地法律法规的内容。</li>
                    <li>含有病毒、木马或其他恶意代码的文件。</li>
                </ul>
            </div>
            <p>
                用户对其上传的所有内容承担全部法律责任。若因用户上传内容引发版权纠纷，平台有权配合执法部门或版权方提供用户信息，并对违规账号进行封禁处理。
            </p>
          </section>

          <section>
            <h4 className="text-white font-bold text-base mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 4. 账号管理
            </h4>
            <p>
              您有责任妥善保管您的账号和密码。任何使用该账号进行的操作均视为您本人的行为。如发现账号被盗，请立即联系管理员。
            </p>
          </section>

          <section>
            <h4 className="text-white font-bold text-base mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 5. 服务的变更与终止
            </h4>
            <p>
              平台保留随时修改、中断或终止部分或全部服务的权利（包括但不限于删除数据、限制存储空间），恕不另行通知。建议用户定期备份上传的重要作品。
            </p>
          </section>
        </div>

        <div className="p-5 border-t border-slate-800 bg-slate-900 flex justify-end">
            <button 
                onClick={onClose}
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2 rounded-lg font-bold transition"
            >
                我已阅读并知晓
            </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;