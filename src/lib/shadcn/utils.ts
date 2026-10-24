import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind のクラス名を結合し、競合するクラスを後勝ちでマージする */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
