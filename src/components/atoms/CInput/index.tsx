import type { ComponentProps } from "react";

import { Input } from "@/components/zShadcnBase/input";

/** CInput の Props (shadcn Input と同一、react-hook-form の register をそのまま展開可能) */
type Props = ComponentProps<typeof Input>;

/** 1行テキスト入力 (type="date" では iOS 標準のドラムロールピッカーを利用) */
const CInput = (props: Props) => <Input {...props} />;

export default CInput;
