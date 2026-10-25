import type { Meta, StoryObj } from "@storybook/react-vite";

import CButton from ".";

const meta = {
  title: "atoms/CButton",
  component: CButton,
  args: { children: "保存する" },
} satisfies Meta<typeof CButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 主要操作 */
export const Default: Story = {};

/** 副次操作 */
export const Outline: Story = { args: { variant: "outline", children: "キャンセル" } };

/** 削除などの破壊的操作 */
export const Destructive: Story = { args: { variant: "destructive", children: "削除" } };

/** 非活性 */
export const Disabled: Story = { args: { disabled: true } };
