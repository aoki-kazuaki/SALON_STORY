import nodemailer from "nodemailer";

import { prisma } from "@/lib/prisma";
import type { MailOutboxItem } from "@/types";

/** SMTP 送信が有効かどうか (SMTP_HOST 未設定時はローカル送信箱に保存する) */
export const isSmtpEnabled: boolean = !((process.env.SMTP_HOST ?? "") === "");

/** ローカル送信箱の最大保持件数 */
const OUTBOX_MAX_ITEMS = 30;

/** ローカル送信箱 (開発サーバーのホットリロードを跨いで保持するため globalThis に格納) */
const globalForMail = globalThis as unknown as { mailOutbox: MailOutboxItem[] | null };
const outbox: MailOutboxItem[] = globalForMail.mailOutbox ?? [];
globalForMail.mailOutbox = outbox;

/** アプリのベースURL */
const appBaseUrl = (): string => process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

/** メールを送信する (SMTP 無効時はサーバーログとローカル送信箱へ出力) */
const mailSend = async (to: string, subject: string, text: string): Promise<void> => {
  if (!isSmtpEnabled) {
    outbox.unshift({ to, subject, text, sentAt: new Date().toISOString() });
    outbox.splice(OUTBOX_MAX_ITEMS);
    console.info(`[mail:local] to=${to} subject=${subject}\n${text}`);
    return;
  }
  const port = Number(process.env.SMTP_PORT ?? "587");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // 465 は接続時から TLS (SMTPS)、587 は STARTTLS で暗号化する
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
  await transporter.sendMail({ from: process.env.MAIL_FROM, to, subject, text });
};

/** 管理者全員にメールを送信する */
const mailSendToAdmins = async (subject: string, text: string): Promise<void> => {
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { email: true } });
  await Promise.all(admins.map((admin) => mailSend(admin.email, subject, text)));
};

/** ローカル送信箱の内容を新しい順で返す (SMTP 有効時は []) */
export const mailListOutbox = (): MailOutboxItem[] => {
  if (isSmtpEnabled) return [];
  return [...outbox];
};

/** 新規登録があったことを管理者へ通知する */
export const mailNotifyRegistration = async (username: string, email: string): Promise<void> =>
  mailSendToAdmins(
    "【サロン空き状況】新規登録の承認依頼",
    `新規登録がありました。管理者メニューから承認してください。\n\nログインID: ${username}\nメール: ${email}\n\n${appBaseUrl()}/dashboard/admin`,
  );

/** PWリセット申請があったことを管理者へ通知する */
export const mailNotifyPasswordResetRequest = async (email: string): Promise<void> =>
  mailSendToAdmins(
    "【サロン空き状況】パスワードリセットの承認依頼",
    `パスワードリセットの申請がありました。管理者メニューから承認してください。\n\nメール: ${email}\n\n${appBaseUrl()}/dashboard/admin`,
  );

/** 新規登録が承認されたことを本人へ通知する */
export const mailNotifyApproved = async (email: string): Promise<void> =>
  mailSend(
    email,
    "【サロン空き状況】アカウントが承認されました",
    `アカウントが承認されました。以下からログインしてください。\n\n${appBaseUrl()}/login`,
  );

/** PWリセットURLを本人へ送付する */
export const mailSendPasswordResetUrl = async (email: string, token: string): Promise<void> =>
  mailSend(
    email,
    "【サロン空き状況】パスワード再設定のご案内",
    `以下のURLから新しいパスワードを設定してください (有効期限: 1時間)。\n\n${appBaseUrl()}/reset-password?token=${token}`,
  );
