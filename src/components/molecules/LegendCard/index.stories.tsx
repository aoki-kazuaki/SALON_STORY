import type { Meta, StoryObj } from "@storybook/react-vite";

import LegendCard from ".";

const meta = {
  title: "molecules/LegendCard",
  component: LegendCard,
  decorators: [
    (Story) => (
      <div className="@container w-[360px] bg-stone-500 p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    title: "ご予約について",
    text: "◎ 空きあり　△ 残りわずか\nご予約はプロフィールのリンク、\nまたはDMからお気軽にどうぞ。",
  },
} satisfies Meta<typeof LegendCard>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 見出し＋改行入り本文 */
export const Default: Story = {};

/** 見出しなし */
export const WithoutTitle: Story = {
  args: { title: "" },
};
