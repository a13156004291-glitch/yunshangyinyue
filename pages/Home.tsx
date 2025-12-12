import React, { useEffect, useState } from 'react';
import { MOCK_SONGS, FEATURED_PLAYLISTS } from '../constants';
import SongCard from '../components/SongCard';
import { generateSmartRecommendation } from '../services/geminiService';
import { Sparkles, Play, Mic2, Radio, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';

const BANNERS = [
    {
        id: 1,
        title: "AI 智能推荐",
        desc: "根据您的听歌习惯，定制专属歌单",
        icon: <Sparkles size={20} />,
        color: "from-violet-900 to-indigo-900",
        accent: "bg-emerald-500",
        link: null, // Action handled by logic
        action: "play_daily"
    },
    {
        id: 2,
        title: "音乐人计划",
        desc: "加入云上爱音乐，上传发布您的原创作品",
        icon: <Mic2 size={20} />,
        color: "from-emerald-900 to-teal-900",
        accent: "bg-emerald-400",
        link: "/generate",
        action: "nav"
    },
    {
        id: 3,
        title: "AI 随心电台",
        desc: "无限音乐流，探索未知的旋律",
        icon: <Radio size={20} />,
        color: "from-rose-900 to-pink-900",
        accent: "bg-pink-500",
        link: "/radio",
        action: "nav"
    }
];

const Home = () => {
  const [greeting, setGreeting] = useState("正在为您生成个性化推荐...");
  const [isLoading, setIsLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const { playSong, playPlaylist } = usePlayer();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Simulate loading delay for skeleton demo
    const timer = setTimeout(() => setIsLoading(false), 1000);

    const hour = new Date().getHours();
    let mood = "neutral";
    if (hour < 12) mood = "energetic and ready for the day";
    else if (hour < 18) mood = "focused working";
    else mood = "relaxing evening";

    generateSmartRecommendation(mood).then(setGreeting);

    // Banner Auto Rotate
    const bannerTimer = setInterval(() => {
        setCurrentBanner(prev => (prev + 1) % BANNERS.length);
    }, 5000);

    return () => {
        clearTimeout(timer);
        clearInterval(bannerTimer);
    };
  }, []);

  const handleBannerAction = (banner: typeof BANNERS[0]) => {
      if (banner.action === 'play_daily') {
          playPlaylist(MOCK_SONGS);
      } else if (banner.action === 'nav' && banner.link) {
          navigate(banner.link);
      }
  };

  const nextBanner = () => setCurrentBanner(prev => (prev + 1) % BANNERS.length);
  const prevBanner = () => setCurrentBanner(prev => (prev - 1 + BANNERS.length) % BANNERS.length);

  if (isLoading) {
      return (
          <div className="p-8 pb-32 space-y-10">
              <div className="h-64 rounded-2xl bg-slate-800 animate-pulse"></div>
              <div className="space-y-4">
                  <div className="h-8 w-48 bg-slate-800 rounded animate-pulse"></div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                      {[1,2,3,4,5].map(i => <div key={i} className="aspect-[4/5] rounded-xl bg-slate-800 animate-pulse"></div>)}
                  </div>
              </div>
          </div>
      )
  }

  const activeBanner = BANNERS[currentBanner];

  return (
    <div className="p-8 pb-32 space-y-10 animate-fade-in-up">
      {/* Dynamic Hero Carousel */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${activeBanner.color} p-8 shadow-2xl transition-colors duration-700 min-h-[280px] flex flex-col justify-center`}>
        {/* Background Elements */}
        <div className={`absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 ${activeBanner.accent} rounded-full blur-3xl opacity-20 transition-colors duration-700`}></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        
        <div className="relative z-10">
            <div className={`flex items-center gap-2 font-semibold mb-2 transition-colors duration-300 ${currentBanner === 0 ? 'text-violet-200' : currentBanner === 1 ? 'text-emerald-200' : 'text-pink-200'}`}>
                {activeBanner.icon}
                <span>{activeBanner.title}</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {currentBanner === 0 ? greeting : activeBanner.desc}
            </h1>
            
            <p className="text-slate-200/80 max-w-xl text-lg mb-8">
                {currentBanner === 0 ? "云上爱音乐分析您的听歌习惯和当前氛围，为您定制完美歌单。" : "探索更多可能，发现属于您的音乐世界。"}
            </p>
            
            <div className="flex gap-4">
                <button 
                    onClick={() => handleBannerAction(activeBanner)}
                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-200 transition flex items-center gap-2 shadow-lg active:scale-95"
                >
                    {currentBanner === 0 ? <><Play size={18} fill="currentColor" /> 播放每日推荐</> : "立即探索"}
                </button>
            </div>
        </div>

        {/* Carousel Controls */}
        <div className="absolute bottom-4 right-4 flex gap-2">
            <button onClick={prevBanner} className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition"><ChevronLeft size={20}/></button>
            <button onClick={nextBanner} className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition"><ChevronRight size={20}/></button>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-6 left-8 flex gap-2">
            {BANNERS.map((_, idx) => (
                <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentBanner ? 'w-8 bg-white' : 'w-2 bg-white/30'}`}
                ></div>
            ))}
        </div>
      </div>

      {/* Featured Songs */}
      <section>
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">热门推荐</h2>
            <Link to="/rankings" className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">查看排行榜</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {MOCK_SONGS.map((song, index) => (
                <SongCard 
                    key={song.id} 
                    song={song} 
                    onPlay={() => playPlaylist(MOCK_SONGS, index)}
                />
            ))}
        </div>
      </section>

      {/* Featured Playlists */}
      <section>
         <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">为您甄选</h2>
            <Link to="/library" className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">查看全部</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_PLAYLISTS.map(playlist => (
                <Link to={`/playlist/${playlist.id}`} key={playlist.id} className="bg-slate-800/50 p-4 rounded-xl flex gap-4 hover:bg-slate-800 transition cursor-pointer group border border-transparent hover:border-slate-700">
                    <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden relative">
                        <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                             <Play className="text-white" fill="currentColor" size={24}/>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center">
                        <h3 className="font-bold text-lg text-white mb-1 group-hover:text-emerald-400 transition">{playlist.name}</h3>
                        <p className="text-sm text-slate-400 line-clamp-2">{playlist.description}</p>
                    </div>
                </Link>
            ))}
        </div>
      </section>
    </div>
  );
};

export default Home;