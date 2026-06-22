# Capsss New Tab

A highly customizable, premium, and feature-rich Chrome / Microsoft Edge extension that replaces your browser's default New Tab page with a stunning, modern dashboard. It features liquid glass (glassmorphism) tilt effects, custom search engine integration, interactive widgets (clocks, greetings, and dynamic search suggestions), background animations, and an embedded background music player with synchronized lyrics support.

---

## Features

- **Premium Glassmorphism (Liquid Glass) Design:** Sleek dark-mode aesthetic with interactive tilt animations and customizable floating background circles.
- **Multi-Engine Search Bar:** Quick engine-switching among Google, Bing, DuckDuckGo, YouTube, ChatGPT, Claude, and Grok. Includes automatic keyword suggestions from Google suggest API.
- **Dynamic Time & Date Widgets:** Offers both a digital clock (with optional seconds display) and an analog liquid-glass clock.
- **Dynamic Greetings & Events:** Greets you based on the time of day, supports custom display names, and features special greetings for your birthday.
- **Daily Entertainment Widget:** Display jokes, riddles, facts, or quotes. Supports both a localized offline collection and real-time online API fetching (via API-Ninjas).
- **Synced Background Music Player:** Integrated music player with control shortcuts, visualizer bars, and synchronized lyric rendering (`.lrc` files support).
- **Popup Settings Panel:** Complete control over your New Tab page with a beautiful popup control center to toggle widgets, configure custom shortcut accounts, manage local paths, set volume, and customize visual themes.

---

## File Structure

```text
custom-NewTab/
├── manifest.json              # Chrome extension configuration manifest (v3)
├── index.html                 # Main dashboard layout
├── mainScript.js              # Core logic, widgets, search engine handlers, clock, and lyrics player
├── mainStyle.css              # Main design system stylesheet, layout, and page-specific rules
├── popup.html                 # Settings popup UI
├── popup.js                   # Settings popup script to read/write storage configurations
└── assets/
    ├── css/                   # Stylesheets for layouts, animations, and glass effects
    ├── fonts/                 # Custom family typography styles
    ├── images/                # Theme graphics, icons, shortcut icons, and logos
    ├── js/                    # Global or custom JS libraries
    ├── vendors/               # Local third-party vendor assets (Bootstrap, SweetAlert2, jQuery, Anime.js)
    └── music/                 # Background music files, tracks registry, and generator scripts
        ├── RexOrangeCounty/   # Example artist subdirectory
        ├── instruction.txt    # Rules for adding music and organizing artist folders
        ├── manage_music.bat   # Windows batch tool to auto-generate and manage tracks.json
        ├── generate_tracks.js # Node.js utility script to parse directories and output tracks.json
        └── tracks.json        # Compiled playlist metadata used by the player
```

---

## 🛠️ Installation & Setup

Follow these detailed steps to install and set up the custom new tab extension in your web browser:

### 1. Download or Clone the Files
You need to have the extension files on your computer. You can either:
* **Option A (Clone):** Use Git to clone the repository:
  ```bash
  git clone https://github.com/YOUR_USERNAME/custom-NewTab.git
  ```
* **Option B (Download ZIP):** Click the green **Code** button on GitHub, select **Download ZIP**, and extract the contents to a folder on your computer.

---

### 2. Install the Extension in Your Browser

#### For Google Chrome:
1. Open Google Chrome.
2. In the address bar, type `chrome://extensions/` and press **Enter**.
3. In the top-right corner of the Extensions page, turn on the **Developer mode** toggle switch.
4. In the top-left corner, click the **Load unpacked** button.
5. Browse your computer, select the root folder of this project (the folder containing `manifest.json`), and click **Select Folder**.
6. The extension is now installed! Open a new tab (`Ctrl + T`) to view your new custom dashboard.

#### For Microsoft Edge:
1. Open Microsoft Edge.
2. In the address bar, type `edge://extensions/` and press **Enter**.
3. In the bottom-left corner of the sidebar, turn on the **Developer mode** toggle switch.
4. Click the **Load unpacked** button at the top of the page.
5. Browse your computer, select the root folder of this project (the folder containing `manifest.json`), and click **Select Folder**.
6. Edge will ask you to confirm if you want to keep the extension when you open a new tab. Click **Keep changes** to keep it active.

---

### 3. Pin the Settings Popup (Recommended)
This extension features a customize/settings menu accessible from the browser toolbar:
1. Click the puzzle piece icon (🧩 **Extensions**) in the top-right of your browser.
2. Find **Capsss New Tab** in the list.
3. Click the pin icon next to it so it is always visible on your toolbar for quick customization.
4. Click the pinned icon to customize search engines, clocks, greetings, online API credentials, and background animations.

---

## Setting Up Background Music

The built-in music player plays local `.mp3` or `.flac` tracks with synchronized lyrics if you supply `.lrc` files.

### Folder Structure rules:
1. **Artist Folder:** Create a folder inside `assets/music/` using **PascalCase** without spaces (e.g. `RexOrangeCounty`). The player will automatically format it to display as "Rex Orange County".
2. **Audio & Lyrics Files:** Ensure the lyric file has the exact same name as the audio file.
   - Example:
     - `assets/music/RexOrangeCounty/Happiness.flac`
     - `assets/music/RexOrangeCounty/Happiness.lrc`
3. **Generate Tracks Registry:**
   - Double-click `manage_music.bat` inside the `assets/music/` directory.
   - Choose **Option [1]** to scan folders and automatically rebuild `tracks.json`.

---

## Configuration

Open the extension's popup window by clicking its icon in the browser toolbar to access these customization options:
- **Search Engine:** Set Google, Bing, DuckDuckGo, YouTube, Grok, ChatGPT, or Claude as your default.
- **Widgets Toggle:** Show/hide date, digital clock, seconds, analog clock, and time-based greeting.
- **Greeting Preferences:** Set your preferred display name and input your birthday to receive an annual birthday card on your dashboard.
- **API integration:** Toggle Online API fetching for quotes/jokes/riddles/facts (requires a free API key from [api-ninjas.com](https://api-ninjas.com/)).
- **Appearance & Effects:** Toggle glass tilt animations, choose color themes for background circles, and set background speeds.
- **Shortcut Links:** Configure multiple Gmail accounts (dropdown shortcuts) and display custom quick links.

---

## License

This project is open-source and available under the [MIT License](LICENSE).


## Preview
![Preview 1](assets/images/Previews/Preview%201.png)
![Preview 2](assets/images/Previews/Preview%202.png)
![Preview 3](assets/images/Previews/Preview%203.png)
![Preview 4](assets/images/Previews/Preview%204.png)
![Preview 5](assets/images/Previews/Preview%205.png)
![Preview 6](assets/images/Previews/Preview%206.png)
![Preview 7](assets/images/Previews/Preview%207.png)