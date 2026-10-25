import type { Meta, StoryObj } from "@storybook/react-vite";

import CInput from "@/components/atoms/CInput";

import CFormField from ".";

const meta = {
  title: "molecules/CFormField",
  component: CFormField,
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  args: {
    htmlFor: "email",
    label: "メールアドレス",
    children: <CInput id="email" type="email" placeholder="owner@example.com" />,
  },
} satisfies Meta<typeof CFormField>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 標準 */
export const Default: Story = {};

/** 補足説明あり */
export const WithHint: Story = { args: { hint: "承認通知やPW再設定URLが届きます" } };

/** エラー表示 */
export const WithError: Story = { args: { error: "メールアドレスの形式が正しくありません" } };
