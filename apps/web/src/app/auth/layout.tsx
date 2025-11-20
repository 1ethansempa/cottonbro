import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Auth | Cotton Bro",
};

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
    <main
      className="min-h-screen w-full flex items-center justify-center 
                 bg-white bg-cover bg-center"
    >
      {children}
    </main>
  );
}
