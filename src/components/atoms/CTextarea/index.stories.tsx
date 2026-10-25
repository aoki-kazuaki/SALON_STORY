import type { Meta, StoryObj } from "@storybook/react-vite";

import CTextarea from ".";

const meta = {
  title: "atoms/CTextarea",
  component: CTextarea,
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  args: { placeholder: "例) 13:00〜 / 15:30〜", rows: 4 },
} satisfies Meta<typeof CTextarea>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 未入力 */
export const Default: Story = {};

/** 改行を含む入力済み */
export const Filled: Story = { args: { defaultValue: "◎ 空きあり\n△ 残りわずか" } };
