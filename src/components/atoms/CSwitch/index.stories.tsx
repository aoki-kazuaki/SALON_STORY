import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import CSwitch from ".";

const meta = {
  title: "atoms/CSwitch",
  component: CSwitch,
  args: { checked: false, onCheckedChange: fn(), "aria-label": "過去日を含める" },
} satisfies Meta<typeof CSwitch>;

export default meta;

type Story = StoryObj<typeof meta>;

/** OFF */
export const Off: Story = {};

/** ON */
export const On: Story = { args: { checked: true } };
