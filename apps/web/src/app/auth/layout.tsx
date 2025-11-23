import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Auth | Cotton Bro",
};

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const c = cookies() as any;
  const access = c.get("access_token")?.value;
  const id = c.get("id_token")?.value;

  if (access || id) {
    redirect("/");
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-white">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center w-full">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
