
import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import Header from './components/Header';
import Loading from './components/Loading'; // New component
import UploadModal from './components/UploadModal';
import DownloadModal from './components/DownloadModal';
import CreatePlaylistModal from './components/CreatePlaylistModal';
import AddToPlaylistModal from './components/AddToPlaylistModal';
import AuthModal from './components/AuthModal';
import MusicianApplyModal from './components/MusicianApplyModal';
import EditProfileModal from './components/EditProfileModal';
import ShareModal from './components/ShareModal';
import ConfirmDialog from './components/ConfirmDialog';
import VipModal from './components/VipModal';
import ContextMenu from './components/ContextMenu';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';

// Lazy Load Pages
const Home = React.lazy(() => import('./pages/Home'));
const Generate = React.lazy(() => import('./pages/Generate'));
const Library = React.lazy(() => import('./pages/Library'));
const Favorites = React.lazy(() => import('./pages/Favorites'));
const Radio = React.lazy(() => import('./pages/Radio'));
const PlaylistDetail = React.lazy(() => import('./pages/PlaylistDetail'));
const Rankings = React.lazy(() => import('./pages/Rankings'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Profile = React.lazy(() => import('./pages/Profile'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));

const Layout = () => {
    const { isUploadModalOpen, setUploadModalOpen } = usePlayer();
    
    return (
        <div className="flex h-screen w-full bg-slate-900 text-white overflow-hidden font-sans selection:bg-emerald-500/30">
            <Sidebar />

            <main className="flex-1 relative flex flex-col min-w-0 bg-slate-900/50">
                <Header />
                
                <div className="flex-1 overflow-y-auto custom-scrollbar pb-24">
                    <Suspense fallback={<Loading />}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/generate" element={<Generate />} />
                            <Route path="/library" element={<Library />} />
                            <Route path="/favorites" element={<Favorites />} />
                            <Route path="/radio" element={<Radio />} />
                            <Route path="/rankings" element={<Rankings />} />
                            <Route path="/playlist/:id" element={<PlaylistDetail />} />
                            <Route path="/profile/:userId" element={<Profile />} />
                            <Route path="/admin" element={<AdminDashboard />} /> 
                            <Route path="/settings" element={<Settings />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Suspense>
                </div>

                <Player />
            </main>
            
            <UploadModal isOpen={isUploadModalOpen} onClose={() => setUploadModalOpen(false)} />
            <DownloadModal />
            <CreatePlaylistModal />
            <AddToPlaylistModal />
            <AuthModal />
            <MusicianApplyModal />
            <EditProfileModal />
            <ShareModal />
            <ConfirmDialog />
            <VipModal /> 
            <ContextMenu />
        </div>
    );
}

const App = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <UserProvider>
          <PlayerProvider>
            <HashRouter>
              <Layout />
            </HashRouter>
          </PlayerProvider>
        </UserProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;