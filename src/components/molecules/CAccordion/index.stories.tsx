import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import CAccordion from ".";

const meta = {
  title: "molecules/CAccordion",
  component: CAccordion,
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  args: {
    items: [
      { value: "2026", trigger: "2026年", content: "Oct 🍁 / Sep 🍁" },
      { value: "2025", trigger: "2025年", content: "Dec ❄️ / Nov 🍁" },
      { value: "2024", trigger: "2024年", content: "Mar 🌸" },
    ],
    value: ["2026", "2025"],
    onValueChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <CAccordion {...args} value={value} onValueChange={setValue} />;
  },
} satisfies Meta<typeof CAccordion>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 直近2年を初期展開 */
export const Default: Story = {};
