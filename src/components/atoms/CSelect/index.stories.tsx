import type { Meta, StoryObj } from "@storybook/react-vite";

import CSelect from ".";

const meta = {
  title: "atoms/CSelect",
  component: CSelect,
  decorators: [
    (Story) => (
      <div className="w-60">
        <Story />
      </div>
    ),
  ],
  args: {
    "aria-label": "対象月",
    options: [
      { value: "2026-10", label: "2026年10月" },
      { value: "2026-11", label: "2026年11月" },
    ],
  },
} satisfies Meta<typeof CSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 標準 */
export const Default: Story = {};
