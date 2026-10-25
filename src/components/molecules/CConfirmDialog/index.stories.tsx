import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import CConfirmDialog from ".";

const meta = {
  title: "molecules/CConfirmDialog",
  component: CConfirmDialog,
  args: {
    open: true,
    onOpenChange: fn(),
    onConfirm: fn(),
    title: "ログアウトしますか？",
    description: "再度ログインが必要になります。",
    confirmLabel: "ログアウト",
  },
} satisfies Meta<typeof CConfirmDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 通常の確認 */
export const Default: Story = {};

/** 破壊的操作の確認 */
export const Destructive: Story = {
  args: {
    title: "スロット2の画像を削除しますか？",
    description: "画像はストレージから完全に削除されます。",
    confirmLabel: "削除",
    isDestructive: true,
  },
};
