import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Auth | Cotton Bro",
};

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const c = await cookies();
  const session = c.get("__session")?.value;

  if (session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-page">
      <SiteHeader theme="dark" />
      <main className="flex-1 flex items-center justify-center w-full">
        {children}
      </main>
      <SiteFooter theme="dark" />
    </div>
  );
}
