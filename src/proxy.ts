import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * ダッシュボード配下のルート保護
 * - セッション Cookie が無い場合はログイン画面へリダイレクト (ログイン後に元の画面へ戻る)
 * - Cookie の有効性はサーバー側 API と AppInitializer で検証する
 */
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
