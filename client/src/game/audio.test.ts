import { describe, expect, it } from "vitest";
import {
  BACKGROUND_TRACK,
  getStoredEffectsVolume,
  getStoredMusicVolume,
  getStoredSoundPreference,
  HanaAudio,
} from "./audio";

describe("HanaAudio", () => {
  it("uses enabled sound with a gentle music level and clearer effects before a browser storage value exists", () => {
    expect(getStoredSoundPreference()).toBe(true);
    expect(getStoredMusicVolume()).toBe(18);
    expect(getStoredEffectsVolume()).toBe(70);
  });

  it("uses the public music asset URL so static hosts do not request a missing local proxy", () => {
    expect(BACKGROUND_TRACK).toBe(
      "https://toan3game-yka3ffqo.manus.space/manus-storage/hana-gentle-orbit-background_2257ff98.mp3"
    );
  });

  it("does not schedule an effect while the master sound switch is off", () => {
    const audio = new HanaAudio(false);

    expect(audio.play("tap")).toBe(false);
    expect(audio.hasRecentEffect()).toBe(false);
  });
});
