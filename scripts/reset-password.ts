// ローカル開発用: 指定ユーザーのパスワードを直接再設定する (管理者承認・メール送信を経由しない)
// 使い方: npm run user:reset-password -- <ログインIDまたはメールアドレス> [新しいパスワード]
//   新しいパスワードを省略した場合は、ルール (英大文字・英小文字・数字を含む8文字以上) を満たす乱数を生成する
import "dotenv/config";

import { randomBytes } from "node:crypto";

import { hashPassword } from "better-auth/crypto";

import { prisma } from "@/lib/prisma";
import { schemaPassword } from "@/lib/schemas";
import { boolIsEmailIdentifier } from "@/utils/boolean";

/** 生成するパスワードの文字数 */
const GENERATED_PASSWORD_LENGTH = 16;

/** パスワードルールを満たす乱数パスワードを生成する (記号を含まないためコピー&ペーストしやすい) */
const generatePassword = (): string => {
  const candidate = randomBytes(32).toString("base64url").replace(/[-_]/g, "").slice(0, GENERATED_PASSWORD_LENGTH);
  if (schemaPassword.safeParse(candidate).success) return candidate;
  return generatePassword();
};

/** ログインIDまたはメールアドレスからユーザー検索条件を組み立てる (username プラグインはIDを小文字で保存する) */
const buildUserWhere = (identifier: string): { email: string } | { username: string } => {
  if (boolIsEmailIdentifier(identifier)) return { email: identifier };
  return { username: identifier.toLowerCase() };
};

/** エラー内容を表示用の文字列に変換する */
const formatError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

const main = async (): Promise<void> => {
  const identifier = process.argv[2] ?? "";
  if (identifier === "") throw new Error("ログインIDまたはメールアドレスを指定してください");

  const password = process.argv[3] ?? generatePassword();
  const parsed = schemaPassword.safeParse(password);
  if (!parsed.success) throw new Error(parsed.error.issues.map((issue) => issue.message).join("\n"));

  const user = await prisma.user.findUnique({
    where: buildUserWhere(identifier),
    select: { id: true, username: true, email: true },
  });
  if (!user) throw new Error(`ユーザーが見つかりません: ${identifier}`);

  const { count } = await prisma.account.updateMany({
    where: { userId: user.id, providerId: "credential" },
    data: { password: await hashPassword(password) },
  });
  if (count === 0) throw new Error("ID/パスワードでログインするアカウントがありません");

  // 旧パスワードでログイン中のセッションは無効化する
  await prisma.session.deleteMany({ where: { userId: user.id } });

  console.info(
    `パスワードを再設定しました\n  ログインID: ${user.username ?? ""}\n  メール    : ${user.email}\n  パスワード: ${password}`,
  );
};

main()
  .catch((error: unknown) => {
    console.error(formatError(error));
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
