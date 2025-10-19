"use client";

import Link from "next/link";
import { useState } from "react";
import Sidebar from "../../components/sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen text-neutral-100 bg-neutral-950">
      <div
        className="fixed inset-0 -z-10 bg-[radial-gradient(1000px_500px_at_20%_0%,rgba(120,119,198,0.12),transparent_60%),radial-gradient(900px_500px_at_80%_20%,rgba(56,189,248,0.10),transparent_60%)]"
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 -z-10 bg-black/40 backdrop-blur-[2px]"
        aria-hidden="true"
      />

      <header className="fixed inset-x-0 top-0 z-30 h-16 border-b border-white/10 bg-black/40 backdrop-blur-sm">
        <div className="mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
          {!open ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open sidebar"
              className="font-bold text-lg hover:text-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded"
            >
              Cotton Bro
            </button>
          ) : (
            <span className="select-none font-bold text-lg opacity-0">
              Cotton Bro
            </span>
          )}

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/auth/login"
              className="px-3 py-2 text-sm text-neutral-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded"
            >
              Log in
            </Link>
            <Link
              href="/create-product"
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white"
            >
              Create product
            </Link>
          </div>
        </div>
      </header>

      <Sidebar open={open} onClose={() => setOpen(false)} />

      <main
        className={[
          "flex flex-col items-stretch justify-start",

          "pt-24 px-6 sm:px-8 lg:px-24 py-8 transition-[margin] duration-300 ease-[cubic-bezier(.22,1,.36,1)]",
          open ? "ml-64" : "ml-0",
        ].join(" ")}
      >
        {children}
      </main>

      <footer className="border-t border-white/10 bg-black/40 backdrop-blur-sm">
        <div className="mx-auto max-w-screen-xl px-4 py-14">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 font-extrabold text-lg tracking-tight">
                <span
                  className="size-8 rounded-lg border border-white/10 shadow-inner"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 30%, #ffffff, #3f3f46)",
                  }}
                />
                Cottonbro
              </div>
              <p className="mt-3 max-w-sm text-sm text-neutral-300">
                Empowering creators to design, sell, and deliver merch
                effortlessly. We handle printing, fulfillment, and payouts — you
                focus on your brand.
              </p>

              <div className="mt-4 flex gap-4">
                <a
                  href="https://twitter.com"
                  aria-label="Twitter"
                  className="text-neutral-400 transition hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-5"
                  >
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.24 4.24 0 0 0 1.88-2.34 8.49 8.49 0 0 1-2.69 1.03 4.23 4.23 0 0 0-7.21 3.86 12 12 0 0 1-8.72-4.42 4.23 4.23 0 0 0 1.31 5.65 4.22 4.22 0 0 1-1.91-.52v.05a4.23 4.23 0 0 0 3.39 4.15 4.25 4.25 0 0 1-1.9.07 4.24 4.24 0 0 0 3.96 2.94A8.5 8.5 0 0 1 2 19.54a12 12 0 0 0 6.29 1.84c7.55 0 11.68-6.26 11.68-11.68v-.53A8.36 8.36 0 0 0 22.46 6z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  aria-label="Instagram"
                  className="text-neutral-400 transition hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="size-5"
                  >
                    <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h10zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm4.5-.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide text-neutral-200">
                Product
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-neutral-300">
                <li>
                  <a href="#features" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#workflow" className="hover:text-white">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#publish" className="hover:text-white">
                    Sell
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide text-neutral-200">
                Resources
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-neutral-300">
                <li>
                  <a href="#live-demo" className="hover:text-white">
                    Demo
                  </a>
                </li>
                <li>
                  <a href="#templates" className="hover:text-white">
                    Templates
                  </a>
                </li>
                <li>
                  <a href="#docs" className="hover:text-white">
                    Docs
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide text-neutral-200">
                Company
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-neutral-300">
                <li>
                  <a href="#about" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#careers" className="hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 md:flex-row">
            <p className="text-sm text-neutral-400">
              © {new Date().getFullYear()} Cottonbro. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm text-neutral-400">
              <a href="#privacy" className="hover:text-white">
                Privacy
              </a>
              <a href="#terms" className="hover:text-white">
                Terms
              </a>
              <a href="#cookies" className="hover:text-white">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
