import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/** S3 互換エンドポイント (ローカルは MinIO、本番 AWS S3 は空文字) */
const endpoint: string = process.env.S3_ENDPOINT ?? "";

/** MinIO 等のカスタムエンドポイントを利用するかどうか */
const hasCustomEndpoint: boolean = !(endpoint === "");

/** アクセスキーが設定されているかどうか (未設定時は IAM ロール等の既定認証情報を利用) */
const hasStaticCredentials: boolean = !((process.env.S3_ACCESS_KEY_ID ?? "") === "");

/** バケット名 */
const bucket: string = process.env.S3_BUCKET ?? "";

/** 表示用署名付きURLの有効期限 (秒) */
const PRESIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60;

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

/** 表示用の署名付きURL (Presigned URL) を発行する */
export const s3CreatePresignedGetUrl = async (objectKey: string): Promise<string> =>
  getSignedUrl(s3Client, new GetObjectCommand({ Bucket: bucket, Key: objectKey }), {
    expiresIn: PRESIGNED_URL_EXPIRES_IN_SECONDS,
  });
