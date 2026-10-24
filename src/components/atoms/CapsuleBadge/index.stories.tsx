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
  args: { label: "10/25(日)", markText: "◎", variant: "current" },
} satisfies Meta<typeof CapsuleBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 当月分 (白背景黒文字) */
export const Current: Story = {};

/** 次月以降 (黒背景白文字) */
export const Future: Story = {
  args: { label: "11/2(月)", variant: "future" },
};

/** 残り枠数を丸バッジに表示 */
export const RemainingCount: Story = {
  args: { markText: "残1" },
};
