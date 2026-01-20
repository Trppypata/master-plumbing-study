import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, X, Search, ExternalLink, User, RotateCcw, Minus } from 'lucide-react';

const STUDY_PLAYLISTS = [
  { name: 'Lofi Beats', id: '0vvXsWCC9xrXsKd4FyS8kM', emoji: '🎧' },
  { name: 'Deep Focus', id: '37i9dQZF1DWZeKCadgRdKQ', emoji: '🧠' },
  { name: 'Classical Study', id: '37i9dQZF1DX8NTLI2TtZa6', emoji: '🎻' },
  { name: 'Peaceful Piano', id: '37i9dQZF1DX4sWSpwq3LiO', emoji: '🎹' },
  { name: 'Nature Sounds', id: '37i9dQZF1DX4PP3DA4J0N8', emoji: '🌿' },
];

export default function SpotifyPanel({ onClose }: { onClose: () => void }) {
  const [currentPlaylist, setCurrentPlaylist] = useState(STUDY_PLAYLISTS[0].id);
  const [customUrl, setCustomUrl] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const extractPlaylistId = (url: string): string | null => {
    // Handle Spotify URLs like: https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO
    const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractPlaylistId(customUrl);
    if (id) {
      setCurrentPlaylist(id);
      setShowCustomInput(false);
      setCustomUrl('');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.open(`https://open.spotify.com/search/${encodeURIComponent(searchQuery)}`, '_blank');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="w-80 rounded-2xl border border-gray-100 overflow-hidden" 
      style={{ backgroundColor: 'white', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1DB954] to-[#1ed760] text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5" />
          <span className="font-semibold text-sm">Study Music</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content - Hidden when minimized */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Search Helper */}
            <div className="p-3 bg-gray-50 border-b border-gray-100">
              <form onSubmit={handleSearch} className="flex gap-2">
                 <input
                   type="text"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Search songs on Spotify..."
                   className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-full focus:outline-none focus:border-[#1DB954]"
                 />
                 <button 
                   type="submit"
                   className="w-7 h-7 bg-[#1DB954] text-white rounded-full flex items-center justify-center hover:bg-[#1ed760] transition-colors"
                   title="Open Search in New Tab"
                 >
                   <Search className="w-3.5 h-3.5" />
                 </button>
              </form>
              <p className="text-[10px] text-gray-400 mt-1 pl-1">
                * Opens a new tab to find links
              </p>
            </div>

            {/* Playlist Selector */}
            <div className="p-3 bg-white border-b border-gray-100">
              <div className="flex flex-wrap gap-1.5">
                {STUDY_PLAYLISTS.map((playlist) => (
                  <motion.button
                    key={playlist.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPlaylist(playlist.id)}
                    className={`text-xs px-2.5 py-1.5 rounded-full transition-all flex items-center gap-1
                      ${currentPlaylist === playlist.id 
                        ? 'bg-[#1DB954] text-white' 
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                  >
                    <span>{playlist.emoji}</span>
                    <span>{playlist.name}</span>
                  </motion.button>
                ))}
              </div>
              
              {/* Custom URL Input */}
              {showCustomInput ? (
                <form onSubmit={handleCustomSubmit} className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="Paste Spotify playlist URL..."
                    className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#1DB954]"
                  />
                  <button 
                    type="submit"
                    className="px-2 py-1.5 bg-[#1DB954] text-white rounded-lg text-xs"
                  >
                    Load
                  </button>
                </form>
              ) : (
                <button 
                  onClick={() => setShowCustomInput(true)}
                  className="mt-2 text-[10px] text-gray-400 hover:text-[#1DB954] flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Use custom playlist
                </button>
              )}
            </div>

            {/* Spotify Embed */}
            <div className="p-2 bg-black/5 relative min-h-[352px]">
              <iframe
                key={currentPlaylist} // Force reload when playlist changes
                style={{ borderRadius: '12px' }}
                src={`https://open.spotify.com/embed/playlist/${currentPlaylist}?utm_source=generator&theme=0`}
                width="100%"
                height="352"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
              
              {/* Playback Controls Helper */}
              <div className="absolute bottom-3 right-3 left-3 flex gap-2 justify-center pointer-events-none">
                 <a 
                   href="https://accounts.spotify.com/en/login?continue=https://open.spotify.com" 
                   target="_blank"
                   rel="noopener noreferrer"
                   className="pointer-events-auto bg-black/80 hover:bg-black text-white text-[10px] px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors flex items-center gap-1.5"
                 >
                   <User className="w-3 h-3" />
                   Log in
                 </a>
                 <button
                   onClick={() => {
                     // Hack to force reload iframe by toggling key slightly
                     const current = currentPlaylist;
                     setCurrentPlaylist('');
                     setTimeout(() => setCurrentPlaylist(current), 10);
                   }}
                   className="pointer-events-auto bg-black/80 hover:bg-black text-white text-[10px] px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors flex items-center gap-1.5"
                 >
                   <RotateCcw className="w-3 h-3" />
                   Reload
                 </button>
                 <a 
                   href={`spotify:playlist:${currentPlaylist}`} 
                   className="pointer-events-auto bg-[#1DB954] hover:bg-[#1ed760] text-white text-[10px] px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors flex items-center gap-1.5"
                 >
                   <ExternalLink className="w-3 h-3" />
                   Open App
                 </a>
              </div>
            </div>

            {/* Footer */}
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 text-center">
              <a 
                href={`https://open.spotify.com/playlist/${currentPlaylist}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-[#1DB954] hover:underline flex items-center justify-center gap-1"
              >
                Open in Spotify <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
