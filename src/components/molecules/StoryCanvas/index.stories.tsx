import type { Meta, StoryObj } from "@storybook/react-vite";

import { SAMPLE_BADGE_ITEMS_MANY, SAMPLE_STORY_CANVAS } from "@/constants/sample";

import StoryCanvas from ".";

const meta = {
  title: "molecules/StoryCanvas",
  component: StoryCanvas,
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
  args: SAMPLE_STORY_CANVAS,
} satisfies Meta<typeof StoryCanvas>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 少件数 (1列・大きめ表示、改行入りメモ) */
export const Few: Story = {};

/** 多件数 (左右2列表示) */
export const Many: Story = { args: { items: SAMPLE_BADGE_ITEMS_MANY } };

/** 凡例テキスト未入力 (凡例カードごと非表示) */
export const WithoutLegend: Story = { args: { legendText: "" } };

/** 背景画像未登録 (グラデーション背景) */
export const WithoutBackground: Story = { args: { backgroundImageUrl: "" } };

/** 空き枠0件 */
export const Empty: Story = { args: { items: [] } };
