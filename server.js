import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import compression from 'compression';
import multer from 'multer';
import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!existsSync(UPLOADS_DIR)) {
    mkdirSync(UPLOADS_DIR);
}

const SONGS_DB = path.join(__dirname, 'songs.json');
const USERS_DB = path.join(__dirname, 'users.json');
const PLAYLISTS_DB = path.join(__dirname, 'playlists.json');
const SETTINGS_DB = path.join(__dirname, 'settings.json');

// --- Async Helper Functions ---
const readJSON = async (file) => {
    if (!existsSync(file)) return [];
    try {
        const data = await fs.readFile(file, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        console.error(`Error reading ${file}:`, e);
        return [];
    }
};

const readJSONObj = async (file) => {
    if (!existsSync(file)) return {};
    try {
        const data = await fs.readFile(file, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        console.error(`Error reading ${file}:`, e);
        return {};
    }
};

const writeJSON = async (file, data) => {
    try {
        await fs.writeFile(file, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(`Error writing ${file}:`, e);
    }
};

// Initialize DBs
const initDB = async () => {
    if (!existsSync(USERS_DB)) {
        await writeJSON(USERS_DB, [
            { id: 'u-admin', username: 'admin', password: 'password', role: 'admin', isVip: true, musicianStatus: 'none', avatar: 'https://picsum.photos/seed/admin/100/100', likedSongs: [], playHistory: [] }
        ]);
    }
    if (!existsSync(PLAYLISTS_DB)) await writeJSON(PLAYLISTS_DB, []);
    if (!existsSync(SONGS_DB)) await writeJSON(SONGS_DB, []);
    if (!existsSync(SETTINGS_DB)) await writeJSON(SETTINGS_DB, { announcement: "", maintenanceMode: false });
};
initDB();

const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, UPLOADS_DIR); },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Better safe name handling
        let ext = path.extname(file.originalname);
        let name = file.originalname.replace(ext, '').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        if (name.length < 2) name = 'file';
        cb(null, uniqueSuffix + '-' + name + ext);
    }
});
const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));

app.use('/uploads', express.static(UPLOADS_DIR));

// --- Search API ---
app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);
    
    const term = q.toString().toLowerCase();
    const songs = await readJSON(SONGS_DB);
    
    const results = songs.filter(s => 
        s.title.toLowerCase().includes(term) || 
        s.artist.toLowerCase().includes(term) ||
        (s.tags && s.tags.some(t => t.toLowerCase().includes(term)))
    );
    
    res.json(results.slice(0, 20)); // Limit results
});

// --- System Settings APIs ---
app.get('/api/settings', async (req, res) => {
    const settings = await readJSONObj(SETTINGS_DB);
    res.json(settings);
});

app.put('/api/settings', async (req, res) => {
    const settings = await readJSONObj(SETTINGS_DB);
    const updated = { ...settings, ...req.body };
    await writeJSON(SETTINGS_DB, updated);
    res.json(updated);
});

// --- Auth APIs ---
app.post('/api/auth/register', async (req, res) => {
    const { username, password, contact, contactType } = req.body;
    const users = await readJSON(USERS_DB);
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: "Username already exists" });
    }
    const newUser = {
        id: `u-${Date.now()}`,
        username,
        password, 
        avatar: `https://picsum.photos/seed/${username}/100/100`,
        role: 'user',
        isVip: false,
        musicianStatus: 'none',
        bio: 'New user',
        followers: 0,
        following: 0,
        followingIds: [],
        likedSongs: [],
        playHistory: [],
        email: contactType === 'email' ? contact : undefined,
        phone: contactType === 'phone' ? contact : undefined,
        createdAt: Date.now()
    };
    users.push(newUser);
    await writeJSON(USERS_DB, users);
    const { password: _, ...safeUser } = newUser;
    res.json(safeUser);
});

app.post('/api/auth/login', async (req, res) => {
    const { account, password } = req.body;
    const users = await readJSON(USERS_DB);
    const user = users.find(u => 
        (u.username === account || u.email === account || u.phone === account) && 
        u.password === password
    );
    if (user) {
        const { password: _, ...safeUser } = user;
        res.json(safeUser);
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
});

app.get('/api/users/:id', async (req, res) => {
    const users = await readJSON(USERS_DB);
    const user = users.find(u => u.id === req.params.id);
    if (user) {
        const { password: _, ...safeUser } = user;
        res.json(safeUser);
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const users = await readJSON(USERS_DB);
    const index = users.findIndex(u => u.id === id);
    if (index > -1) {
        const currentUser = users[index];
        const updatedUser = { ...currentUser, ...updates };
        // Preserve arrays if not provided
        if (!updates.likedSongs) updatedUser.likedSongs = currentUser.likedSongs || [];
        if (!updates.playHistory) updatedUser.playHistory = currentUser.playHistory || [];
        users[index] = updatedUser;
        await writeJSON(USERS_DB, users);
        const { password: _, ...safeUser } = updatedUser;
        res.json(safeUser);
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

app.get('/api/users', async (req, res) => {
    const users = await readJSON(USERS_DB);
    const safeUsers = users.map(({ password, likedSongs, playHistory, ...u }) => u);
    res.json(safeUsers);
});

// --- Playlist APIs ---
app.get('/api/playlists', async (req, res) => {
    const playlists = await readJSON(PLAYLISTS_DB);
    const { userId } = req.query;
    if (userId) {
        return res.json(playlists.filter(p => p.creatorId === userId));
    }
    res.json(playlists);
});

app.post('/api/playlists', async (req, res) => {
    const newPlaylist = req.body;
    const playlists = await readJSON(PLAYLISTS_DB);
    playlists.push(newPlaylist);
    await writeJSON(PLAYLISTS_DB, playlists);
    res.json(newPlaylist);
});

app.put('/api/playlists/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    let playlists = await readJSON(PLAYLISTS_DB);
    const index = playlists.findIndex(p => p.id === id);
    if (index > -1) {
        playlists[index] = { ...playlists[index], ...updates };
        await writeJSON(PLAYLISTS_DB, playlists);
        res.json(playlists[index]);
    } else {
        res.status(404).json({ error: "Playlist not found" });
    }
});

app.delete('/api/playlists/:id', async (req, res) => {
    const { id } = req.params;
    let playlists = await readJSON(PLAYLISTS_DB);
    const filtered = playlists.filter(p => p.id !== id);
    if (playlists.length !== filtered.length) {
        await writeJSON(PLAYLISTS_DB, filtered);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Playlist not found" });
    }
});

// --- Song Upload APIs ---
app.post('/api/upload', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req, res) => {
    try {
        const files = req.files;
        const body = req.body;
        if (!files || !files['audio']) return res.status(400).json({ error: "No audio" });
        const audioFile = files['audio'][0];
        const coverFile = files['cover'] ? files['cover'][0] : null;
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const newSong = {
            id: `server-${Date.now()}`,
            title: body.title || 'Unknown',
            artist: body.artist || 'Unknown',
            album: body.album || 'Uploads',
            audioUrl: `${baseUrl}/uploads/${audioFile.filename}`,
            coverUrl: coverFile ? `${baseUrl}/uploads/${coverFile.filename}` : `https://picsum.photos/seed/${body.title}/300/300`,
            duration: parseFloat(body.duration) || 0,
            tags: body.tags ? JSON.parse(body.tags) : ['Upload'],
            language: body.language || 'Unknown',
            releaseYear: body.releaseYear,
            lyrics: body.lyrics || '',
            quality: body.quality || 'standard',
            uploaderId: body.uploaderId,
            createdAt: Date.now()
        };
        const songs = await readJSON(SONGS_DB);
        songs.push(newSong);
        await writeJSON(SONGS_DB, songs);
        res.json(newSong);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Upload failed" });
    }
});

app.get('/api/songs', async (req, res) => {
    const songs = await readJSON(SONGS_DB);
    res.json(songs.sort((a, b) => b.createdAt - a.createdAt));
});

app.delete('/api/songs/:id', async (req, res) => {
    const { id } = req.params;
    let songs = await readJSON(SONGS_DB);
    const index = songs.findIndex(s => s.id === id);
    if (index > -1) {
        songs.splice(index, 1);
        await writeJSON(SONGS_DB, songs);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Not found" });
    }
});

const getAiClient = () => process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;

app.post('/api/generate', async (req, res) => {
  try {
    const ai = getAiClient();
    if (!ai) return res.status(500).json({ error: "API Key missing" });
    const { mood, genre, theme } = req.body;
    const prompt = `Create a unique fictional song based on: Mood:${mood}, Genre:${genre}, Theme:${theme}. Return JSON with title, artist, album, lyrics (Chinese), tags.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, artist: { type: Type.STRING }, album: { type: Type.STRING }, lyrics: { type: Type.STRING }, tags: { type: Type.ARRAY, items: { type: Type.STRING } } } } }
    });
    res.json(JSON.parse(response.text || "{}"));
  } catch (e) { res.status(500).json({ error: "AI Failed" }); }
});

app.post('/api/recommend', async (req, res) => {
  try {
      const ai = getAiClient();
      if (!ai) return res.json({ text: "Enjoy the music!" });
      const r = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: `User mood: ${req.body.mood}. Short Chinese greeting.` });
      res.json({ text: r.text });
  } catch { res.json({ text: "Welcome!" }); }
});

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});