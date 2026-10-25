import type { ComponentProps } from "react";

import { Textarea } from "@/components/zShadcnBase/textarea";

/** CTextarea の Props (shadcn Textarea と同一) */
type Props = ComponentProps<typeof Textarea>;

/** 複数行テキスト入力 (改行をそのまま保持) */
const CTextarea = (props: Props) => <Textarea {...props} />;

export default CTextarea;
