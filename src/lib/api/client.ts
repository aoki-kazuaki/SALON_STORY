import type { ApiErrorResponse } from "@/types";

/** API 呼び出し結果 (成功時は data、失敗時は error のみ値を持つ) */
export type ApiResult<TData, TError = ApiErrorResponse> =
  { ok: true; status: number; data: TData; error: null } | { ok: false; status: number; data: null; error: TError };

/** 通信自体に失敗した場合のエラー */
const NETWORK_ERROR: ApiErrorResponse = {
  code: "NETWORK_ERROR",
  message: "通信に失敗しました。時間をおいて再度お試しください",
};

/** fetch を実行し、結果を ApiResult に変換する (401 の場合はログイン画面へ遷移) */
const request = async <TData, TError>(path: string, init: RequestInit): Promise<ApiResult<TData, TError>> => {
  try {
    const response = await fetch(path, init);
    const json: unknown = await response.json().catch(() => null);
    // セッション切れの場合はログイン画面へ (API 層のためルーターを持たず、ページ遷移で状態もリセットする)
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    if (response.status === 401) window.location.assign("/login");
    if (response.ok) return { ok: true, status: response.status, data: json as TData, error: null };
    return { ok: false, status: response.status, data: null, error: (json ?? NETWORK_ERROR) as TError };
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
