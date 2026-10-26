import imageCompression from "browser-image-compression";

import {
  BACKGROUND_COMPRESS_CONTENT_TYPE,
  BACKGROUND_COMPRESS_INITIAL_QUALITY,
  BACKGROUND_COMPRESS_MAX_EDGE_PX,
  BACKGROUND_COMPRESS_MAX_SIZE_MB,
} from "@/constants/app";

/**
 * 背景画像をアップロード用に縮小・圧縮する (ブラウザ専用)
 * - 長辺 1920px 以内・約1MB 以内の JPEG に変換する (EXIF の向きは補正済みで出力される)
 * - Web Worker は外部 CDN からスクリプトを読み込むため使用せず、メインスレッドで処理する
 * @param file ユーザーが選択した画像ファイル
 * @returns 圧縮後の画像ファイル (ファイル名の拡張子は .jpg に置き換える)
 */
export const blobCompressBackgroundImage = async (file: File): Promise<File> => {
  const compressed = await imageCompression(file, {
    maxSizeMB: BACKGROUND_COMPRESS_MAX_SIZE_MB,
    maxWidthOrHeight: BACKGROUND_COMPRESS_MAX_EDGE_PX,
    initialQuality: BACKGROUND_COMPRESS_INITIAL_QUALITY,
    fileType: BACKGROUND_COMPRESS_CONTENT_TYPE,
    useWebWorker: false,
  });
  const fileName = `${file.name.replace(/\.[^.]*$/, "")}.jpg`;
  return new File([compressed], fileName, { type: BACKGROUND_COMPRESS_CONTENT_TYPE });
};
