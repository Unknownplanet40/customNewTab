# Capsss New Tab

Capsss New Tab is a modern Chrome / Microsoft Edge new-tab extension that replaces the default blank page with a beautiful, interactive dashboard.

It combines a liquid-glass UI, multi-engine search, smart widgets, animated backgrounds, and a local music player with synced lyrics.

---

## Highlights

- **Liquid Glass (Glassmorphism) UI** with interactive tilt effects
- **Multi-engine search** (Google, Bing, DuckDuckGo, YouTube, ChatGPT, Claude, Grok)
- **Search suggestions** using Google Suggest
- **Digital + analog clocks**, date widget, and dynamic greetings
- **Birthday and special event greetings**
- **Daily content widget** (quotes, facts, riddles, jokes)
- **Optional online data mode** via API Ninjas
- **Built-in music player** with visualizer and `.lrc` synchronized lyrics
- **Popup control center** for feature toggles and personalization

---

## Project Structure

```text
customNewTab/
├── manifest.json
├── index.html
├── mainScript.js
├── mainStyle.css
├── popup.html
├── popup.js
├── README.md
└── assets/
   ├── css/
   ├── fonts/
   ├── images/
   │   ├── DynamicWallpapers/
   │   ├── icons/
   │   ├── Previews/
   │   └── shortcuts/
   ├── js/
   ├── music/
   └── vendors/
```

---

## Install (Unpacked Extension)

### Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this project folder (the one containing `manifest.json`)

### Edge

1. Open `edge://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this project folder
5. If prompted, choose **Keep changes**

---

## First-Time Setup

1. Open a new tab to verify the dashboard is active.
2. Pin the extension from your browser’s extension menu.
3. Open the popup settings panel and configure:
  - preferred search engine
  - widget visibility
  - display name and birthday
  - theme and animation preferences
  - shortcut links/accounts

---

## Music Library Setup

The player supports local `.mp3` / `.flac` tracks and optional synced `.lrc` files.

### Naming Rules

1. Add artist folders under `assets/music/` using **PascalCase** without spaces.
  - Example: `RexOrangeCounty`
2. Keep lyric and audio filenames identical.
  - `Happiness.flac`
  - `Happiness.lrc`

### Rebuild `tracks.json`

- Open `assets/music/manage_music.bat`
- Select option **[1]** to regenerate `tracks.json`

---

## Dynamic Wallpaper Setup

Wallpaper packs are stored in `assets/images/DynamicWallpapers/`.

- Each wallpaper folder should contain a `config.json`
- Use `manage_wallpapers.bat` to rebuild wallpaper metadata
- `folders.json` is used as the generated registry for available wallpaper sets

---

## Online API Mode (Optional)

The daily content widget can use live data from API Ninjas.

- Create an API key at [api-ninjas.com](https://api-ninjas.com/)
- Add the key from the popup settings panel
- If no key is provided, offline/local fallback content is used

---

## Tech Notes

- Extension platform: **Manifest V3**
- Front-end: vanilla JS, HTML, CSS
- Bundled vendors: Bootstrap, SweetAlert2, jQuery, Anime.js
- No build step required for normal use (load unpacked directly)

---

## Troubleshooting

- **Changes not showing?** Reload the extension from the browser extensions page.
- **New tab not replaced?** Ensure this extension is enabled and allowed to override new tab.
- **Music not loading?** Recheck file paths and regenerate `tracks.json`.
- **Lyrics not syncing?** Ensure `.lrc` filename exactly matches the audio filename.

---

## License

Released under the [MIT License](LICENSE).
