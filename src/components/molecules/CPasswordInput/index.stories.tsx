import type { Meta, StoryObj } from "@storybook/react-vite";

import { UNIT_TEST_PASSWORD } from "@/constants/unitTest";

import CPasswordInput from ".";

const meta = {
  title: "molecules/CPasswordInput",
  component: CPasswordInput,
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  args: { placeholder: "パスワード" },
} satisfies Meta<typeof CPasswordInput>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 未入力 */
export const Default: Story = {};

/** 入力済み (目アイコンで表示切替) */
export const Filled: Story = { args: { defaultValue: UNIT_TEST_PASSWORD } };

/** 非活性 */
export const Disabled: Story = { args: { disabled: true, defaultValue: UNIT_TEST_PASSWORD } };
