import { describe, expect, it } from "vitest";
import {
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

  it("does not schedule an effect while the master sound switch is off", () => {
    const audio = new HanaAudio(false);

    expect(audio.play("tap")).toBe(false);
    expect(audio.hasRecentEffect()).toBe(false);
  });
});
