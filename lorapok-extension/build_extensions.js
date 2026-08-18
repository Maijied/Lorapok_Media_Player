import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXTENSION_DIR = __dirname;
const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.resolve(PROJECT_ROOT, 'lorapok-player', 'release', 'builds', 'extensions');
const WEBSITE_DOWNLOADS = path.resolve(PROJECT_ROOT, 'lorapok-player', 'packages', 'website', 'public', 'downloads');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(WEBSITE_DOWNLOADS, { recursive: true });

function packageExtension(manifestSource, outputFilename) {
  const tempDir = path.join(EXTENSION_DIR, '.tmp_pkg');
  fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(tempDir, { recursive: true });

  // Copy files with specified manifest as manifest.json
  fs.copyFileSync(path.join(EXTENSION_DIR, manifestSource), path.join(tempDir, 'manifest.json'));
  fs.copyFileSync(path.join(EXTENSION_DIR, 'background.js'), path.join(tempDir, 'background.js'));
  fs.copyFileSync(path.join(EXTENSION_DIR, 'popup.html'), path.join(tempDir, 'popup.html'));
  fs.copyFileSync(path.join(EXTENSION_DIR, 'popup.js'), path.join(tempDir, 'popup.js'));
  fs.copyFileSync(path.join(EXTENSION_DIR, 'icon128.png'), path.join(tempDir, 'icon128.png'));

  const outputPath = path.join(OUTPUT_DIR, outputFilename);
  fs.rmSync(outputPath, { force: true });

  // Zip files
  execSync(`cd "${tempDir}" && zip -9 -q -r "${outputPath}" ./*`);
  
  // Copy to website downloads
  const webPath = path.join(WEBSITE_DOWNLOADS, outputFilename);
  fs.copyFileSync(outputPath, webPath);

  const stats = fs.statSync(outputPath);
  console.log(`✅ Packaged ${outputFilename} (${(stats.size / 1024).toFixed(1)} KB)`);

  // Cleanup temp dir
  fs.rmSync(tempDir, { recursive: true, force: true });
}

function buildAll() {
  console.log('🚀 Building Browser Extensions for All Browsers (Chrome, Firefox AMO, Edge)...');
  try {
    packageExtension('manifest.chrome.json', 'lorapok-extension-chrome-1.5.0.zip');
    packageExtension('manifest.chrome.json', 'lorapok-extension-edge-1.5.0.zip');
    packageExtension('manifest.firefox.json', 'lorapok-extension-firefox-1.5.0.xpi');
    packageExtension('manifest.firefox.json', 'lorapok-extension-firefox-1.5.0.zip');
    packageExtension('manifest.chrome.json', 'lorapok-extension-1.5.0.zip');
    console.log('🎉 All Browser Extension Packages Created Successfully!');
  } catch (err) {
    console.error('❌ Error packaging extensions:', err);
    process.exit(1);
  }
}

buildAll();
