import type { ReactNode } from "react";

/** HomeLayout の Props */
type Props = {
  /** 完了通知バナー */
  banner: ReactNode;
  /** 挨拶・見出し */
  greeting: ReactNode;
  /** クイック操作 (メモ入力・凡例編集) */
  actions: ReactNode;
  /** 各画面への遷移導線 */
  navigation: ReactNode;
};

/** ダッシュボードのレイアウト */
const HomeLayout = ({ banner, greeting, actions, navigation }: Props) => (
  <div className="grid gap-6">
    {banner}
    {greeting}
    <section aria-label="クイック操作">{actions}</section>
    <section aria-label="メニュー">{navigation}</section>
  </div>
);

export default HomeLayout;
