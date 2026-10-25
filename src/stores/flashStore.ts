import { create } from "zustand";

/** 画面遷移後に1回だけ表示する完了バナーの State */
type FlashState = {
  /** 表示メッセージ (非表示は "") */
  message: string;
  /** メッセージを登録する */
  setMessage: (message: string) => void;
  /** メッセージを消去する */
  clearMessage: () => void;
};

/** ユーザー情報変更後にダッシュボード上部へ表示する一時バナー */
export const useFlashStore = create<FlashState>()((set) => ({
  message: "",
  setMessage: (message) => set({ message }),
  clearMessage: () => set({ message: "" }),
}));
