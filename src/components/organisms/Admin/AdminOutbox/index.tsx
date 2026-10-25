import { MailIcon } from "lucide-react";
import { Fragment } from "react";

import CCard from "@/components/molecules/CCard";
import type { MailOutboxItem } from "@/types";
import { dateFormatRelative } from "@/utils/date";

/** AdminOutbox の Props */
type Props = {
  /** ローカル送信箱のメール (新しい順) */
  mails: MailOutboxItem[];
  /** 相対日時表示の基準日時 */
  baseDateTime: string;
};

/** URL 部分を検出する正規表現 */
const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

/** 本文中の URL をリンクに変換して表示する */
const LinkifiedText = ({ text }: { text: string }) => (
  <>
    {text.split(URL_PATTERN).map((part, index) => {
      /** URL 部分かどうかの判定フラグ */
      const isUrl: boolean = /^https?:\/\//.test(part);
      return (
        <Fragment key={index}>
          {isUrl && (
            <a href={part} className="break-all text-blue-700 underline">
              {part}
            </a>
          )}
          {!isUrl && part}
        </Fragment>
      );
    })}
  </>
);

/**
 * ローカル送信箱 (SMTP 未設定のローカル環境のみ)
 * - 本来メールで届く承認依頼・PW再設定URLをこの画面で確認できる
 */
const AdminOutbox = ({ mails, baseDateTime }: Props) => (
  <CCard
    title="ローカル送信メール"
    description="SMTP 未設定のため、送信されたメールはここに表示されます (サーバー再起動で消去)。"
  >
    {mails.length === 0 && <p className="text-muted-foreground text-sm">送信されたメールはありません。</p>}
    <ul className="grid gap-3">
      {mails.map((mail, index) => (
        <li key={`${mail.sentAt}-${index}`} className="bg-muted/50 rounded-lg border p-3 text-sm">
          <p className="flex items-center gap-2 font-bold">
            <MailIcon className="size-4" />
            {mail.subject}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            宛先: {mail.to} ・ {dateFormatRelative(mail.sentAt ?? "", baseDateTime)}
          </p>
          <p className="mt-2 whitespace-pre-wrap">
            <LinkifiedText text={mail.text} />
          </p>
        </li>
      ))}
    </ul>
  </CCard>
);

export default AdminOutbox;
