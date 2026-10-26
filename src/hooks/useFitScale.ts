"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

/** 縮小率を書き込む CSS 変数名 */
export const FIT_SCALE_CSS_VARIABLE = "--fit-scale";

/** 二分探索の試行回数 (2^-8 ≒ 0.4% 刻みの精度) */
const SEARCH_ITERATIONS = 8;

/**
 * 要素の内容が高さ内に収まる最大の縮小率 (minScale〜1) を求め、CSS 変数 `--fit-scale` に書き込む
 * - 子孫要素のサイズを `calc(... * var(--fit-scale, 1))` で指定しておくと、内容全体が比例して縮小される
 * - 要素サイズの変化 (全画面表示・画面回転など)、Web フォントの読み込み完了、contentKey の変化で再計算する
 * - React の再描画を伴わず、描画前 (useLayoutEffect) に直接スタイルを書き換えるためちらつかない
 * @param minScale 縮小率の下限 (これ以上は縮小せず、はみ出し分は親要素で隠れる)
 * @param contentKey 内容が変わったことを示すキー (変化時に再計算)
 * @param onOverflowChange 下限まで縮小しても収まらない状態になった / 解消したときに呼ばれる
 * @returns 対象要素に渡す ref
 */
export const useFitScale = <T extends HTMLElement>(
  minScale: number,
  contentKey: string,
  onOverflowChange: (isOverflowing: boolean) => void,
) => {
  const ref = useRef<T>(null);
  const onOverflowChangeRef = useRef(onOverflowChange);
  const isOverflowingRef = useRef(false);

  useEffect(() => {
    onOverflowChangeRef.current = onOverflowChange;
  }, [onOverflowChange]);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    /** 現在の縮小率で内容が高さ内に収まっているかどうか */
    const isFitting = (scale: number): boolean => {
      element.style.setProperty(FIT_SCALE_CSS_VARIABLE, String(scale));
      return element.scrollHeight <= element.clientHeight;
    };

    /** はみ出し状態が変わったときだけ通知する */
    const notifyOverflow = (isOverflowing: boolean) => {
      if (isOverflowingRef.current === isOverflowing) return;
      isOverflowingRef.current = isOverflowing;
      onOverflowChangeRef.current(isOverflowing);
    };

    const fit = () => {
      if (isFitting(1)) {
        notifyOverflow(false);
        return;
      }
      let fittingScale = minScale;
      let overflowingScale = 1;
      Array.from({ length: SEARCH_ITERATIONS }).forEach(() => {
        const middleScale = (fittingScale + overflowingScale) / 2;
        const fits = isFitting(middleScale);
        if (fits) fittingScale = middleScale;
        if (!fits) overflowingScale = middleScale;
      });
      notifyOverflow(!isFitting(fittingScale));
    };

    fit();
    document.fonts?.ready.then(fit);
    if (!("ResizeObserver" in window)) return;
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    return () => observer.disconnect();
  }, [minScale, contentKey]);

  return ref;
};
