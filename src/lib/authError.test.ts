import { describe, expect, it } from "vitest";

import { AUTH_MESSAGE_INVALID_CREDENTIALS, AUTH_MESSAGE_SERVER_ERROR, AUTH_MESSAGES_BY_STATUS } from "@/constants/auth";

import { authCall, authErrorMessage } from "./authError";

/** フォーム既定の文言 */
const FALLBACK = "登録に失敗しました";

describe("authCall", () => {
  it("成功時は null を返す", async () => {
    expect(await authCall(async () => ({ error: null }))).toBeNull();
  });

  it("失敗時はコードとステータスを返す (コード無しは空文字)", async () => {
    expect(await authCall(async () => ({ error: { code: "INVALID_PASSWORD", status: 400 } }))).toEqual({
      code: "INVALID_PASSWORD",
      status: 400,
    });
    expect(await authCall(async () => ({ error: { status: 500 } }))).toEqual({ code: "", status: 500 });
  });

  it("通信自体の失敗 (例外) は status 0 として返す", async () => {
    expect(
      await authCall(async () => {
        throw new TypeError("Failed to fetch");
      }),
    ).toEqual({ code: "NETWORK_ERROR", status: 0 });
  });
});

describe("authErrorMessage", () => {
  it("ID・メールアドレスのどちらでログインしても、どちらが誤りかを区別しない文言になる", () => {
    const byUsername = authErrorMessage({ code: "INVALID_USERNAME_OR_PASSWORD", status: 401 }, FALLBACK);
    const byEmail = authErrorMessage({ code: "INVALID_EMAIL_OR_PASSWORD", status: 401 }, FALLBACK);
    expect(byUsername).toBe(AUTH_MESSAGE_INVALID_CREDENTIALS);
    expect(byEmail).toBe(AUTH_MESSAGE_INVALID_CREDENTIALS);
  });

  it("フォーム固有の文言を共通の文言より優先する", () => {
    const message = authErrorMessage({ code: "INVALID_PASSWORD", status: 400 }, FALLBACK, {
      INVALID_PASSWORD: "現在のパスワードが正しくありません",
    });
    expect(message).toBe("現在のパスワードが正しくありません");
  });

  it.each([
    [{ code: "NETWORK_ERROR", status: 0 }, AUTH_MESSAGES_BY_STATUS[0]],
    [{ code: "", status: 429 }, AUTH_MESSAGES_BY_STATUS[429]],
    [{ code: "", status: 500 }, AUTH_MESSAGE_SERVER_ERROR],
    [{ code: "", status: 503 }, AUTH_MESSAGE_SERVER_ERROR],
    [{ code: "UNKNOWN_CODE", status: 400 }, FALLBACK],
  ])("%j → コードで判別できない場合はステータスから文言を決める", (error, expected) => {
    expect(authErrorMessage(error, FALLBACK)).toBe(expected);
  });
});
