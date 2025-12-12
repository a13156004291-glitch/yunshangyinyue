
import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = () => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 gap-4 animate-fade-in-up">
      <Loader2 size={48} className="animate-spin text-emerald-500" />
      <p className="text-sm font-medium tracking-wider">正在加载云端资源...</p>
    </div>
  );
};

export default Loading;
