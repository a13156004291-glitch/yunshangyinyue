import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = () => {
  const { confirmDialog, closeConfirm } = usePlayer();
  const { isOpen, title, message, onConfirm, confirmText = '确认', cancelText = '取消', isDangerous = false } = confirmDialog;

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    closeConfirm();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeConfirm}></div>
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        
        <div className="p-6">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-amber-500 mx-auto">
                <AlertTriangle size={24} />
            </div>
            
            <h3 className="text-xl font-bold text-white text-center mb-2">{title}</h3>
            <p className="text-slate-400 text-center text-sm leading-relaxed mb-6">
                {message}
            </p>

            <div className="flex gap-3">
                <button 
                    onClick={closeConfirm}
                    className="flex-1 px-4 py-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
                >
                    {cancelText}
                </button>
                <button 
                    onClick={handleConfirm}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold text-white transition shadow-lg ${isDangerous ? 'bg-red-500 hover:bg-red-400 shadow-red-500/20' : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'}`}
                >
                    {confirmText}
                </button>
            </div>
        </div>

        <button 
            onClick={closeConfirm} 
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition p-1"
        >
            <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default ConfirmDialog;