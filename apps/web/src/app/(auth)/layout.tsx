import type { Metadata } from "next";

export const metadata: Metadata = { title: "Auth | Cotton Bro" };

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className="min-h-screen w-full flex items-center justify-center 
             bg-[url('/auth-bg.png')] bg-cover bg-center"
    >
      {children}
    </main>
  );
}
