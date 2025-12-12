import { GenerateSongParams, Song } from "../types";
import { SAMPLE_AUDIO_POOL } from "../constants";

/**
 * Generates song metadata and lyrics by calling the backend API.
 * This keeps the API Key secure on the server.
 */
export const generateAiSong = async (params: GenerateSongParams): Promise<Song | null> => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    // The server returns the raw metadata (title, artist, etc.)
    // We enrich it here with client-side mock assets (cover, audio) 
    // to maintain the "Demo" experience.

    const randomId = Math.random().toString(36).substring(7);
    const randomSample = SAMPLE_AUDIO_POOL[Math.floor(Math.random() * SAMPLE_AUDIO_POOL.length)];

    return {
      id: `ai-${randomId}`,
      title: data.title || "未知旋律",
      artist: data.artist || "AI 作曲家",
      album: data.album || "云上创作",
      coverUrl: `https://picsum.photos/seed/${(data.title || 'music').replace(/\s/g, '')}/300/300`,
      duration: 200 + Math.floor(Math.random() * 100), // Approximate duration
      audioUrl: randomSample,
      lyrics: data.lyrics || "暂无歌词",
      isAiGenerated: true,
      tags: data.tags || [params.genre]
    };

  } catch (error) {
    console.error("Error generating song via backend:", error);
    return null;
  }
};

/**
 * Generates a smart playlist description by calling the backend API.
 */
export const generateSmartRecommendation = async (userMood: string): Promise<string> => {
    try {
        const response = await fetch('/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mood: userMood })
        });

        if (!response.ok) return "为您推荐一些好听的音乐。";
        
        const data = await response.json();
        return data.text || "尽情享受音乐！";
    } catch (e) {
        console.error("Recommendation error:", e);
        return "为您推荐一些好听的音乐。";
    }
}