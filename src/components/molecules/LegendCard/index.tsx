/** LegendCard の Props */
type Props = {
  /** カード見出し ("" の場合は非表示) */
  title: string;
  /** 凡例本文 (改行をそのまま表示) */
  text: string;
};

/**
 * ストーリーズ下部に配置する半透明白の凡例カード
 * - サイズは親コンテナ幅基準 (cqw) で指定し、キャンバスの拡大縮小に追従する
 */
const LegendCard = ({ title, text }: Props) => {
  /** 見出しを表示するかどうかの判定フラグ */
  const hasTitle: boolean = !(title === "");

  return (
    <div className="rounded-[3.5cqw] bg-white/75 px-[4.5cqw] py-[3.8cqw] text-stone-900 shadow-lg backdrop-blur-sm">
      {hasTitle && <p className="mb-[1.6cqw] text-[3.8cqw] font-bold tracking-wider">{title}</p>}
      <p className="text-[3.4cqw] leading-relaxed whitespace-pre-wrap">{text}</p>
    </div>
  );
};

export default LegendCard;
