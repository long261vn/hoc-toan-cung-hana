import { describe, expect, it } from "vitest";
import { decodeAvatarJpeg } from "./routers";

describe("decodeAvatarJpeg", () => {
  it("accepts a small JPEG data URL after client-side resizing", () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
    const bytes = decodeAvatarJpeg(`data:image/jpeg;base64,${jpeg.toString("base64")}`);
    expect(bytes).toEqual(jpeg);
  });

  it("rejects unsupported image payloads", () => {
    expect(() => decodeAvatarJpeg("data:image/png;base64,aGVsbG8=")).toThrow(
      "Avatar must be a resized JPEG image."
    );
  });

  it("rejects avatar payloads above the server size limit", () => {
    const oversizedBytes = Buffer.alloc(512 * 1024 + 1);
    oversizedBytes[0] = 0xff;
    oversizedBytes[1] = 0xd8;
    const oversized = oversizedBytes.toString("base64");
    expect(() => decodeAvatarJpeg(`data:image/jpeg;base64,${oversized}`)).toThrow(
      "Avatar image is too large."
    );
  });

  it("rejects a JPEG-labelled string without JPEG bytes", () => {
    expect(() => decodeAvatarJpeg("data:image/jpeg;base64,aGVsbG8=")).toThrow(
      "Avatar must contain valid JPEG data."
    );
  });
});
