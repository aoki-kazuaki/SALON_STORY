import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import CDialog from ".";

const meta = {
  title: "molecules/CDialog",
  component: CDialog,
  args: {
    open: true,
    onOpenChange: fn(),
    title: "凡例テキストを編集",
    description: "ストーリーズ下部のカードに表示されます",
    children: <textarea className="h-24 w-full rounded border p-2" defaultValue={"◎ 空きあり\n△ 残りわずか"} />,
    footer: <button className="rounded bg-stone-900 px-4 py-2 text-white">保存</button>,
  },
} satisfies Meta<typeof CDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

/** フォーム付きダイアログ */
export const Default: Story = {};

/** 表示時に入力欄へ自動フォーカスしない (登録済みメモの編集用。iOS でキーボードが勝手に開かない) */
export const AutoFocusDisabled: Story = { args: { title: "メモを編集", isAutoFocusDisabled: true } };
