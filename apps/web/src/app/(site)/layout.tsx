"use client";

//import type { Metadata } from "next";
import Link from "next/link";
import { useState } from "react";
import Sidebar from "../../components/sidebar";

//export const metadata: Metadata = { title: "Cotton Bro" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header (fixed). Header logo toggles the sidebar */}
      <header className="fixed inset-x-0 top-0 z-30 h-16 border-b bg-white">
        <div className="mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Show text logo ONLY when sidebar is closed; clicking opens the sidebar */}
          {!open ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open sidebar"
              className="font-bold text-lg hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 rounded"
            >
              Cotton Bro
            </button>
          ) : (
            <span className="font-bold text-lg opacity-0 select-none">
              Cotton Bro
            </span>
          )}

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-3 py-2 text-sm hover:text-gray-700"
            >
              Log in
            </Link>
            <Link
              href="/create-product"
              className="px-4 py-2 text-sm font-semibold rounded-md bg-black text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
            >
              Create product
            </Link>
          </div>
        </div>
      </header>

      {/* Sidebar (controlled). No overlay/backdrop. */}
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* Content shifts with the sidebar. Starts below header. */}
      <main
        className={[
          "pt-24 px-24 py-8 transition-[margin] duration-300 ease-[cubic-bezier(.22,1,.36,1)]",
          open ? "ml-64" : "ml-0",
        ].join(" ")}
      >
        {children}
      </main>
    </div>
  );
}
