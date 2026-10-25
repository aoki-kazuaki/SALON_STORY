import type { Meta, StoryObj } from "@storybook/react-vite";

import CLabel from ".";

const meta = {
  title: "atoms/CLabel",
  component: CLabel,
  args: { children: "ログインID" },
} satisfies Meta<typeof CLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 標準 */
export const Default: Story = {};
