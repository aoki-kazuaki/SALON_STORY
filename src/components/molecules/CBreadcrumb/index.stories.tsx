import type { Meta, StoryObj } from "@storybook/react-vite";

import CBreadcrumb from ".";

const meta = {
  title: "molecules/CBreadcrumb",
  component: CBreadcrumb,
  args: {
    items: [
      { label: "ダッシュボード", href: "/dashboard" },
      { label: "登録データ一覧", href: "/dashboard/records" },
      { label: "2026年10月", href: "/dashboard/records/2026/10" },
    ],
  },
} satisfies Meta<typeof CBreadcrumb>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 3階層 */
export const Default: Story = {};

/** トップ階層のみ */
export const TopLevel: Story = { args: { items: [{ label: "ダッシュボード", href: "/dashboard" }] } };
