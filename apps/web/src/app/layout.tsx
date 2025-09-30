import "./globals.css";
import type { Metadata } from "next";
import { DM_Sans, Cedarville_Cursive } from "next/font/google";
import Sidebar from "../components/sidebar";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const cedarville = Cedarville_Cursive({
  variable: "--font-cedarville",
  subsets: ["latin"],
  weight: "400", // only weight available
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
        <div className="md:flex">
          <Sidebar />
          <main className="flex-1 min-w-0 px-6 py-8 pt-14 md:pt-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
