export function initMusicController(settings = {}) {
  const { enabled = false, volume = 0.4, delaySeconds = 15, bypassDelay = false } = settings;

  const FADE_DURATION_MS = 1500;
  const FADE_STEPS = 40;

  let audio = null;
  let currentTrackIndex = 0;
  let tracks = [];
  let delayTimer = null;
  let isStarted = false;
  let targetVolume = Math.min(1, Math.max(0, volume));
  let fadeInterval = null;
  let currentLyrics = [];
  let currentLyricIndex = -1;
  let syncAnimationFrameId = null;

  function syncLyrics() {
    if (!audio || audio.paused || audio.ended) {
      stopLyricSync();
      return;
    }
    if (currentLyrics.length > 0) {
      const currentTime = audio.currentTime;
      let activeIndex = -1;
      for (let i = 0; i < currentLyrics.length; i++) {
        if (currentTime >= currentLyrics[i].time) {
          activeIndex = i;
        } else {
          break;
        }
      }

      if (activeIndex !== currentLyricIndex) {
        currentLyricIndex = activeIndex;
        const text = activeIndex >= 0 ? currentLyrics[activeIndex].text : "";
        dispatchLyric(text);
      }
    }
    syncAnimationFrameId = requestAnimationFrame(syncLyrics);
  }

  function startLyricSync() {
    stopLyricSync();
    syncAnimationFrameId = requestAnimationFrame(syncLyrics);
  }

  function stopLyricSync() {
    if (syncAnimationFrameId !== null) {
      cancelAnimationFrame(syncAnimationFrameId);
      syncAnimationFrameId = null;
    }
  }

  function clearFade() {
    if (fadeInterval !== null) {
      clearInterval(fadeInterval);
      fadeInterval = null;
    }
  }

  function fadeIn(audioEl, toVolume, onDone) {
    clearFade();
    audioEl.volume = 0;
    const step = toVolume / FADE_STEPS;
    const interval = FADE_DURATION_MS / FADE_STEPS;
    fadeInterval = setInterval(() => {
      if (!audioEl || audioEl.ended) {
        clearFade();
        return;
      }
      const next = Math.min(toVolume, audioEl.volume + step);
      audioEl.volume = next;
      if (next >= toVolume) {
        clearFade();
        if (onDone) onDone();
      }
    }, interval);
  }

  function fadeOut(audioEl, onDone) {
    clearFade();
    const from = audioEl.volume;
    const step = from / FADE_STEPS;
    const interval = FADE_DURATION_MS / FADE_STEPS;
    fadeInterval = setInterval(() => {
      if (!audioEl || audioEl.ended) {
        clearFade();
        if (onDone) onDone();
        return;
      }
      const next = Math.max(0, audioEl.volume - step);
      audioEl.volume = next;
      if (next <= 0) {
        clearFade();
        audioEl.pause();
        if (onDone) onDone();
      }
    }, interval);
  }

  function dispatchNowPlaying(track, isPlaying = true) {
    const event = new CustomEvent("nowplaying", {
      detail: {
        title: track.title || track.file || "Unknown",
        artist: track.artist || "Unknown Artist",
        status: isPlaying ? "playing" : "paused",
        playing: true,
        cover: track.cover || null,
      },
    });
    window.dispatchEvent(event);

    // Update Media Session API for OS media controls
    if ("mediaSession" in navigator) {
      try {
        const baseMetadata = {
          title: track.title || "Unknown",
          artist: track.artist || "Unknown Artist",
          artwork: []
        };

        if (track.cover) {
          const fullUrl = chrome.runtime.getURL(`assets/music/${track.cover}`);
          fetch(fullUrl)
            .then(r => r.blob())
            .then(blob => {
              const blobUrl = URL.createObjectURL(blob);
              navigator.mediaSession.metadata = new MediaMetadata({
                ...baseMetadata,
                artwork: [{ src: blobUrl, sizes: "512x512", type: blob.type || "image/jpeg" }]
              });
            })
            .catch(() => {
              // Fallback: set metadata without artwork
              navigator.mediaSession.metadata = new MediaMetadata(baseMetadata);
            });
        } else {
          navigator.mediaSession.metadata = new MediaMetadata(baseMetadata);
        }
      } catch (e) {
        console.error("Error setting MediaSession metadata:", e);
      }
    }
  }

  function dispatchStopped() {
    window.dispatchEvent(
      new CustomEvent("nowplaying", {
        detail: { status: "stopped", playing: false },
      }),
    );
  }

  function dispatchLyric(text) {
    window.dispatchEvent(
      new CustomEvent("lyricupdate", {
        detail: { text },
      }),
    );
  }

  function loadLyrics(lyricFile) {
    currentLyrics = [];
    currentLyricIndex = -1;
    dispatchLyric("");

    if (!lyricFile) {
      dispatchLyric("No lyrics available for this track.");
      setTimeout(() => {
        dispatchLyric("");
      }, 5000);
      return;
    }

    fetch(`assets/music/${lyricFile}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load lyrics file: ${lyricFile}`);
        return res.text();
      })
      .then((text) => {
        const lines = text.split(/\r?\n/);
        const parsed = [];
        const timestampRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

        for (const line of lines) {
          timestampRegex.lastIndex = 0;
          const matches = [...line.matchAll(timestampRegex)];
          if (matches.length === 0) continue;

          const cleanText = line.replace(/\[\d{2}:\d{2}(?:\.\d{2,3})?\]/g, "").trim();

          for (const match of matches) {
            const min = parseInt(match[1], 10);
            const sec = parseInt(match[2], 10);
            const msStr = match[3] || "0";
            const ms = parseFloat(`0.${msStr}`);
            const seconds = min * 60 + sec + ms;
            parsed.push({ time: seconds, text: cleanText });
          }
        }

        parsed.sort((a, b) => a.time - b.time);
        currentLyrics = parsed;
      })
      .catch((err) => {
        dispatchLyric(`Could not load lyrics: ${err.message}`);
        setTimeout(() => {
          dispatchLyric("");
        }, 5000);
      });
  }

  fetch("assets/music/tracks.json")
    .then((res) => res.json())
    .then((data) => {
      tracks = (data.tracks || [])
        .map((t) => (typeof t === "string" ? { file: t } : t))
        .filter((t) => {
          const ext = (t.file || "").toLowerCase().split(".").pop();
          return ext === "mp3" || ext === "flac" || ext === "ogg" || ext === "wav";
        });

      if (!enabled || tracks.length === 0) return;

      tracks = shuffleArray(tracks);

      if (bypassDelay || delaySeconds <= 0) {
        startPlayback();
        setTimeout(() => {
          if (audio && !audio.paused && !audio.ended) {
            audio.pause();
            dispatchStopped();
          }
        }, 3600 * 1000);
      } else {
        delayTimer = setTimeout(() => {
          startPlayback();
        }, delaySeconds * 1000);
      }
    })
    .catch((err) => {
      setTimeout(() => {
        dispatchLyric(`[Music] ${err.message}`);
      }, 3000);
    });

  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startPlayback() {
    if (isStarted || tracks.length === 0) return;
    isStarted = true;
    playTrack(currentTrackIndex);
  }

  function dispatchError(reason) {
    window.dispatchEvent(
      new CustomEvent("nowplayingerror", {
        detail: { reason },
      }),
    );
  }

  function playTrack(index) {
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio = null;
    }
    clearFade();
    stopLyricSync();

    const track = tracks[index % tracks.length];
    loadLyrics(track.lyrics);
    const newAudio = new Audio(`assets/music/${track.file}`);
    audio = newAudio;

    newAudio.addEventListener("error", () => {
      const err = newAudio.error;
      const codeMap = {
        1: "Playback was aborted.",
        2: "A network error occurred.",
        3: "Audio decoding failed — file may be corrupt or unsupported.",
        4: `Format not supported: ${track.file}`,
      };
      const msg = (err && codeMap[err.code]) || "Unknown audio error.";
      dispatchError(msg);
      dispatchLyric("");
      stopLyricSync();
      setTimeout(() => {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        playTrack(currentTrackIndex);
      }, 2000);
    });

    newAudio
      .play()
      .then(() => {
        dispatchNowPlaying(track);
        fadeIn(newAudio, targetVolume);
        startLyricSync();
      })
      .catch((err) => {
        if (err.name === "NotAllowedError") {
          dispatchError("Autoplay blocked by browser. Interact with the page first.");
        } else if (err.name === "NotSupportedError") {
          dispatchError(`Format not supported: ${track.file}`);
        } else {
          dispatchError("Audio could not be played.");
        }
      });

    newAudio.addEventListener("ended", () => {
      clearFade();
      stopLyricSync();
      currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
      playTrack(currentTrackIndex);
    });
  }

  const controller = {
    setVolume(vol) {
      targetVolume = Math.min(1, Math.max(0, vol));
      if (audio && !audio.paused && !audio.ended) {
        clearFade();
        audio.volume = targetVolume;
      }
    },
    stop() {
      clearTimeout(delayTimer);
      clearFade();
      stopLyricSync();
      dispatchStopped();
      dispatchLyric("");
      currentLyrics = [];
      currentLyricIndex = -1;
      if (audio) {
        const dying = audio;
        audio = null;
        dying.onended = null;
        fadeOut(dying, () => {
          dying.pause();
        });
      }
      isStarted = false;
    },
    start() {
      if (tracks.length > 0 && !isStarted) {
        startPlayback();
      }
    },
    next() {
      if (tracks.length === 0) return;
      clearFade();
      currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
      playTrack(currentTrackIndex);
    },
    togglePlayPause() {
      if (!audio) return;
      clearFade();
      if (audio.paused) {
        audio.play().then(() => {
          if (tracks[currentTrackIndex]) {
            dispatchNowPlaying(tracks[currentTrackIndex], true);
          }
          fadeIn(audio, targetVolume);
          startLyricSync();
        });
      } else {
        stopLyricSync();
        fadeOut(audio, () => {
          if (tracks[currentTrackIndex]) {
            dispatchNowPlaying(tracks[currentTrackIndex], false);
          }
        });
      }
    },
    shuffle() {
      if (tracks.length === 0) return;
      clearFade();
      tracks = shuffleArray(tracks);
      currentTrackIndex = 0;
      playTrack(currentTrackIndex);
    }
  };

  // Bind Media Session action handlers to the controller methods
  if ("mediaSession" in navigator) {
    try {
      navigator.mediaSession.setActionHandler("play", () => {
        controller.togglePlayPause();
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        controller.togglePlayPause();
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        controller.next();
      });
    } catch (e) {
      console.error("Error binding MediaSession action handlers:", e);
    }
  }

  return controller;
}
