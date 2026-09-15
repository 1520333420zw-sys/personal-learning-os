import type { Metadata } from "next";
import type { ReactNode } from "react";

import "../globals.css";

export const metadata: Metadata = {
  title: "Personal Learning OS",
  description: "A personal learning and growth workspace.",
};

export default function RedirectRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
