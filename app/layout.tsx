import type { Metadata } from "next";
import { Anton, Nunito } from "next/font/google";
import "./globals.css";

const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" });
const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800", "900"], variable: "--font-nunito" });

export const metadata: Metadata = { title: "asas" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${nunito.variable}`}>
      <body><div className="shell">{children}</div></body>
    </html>
  );
}
