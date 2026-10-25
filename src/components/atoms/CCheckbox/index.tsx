import type { ComponentProps } from "react";

import { Checkbox } from "@/components/zShadcnBase/checkbox";

/** CCheckbox の Props */
type Props = Omit<ComponentProps<typeof Checkbox>, "checked" | "onCheckedChange"> & {
  /** チェック状態 */
  checked: boolean;
  /** チェック状態の変更時に呼ばれる */
  onCheckedChange: (checked: boolean) => void;
};

/** チェックボックス (中間状態は扱わず boolean のみ) */
const CCheckbox = ({ checked, onCheckedChange, ...props }: Props) => (
  <Checkbox checked={checked} onCheckedChange={(value) => onCheckedChange(value === true)} {...props} />
);

export default CCheckbox;
