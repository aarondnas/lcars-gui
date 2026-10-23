import type { ReactNode } from "react";
import "@lcars-gui/federation/ui.css";

export const metadata = {
  title: "LCARS UI – Next.js Example",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body
        style={{
          background: "var(--colors-background)",
          color: "var(--colors-text2)",
          fontFamily: "Antonio, sans-serif",
          padding: 40,
        }}
      >
        {children}
      </body>
    </html>
  );
}
