import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import CTabs from ".";

const meta = {
  title: "molecules/CTabs",
  component: CTabs,
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  args: {
    items: [
      { value: "edit", label: "編集・選択", content: <p className="text-sm">期間・空き枠・背景の選択</p> },
      { value: "preview", label: "プレビュー・保存", content: <p className="text-sm">9:16 キャンバス</p> },
    ],
    value: "edit",
    onValueChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <CTabs {...args} value={value} onValueChange={setValue} />;
  },
} satisfies Meta<typeof CTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 2タブ切り替え */
export const Default: Story = {};
