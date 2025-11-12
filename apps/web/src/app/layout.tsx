import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import WebAuthProvider from "@/app/providers/auth-provider";

const montserrat = Montserrat({
  variable: "--font-questrial",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = { title: "Cotton Bro", description: "" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-white ${montserrat.variable}`}>
        <WebAuthProvider>{children}</WebAuthProvider>
      </body>
    </html>
  );
}
