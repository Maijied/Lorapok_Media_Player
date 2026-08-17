import { useState, useCallback } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export interface ScannedAudioFile {
  name: string;
  path: string;
  size?: number;
  extension: string;
}

export function useDeviceScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState<ScannedAudioFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const scanDesktop = async (customDir?: string) => {
    if (!window.ipcRenderer) return [];
    try {
      const results = await window.ipcRenderer.invoke('scan-directory', customDir);
      return results as ScannedAudioFile[];
    } catch (e: any) {
      throw new Error(`Desktop scan failed: ${e.message}`);
    }
  };

  const scanAndroidDir = async (path: string, directory: Directory): Promise<ScannedAudioFile[]> => {
    let results: ScannedAudioFile[] = [];
    try {
      const res = await Filesystem.readdir({ path, directory });
      
      for (const file of res.files) {
        if (file.type === 'directory') {
          const subResults = await scanAndroidDir(`${path}/${file.name}`, directory);
          results = results.concat(subResults);
        } else {
          const name = file.name.toLowerCase();
          if (name.endsWith('.mp3') || name.endsWith('.flac') || name.endsWith('.wav') || name.endsWith('.aac') || name.endsWith('.m4a') || name.endsWith('.ogg')) {
            results.push({
              name: file.name,
              path: Capacitor.convertFileSrc(`${directory}/${path}/${file.name}`),
              size: file.size,
              extension: '.' + name.split('.').pop()
            });
          }
        }
      }
    } catch (e) {
      console.warn(`Could not read ${path}`, e);
    }
    return results;
  };

  const scanAndroid = async () => {
    try {
      const status = await Filesystem.requestPermissions();
      if (status.publicStorage !== 'granted') {
        throw new Error('Storage permission denied.');
      }
      
      // Scan Music directory
      const musicFiles = await scanAndroidDir('', Directory.Documents);
      return musicFiles;
    } catch (e: any) {
      throw new Error(`Android scan failed: ${e.message}`);
    }
  };

  const startScan = useCallback(async (customDir?: string) => {
    setIsScanning(true);
    setProgress(0);
    setError(null);
    try {
      let results: ScannedAudioFile[] = [];
      
      if (Capacitor.isNativePlatform()) {
        setProgress(20);
        results = await scanAndroid();
      } else {
        setProgress(20);
        results = await scanDesktop(customDir);
      }
      
      setProgress(100);
      setFiles(results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsScanning(false);
    }
  }, []);

  return { isScanning, progress, files, error, startScan };
}
