import type { Meta, StoryObj } from "@storybook/react-vite";

import CapsuleBadge from ".";

const meta = {
  title: "atoms/CapsuleBadge",
  component: CapsuleBadge,
  decorators: [
    (Story) => (
      <div className="@container w-[360px] bg-stone-400 p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    label: "10/25",
    descriptionLines: ["10:00", "13:15", "14:00"],
    markText: "日",
    variant: "current",
    density: "lg",
  },
} satisfies Meta<typeof CapsuleBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 当月分 (白背景黒文字) */
export const Current: Story = {};

/** 次月以降 (黒背景白文字) */
export const Future: Story = { args: { label: "11/2", markText: "月", variant: "future" } };

/** 長い行を含むメモ (省略せず折り返して全文表示) */
export const LongLine: Story = { args: { descriptionLines: ["16:00〜 カットのみ", "※カラーをご希望の方は要相談"] } };

/** 入力上限 (5行・1行20文字) に近いメモ */
export const MaxLines: Story = {
  args: {
    descriptionLines: [
      "10:00〜 カット・カラーどちらも可能",
      "13:00〜 カットのみ (60分程度)",
      "15:30〜 パーマ・縮毛矯正もOK",
      "17:00〜 最終受付となります",
      "※ご新規様はDMからお問い合わせ",
    ],
  },
};

/** 2列表示用の中サイズ */
export const Medium: Story = { args: { density: "md" } };

/** 多件数用の小サイズ */
export const Small: Story = { args: { density: "sm" } };
