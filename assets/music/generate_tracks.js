const fs = require('fs');
const path = require('path');

const MUSIC_DIR = __dirname;
const OUTPUT_FILE = path.join(MUSIC_DIR, 'tracks.json');

// Supported audio formats
const AUDIO_EXTS = new Set(['.mp3', '.flac', '.ogg', '.wav']);

function cleanName(str) {
  // Replace underscores and hyphens with spaces, capitalize words nicely
  return str
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function scanDir(dir, relativeTo = MUSIC_DIR) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(scanDir(filePath, relativeTo));
    } else {
      const ext = path.extname(file).toLowerCase();
      if (AUDIO_EXTS.has(ext)) {
        results.push(filePath);
      }
    }
  });

  return results;
}

function main() {
  console.log(`Scanning music folder: ${MUSIC_DIR}`);
  const audioFiles = scanDir(MUSIC_DIR);
  const tracks = [];

  audioFiles.forEach((filePath) => {
    const relPath = path.relative(MUSIC_DIR, filePath).replace(/\\/g, '/');
    const ext = path.extname(filePath);
    const baseWithoutExt = path.basename(filePath, ext);
    
    // Determine lyrics file path (same directory and base name, but .lrc extension)
    const lrcPathLocal = filePath.slice(0, -ext.length) + '.lrc';
    let lyricsRelPath = null;
    if (fs.existsSync(lrcPathLocal)) {
      lyricsRelPath = path.relative(MUSIC_DIR, lrcPathLocal).replace(/\\/g, '/');
    }

    // Determine cover image path (fallback: look for cover.jpg/png in current dir or artist parent dir)
    const imgExts = ['.jpg', '.jpeg', '.png'];
    let coverRelPath = null;

    // 1. Look for matching song image name: e.g. "Happiness.jpg"
    for (const imgExt of imgExts) {
      const imgPathLocal = filePath.slice(0, -ext.length) + imgExt;
      if (fs.existsSync(imgPathLocal)) {
        coverRelPath = path.relative(MUSIC_DIR, imgPathLocal).replace(/\\/g, '/');
        break;
      }
    }

    // 2. Look for "cover.ext" or "folder.ext" in the immediate song directory
    if (!coverRelPath) {
      const songDir = path.dirname(filePath);
      const possibleNames = ['cover', 'folder', 'album'];
      for (const name of possibleNames) {
        for (const imgExt of imgExts) {
          const imgPathLocal = path.join(songDir, name + imgExt);
          if (fs.existsSync(imgPathLocal)) {
            coverRelPath = path.relative(MUSIC_DIR, imgPathLocal).replace(/\\/g, '/');
            break;
          }
        }
        if (coverRelPath) break;
      }
    }

    // 3. Look for "cover.ext" or "folder.ext" in the artist parent directory (if nested inside an album subfolder)
    if (!coverRelPath && relPath.split('/').length > 2) {
      const artistDir = path.join(MUSIC_DIR, relPath.split('/')[0]);
      const possibleNames = ['cover', 'folder', 'album'];
      for (const name of possibleNames) {
        for (const imgExt of imgExts) {
          const imgPathLocal = path.join(artistDir, name + imgExt);
          if (fs.existsSync(imgPathLocal)) {
            coverRelPath = path.relative(MUSIC_DIR, imgPathLocal).replace(/\\/g, '/');
            break;
          }
        }
        if (coverRelPath) break;
      }
    }

    // Try to determine artist and title
    let artist = 'Unknown Artist';
    let title = cleanName(baseWithoutExt);

    // If file is in a subdirectory, the top-level directory name is the artist
    const pathParts = relPath.split('/');
    if (pathParts.length > 1) {
      const rawArtist = pathParts[0];
      const spacedArtist = rawArtist.replace(/(?<!^)([A-Z])/g, ' $1');
      artist = cleanName(spacedArtist);
    }

    // Alternatively, if filename contains " - ", split it
    if (baseWithoutExt.includes(' - ')) {
      const parts = baseWithoutExt.split(' - ');
      artist = cleanName(parts[0]);
      title = cleanName(parts[1]);
    }

    tracks.push({
      file: relPath,
      title: title,
      artist: artist,
      lyrics: lyricsRelPath,
      cover: coverRelPath
    });
  });

  const outputData = {
    musicDirectory: MUSIC_DIR,
    tracks
  };
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2), 'utf8');
  console.log(`Successfully generated ${OUTPUT_FILE} with ${tracks.length} tracks.`);
}

main();
