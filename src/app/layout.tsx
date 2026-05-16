import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dojo · 开口才算学会",
  description: "抖音精选内容重构：让视频里的技巧，变成你身上的本能",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
