import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import CBanner from ".";

const meta = {
  title: "molecules/CBanner",
  component: CBanner,
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
  args: { message: "パスワードを変更しました", onClose: fn() },
} satisfies Meta<typeof CBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 完了通知 */
export const Default: Story = {};
