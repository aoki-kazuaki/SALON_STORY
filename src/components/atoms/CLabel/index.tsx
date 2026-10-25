import type { ComponentProps } from "react";

import { Label } from "@/components/zShadcnBase/label";

/** CLabel の Props (shadcn Label と同一) */
type Props = ComponentProps<typeof Label>;

/** フォーム項目のラベル */
const CLabel = (props: Props) => <Label {...props} />;

export default CLabel;
