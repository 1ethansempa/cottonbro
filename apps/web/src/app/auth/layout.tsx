import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auth | Cotton Plug",
};

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-page">
      <SiteHeader theme="light" position="static" />
      <main className="flex-1 flex items-center justify-center w-full">
        {children}
      </main>
      <SiteFooter theme="light" />
    </div>
  );
}
