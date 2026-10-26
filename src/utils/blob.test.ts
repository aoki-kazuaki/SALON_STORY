import imageCompression from "browser-image-compression";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  BACKGROUND_COMPRESS_CONTENT_TYPE,
  BACKGROUND_COMPRESS_MAX_EDGE_PX,
  BACKGROUND_COMPRESS_MAX_SIZE_MB,
} from "@/constants/app";

import { blobCompressBackgroundImage } from "./blob";

// jsdom には canvas の画像エンコードが無いため、圧縮ライブラリ本体はモックする
vi.mock("browser-image-compression", () => ({ default: vi.fn() }));

/** 圧縮ライブラリのモック */
const imageCompressionMock = vi.mocked(imageCompression);

describe("blobCompressBackgroundImage", () => {
  beforeEach(() => {
    imageCompressionMock.mockReset();
    imageCompressionMock.mockResolvedValue(new File(["compressed"], "IMG_0001.png", { type: "image/jpeg" }));
  });

  it("長辺・目標サイズ・JPEG 形式を指定して圧縮し、外部 CDN の Web Worker は使わない", async () => {
    const source = new File(["original"], "IMG_0001.png", { type: "image/png" });
    await blobCompressBackgroundImage(source);
    expect(imageCompressionMock).toHaveBeenCalledWith(
      source,
      expect.objectContaining({
        maxWidthOrHeight: BACKGROUND_COMPRESS_MAX_EDGE_PX,
        maxSizeMB: BACKGROUND_COMPRESS_MAX_SIZE_MB,
        fileType: BACKGROUND_COMPRESS_CONTENT_TYPE,
        useWebWorker: false,
      }),
    );
  });

  it.each([
    ["IMG_0001.png", "IMG_0001.jpg"],
    ["salon.photo.webp", "salon.photo.jpg"],
    ["background", "background.jpg"],
  ])("%s → %s (JPEG の File として返す)", async (sourceName, expectedName) => {
    const result = await blobCompressBackgroundImage(new File(["original"], sourceName, { type: "image/png" }));
    expect(result.name).toBe(expectedName);
    expect(result.type).toBe(BACKGROUND_COMPRESS_CONTENT_TYPE);
    expect(await result.text()).toBe("compressed");
  });

  it("画像として読み込めない場合はエラーを投げる", async () => {
    imageCompressionMock.mockRejectedValue(new Error("decode failed"));
    await expect(blobCompressBackgroundImage(new File(["x"], "broken.jpg"))).rejects.toThrow("decode failed");
  });
});
