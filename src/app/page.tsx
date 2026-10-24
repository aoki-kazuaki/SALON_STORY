import StoryCanvas from "@/components/molecules/StoryCanvas";
import { SAMPLE_STORY_CANVAS } from "@/constants/sample";

/** キャンバスコアコンポーネントの動作確認用プレビュー (ダッシュボード実装までの暫定トップページ) */
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center gap-6 bg-stone-100 px-4 py-10">
      <div className="text-center">
        <h1 className="text-xl font-bold text-stone-800">ストーリーズ キャンバス プレビュー</h1>
        <p className="mt-1 text-sm text-stone-500">サンプルデータで StoryCanvas を描画しています</p>
      </div>
      <div className="w-full max-w-[360px] overflow-hidden rounded-2xl shadow-2xl">
        <StoryCanvas {...SAMPLE_STORY_CANVAS} />
      </div>
    </main>
  );
}
