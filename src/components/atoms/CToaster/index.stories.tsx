import type { Meta, StoryObj } from "@storybook/react-vite";
import { toast } from "sonner";

import CToaster from ".";

const meta = {
  title: "atoms/CToaster",
  component: CToaster,
  decorators: [
    (Story) => (
      <div className="flex gap-2">
        <button className="rounded border px-3 py-1" onClick={() => toast.success("保存しました")}>
          成功トースト
        </button>
        <button className="rounded border px-3 py-1" onClick={() => toast.error("保存に失敗しました")}>
          失敗トースト
        </button>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CToaster>;

export default meta;

type Story = StoryObj<typeof meta>;

/** ボタンを押すと2秒間トーストを表示 */
export const Default: Story = {};
