/**
 * Học Toán Cùng Hana audio: gentle background music plus short, low-volume
 * Web Audio signals that affirm actions without disrupting reading or reasoning.
 */

export type SoundEffect =
  | "tap"
  | "launch"
  | "correct"
  | "wrong"
  | "next"
  | "reward";

const BACKGROUND_TRACK_PATH =
  "/manus-storage/hana-gentle-orbit-background_2257ff98.mp3";
const MANUS_ASSET_ORIGIN = "https://toan3game-yka3ffqo.manus.space";

/**
 * GitHub Pages has no `/manus-storage` proxy, so a root-relative track URL
 * becomes a 404 there. Keep the short project-relative path for Manus while
 * using the same public asset through an absolute URL on GitHub Pages.
 */
const BACKGROUND_TRACK =
  typeof window !== "undefined" && window.location.hostname.endsWith("github.io")
    ? `${MANUS_ASSET_ORIGIN}${BACKGROUND_TRACK_PATH}`
    : BACKGROUND_TRACK_PATH;
const STORAGE_KEY = "hana-sound-enabled";
const MUSIC_VOLUME_STORAGE_KEY = "hana-music-volume";
const EFFECTS_VOLUME_STORAGE_KEY = "hana-effects-volume";
const AUDIO_SETTINGS_VERSION_KEY = "hana-audio-settings-version";
const DEFAULT_MUSIC_VOLUME = 18;
const DEFAULT_EFFECTS_VOLUME = 70;

type Tone = {
  frequency: number;
  delay: number;
  duration: number;
  volume: number;
  type?: OscillatorType;
};

const soundPatterns: Record<SoundEffect, Tone[]> = {
  tap: [
    { frequency: 660, delay: 0, duration: 0.055, volume: 0.07, type: "sine" },
  ],
  launch: [
    { frequency: 392, delay: 0, duration: 0.08, volume: 0.095 },
    { frequency: 523.25, delay: 0.07, duration: 0.1, volume: 0.09 },
    { frequency: 783.99, delay: 0.15, duration: 0.14, volume: 0.08 },
  ],
  correct: [
    { frequency: 523.25, delay: 0, duration: 0.09, volume: 0.13 },
    { frequency: 659.25, delay: 0.08, duration: 0.1, volume: 0.125 },
    { frequency: 783.99, delay: 0.17, duration: 0.15, volume: 0.115 },
  ],
  wrong: [
    {
      frequency: 293.66,
      delay: 0,
      duration: 0.11,
      volume: 0.08,
      type: "sine",
    },
    {
      frequency: 246.94,
      delay: 0.1,
      duration: 0.14,
      volume: 0.07,
      type: "sine",
    },
  ],
  next: [
    { frequency: 587.33, delay: 0, duration: 0.075, volume: 0.08 },
    { frequency: 698.46, delay: 0.065, duration: 0.095, volume: 0.07 },
  ],
  reward: [
    { frequency: 523.25, delay: 0, duration: 0.09, volume: 0.1 },
    { frequency: 659.25, delay: 0.08, duration: 0.1, volume: 0.1 },
    { frequency: 783.99, delay: 0.17, duration: 0.11, volume: 0.095 },
    { frequency: 1046.5, delay: 0.27, duration: 0.22, volume: 0.085 },
  ],
};

export function getStoredSoundPreference() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(STORAGE_KEY) !== "false";
}

function getStoredVolume(key: string, fallback: number) {
  if (typeof window === "undefined") return fallback;
  // Move only the old default 50/50 balance to the gentler 18/70 mix. A child
  // or parent who adjusted either slider keeps their own saved preference.
  if (window.localStorage.getItem(AUDIO_SETTINGS_VERSION_KEY) !== "3") {
    const previousVersion = window.localStorage.getItem(AUDIO_SETTINGS_VERSION_KEY);
    const storedMusic = Number(window.localStorage.getItem(MUSIC_VOLUME_STORAGE_KEY));
    const storedEffects = Number(window.localStorage.getItem(EFFECTS_VOLUME_STORAGE_KEY));
    const isPreviousDefault = storedMusic === 50 && storedEffects === 50;
    if (previousVersion !== "2" || isPreviousDefault) {
      window.localStorage.setItem(
        MUSIC_VOLUME_STORAGE_KEY,
        String(DEFAULT_MUSIC_VOLUME)
      );
      window.localStorage.setItem(
        EFFECTS_VOLUME_STORAGE_KEY,
        String(DEFAULT_EFFECTS_VOLUME)
      );
    }
    window.localStorage.setItem(AUDIO_SETTINGS_VERSION_KEY, "3");
  }
  const rawValue = window.localStorage.getItem(key);
  if (rawValue === null) return fallback;
  const value = Number(rawValue);
  return Number.isFinite(value)
    ? Math.min(100, Math.max(0, Math.round(value)))
    : fallback;
}

export function getStoredMusicVolume() {
  return getStoredVolume(MUSIC_VOLUME_STORAGE_KEY, DEFAULT_MUSIC_VOLUME);
}

export function getStoredEffectsVolume() {
  return getStoredVolume(EFFECTS_VOLUME_STORAGE_KEY, DEFAULT_EFFECTS_VOLUME);
}

export class HanaAudio {
  private context: AudioContext | null = null;
  private music: HTMLAudioElement | null = null;
  private enabled: boolean;
  private musicVolume: number;
  private effectsVolume: number;
  private musicPrimed = false;
  private lastEffectAt = 0;

  constructor(
    initiallyEnabled: boolean,
    musicVolume = getStoredMusicVolume(),
    effectsVolume = getStoredEffectsVolume()
  ) {
    this.enabled = initiallyEnabled;
    this.musicVolume = musicVolume / 100;
    this.effectsVolume = effectsVolume / 100;
  }

  private getContext() {
    if (typeof window === "undefined") return null;
    if (!this.context) {
      const AudioContextCtor = window.AudioContext ?? window.webkitAudioContext;
      if (!AudioContextCtor) return null;
      this.context = new AudioContextCtor();
    }
    return this.context;
  }

  private getMusic() {
    if (typeof window === "undefined") return null;
    if (!this.music) {
      this.music = document.createElement("audio");
      this.music.dataset.hanaBackgroundMusic = "true";
      this.music.setAttribute("aria-hidden", "true");
      this.music.src = BACKGROUND_TRACK;
      this.music.loop = true;
      this.music.preload = "auto";
      this.music.volume = this.musicVolume;
      this.music.dataset.hanaPlaybackState = "ready";
      this.music.addEventListener("playing", () => {
        if (this.music) this.music.dataset.hanaPlaybackState = "playing";
      });
      this.music.addEventListener("pause", () => {
        if (this.music && !this.music.ended)
          this.music.dataset.hanaPlaybackState = "paused";
      });
      this.music.addEventListener("error", () => {
        if (this.music) this.music.dataset.hanaPlaybackState = "unavailable";
      });
      document.body.appendChild(this.music);
    }
    return this.music;
  }

  /**
   * First try audible autoplay for browsers that explicitly allow it. When a
   * browser blocks audible autoplay, keep a muted track ready so the first
   * child/parent gesture can immediately unmute the same buffered track.
   */
  prime() {
    if (!this.enabled || this.musicPrimed) return;
    const music = this.getMusic();
    if (!music) return;
    this.musicPrimed = true;
    music.muted = false;
    void music.play().then(
      () => {
        music.dataset.hanaPlaybackState = "playing";
      },
      () => {
        music.muted = true;
        void music.play().then(
          () => {
            music.dataset.hanaPlaybackState = "awaiting-gesture";
          },
          () => {
            this.musicPrimed = false;
            music.muted = false;
            music.dataset.hanaPlaybackState = "awaiting-gesture";
          }
        );
      }
    );
  }

  activate() {
    if (!this.enabled) return;
    const context = this.getContext();
    if (context?.state === "suspended")
      void context.resume().catch(() => undefined);
    const music = this.getMusic();
    if (music) music.dataset.hanaPlaybackRequested = "true";
    if (!music) return;
    if (this.musicPrimed && !music.paused) {
      music.muted = false;
      music.dataset.hanaPlaybackState = "playing";
      return;
    }
    music.muted = false;
    void music
      .play()
      .then(() => {
        this.musicPrimed = true;
        music.dataset.hanaPlaybackState = "playing";
      })
      .catch(() => {
        this.musicPrimed = false;
        music.dataset.hanaPlaybackState = "awaiting-gesture";
      });
  }

  setEnabled(nextEnabled: boolean) {
    this.enabled = nextEnabled;
    if (typeof window !== "undefined")
      window.localStorage.setItem(STORAGE_KEY, String(nextEnabled));
    const music = this.getMusic();
    if (!nextEnabled) {
      music?.pause();
      if (music) music.muted = false;
      this.musicPrimed = false;
    } else void this.activate();
  }

  setMusicVolume(nextVolume: number) {
    const volume = Math.min(100, Math.max(0, Math.round(nextVolume)));
    this.musicVolume = volume / 100;
    if (typeof window !== "undefined")
      window.localStorage.setItem(MUSIC_VOLUME_STORAGE_KEY, String(volume));
    const music = this.getMusic();
    if (music) music.volume = this.musicVolume;
  }

  setEffectsVolume(nextVolume: number) {
    const volume = Math.min(100, Math.max(0, Math.round(nextVolume)));
    this.effectsVolume = volume / 100;
    if (typeof window !== "undefined")
      window.localStorage.setItem(EFFECTS_VOLUME_STORAGE_KEY, String(volume));
  }

  hasRecentEffect(windowMs = 110) {
    return performance.now() - this.lastEffectAt < windowMs;
  }

  play(effect: SoundEffect) {
    if (!this.enabled || this.effectsVolume === 0) return false;
    const context = this.getContext();
    if (!context) return false;
    this.lastEffectAt = performance.now();
    if (context.state !== "running") {
      void context
        .resume()
        .then(() => {
          if (context.state === "running") this.scheduleEffect(effect, context);
        })
        .catch(() => undefined);
      return true;
    }
    this.scheduleEffect(effect, context);
    return true;
  }

  private scheduleEffect(effect: SoundEffect, context: AudioContext) {
    const now = context.currentTime;
    soundPatterns[effect].forEach(tone => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = tone.type ?? "triangle";
      oscillator.frequency.setValueAtTime(tone.frequency, now + tone.delay);
      gain.gain.setValueAtTime(0.0001, now + tone.delay);
      gain.gain.exponentialRampToValueAtTime(
        tone.volume * this.effectsVolume,
        now + tone.delay + 0.012
      );
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + tone.delay + tone.duration
      );
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now + tone.delay);
      oscillator.stop(now + tone.delay + tone.duration + 0.025);
    });
  }

  dispose() {
    this.music?.pause();
    this.music?.remove();
    this.music = null;
    this.musicPrimed = false;
    void this.context?.close();
    this.context = null;
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
