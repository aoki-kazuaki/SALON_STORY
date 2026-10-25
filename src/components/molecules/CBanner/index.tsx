import { CircleCheckIcon, XIcon } from "lucide-react";

/** CBanner の Props */
type Props = {
  /** 表示メッセージ */
  message: string;
  /** 閉じるボタン押下時に呼ばれる */
  onClose: () => void;
};

/** 画面上部に表示する一時的な完了通知バナー */
const CBanner = ({ message, onClose }: Props) => (
  <div
    role="status"
    className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
  >
    <CircleCheckIcon className="size-5 shrink-0" />
    <p className="flex-1">{message}</p>
    <button type="button" aria-label="閉じる" onClick={onClose} className="rounded p-1 hover:bg-emerald-100">
      <XIcon className="size-4" />
    </button>
  </div>
);

export default CBanner;
