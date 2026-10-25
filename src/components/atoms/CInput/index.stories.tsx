import type { Meta, StoryObj } from "@storybook/react-vite";

import CInput from ".";

const meta = {
  title: "atoms/CInput",
  component: CInput,
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  args: { placeholder: "ログインID" },
} satisfies Meta<typeof CInput>;

export default meta;

type Story = StoryObj<typeof meta>;

/** テキスト入力 */
export const Default: Story = {};

/** 日付入力 (iOS ではドラムロールピッカー) */
export const DateInput: Story = { args: { type: "date", min: "2026-10-25" } };

/** 非活性 */
export const Disabled: Story = { args: { disabled: true, defaultValue: "owner@example.com" } };
