import "./globals.css";
import type { Metadata } from "next";
import { DM_Sans, Urbanist } from "next/font/google";
import WebAuthProvider from "@/app/providers/auth-provider";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = { title: "Cotton Bro", description: "" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`min-h-screen bg-white ${dmSans.variable} ${urbanist.variable}`}
        suppressHydrationWarning
      >
        <WebAuthProvider>{children}</WebAuthProvider>
      </body>
    </html>
  );
}
