import sharp from "sharp";
import { expect, test } from "vitest";
import { compressImage } from "./compressImage";

test("compressImage produces a decodable WebP within Bluesky's size limit", async () => {
  const input = await sharp({
    create: {
      background: "red",
      channels: 3,
      height: 24,
      width: 32,
    },
  })
    .png()
    .toBuffer();

  const output = await compressImage(new Blob([new Uint8Array(input)]));

  expect(output).toBeDefined();
  if (output === undefined) {
    throw new Error("Image compression returned no image");
  }

  expect(output.type).toBe("image/webp");
  expect(output.size).toBeGreaterThan(0);
  expect(output.size).toBeLessThanOrEqual(1_000_000);

  const decoded = await sharp(await output.arrayBuffer())
    .raw()
    .toBuffer({ resolveWithObject: true });
  expect(decoded.info.width).toBe(32);
  expect(decoded.info.height).toBe(24);
  expect(decoded.data.byteLength).toBeGreaterThan(0);
});
