import type { Meta, StoryObj } from "@storybook/react-vite";

import CCard from ".";

const meta = {
  title: "molecules/CCard",
  component: CCard,
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  args: {
    title: "登録データ一覧",
    description: "入力済みのメモを年月別に確認できます",
    children: <p className="text-sm">カード本文</p>,
  },
} satisfies Meta<typeof CCard>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 見出し・説明文あり */
export const Default: Story = {};

/** 本文のみ */
export const BodyOnly: Story = { args: { title: "", description: "" } };
