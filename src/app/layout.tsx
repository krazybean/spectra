import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spectra",
  description: "Ambient AI visualizer for autonomous coding agents."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
