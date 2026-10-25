import type { ReactNode } from "react";

/** AuthLayout の Props */
type Props = {
  /** 見出し */
  title: string;
  /** 説明文 */
  description: string;
  /** フォーム等の本文 */
  children: ReactNode;
  /** カード下部のリンク類 */
  footer: ReactNode;
};

/** ログイン・新規登録など未ログイン画面の中央寄せカードレイアウト */
const AuthLayout = ({ title, description, children, footer }: Props) => (
  <main className="flex flex-1 items-center justify-center bg-linear-to-b from-stone-100 to-stone-200 px-4 py-12">
    <div className="w-full max-w-sm">
      <p className="mb-6 text-center text-sm font-bold tracking-[0.3em] text-stone-500">SALON STORY</p>
      <div className="bg-card rounded-2xl border p-6 shadow-sm">
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        <div className="mt-6">{children}</div>
      </div>
      <div className="mt-6 grid gap-2 text-center text-sm">{footer}</div>
    </div>
  </main>
);

export default AuthLayout;
