import { Song, Playlist } from './types';

// Using reliable public domain samples (Free Music Archive)
const SAMPLE_AUDIO_1 = "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/WFMU/Broke_For_Free/Directionless_EP/Broke_For_Free_-_01_-_Night_Owl.mp3";
const SAMPLE_AUDIO_2 = "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3";
const SAMPLE_AUDIO_3 = "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_01_-_Algorithms.mp3";
const SAMPLE_AUDIO_4 = "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Josh_Woodward/The_Wake/Josh_Woodward_-_The_Wake_-_01_-_The_Wake_1.mp3";

export const SAMPLE_AUDIO_POOL = [SAMPLE_AUDIO_1, SAMPLE_AUDIO_2, SAMPLE_AUDIO_3, SAMPLE_AUDIO_4];

export const MOCK_SONGS: Song[] = [
  {
    id: '1',
    title: '霓虹地平线',
    artist: '赛博梦境',
    album: '未来城市',
    coverUrl: 'https://picsum.photos/seed/neon/300/300',
    duration: 198, // Updated duration for sample 1
    audioUrl: SAMPLE_AUDIO_1,
    tags: ['电子', '合成波', '驾驶'],
    lyrics: "[00:10.00]雨中的霓虹灯光\n[00:15.00]冲刷着城市的忧伤\n[00:20.00]穿梭在数字构建的街巷...",
    playCount: 125042,
    downloadCount: 34201,
    language: '国语',
    releaseYear: '2024'
  },
  {
    id: '2',
    title: '静谧时光',
    artist: '惬意乐队',
    album: '周日清晨',
    coverUrl: 'https://picsum.photos/seed/quiet/300/300',
    duration: 251, // Updated duration for sample 2
    audioUrl: SAMPLE_AUDIO_2,
    tags: ['低保真', '放松', '咖啡厅'],
    lyrics: "[00:05.00]手中的咖啡微温\n[00:12.00]躲避风暴的港湾...",
    playCount: 89321,
    downloadCount: 12050,
    language: '纯音乐',
    releaseYear: '2023'
  },
  {
    id: '3',
    title: '量子跃迁',
    artist: '星际之风',
    album: '星际穿越',
    coverUrl: 'https://picsum.photos/seed/space/300/300',
    duration: 184, // Updated duration for sample 3
    audioUrl: SAMPLE_AUDIO_3,
    tags: ['氛围音乐', '太空', '冥想'],
    lyrics: "[00:20.00]漂浮在虚空之中\n[00:25.00]群星从身边掠过...",
    playCount: 56210,
    downloadCount: 8900,
    language: '英语',
    releaseYear: '2025'
  },
  {
    id: '4',
    title: '城市丛林',
    artist: '节奏大师',
    album: '混凝土森林',
    coverUrl: 'https://picsum.photos/seed/urban/300/300',
    duration: 240,
    audioUrl: SAMPLE_AUDIO_4,
    tags: ['嘻哈', '都市', '运动'],
    playCount: 154005,
    downloadCount: 45002,
    language: '国语',
    releaseYear: '2024'
  },
  {
    id: '5',
    title: '此刻宁静',
    artist: '瑜伽流',
    album: '内心和平',
    coverUrl: 'https://picsum.photos/seed/peace/300/300',
    duration: 198,
    audioUrl: SAMPLE_AUDIO_1,
    tags: ['冥想', '新世纪', '自然'],
    playCount: 32001,
    downloadCount: 1502,
    language: '纯音乐',
    releaseYear: '2022'
  },
  {
    id: '6',
    title: '夏日气泡水',
    artist: '橘子海',
    album: '夏日回响',
    coverUrl: 'https://picsum.photos/seed/summer/300/300',
    duration: 251,
    audioUrl: SAMPLE_AUDIO_2,
    tags: ['流行', '清新', '旅行'],
    playCount: 210400,
    downloadCount: 56000,
    language: '英语',
    releaseYear: '2023'
  },
  {
    id: '7',
    title: 'Code & Coffee',
    artist: 'DevBeats',
    album: '深夜编译',
    coverUrl: 'https://picsum.photos/seed/code/300/300',
    duration: 184,
    audioUrl: SAMPLE_AUDIO_3,
    tags: ['专注', '电子', '编程'],
    playCount: 9900,
    downloadCount: 2100,
    language: '纯音乐',
    releaseYear: '2024'
  },
  {
    id: '8',
    title: '旧时光',
    artist: '黑胶记忆',
    album: '岁月留声',
    coverUrl: 'https://picsum.photos/seed/vinyl/300/300',
    duration: 240,
    audioUrl: SAMPLE_AUDIO_4,
    tags: ['复古', '爵士', '经典'],
    playCount: 45000,
    downloadCount: 8700,
    language: '英语',
    releaseYear: '1998'
  }
];

export const FEATURED_PLAYLISTS: Playlist[] = [
  {
    id: 'p1',
    name: '每日推荐',
    coverUrl: 'https://picsum.photos/seed/daily/300/300',
    description: '根据您的听歌历史为您精选的新鲜曲目。',
    songs: [MOCK_SONGS[0], MOCK_SONGS[1], MOCK_SONGS[2], MOCK_SONGS[5]]
  },
  {
    id: 'p2',
    name: '专注心流',
    coverUrl: 'https://picsum.photos/seed/focus/300/300',
    description: '深度工作时的最佳伴侣，助您保持专注。',
    songs: [MOCK_SONGS[1], MOCK_SONGS[4], MOCK_SONGS[6]]
  },
  {
    id: 'p3',
    name: '赛博朋克氛围',
    coverUrl: 'https://picsum.photos/seed/cyber/300/300',
    description: '高科技，低生活的未来之声。',
    songs: [MOCK_SONGS[0], MOCK_SONGS[3]]
  },
  {
    id: 'p4',
    name: '夏日特饮',
    coverUrl: 'https://picsum.photos/seed/drink/300/300',
    description: '清凉解暑的音乐特调。',
    songs: [MOCK_SONGS[5], MOCK_SONGS[1]]
  }
];