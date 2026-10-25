import type { Meta, StoryObj } from "@storybook/react-vite";

import CBadge from ".";

const meta = {
  title: "atoms/CBadge",
  component: CBadge,
  args: { children: "入力済", tone: "blue" },
} satisfies Meta<typeof CBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 入力済み */
export const Blue: Story = {};

/** 未入力 */
export const Gray: Story = { args: { tone: "gray", children: "未入力" } };

/** 新規登録直後 */
export const Green: Story = { args: { tone: "green", children: "NEW" } };

/** 更新直後 */
export const Orange: Story = { args: { tone: "orange", children: "UPDATED" } };
