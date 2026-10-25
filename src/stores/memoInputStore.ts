import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { DateKey } from "@/types";

/** メモ入力ダイアログの State */
type MemoInputState = {
  /** 直前に入力した日付 (未入力は "") */
  lastInputDateKey: DateKey;
  /** 直前に入力した日付を保存する */
  setLastInputDateKey: (dateKey: DateKey) => void;
};

/** メモ入力の直前入力日キャッシュ (ブラウザの localStorage に保持) */
export const useMemoInputStore = create<MemoInputState>()(
  persist(
    (set) => ({
      lastInputDateKey: "",
      setLastInputDateKey: (dateKey) => set({ lastInputDateKey: dateKey }),
    }),
    { name: "salon-story-memo-input", storage: createJSONStorage(() => localStorage) },
  ),
);
