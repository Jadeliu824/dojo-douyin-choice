import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "练练 - 你的视频搭子",
  description: "让视频里的技巧，变成你身上的本能",
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
