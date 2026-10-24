# 美容院 Instagram空き状況画像ジェネレーター フルスタック開発マスター仕様書

## 1. プロジェクト概要

美容院・サロンの予約空き枠情報をGUIから入力・管理し、Instagramストーリーズ（アスペクト比 9:16）告知用の画像をプレビュー・画面キャプチャ（端末スクショ）運用できるWebアプリケーションです。
ポートフォリオ用途かつ極小アクター運用を想定し、軽量・高速・実用的なSPAライクな構成とします。

---

## 2. 技術スタック & インフラ設計

- **Framework**: Next.js (App Router, TypeScript)
- **Database & ORM**: PostgreSQL (Amazon RDS / Aurora Serverless 想定), Prisma
- **Styling**: Tailwind CSS
- **Base UI**: shadcn/ui (Radix UI ベース / `src/components/zShadcnBase/` 配下)
- **Date Handling**: `dayjs`
- **Icons**: Lucide React
- **Form & Validation**:
  - `react-hook-form`, `@hookform/resolvers`, `zod`
  - `<input type="date">`（iOS標準ドラムロールピッカーUX、Tailwindで外観統一、過去日選択不可）
- **Auth & Session**:
  - `better-auth`（Cookieベース、セッション有効期限は30日間保持、ブックマーク直行可能、`middleware.ts` でルート保護）
- **Notifications**: `sonner`（2秒自動フェードアウトのトースト通知）
- **State Management**: `zustand`（直前入力日キャッシュ、エディタ選択状態）
- **Storage / Cloud**:
  - `@aws-sdk/client-s3`（ローカルは MinIO、本番は AWS S3 を `S3_ENDPOINT` 環境変数で切り替え、Presigned URL 発行 & 物理削除）
- **Testing & Quality Assurance**:
  - Vitest / React Testing Library（atoms/molecules、utils の単体テスト）
  - Playwright（organisms 以上の E2E テスト）
  - Storybook（可視化可能な全 atoms/molecules のカタログ化）
  - CI: GitHub Actions（ESLint, Prettier, TypeScript `tsc --noEmit`, Vitest, `npm audit`, `license-checker` による商用ライセンス検証）
  - GitHooks: Husky + lint-staged（ステージング対象の `.ts, .tsx, .css` に `prettier --write` [printWidth: 120] と `eslint --fix` を自動実行）
- **Container**: Docker (Multi-stage build, Next.js `output: 'standalone'`)

---

## 3. ディレクトリ構成 & アーキテクチャ規約

### ディレクトリ構造

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml                        # Lint, Format, TypeCheck, Test, Audit, License
├── assets/
│   └── img/                              # 静的画像リソース
├── components/
│   ├── atoms/                            # 最小単位 (大外divなし、ロジックなし、Storybook/Vitest必須)
│   │   ├── CButton/ (index.tsx, index.stories.tsx, index.test.tsx)
│   │   └── CInput/ (index.tsx, index.stories.tsx, index.test.tsx)
│   ├── molecules/                        # 複合パーツ (大外divあり、ロジックなし、Storybook/Vitest必須)
│   │   ├── Container/ (index.tsx, index.stories.tsx, index.test.tsx)
│   │   ├── CCard/ (index.tsx, index.stories.tsx, index.test.tsx)
│   │   └── CAccordion/ (index.tsx, index.stories.tsx, index.test.tsx)
│   ├── organisms/                        # 画面セクション単位、通信・状態更新ロジックを内包 (単体テスト対象外)
│   │   ├── App/Header/index.tsx          # 追従/スクロール連動ヘッダー (レスポンシブ対応)
│   │   ├── Home/...                      # ページ専用organisms (prefixにページ名付与)
│   │   ├── Records/...
│   │   ├── Backgrounds/...
│   │   └── Editor/...
│   ├── pages/                            # 初期通信・State保持・ページ独自データ管理
│   │   ├── Home/index.tsx
│   │   ├── Records/index.tsx
│   │   ├── RecordsMonth/index.tsx
│   │   ├── Backgrounds/index.tsx
│   │   └── Editor/index.tsx
│   ├── template/                         # organismsを配置するレイアウト、Tailwind配置 (ロジックなし)
│   │   ├── HomeLayout/index.tsx
│   │   ├── RecordsLayout/index.tsx
│   │   └── ...
│   └── zShadcnBase/                      # shadcnプリミティブ (単体テスト対象外、画面直import禁止)
├── constants/
│   └── unitTest/
│       └── index.ts                      # 1行目にファイル説明、全定数にJSDoc記載
├── hooks/                                # 高頻度共通処理のみ (通信依存のため単体テスト対象外)
├── lib/
│   ├── auth.ts                           # BetterAuth 設定 (30日セッション)
│   ├── prisma.ts                         # Prisma Client
│   ├── s3.ts                             # S3 / MinIO クライアント
│   └── shadcn/utils.ts                   # cn ヘルパー
├── prisma/
│   └── schema.prisma                     # PostgreSQL用スキーマ
├── types/
│   └── api/                              # APIパス単位でディレクトリ分割
│       └── [path]/
│           └── index.d.ts                # ReqParams/ReqBody/ResGet/ResPost/ResDelete + JSDoc日本語訳
├── utils/                                # 戻り値別純粋関数 (Vitest必須、JSDoc必須、prefix付与)
│   ├── array.ts   (例: arrayUnique)
│   ├── boolean.ts (例: boolIsValid)
│   ├── date.ts    (例: dateFormatRelative, dateCurrentTimeStamp)
│   ├── number.ts  (例: numberFormatCurrency)
│   ├── object.ts  (例: objectPick)
│   └── string.ts  (例: stringTruncate)
├── .env.example                          # Git管理外環境変数の雛形
├── docker-compose.yml                    # PostgreSQL + MinIO + MinIO初期バケット作成
└── Dockerfile                            # Next.js standalone Multi-stage build
```

---

## 4. 厳格な実装・コーディング・データ型規約

### (1) State・API・データ型の初期値とハンドリング規約（厳格遵守）

1. **型ごとの初期値・想定値の絶対ルール**:
   - **文字列（string）**: 必ず空文字 `""` とする。
   - **日付（Date / Dayjs / string ISO日付等）**: `null` とする。
   - **オブジェクト（Object / Record）**: `null` とする。
   - **配列（Array / List）**: 必ず空配列 `[]` とする。
2. **`undefined` の完全禁止**:
   - アプリケーション全体のState初期値、コンポーネントPropsの初期値、およびAPIレスポンスにおいて `undefined` は**一切認めない**。
3. **文字列入力フォームの型から `null` 排除**:
   - フォーム入力欄（Input, Textarea等）にバインドされるStateおよび型定義において、文字列項目に `null` や `undefined` を許容しない（型は `string` のみとし、未入力時は `""` を徹底）。
4. **リスト検索・一覧取得のレスポンス規約**:
   - 該当データが存在しない場合、レスポンスとして `null` や `undefined` を返却することは禁止。必ず空配列 `[]` を返却すること。

### (2) 構文・制御構文ルール

1. **if文のネスト（入れ子）は禁止**:
   - 必ずガード節（アーリーリターン）を用いて階層をフラットに保つこと。
2. **switch文は禁止**:
   - オブジェクトマッピングやルックアップテーブルで表現すること。
3. **条件分岐のショートハンド記法**:
   - `if (condition) return fallbackValue;` のように1行ショートハンドを推奨。
4. **不等価演算子（`!==`）の使用禁止**:
   - `!==` は使用せず、厳密等価を否定する構文を使用すること。
   - 例: `!(targetType === "A")`
5. **三項演算子の厳格禁止と例外**:
   - 原則として三項演算子の使用は禁止。
   - **唯一の例外**: JSX等のレンダリング計算箇所において、明示的な戻り値が2パターンの文字列である場合のみ許容（例: `const badgeColor = isActive ? "bg-blue-600" : "bg-slate-100";`）。
6. **レンダリング内での複合計算の事前変数化**:
   - JSXやレンダリング内で `&&` などを複数繋げた計算・判定を行うことは禁止。
   - 必ず事前にJSDocコメントを付与した定数として切り出すこと。
   ```typescript
   /** ユーザーが承認済みかつ直近更新データが存在するかどうかの判定フラグ */
   const isEligibleToDisplayRecord: boolean = Boolean(isApproved) && Boolean(hasRecentData);
   ```

### (3) アトミックデザイン & コンポーネント規約

- **`atoms`**: トップレベルに大外 `<div>` を持たない。ロジックなし。
- **`molecules`**: トップレベルに大外 `<div>` を持つ。ロジックなし。
- **`zShadcnBase`**: 単体テスト対象外。画面から直接importせず、atoms/molecules経由でラップして使用。
- **`organisms` 以上**: 単体テスト対象外（Playwright E2Eでカバー）。
- 専用コンポーネント・レイアウトはすべて `default export` とし、ページ名をprefixに付ける（例: `HomeLayout`, `RecordsMonthArea`）。
- マウント時の共通初期化が必要な場合は `return null;` の `AppInitializer` を作成。

### (4) 定数・型定義・JSDoc

- `constants/` 配下のファイルは1行目にファイルの概要を日本語で記載。
- 全定数および型の各プロパティに JSDoc による日本語説明を必須とする。

### (5) API型定義命名規則 (`types/api/...`)

- GET: `ReqParams[Path]`, `ResGet[Path]`
- POST: `ReqBody[Path]`, `ResPost[Path]`
- DELETE: `ReqParams[Path]`/`ReqBody[Path]`, `ResDelete[Path]`
- （例: `api/user/detail` -> `ReqParamsUserDetail`, `ResGetUserDetail`）

### (6) ユーティリティ関数 (`utils/`)

- 戻り値の型別（`date.ts`, `string.ts` 等）に配置し、関数名には戻り値の型名をprefixとして付与（`dateCurrentTimeStamp` 等）。
- 単体テスト（Vitest）を必須とする。

---

## 5. UI/UX & 各画面の機能仕様

### (1) 共通ヘッダー & ナビゲーション

- ダッシュボード配下で固定追従（`fixed top-0`）。スクロールダウンで隠れ、スクロールアップで出現。
- 左側: `[← 戻る]` リンク（下層のみ）＋ アプリロゴ（タップで `/dashboard` へ直行）。
- 右側: ユーザー設定リンク ＋ ログアウト（確認ダイアログ付き）。
- コンテンツ最上部にパンくずリスト（`Breadcrumb`）を配置。

### (2) 認証フロー

- ログイン（ID/PW、BetterAuth利用、セッション30日保持）。
- 新規登録（送信後「管理者承認待ち」画面、管理者へメール送信、管理者が画面上で確認・承認）。
- PWリセット（管理者承認後にURL送付、メアド非活性表示、新PW2回入力）。
- ユーザー情報変更（メアド変更・PW変更それぞれ確認ダイアログ挟み即時反映、成功後は `history.state` でダッシュボード上部に一時バナー）。

### (3) ダッシュボード (`/dashboard`)

- メッセージ入力ダイアログ（`<input type="date">` iOSネイティブ、min=今日、直前入力日キャッシュ、409重複時は新旧比較して上書き確認ダイアログ）。
- ボトムコンテンツ（凡例・注記テキスト）編集ダイアログ（テキストエリア、改行対応、DB保存）。
- 各画面への遷移導線（登録データ一覧、背景画像管理、エディタ）。

### (4) 登録データ一覧 (`/dashboard/records`)

- 年別降順アコーディオン（最新2年分はデフォルト展開、過去分は折りたたみ、データ存在年のみ）。
- 月リスト（データ存在月のみ12月〜1月の降順、英語略称＋季節絵文字付き）。
- 月タップで「月別一覧画面」へ画面遷移（ネストアコーディオン不採用）。

### (5) 月別一覧画面 (`/dashboard/records/[year]/[month]`)

- 一括操作バー: `[ 全て開く (入力済) ]` / `[ 全て閉じる ]`。
- 当月の日別アコーディオン一覧:
  - 入力済み: 青系バッジ、デフォルトOPEN、メモ本文、`[ 編集 ]`、`[ クリア ]`（ダイアログ確認後空文字更新）、最終更新日時。
  - 未入力: グレーバッジ、デフォルトCLOSE、開くと `[ メモを追加 ]` ボタン。
  - 操作直後: `[NEW]`（緑）/ `[UPDATED]`（オレンジ）バッジ付与。
- 操作後は2秒自動消去のトースト通知（Sonner）。
- 下部にエディタへの直接遷移導線を配置。

### (6) 背景画像管理 (`/dashboard/backgrounds`)

- 1〜5番の固定スロット型カードUI。
- 登録済み: 9:16サムネイルプレビュー、`[ 上書き変更 ]`、`[ 削除 ]`（S3/MinIO物理削除確認ダイアログ）。
- 未登録: 点線枠、`[ ＋ 画像をアップロード ]`（1枚ずつアップロード）。
- 2秒トースト通知、エディタへの直接遷移導線。

### (7) ストーリーズ画像エディタ (`/dashboard/editor`)

- **[ 編集・選択 ] タブ**:
  1. 期間・日付選択: `月指定`（登録済み月セレクト ＋ 過去日含めるトグル）または `期間指定`（開始日＋上限付きプリセット）。
  2. 抽出された空き枠リスト: 各行にチェックボックス（デフォルトON）、チェックOFFでグレーアウト除外。条件変更時も外した日付キー（`excludedDateKeys: Set<string>`）をState維持。「全選択/全解除」ボタン付き。
  3. 背景画像選択: 登録済みスロットから選択（DB保持）。未選択/削除時はスロット1へフォールバック、0枚時は外部サロン風画像へフォールバック。
- **[ プレビュー・保存 ] タブ**:
  - 差分比較による通信抑制（選択状態が同一ならAPI通信をスキップしローカルStateで即時描画）。
  - 9:16キャンバス（背景 ＋ 左右2列カプセルバッジ ＋ 下部凡例カード）[cite: 1, 2]。
  - カプセルバッジ: 角丸ピル形状、当月分は白背景黒文字、次月以降は黒背景白文字、丸バッジ付き[cite: 1, 2]。
  - 凡例カード: 半透明白カード、改行テキスト表示[cite: 1, 2]。
  - 全画面プレビュー: AI生成・画像変換ライブラリは使用せず、画面全体にキャンバスを表示して端末スクショ。シングルタップで全画面解除。

---

## 6. 今回の実装指示 (ファーストステップ)

上記仕様・ディレクトリ規約・命名規則・ドキュメント規約・データ型規約・厳格な構文ルールを完全に遵守し、以下のファイルを順次作成してください：

1. **`prisma/schema.prisma`**:
   - BetterAuth用テーブル、スケジュールメモテーブル、背景画像スロットテーブル、凡例テキストテーブルの定義。
2. **`types/index.ts` および API型定義 (`types/api/...`)**:
   - 各プロパティへのJSDoc日本語説明を含む完全な型定義（`undefined` 排他、空文字・空配列・null の初期値定義を厳守）。
3. **`utils/` 配下のユーティリティ関数群**:
   - `utils/date.ts`（`dateFormatRelative` 等）およびその単体テストコード（`index.test.ts`）。
4. **キャンバスコアコンポーネント**:
   - `src/components/atoms/` または `molecules/` に準拠した `CapsuleBadge`、`LegendCard`、`StoryCanvas` の実装[cite: 1, 2]。
