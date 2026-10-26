import type { ApiErrorResponse } from "@/types";

/** API 呼び出し結果 (成功時は data、失敗時は error のみ値を持つ) */
export type ApiResult<TData, TError = ApiErrorResponse> =
  { ok: true; status: number; data: TData; error: null } | { ok: false; status: number; data: null; error: TError };

/** 通信自体に失敗した場合のエラー */
const NETWORK_ERROR: ApiErrorResponse = {
  code: "NETWORK_ERROR",
  message: "通信に失敗しました。時間をおいて再度お試しください",
};

/** サーバー側の予期しないエラー */
const SERVER_ERROR: ApiErrorResponse = {
  code: "SERVER_ERROR",
  message: "サーバーでエラーが発生しました。時間をおいて再度お試しください",
};

/** JSON のエラー本文が返らなかった場合 (ホスティング側で弾かれた等) に、ステータスごとに表示するエラー */
const FALLBACK_ERRORS_BY_STATUS: Record<number, ApiErrorResponse> = {
  401: { code: "UNAUTHORIZED", message: "ログインの有効期限が切れました。再度ログインしてください" },
  403: { code: "FORBIDDEN", message: "この操作を行う権限がありません" },
  404: { code: "NOT_FOUND", message: "対象のデータが見つかりません。画面を再読み込みしてください" },
  413: { code: "PAYLOAD_TOO_LARGE", message: "送信するデータが大きすぎます。ファイルサイズを小さくしてお試しください" },
  429: { code: "TOO_MANY_REQUESTS", message: "操作が集中しています。しばらく待ってから再度お試しください" },
};

/** JSON のエラー本文が返らなかった場合のエラーを返す (該当ステータスが無ければサーバーエラー扱い) */
const fallbackError = (status: number): ApiErrorResponse => FALLBACK_ERRORS_BY_STATUS[status] ?? SERVER_ERROR;

/** fetch を実行し、結果を ApiResult に変換する (401 の場合はログイン画面へ遷移) */
const request = async <TData, TError>(path: string, init: RequestInit): Promise<ApiResult<TData, TError>> => {
  try {
    const response = await fetch(path, init);
    const json: unknown = await response.json().catch(() => null);
    // セッション切れの場合はログイン画面へ (API 層のためルーターを持たず、ページ遷移で状態もリセットする)
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    if (response.status === 401) window.location.assign("/login");
    if (response.ok) return { ok: true, status: response.status, data: json as TData, error: null };
    return {
      ok: false,
      status: response.status,
      data: null,
      error: (json ?? fallbackError(response.status)) as TError,
    };
  } catch {
    return { ok: false, status: 0, data: null, error: NETWORK_ERROR as TError };
  }
};

/** GET リクエスト (params はクエリ文字列に変換) */
export const apiGet = <TData>(path: string, params: Record<string, string>): Promise<ApiResult<TData>> => {
  const query = new URLSearchParams(params).toString();
  const url = [path, query].filter((part) => !(part === "")).join("?");
  return request<TData, ApiErrorResponse>(url, { method: "GET", cache: "no-store" });
};

/** POST リクエスト (JSON ボディ) */
export const apiPost = <TData, TError = ApiErrorResponse>(
  path: string,
  body: object,
): Promise<ApiResult<TData, TError>> =>
  request<TData, TError>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

/** POST リクエスト (multipart/form-data) */
export const apiPostForm = <TData>(path: string, formData: FormData): Promise<ApiResult<TData>> =>
  request<TData, ApiErrorResponse>(path, { method: "POST", body: formData });

/** DELETE リクエスト (JSON ボディ) */
export const apiDelete = <TData>(path: string, body: object): Promise<ApiResult<TData>> =>
  request<TData, ApiErrorResponse>(path, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
