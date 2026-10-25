import { Toaster } from "@/components/zShadcnBase/sonner";
import { TOAST_DURATION_MS } from "@/constants/app";

/** トースト通知の表示領域 (2秒で自動フェードアウト、画面上部中央に表示) */
const CToaster = () => <Toaster theme="light" position="top-center" duration={TOAST_DURATION_MS} richColors />;

export default CToaster;
