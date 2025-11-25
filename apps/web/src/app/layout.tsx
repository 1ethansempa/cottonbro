import "./globals.css";
import type { Metadata } from "next";
import { Montserrat, Urbanist } from "next/font/google";
import WebAuthProvider from "@/app/providers/auth-provider";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: "400",
});

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
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
        className={`min-h-screen bg-white ${montserrat.variable} ${urbanist.variable}`}
        suppressHydrationWarning
      >
        <WebAuthProvider>{children}</WebAuthProvider>
      </body>
    </html>
  );
}
