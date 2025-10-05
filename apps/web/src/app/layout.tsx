import "./globals.css";
import type { Metadata } from "next";
import { DM_Sans, Cedarville_Cursive } from "next/font/google";
import AuthSessionKeeper from "../components/auth-session-keeper";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const cedarville = Cedarville_Cursive({
  variable: "--font-cedarville",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = { title: "Cotton Bro" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`min-h-screen bg-white ${dmSans.variable} ${cedarville.variable}`}
      >
        <AuthSessionKeeper />
        {children}
      </body>
    </html>
  );
}
