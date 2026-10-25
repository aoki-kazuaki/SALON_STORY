import type { Meta, StoryObj } from "@storybook/react-vite";

import Container from ".";

const meta = {
  title: "molecules/Container",
  component: Container,
  parameters: { layout: "fullscreen" },
  args: { children: <div className="rounded bg-stone-200 p-4">最大幅 768px のコンテンツ領域</div> },
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 標準 */
export const Default: Story = {};
