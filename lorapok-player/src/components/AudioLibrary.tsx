import { useState } from 'react';
import { X, Search, Disc3, FolderSearch, Music, AudioLines } from 'lucide-react';
import { useDeviceScanner } from '../hooks/useDeviceScanner';
import { Capacitor } from '@capacitor/core';

interface AudioLibraryProps {
  onClose: () => void;
  onPlay: (path: string) => void;
}

export function AudioLibrary({ onClose, onPlay }: AudioLibraryProps) {
  const { isScanning, files, error, startScan } = useDeviceScanner();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Random color generator for empty album art to give it a premium feel
  const getGradient = (name: string) => {
    const colors = [
      'from-neon-cyan to-blue-600',
      'from-neon-magenta to-purple-800',
      'from-teal-400 to-emerald-600',
      'from-orange-500 to-red-600',
      'from-indigo-500 to-blue-800'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const handleScanClick = () => {
    startScan();
  };

  return (
    <div
      className="absolute inset-0 z-[200] bg-midnight/95 backdrop-blur-2xl flex flex-col font-inter transition-all duration-300 animate-fadeIn"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-cyan to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(0,243,255,0.2)]">
            <AudioLines className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight">
              Audio Library
            </h2>
            <p className="text-neon-cyan/70 font-mono text-[10px] tracking-widest uppercase">
              {files.length} Tracks Discovered
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:rotate-90 transition-all duration-300 group"
        >
          <X className="w-5 h-5 text-white/50 group-hover:text-white" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 p-6 border-b border-white/5 items-center justify-between">
        <div className="flex-1 w-full relative">
          <Search className="w-5 h-5 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tracks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan focus:bg-white/10 transition-colors"
          />
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <button
            onClick={handleScanClick}
            disabled={isScanning}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-neon-cyan to-blue-600 hover:from-blue-400 hover:to-neon-cyan text-midnight font-bold px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(0,243,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScanning ? (
              <div className="w-5 h-5 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
            ) : (
              <FolderSearch className="w-5 h-5" />
            )}
            {isScanning ? 'Scanning...' : 'Scan Device'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 font-mono text-sm">
            ERROR: {error}
          </div>
        )}

        {files.length === 0 && !isScanning && !error && (
          <div className="h-full flex flex-col items-center justify-center text-white/30">
            <Disc3 className="w-24 h-24 mb-6 opacity-20" />
            <h3 className="text-xl font-bold text-white/50 mb-2">No Audio Found</h3>
            <p className="font-mono text-xs max-w-sm text-center">
              Click "Scan Device" to recursively search for supported audio files ({Capacitor.isNativePlatform() ? 'Documents/Music' : 'Music Folder'}).
            </p>
          </div>
        )}

        <div
          className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
        >
          {filteredFiles.map((file) => (
            <div
              key={file.path}
              onClick={() => onPlay(file.path)}
              className="group relative bg-white/5 hover:bg-white/10 border border-white/5 hover:border-neon-cyan/50 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,243,255,0.15)] flex items-center gap-4"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getGradient(file.name)} flex items-center justify-center flex-shrink-0 shadow-inner overflow-hidden relative`}>
                <Music className="w-8 h-8 text-white/50" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold truncate group-hover:text-neon-cyan transition-colors">
                  {file.name.replace(file.extension, '')}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/60 tracking-wider">
                    {file.extension.toUpperCase().replace('.', '')}
                  </span>
                  {file.size && (
                    <span className="text-[10px] font-mono text-white/30 truncate">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
