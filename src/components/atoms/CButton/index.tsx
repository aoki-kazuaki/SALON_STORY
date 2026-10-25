import type { ComponentProps } from "react";

import { Button } from "@/components/zShadcnBase/button";

/** CButton の Props (shadcn Button と同一、type の既定値のみ "button") */
type Props = ComponentProps<typeof Button>;

/**
 * 汎用ボタン
 * - フォーム内での意図しない送信を防ぐため type の既定値を "button" とする
 * - asChild で Link 等をボタン外観で描画できる
 */
const CButton = ({ type = "button", ...props }: Props) => <Button type={type} {...props} />;

export default CButton;
