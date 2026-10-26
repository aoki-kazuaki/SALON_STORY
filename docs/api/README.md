# API仕様書兼設計書

[← 設計資料一覧](../README.md)

## API一覧

| No | リンク | API名称(論理名) | API名称(物理名) | HTTPメソッド | リクエストパス | 認証可否 | 備考 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | [GO](01-auth-sign-up-email.md) | 新規登録 | AuthSignUpEmail | POST | `/api/auth/sign-up/email` | 不要 | ログインID・メール・パスワードでアカウントを作成する (BetterAuth) |
| 2 | [GO](02-auth-sign-in-username.md) | ログイン (ログインID) | AuthSignInUsername | POST | `/api/auth/sign-in/username` | 不要 | ログインIDとパスワードでログインする (BetterAuth) |
| 3 | [GO](03-auth-sign-in-email.md) | ログイン (メールアドレス) | AuthSignInEmail | POST | `/api/auth/sign-in/email` | 不要 | メールアドレスとパスワードでログインする (BetterAuth) |
| 4 | [GO](04-auth-sign-out.md) | ログアウト | AuthSignOut | POST | `/api/auth/sign-out` | 必要 | ログイン中のセッションを破棄する (BetterAuth) |
| 5 | [GO](05-auth-get-session.md) | セッション取得 | AuthGetSession | GET | `/api/auth/get-session` | 不要 | ログイン中のユーザー情報を取得する (BetterAuth) |
| 6 | [GO](06-auth-change-password.md) | パスワード変更 | AuthChangePassword | POST | `/api/auth/change-password` | 必要 | 現在のパスワードを確認して変更する (BetterAuth) |
| 7 | [GO](07-auth-reset-password.md) | パスワード再設定 | AuthResetPassword | POST | `/api/auth/reset-password` | 不要 | 再設定URLのトークンで新しいパスワードを設定する (BetterAuth) |
| 8 | [GO](08-password-reset-request.md) | パスワードリセット申請 | PasswordResetRequest | POST | `/api/password-reset/request` | 不要 | リセットを申請し、管理者へ承認依頼を通知する |
| 9 | [GO](09-password-reset-detail.md) | パスワードリセットトークン確認 | PasswordResetDetail | GET | `/api/password-reset/detail` | 不要 | 再設定URLのトークンの有効性と、紐づくメールアドレスを取得する |
| 10 | [GO](10-user-email.md) | メールアドレス変更 | UserEmail | POST | `/api/user/email` | 必要 | ログインユーザーのメールアドレスを即時変更する |
| 11 | [GO](11-admin-pending.md) | 承認待ち一覧取得 | AdminPending | GET | `/api/admin/pending` | 必要 (管理者) | 承認待ちの新規登録・PWリセット申請・ローカル送信メールを取得する |
| 12 | [GO](12-admin-approve-user.md) | 新規登録承認 | AdminApproveUser | POST | `/api/admin/approve-user` | 必要 (管理者) | 新規登録を承認・却下する |
| 13 | [GO](13-admin-approve-reset.md) | パスワードリセット承認 | AdminApproveReset | POST | `/api/admin/approve-reset` | 必要 (管理者) | PWリセット申請を承認 (再設定URLを送付)・却下する |
| 14 | [GO](14-schedule-list.md) | スケジュールメモ一覧取得 | ScheduleList | GET | `/api/schedule/list` | 必要 | 期間内の入力済みメモを日付昇順で取得する |
| 15 | [GO](15-schedule-summary.md) | スケジュールメモ年月一覧取得 | ScheduleSummary | GET | `/api/schedule/summary` | 必要 | データが存在する年・月と件数を取得する |
| 16 | [GO](16-schedule-save.md) | スケジュールメモ保存 | ScheduleSave | POST | `/api/schedule/save` | 必要 | メモを新規登録・上書きする (重複時は 409) |
| 17 | [GO](17-schedule-clear.md) | スケジュールメモクリア | ScheduleClear | DELETE | `/api/schedule/clear` | 必要 | メモ本文を空文字で更新する |
| 18 | [GO](18-legend-detail.md) | 凡例テキスト取得 | LegendDetail | GET | `/api/legend/detail` | 必要 | ストーリーズ下部の凡例テキストを取得する |
| 19 | [GO](19-legend-save.md) | 凡例テキスト保存 | LegendSave | POST | `/api/legend/save` | 必要 | 凡例テキストを保存する |
| 20 | [GO](20-background-list.md) | 背景画像一覧取得 | BackgroundList | GET | `/api/background/list` | 必要 | 登録済みの背景画像スロットを表示用URL付きで取得する |
| 21 | [GO](21-background-upload.md) | 背景画像アップロード | BackgroundUpload | POST | `/api/background/upload` | 必要 | 背景画像をスロットに登録・上書きする |
| 22 | [GO](22-background-delete.md) | 背景画像削除 | BackgroundDelete | DELETE | `/api/background/delete` | 必要 | 背景画像をストレージから物理削除する |
| 23 | [GO](23-editor-setting-get.md) | エディタ設定取得 | EditorSetting | GET | `/api/editor/setting` | 必要 | 選択中の背景スロット番号を取得する |
| 24 | [GO](24-editor-setting-post.md) | エディタ設定保存 | EditorSetting | POST | `/api/editor/setting` | 必要 | 選択中の背景スロット番号を保存する |

- No 1〜7 は認証ライブラリ BetterAuth が提供する API です (`src/app/api/auth/[...all]/route.ts` で一括公開)。アプリ固有の制御はフック (`src/lib/auth.ts`) で追加しています。
- No 8〜24 はアプリ独自の API です (`src/app/api/<パス>/route.ts`)。
- 物理名は型定義の命名規則 (`ReqParams[物理名]` / `ReqBody[物理名]` / `ResGet[物理名]` / `ResPost[物理名]` / `ResDelete[物理名]`) と対応します。型定義は `src/types/api/<パス>/index.d.ts` にあります。

---

## 共通仕様

### 認証方式

| 項目 | 内容 |
| --- | --- |
| 方式 | BetterAuth による Cookie セッション (Cookie 名: `better-auth.session_token`、HttpOnly) |
| 有効期限 | 30日間 (1日ごとにアクセスがあれば延長) |
| ログイン可能なユーザー | 承認ステータスが `APPROVED` のユーザーのみ (承認待ちはセッションを発行しない) |
| ルート保護 | `/dashboard` 配下は Cookie が無ければ `/login?redirect=<元のパス>` へリダイレクト (`src/proxy.ts`) |
| 回数制限 | ログイン・新規登録・パスワード変更は、同じ送信元IPから 10秒間に3回まで (超過時は 429) |

### 共通エラーレスポンス

アプリ独自の API (No 8〜24) は、エラー時に次の形式の JSON を返します (型: `ApiErrorResponse`)。

| 論理名 | キー名(物理名) | 型情報 | 省略可否 | 備考, コード値等 |
| --- | --- | --- | --- | --- |
| エラー識別コード | code | string | 省略不可 | 例: `"UNAUTHORIZED"`, `"CONFLICT"` |
| エラーメッセージ | message | string | 省略不可 | 画面にそのまま表示できる日本語の文言 |

### 共通ステータスコード

| ステータス | code | message | 発生条件 |
| --- | --- | --- | --- |
| 400 | `BAD_REQUEST` | 入力内容に誤りがあります | リクエストの形式・入力チェックに該当した場合 |
| 401 | `UNAUTHORIZED` | ログインが必要です | 認証が必要な API を未ログインで呼び出した場合 |
| 403 | `FORBIDDEN` | この操作を行う権限がありません | 管理者専用 API を一般ユーザーが呼び出した場合 |

- 画面側の API クライアント (`src/lib/api/client.ts`) は、401 を受け取るとログイン画面へ遷移します。
- 通信自体の失敗や JSON 以外の応答 (413・5xx 等) は、画面側で状況に応じた文言に置き換えて表示します。

### データ型の規約

| 種類 | 未設定時の値 | 例 |
| --- | --- | --- |
| 文字列 | `""` (空文字) | メモ本文が未入力 → `content: ""` |
| 日付・日時 | `null` | 未保存 → `updatedAt: null` |
| オブジェクト | `null` | 未選択 → `selectedSlotNumber: null` |
| 配列 | `[]` (空配列) | 該当データなし → `memos: []` |

`undefined` (キーの省略) は使用しません。一覧取得で該当データが無い場合も、エラーにせず空配列を返します。
