import React from 'react';
import { Home, Music, Radio, Heart, Mic2, Disc, Settings, BarChart2, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { useUser } from '../context/UserContext';

const Sidebar = () => {
  const location = useLocation();
  const { mobileMenuOpen, setMobileMenuOpen } = usePlayer();
  const { currentUser } = useUser();

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <Link
      to={to}
      onClick={() => setMobileMenuOpen(false)}
      className={`flex items-center gap-4 px-6 py-3.5 transition-all duration-200 border-l-4 group ${
        isActive(to)
          ? 'border-emerald-500 bg-gradient-to-r from-emerald-500/10 to-transparent text-white'
          : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon
        size={22}
        className={`transition-colors duration-200 ${
          isActive(to) ? 'text-emerald-500' : 'group-hover:text-emerald-400'
        }`}
      />
      <span className="font-medium text-sm md:text-base">{label}</span>
      {isActive(to) && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
      )}
    </Link>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in-up"
            onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar Container */}
      <div className={`fixed md:relative z-50 h-full bg-slate-900 border-r border-slate-800 w-64 flex-shrink-0 flex flex-col transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Logo Area */}
        <div className="h-24 flex items-center px-8 border-b border-slate-800/50">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-400 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20 mr-3">
             <Music size={24} className="text-white" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-200">
              云上爱音乐
            </h1>
            <p className="text-[10px] text-pink-500 font-bold tracking-widest uppercase">Cloud Music</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8 overflow-y-auto custom-scrollbar space-y-1">
          <div className="px-6 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">发现</div>
          <NavItem to="/" icon={Home} label="首页" />
          <NavItem to="/rankings" icon={BarChart2} label="排行榜" />
          <NavItem to="/radio" icon={Radio} label="AI 电台" />
          
          <div className="px-6 mb-2 mt-8 text-xs font-bold text-slate-500 uppercase tracking-wider">创作 & 库</div>
          <NavItem to="/generate" icon={Mic2} label="音乐人中心" />
          <NavItem to="/library" icon={Disc} label="音乐库" />
          <NavItem to="/favorites" icon={Heart} label="我喜欢的" />

          <div className="px-6 mb-2 mt-8 text-xs font-bold text-slate-500 uppercase tracking-wider">系统</div>
          <NavItem to="/settings" icon={Settings} label="设置" />
          
          {currentUser?.role === 'admin' && (
              <>
                <div className="px-6 mb-2 mt-8 text-xs font-bold text-red-500/80 uppercase tracking-wider">管理员</div>
                <NavItem to="/admin" icon={Shield} label="后台管理" />
              </>
          )}
        </nav>

        {/* User Stats / Footer */}
        <div className="p-6 border-t border-slate-800/50">
             <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                        <Mic2 size={16} />
                    </div>
                    <div>
                        <div className="text-xs text-slate-400">音乐人服务</div>
                        <div className="text-sm font-bold text-white">发布作品</div>
                    </div>
                </div>
                <Link to="/generate" className="block w-full py-2 text-center text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition">
                    管理作品
                </Link>
             </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;