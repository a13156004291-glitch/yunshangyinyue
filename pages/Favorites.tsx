import React from 'react';
import { MOCK_SONGS } from '../constants';
import { usePlayer } from '../context/PlayerContext';
import { Heart, Play } from 'lucide-react';
import SongCard from '../components/SongCard';

const Favorites = () => {
  const { likedSongs, playPlaylist, generatedSongs, uploadedSongs } = usePlayer();
  
  // Combine all possible sources to find liked songs details
  const allSongs = [...MOCK_SONGS, ...generatedSongs, ...uploadedSongs];
  
  // Filter unique songs that are in the liked list
  const favoriteSongs = allSongs.filter(song => likedSongs.includes(song.id));
  
  // Deduplicate based on ID just in case
  const uniqueFavorites = Array.from(new Map(favoriteSongs.map(s => [s.id, s])).values());

  return (
    <div className="p-8 pb-32">
        <div className="flex items-center gap-6 mb-10">
            <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-2xl">
                <Heart size={48} className="text-white" fill="currentColor" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">我喜欢的音乐</h1>
                <p className="text-slate-400">{uniqueFavorites.length} 首歌曲</p>
                <button 
                    onClick={() => playPlaylist(uniqueFavorites)}
                    disabled={uniqueFavorites.length === 0}
                    className="mt-4 bg-white text-slate-900 px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                    <Play size={16} fill="currentColor" /> 播放全部
                </button>
            </div>
        </div>

        {uniqueFavorites.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-fade-in-up">
                {uniqueFavorites.map((song, index) => (
                    <SongCard 
                        key={song.id} 
                        song={song} 
                        onPlay={() => playPlaylist(uniqueFavorites, index)}
                    />
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Heart size={48} className="mb-4 opacity-20" />
                <p>您还没有收藏任何音乐。</p>
                <p className="text-sm mt-2">在播放器或歌曲列表点击爱心即可收藏。</p>
            </div>
        )}
    </div>
  );
};

export default Favorites;