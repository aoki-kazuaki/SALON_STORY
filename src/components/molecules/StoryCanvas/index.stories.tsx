import type { Meta, StoryObj } from "@storybook/react-vite";

import { SAMPLE_STORY_CANVAS } from "@/constants/sample";

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

/** 背景画像あり (当月＋次月のバッジ混在) */
export const Default: Story = {};

/** 背景画像未登録 (グラデーション背景) */
export const WithoutBackground: Story = {
  args: { backgroundImageUrl: "" },
};

/** 空き枠0件 */
export const Empty: Story = {
  args: { items: [] },
};
