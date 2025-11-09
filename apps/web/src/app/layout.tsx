import "./globals.css";
import type { Metadata } from "next";
import { Questrial, Cedarville_Cursive } from "next/font/google";
import WebAuthProvider from "@/app/providers/auth-provider";

const questrial = Questrial({
  variable: "--font-questrial",
  subsets: ["latin"],
  weight: "400",
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
        className={`min-h-screen bg-white ${questrial.variable} ${cedarville.variable}`}
      >
        <WebAuthProvider>{children}</WebAuthProvider>
      </body>
    </html>
  );
}
