"use client";

import { useEffect, useState } from "react";

/** 非表示判定を開始するスクロール量 (px) */
const HIDE_THRESHOLD_PX = 64;

/**
 * スクロール方向に応じた表示状態を返す (下スクロールで非表示、上スクロールで表示)
 * @returns 非表示にすべきかどうか
 */
export const useScrollHidden = (): boolean => {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      /** 一定量以上スクロールし、かつ下方向へ移動したかどうか */
      const isScrollingDown: boolean = currentScrollY > HIDE_THRESHOLD_PX && currentScrollY > lastScrollY;
      setIsHidden(isScrollingDown);
      lastScrollY = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return isHidden;
};
