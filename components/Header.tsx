import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Bell, Mail, Crown, Mic2, Cloud, UploadCloud, Clock, Flame, X, User, LogOut, Settings as SettingsIcon, Menu, Volume2, Loader2 } from 'lucide-react';
import { MOCK_SONGS } from '../constants';
import { usePlayer } from '../context/PlayerContext';
import { useUser } from '../context/UserContext';
import { Song } from '../types';
import { Link, useNavigate } from 'react-router-dom';

const HOT_SEARCHES = ["赛博朋克", "放松", "Lo-Fi", "周杰伦", "Taylor Swift", "钢琴曲", "助眠"];

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [displayTerm, setDisplayTerm] = useState(''); // Value in input
  const [showResults, setShowResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { playSong, setUploadModalOpen, searchHistory, addSearchHistory, clearSearchHistory, removeSearchHistoryItem, setMobileMenuOpen } = usePlayer();
  const { currentUser, isAuthenticated, openLogin, logout, openVipModal, systemSettings } = useUser();

  // Server-side Search
  useEffect(() => {
      const handler = setTimeout(async () => {
          setSearchTerm(displayTerm);
          if (displayTerm.trim()) {
              setIsSearching(true);
              try {
                  // Mix server results with mock results for demo purposes
                  const res = await fetch(`/api/search?q=${encodeURIComponent(displayTerm)}`);
                  const serverSongs = await res.json();
                  
                  // Filter local MOCK songs as well
                  const localMockHits = MOCK_SONGS.filter(s => 
                      s.title.toLowerCase().includes(displayTerm.toLowerCase()) || 
                      s.artist.toLowerCase().includes(displayTerm.toLowerCase())
                  );
                  
                  // Merge and deduplicate
                  const combined = [...localMockHits, ...serverSongs];
                  const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
                  
                  setSearchResults(unique.slice(0, 10));
              } catch (e) {
                  console.error("Search failed");
                  setSearchResults([]);
              } finally {
                  setIsSearching(false);
              }
          } else {
              setSearchResults([]);
          }
      }, 300); // 300ms debounce

      return () => {
          clearTimeout(handler);
      };
  }, [displayTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
            e.preventDefault();
            searchInputRef.current?.focus();
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setDisplayTerm(e.target.value);
      setShowResults(true);
  };

  const handleClearSearch = () => {
      setDisplayTerm('');
      setSearchTerm('');
      setSearchResults([]);
      setShowResults(false);
      searchInputRef.current?.focus();
  };

  const handleSelectSong = (song: Song) => {
      playSong(song);
      addSearchHistory(song.title);
      setShowResults(false);
      setDisplayTerm('');
      setSearchTerm('');
  };

  const handleSearchSubmit = (term: string) => {
      setDisplayTerm(term);
      setShowResults(true);
  };

  const handleUploadClick = () => {
      setUploadModalOpen(true);
  }

  const handleVipClick = () => {
      if (isAuthenticated) {
          openVipModal();
      } else {
          openLogin();
      }
  };

  const getSourceIcon = (song: Song) => {
      if (song.id.startsWith('ai-')) return <Mic2 size={12} className="text-violet-400" />;
      if (song.id.startsWith('server-')) return <Cloud size={12} className="text-blue-400" />;
      return null;
  };

  const HighlightText = ({ text, highlight }: { text: string, highlight: string }) => {
    if (!highlight.trim() || !text) {
      return <span>{text}</span>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) ? <span key={i} className="text-emerald-400 font-bold">{part}</span> : <span key={i}>{part}</span>
        )}
      </span>
    );
  };

  return (
    <div className="flex flex-col sticky top-0 z-20 shrink-0">
      {/* Announcement Bar */}
      {systemSettings?.announcement && showAnnouncement && (
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs px-4 py-1.5 flex justify-between items-center shadow-md animate-slide-in-right">
              <div className="flex items-center gap-2 font-medium">
                  <Volume2 size={14} className="animate-pulse" />
                  <span className="line-clamp-1">{systemSettings.announcement}</span>
              </div>
              <button onClick={() => setShowAnnouncement(false)} className="hover:bg-white/20 rounded-full p-0.5 transition">
                  <X size={12} />
              </button>
          </div>
      )}

      {/* Main Header */}
      <div className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 md:px-6">
        
        {/* Left: Mobile Menu & Search */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Toggle */}
          <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-slate-400 hover:text-white p-2 -ml-2"
          >
              <Menu size={24} />
          </button>

          {/* Search Bar */}
          <div ref={searchContainerRef} className="relative group max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={displayTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowResults(true)}
              className="block w-full pl-10 pr-9 py-2 border border-slate-700/50 rounded-full leading-5 bg-slate-800/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:bg-slate-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 sm:text-sm transition-all"
              placeholder="搜索歌曲 / 按 '/' 快捷键"
            />
            {displayTerm && (
                <button 
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white"
                >
                    <X size={14} />
                </button>
            )}
            
            {/* Search Dropdown */}
            {showResults && (
                <div className="absolute top-full mt-2 left-0 w-[calc(100vw-2rem)] md:w-full bg-slate-800 rounded-xl border border-slate-700 shadow-2xl overflow-hidden z-50 animate-fade-in-up">
                    {displayTerm.trim() ? (
                        // Search Results Mode
                        <>
                          {isSearching ? (
                              <div className="p-4 text-center text-slate-500 flex items-center justify-center gap-2">
                                  <Loader2 className="animate-spin" size={16} /> 搜索中...
                              </div>
                          ) : searchResults.length > 0 ? (
                              <ul>
                                  <li className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-900/50 flex justify-between">
                                      <span>搜索结果</span>
                                      <span className="font-normal">{searchResults.length} 条</span>
                                  </li>
                                  {searchResults.map(song => (
                                      <li 
                                          key={song.id}
                                          onClick={() => handleSelectSong(song)}
                                          className="px-4 py-3 hover:bg-slate-700/50 cursor-pointer flex items-center justify-between group border-b border-slate-800/50 last:border-0"
                                      >
                                          <div className="flex items-center gap-3">
                                              {/* Tiny Cover */}
                                              <img src={song.coverUrl} className="w-8 h-8 rounded object-cover opacity-80 group-hover:opacity-100" alt="" />
                                              <div>
                                                  <div className="text-sm text-slate-200 group-hover:text-emerald-400 flex items-center gap-2">
                                                      <HighlightText text={song.title} highlight={searchTerm} />
                                                      {getSourceIcon(song)}
                                                  </div>
                                                  <div className="text-xs text-slate-500 flex items-center gap-2">
                                                      <HighlightText text={song.artist} highlight={searchTerm} />
                                                      {song.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())) && (
                                                          <span className="bg-slate-700 px-1.5 rounded text-[10px] text-emerald-400">
                                                              包含: {song.tags.find(t => t.toLowerCase().includes(searchTerm.toLowerCase()))}
                                                          </span>
                                                      )}
                                                  </div>
                                              </div>
                                          </div>
                                      </li>
                                  ))}
                              </ul>
                          ) : (
                              <div className="p-4 text-center text-slate-500 text-sm">
                                  未找到 "{displayTerm}" 相关结果
                              </div>
                          )}
                        </>
                    ) : (
                        // Search History & Trends Mode
                        <div className="p-4 space-y-4">
                            {searchHistory.length > 0 && (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                                            <Clock size={12} /> 搜索历史
                                        </h3>
                                        <button onClick={clearSearchHistory} className="text-xs text-slate-600 hover:text-slate-400">清空</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {searchHistory.map((item, i) => (
                                            <div key={i} className="group flex items-center gap-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-md transition cursor-pointer">
                                                <span onClick={() => handleSearchSubmit(item)}>{item}</span>
                                                <X 
                                                  size={10} 
                                                  className="opacity-0 group-hover:opacity-100 hover:text-red-400"
                                                  onClick={(e) => { e.stopPropagation(); removeSearchHistoryItem(item); }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <div>
                                <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                                    <Flame size={12} className="text-red-500" /> 热门搜索
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {HOT_SEARCHES.map((tag, i) => (
                                        <span 
                                              key={i} 
                                              onClick={() => handleSearchSubmit(tag)}
                                              className={`text-xs px-2 py-1 rounded-md cursor-pointer transition ${i < 3 ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20' : 'text-slate-400 bg-slate-700/30 hover:bg-slate-700/50'}`}
                                          >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-4 ml-4">
          <button 
              onClick={handleUploadClick}
              className="hidden md:flex text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500 px-3 py-1.5 rounded-full transition items-center gap-1.5 group"
          >
              <UploadCloud size={14} className="text-emerald-500 group-hover:scale-110 transition" />
              <span>上传</span>
          </button>

          <button 
              onClick={handleVipClick}
              className="hidden lg:flex text-xs font-bold text-slate-900 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 px-3 py-1.5 rounded-full transition items-center gap-1 shadow-lg shadow-amber-500/20"
          >
              <Crown size={14} fill="currentColor" />
              <span>{currentUser?.isVip ? 'VIP会员' : '开通VIP'}</span>
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1 hidden md:block"></div>

          <button className="text-slate-400 hover:text-white transition relative p-1.5 hover:bg-slate-800 rounded-full">
              <Mail size={20} />
              {isAuthenticated && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>}
          </button>
          <button className="text-slate-400 hover:text-white transition p-1.5 hover:bg-slate-800 rounded-full">
              <Bell size={20} />
          </button>
          
          {isAuthenticated && currentUser ? (
              <div className="relative" ref={userMenuRef}>
                  <div 
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="w-8 h-8 rounded-full overflow-hidden border border-slate-600 cursor-pointer hover:border-emerald-500 transition"
                  >
                      <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  </div>

                  {showUserMenu && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 rounded-xl border border-slate-700 shadow-2xl py-2 z-50 animate-fade-in-up">
                          <div className="px-4 py-2 border-b border-slate-700/50 mb-1">
                              <p className="font-bold text-white truncate">{currentUser.username}</p>
                              <p className="text-xs text-slate-400 capitalize">{currentUser.role === 'musician' ? '认证音乐人' : '普通用户'}</p>
                          </div>
                          <button onClick={() => { navigate(`/profile/${currentUser.id}`); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2">
                              <User size={16} /> 个人主页
                          </button>
                          <button onClick={() => { navigate('/settings'); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2">
                              <SettingsIcon size={16} /> 设置
                          </button>
                          <button onClick={() => { logout(); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 flex items-center gap-2">
                              <LogOut size={16} /> 退出登录
                          </button>
                      </div>
                  )}
              </div>
          ) : (
              <button 
                  onClick={openLogin}
                  className="text-sm font-bold text-slate-900 bg-emerald-500 hover:bg-emerald-400 px-4 py-1.5 rounded-full transition shadow-lg shadow-emerald-500/20 whitespace-nowrap"
              >
                  登录
              </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;