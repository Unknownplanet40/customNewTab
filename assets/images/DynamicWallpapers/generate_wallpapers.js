const fs = require('fs');
const path = require('path');

const WP_DIR = __dirname;
const OUTPUT_FILE = path.join(WP_DIR, 'folders.json');

function scanDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      const configPath = path.join(filePath, 'config.json');
      if (fs.existsSync(configPath)) {
        try {
          const configData = fs.readFileSync(configPath, 'utf8');
          const cleanJson = configData.replace(/\/\/.*$/gm, '').replace(/,(?=\s*[}\]])/g, '');
          const config = JSON.parse(cleanJson);
          
          results.push({
            folder: file,
            config: config
          });
        } catch (e) {
          console.error(`Error reading/parsing config.json in ${file}:`, e.message);
        }
      }
    }
  });

  return results;
}

function main() {
  console.log(`Scanning DynamicWallpapers folder: ${WP_DIR}`);
  const wallpapers = scanDir(WP_DIR);

  const outputData = {
    wallpapers: wallpapers
  };
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2), 'utf8');
  console.log(`Successfully generated ${OUTPUT_FILE} with ${wallpapers.length} dynamic wallpapers.`);
}

main();
