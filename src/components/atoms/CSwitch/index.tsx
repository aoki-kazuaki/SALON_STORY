import type { ComponentProps } from "react";

import { Switch } from "@/components/zShadcnBase/switch";

/** CSwitch の Props */
type Props = Omit<ComponentProps<typeof Switch>, "checked" | "onCheckedChange"> & {
  /** ON/OFF 状態 */
  checked: boolean;
  /** ON/OFF の変更時に呼ばれる */
  onCheckedChange: (checked: boolean) => void;
};

/** ON/OFF トグルスイッチ */
const CSwitch = ({ checked, onCheckedChange, ...props }: Props) => (
  <Switch checked={checked} onCheckedChange={onCheckedChange} {...props} />
);

export default CSwitch;
