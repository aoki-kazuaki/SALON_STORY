import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { dateFloorToWindow } from "@/utils/date";

/** S3 互換エンドポイント (ローカルは MinIO、本番 AWS S3 は空文字) */
const endpoint: string = process.env.S3_ENDPOINT ?? "";

/** MinIO 等のカスタムエンドポイントを利用するかどうか */
const hasCustomEndpoint: boolean = !(endpoint === "");

/** アクセスキーが設定されているかどうか (未設定時は IAM ロール等の既定認証情報を利用) */
const hasStaticCredentials: boolean = !((process.env.S3_ACCESS_KEY_ID ?? "") === "");

/** バケット名 */
const bucket: string = process.env.S3_BUCKET ?? "";

/**
 * 表示用署名付きURLを同一に保つ区間 (3日、秒)
 * - 署名日時を区間の開始にそろえることで、区間内は毎回同じURLになり、ブラウザキャッシュが効く (S3 への再ダウンロードを防ぐ)
 */
const PRESIGNED_URL_WINDOW_SECONDS = 60 * 60 * 24 * 3;

/**
 * 表示用署名付きURLの有効期限 (6日、秒)
 * - 区間の終わりに発行したURLも最低3日は有効になるよう、区間の2倍とする (SigV4 の上限は7日)
 * - IAM ユーザーのアクセスキー前提。IAM ロールの一時認証情報の場合は認証情報の失効が先に来る
 */
const PRESIGNED_URL_EXPIRES_IN_SECONDS = PRESIGNED_URL_WINDOW_SECONDS * 2;

/**
 * 画像レスポンスのキャッシュ指定 (署名付きURLのクエリで S3 に返させるため、既存の画像にも適用される)
 * - オブジェクトキーはアップロードごとに新しく発行するため、同じURLの内容が変わることはない (immutable)
 */
const IMAGE_RESPONSE_CACHE_CONTROL = `private, max-age=${PRESIGNED_URL_WINDOW_SECONDS}, immutable`;

const s3Client = new S3Client({
  region: process.env.S3_REGION ?? "ap-northeast-1",
  ...(hasCustomEndpoint && { endpoint, forcePathStyle: true }),
  ...(hasStaticCredentials && {
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
    },
  }),
});

/** バケット存在確認を1プロセスにつき1回に抑えるためのキャッシュ */
const globalForS3 = globalThis as unknown as { s3BucketReady: Promise<void> | null };

/** ローカル (MinIO) の場合のみ、バケットが無ければ作成する */
const ensureBucket = async (): Promise<void> => {
  if (!hasCustomEndpoint) return;
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch {
    await s3Client.send(new CreateBucketCommand({ Bucket: bucket }));
  }
};

/** バケットの準備を待つ (失敗時はキャッシュを破棄し、次回呼び出しで再試行する) */
const s3EnsureBucket = (): Promise<void> => {
  globalForS3.s3BucketReady =
    globalForS3.s3BucketReady ??
    ensureBucket().catch((error: unknown) => {
      globalForS3.s3BucketReady = null;
      throw error;
    });
  return globalForS3.s3BucketReady;
};

/** オブジェクトをアップロードする */
export const s3PutObject = async (objectKey: string, body: Uint8Array, contentType: string): Promise<void> => {
  await s3EnsureBucket();
  await s3Client.send(new PutObjectCommand({ Bucket: bucket, Key: objectKey, Body: body, ContentType: contentType }));
};

/** オブジェクトを物理削除する */
export const s3DeleteObject = async (objectKey: string): Promise<void> => {
  await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: objectKey }));
};

/** 表示用の署名付きURL (Presigned URL) を発行する (同じ区間内は同一URL・ブラウザキャッシュ可) */
export const s3CreatePresignedGetUrl = async (objectKey: string): Promise<string> =>
  getSignedUrl(
    s3Client,
    new GetObjectCommand({ Bucket: bucket, Key: objectKey, ResponseCacheControl: IMAGE_RESPONSE_CACHE_CONTROL }),
    {
      expiresIn: PRESIGNED_URL_EXPIRES_IN_SECONDS,
      signingDate: dateFloorToWindow(new Date(), PRESIGNED_URL_WINDOW_SECONDS),
    },
  );
