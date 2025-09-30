import type { Metadata } from "next";
import Sidebar from "../../components/sidebar";

export const metadata: Metadata = { title: "Cotton Bro" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="md:flex">
      <Sidebar />
      <main className="flex-1 min-w-0 px-6 py-8 pt-14 md:pt-8">{children}</main>
    </div>
  );
}
