import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { z } from "zod";

import { auth } from "@/lib/auth";
import type { ApiErrorResponse, UserRole } from "@/types";

/** API で利用するログインユーザー情報 */
export type SessionUser = {
  /** ユーザーID */
  id: string;
  /** ユーザー権限 */
  role: UserRole;
};

/** リクエストの Cookie からログインユーザーを取得する (未ログインは null) */
export const apiGetSessionUser = async (): Promise<SessionUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  return { id: session.user.id, role: session.user.role as UserRole };
};

/** エラーレスポンスを生成する */
export const apiErrorResponse = (status: number, code: string, message: string) =>
  NextResponse.json<ApiErrorResponse>({ code, message }, { status });

/** 401 未ログイン */
export const apiUnauthorizedResponse = () => apiErrorResponse(401, "UNAUTHORIZED", "ログインが必要です");

/** 403 権限なし */
export const apiForbiddenResponse = () => apiErrorResponse(403, "FORBIDDEN", "この操作を行う権限がありません");

/** 400 入力不正 */
export const apiBadRequestResponse = () => apiErrorResponse(400, "BAD_REQUEST", "入力内容に誤りがあります");

/** JSON ボディを読み込み、スキーマで検証する (不正な場合は null) */
export const apiParseJsonBody = async <T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<z.infer<T> | null> => {
  const body: unknown = await request.json().catch(() => null);
  const result = schema.safeParse(body);
  if (!result.success) return null;
  return result.data;
};
