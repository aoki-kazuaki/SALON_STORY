import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import CCheckbox from ".";

const meta = {
  title: "atoms/CCheckbox",
  component: CCheckbox,
  args: { checked: true, onCheckedChange: fn(), "aria-label": "選択" },
} satisfies Meta<typeof CCheckbox>;

export default meta;

type Story = StoryObj<typeof meta>;

/** チェックON */
export const Checked: Story = {};

/** チェックOFF */
export const Unchecked: Story = { args: { checked: false } };
