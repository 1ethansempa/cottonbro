"use client";

import Link from "next/link";
import { ArrowUpRight, Frown } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function NotFound() {
  return (
    <div className="font-sans bg-white text-black min-h-screen flex flex-col selection:bg-black selection:text-white">
      <SiteHeader theme="light" position="static" />
      
      <main className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 text-center">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center border-4 border-gray-200 bg-white mb-6 rounded-3xl shadow-xl shadow-black/5">
          <Frown className="h-12 w-12 text-black" aria-hidden="true" />
        </div>

        <div className="mb-4">
          <h1 className="text-[120px] md:text-[200px] font-black text-black leading-[0.8] tracking-tighter mix-blend-difference">
            404
          </h1>
        </div>
        
        <p className="text-xl md:text-2xl font-bold uppercase tracking-[0.2em] text-black mb-10 max-w-md mx-auto">
          Oops, this page doesn&apos;t exist.
        </p>

        <Link
          href="/"
          className="group inline-flex items-center justify-center bg-black text-white hover:opacity-80 px-10 py-5 rounded-full text-xs font-bold tracking-[0.15em] uppercase transition-all cursor-pointer"
        >
          Return Home
          <ArrowUpRight className="h-3.5 w-0 -translate-x-2 opacity-0 transition-all duration-300 group-hover:w-3.5 group-hover:translate-x-0 group-hover:opacity-100 group-hover:ml-2" aria-hidden="true" />
        </Link>
      </main>

      <SiteFooter theme="dark" disableLinks />
    </div>
  );
}
