import React, { useState } from 'react';
import { Radio as RadioIcon, Play, Loader2, Music2 } from 'lucide-react';
import { MOCK_SONGS } from '../constants';
import { usePlayer } from '../context/PlayerContext';
import { useToast } from '../context/ToastContext';

const GENRES = [
    { id: 'synth', name: '霓虹夜行', color: 'from-fuchsia-600 to-purple-600', tags: ['电子', '合成波', '赛博', 'Cyberpunk', 'Synthwave'] },
    { id: 'lofi', name: '午后咖啡', color: 'from-amber-600 to-orange-600', tags: ['低保真', '放松', '咖啡', 'Lo-Fi', 'Jazz'] },
    { id: 'jazz', name: '爵士情调', color: 'from-blue-600 to-indigo-600', tags: ['爵士', '复古', 'Jazz', 'Classic'] },
    { id: 'rock', name: '硬核摇滚', color: 'from-red-600 to-rose-600', tags: ['摇滚', 'Rock', '运动'] },
    { id: 'ambient', name: '冥想空间', color: 'from-teal-600 to-emerald-600', tags: ['氛围', '冥想', 'Ambient', '太空', '自然'] },
];

const Radio = () => {
  const [activeStation, setActiveStation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { playPlaylist, generatedSongs, uploadedSongs, currentSong, isPlaying } = usePlayer();
  const { showToast } = useToast();

  const handleStartStation = (genreId: string) => {
      if (activeStation === genreId && isPlaying) return;

      setActiveStation(genreId);
      setIsLoading(true);

      const targetGenre = GENRES.find(g => g.id === genreId);
      const tags = targetGenre?.tags || [];
      
      // Combine all sources
      const allSongs = [...MOCK_SONGS, ...generatedSongs, ...uploadedSongs];

      // Filter songs that match any of the tags
      // If no tags match (e.g. generic), provide a random selection
      let matchedSongs = allSongs.filter(song => 
          song.tags?.some(t => tags.some(tag => t.toLowerCase().includes(tag.toLowerCase())))
      );

      // Shuffle logic
      matchedSongs = matchedSongs.sort(() => Math.random() - 0.5);

      // Fallback if no songs found for this genre
      if (matchedSongs.length === 0) {
          matchedSongs = allSongs.sort(() => Math.random() - 0.5).slice(0, 10);
      }
      
      setTimeout(() => {
          playPlaylist(matchedSongs);
          setIsLoading(false);
          showToast(`正在播放: ${targetGenre?.name} 电台`, 'success');
      }, 1000); // Simulated network delay
  };

  return (
    <div className="p-8 pb-32 h-full flex flex-col animate-fade-in-up">
        <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500">
                <RadioIcon size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white">AI 随心电台</h1>
        </div>
        
        <p className="text-slate-400 mb-10 max-w-2xl">
            基于 Gemini AI 算法，根据您的口味实时生成无限音乐流。选择一个频道，智能算法将为您筛选最契合的旋律。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {GENRES.map(genre => {
                const isActive = activeStation === genre.id;
                // Check if current song actually belongs to this station visually
                const isPlayingThisStation = isActive && isPlaying;

                return (
                    <div 
                        key={genre.id}
                        onClick={() => handleStartStation(genre.id)}
                        className={`relative h-64 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 ${isActive ? 'ring-2 ring-white scale-105 shadow-2xl' : 'hover:scale-105 hover:shadow-xl'}`}
                    >
                        {/* Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-80 group-hover:opacity-100 transition duration-500`}></div>
                        
                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center z-10">
                            <h3 className="text-2xl font-bold mb-2 drop-shadow-md">{genre.name}</h3>
                            <div className={`w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${isActive ? 'scale-110 bg-white text-slate-900 shadow-lg' : 'group-hover:bg-white group-hover:text-slate-900'}`}>
                                {isActive && isLoading ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : isPlayingThisStation ? (
                                    <div className="flex gap-1 h-4 items-end">
                                        <div className="w-1 bg-current animate-[bounce_1s_infinite]"></div>
                                        <div className="w-1 bg-current animate-[bounce_1.2s_infinite]"></div>
                                        <div className="w-1 bg-current animate-[bounce_0.8s_infinite]"></div>
                                    </div>
                                ) : (
                                    <Play fill="currentColor" size={24} className="ml-1" />
                                )}
                            </div>
                            
                            {isActive && !isLoading && (
                                <p className="text-xs font-bold mt-4 uppercase tracking-widest opacity-80 animate-pulse">
                                    {isPlayingThisStation ? '正在播放' : '已就绪'}
                                </p>
                            )}
                        </div>

                        {/* Decorator Icons */}
                        <div className="absolute -bottom-4 -right-4 text-white/10 transform rotate-12 group-hover:scale-110 transition duration-500">
                            <Music2 size={120} />
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default Radio;