import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

import CToaster from "@/components/atoms/CToaster";

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: { default: "サロン空き状況ストーリーズ", template: "%s | サロン空き状況ストーリーズ" },
  description: "美容院の予約空き枠から Instagram ストーリーズ告知画像を作成します",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${notoSansJp.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <CToaster />
      </body>
    </html>
  );
}
