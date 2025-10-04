"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { useSession } from "../lib/use-session";

const baseLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/create-product", label: "Create Product" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const { user, loading } = useSession();

  console.log(user);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const onLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      window.location.href = "/auth/login";
    }
  };

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={[
          "block rounded-md px-3 py-2 text-sm font-medium tracking-wide",
          "transition-colors duration-300 ease-[cubic-bezier(.22,1,.36,1)]",
          active ? "text-white" : "text-gray-300 hover:text-white",
          active
            ? "bg-white/6 ring-1 ring-white/10"
            : "hover:bg-white/5 hover:ring-1 hover:ring-white/10",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
        ].join(" ")}
        onClick={() => setOpen(false)}
      >
        {label}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile header */}
      <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between bg-gray-950/90 px-4 py-3 text-white md:hidden backdrop-blur supports-[backdrop-filter]:bg-gray-950/70">
        <Image
          src="/white-logo.png"
          alt="Cotton Bro"
          width={112}
          height={48}
          className="h-12 w-auto"
          priority
        />
        <button
          aria-label="Toggle navigation"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen(!open)}
          className="rounded-md border border-white/15 px-3 py-1 text-sm hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity md:hidden ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } motion-safe:duration-300`}
        onClick={() => setOpen(false)}
      />

      <aside
        id={menuId}
        className={[
          "bg-[#141414] text-white",
          "md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0",
          "fixed left-0 top-0 z-50 h-full w-64",
          "px-4 pb-[env(safe-area-inset-bottom)]",
          "shadow-[8px_0_30px_rgba(0,0,0,0.45)] ring-1 ring-white/5",
          "relative",
          "transform transition-transform motion-safe:duration-400 motion-safe:ease-[cubic-bezier(.22,1,.36,1)]",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] before:bg-[length:12px_12px] before:opacity-[0.15]",
          "after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-gradient-to-b after:from-white/15 after:via-white/5 after:to-white/15",
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          {/* Top */}
          <div className="relative border-b border-white/10">
            <div className="mx-6 flex items-center py-4">
              <Image
                src="/white-logo.png"
                alt="Cotton Bro"
                width={144}
                height={48}
                className="h-12 w-auto"
                priority
              />
            </div>
          </div>

          {/* Scrollable nav */}
          <nav className="relative flex-1 overflow-y-auto px-2 py-4 [mask-image:linear-gradient(to_bottom,transparent_0,black_12px,black_calc(100%-24px),transparent_100%)]">
            <div className="space-y-1">
              {baseLinks.map((l) => (
                <NavLink key={l.href} href={l.href} label={l.label} />
              ))}

              {/* Auth-aware link */}
              {!loading &&
                (user ? (
                  <button
                    onClick={onLogout}
                    className="w-full text-left block rounded-md px-3 py-2 text-sm font-medium tracking-wide text-gray-300 hover:text-white hover:bg-white/5 hover:ring-1 hover:ring-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <NavLink href="/auth/login" label="Login" />
                  </>
                ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-white/10 px-6 py-4 text-[11px] leading-none text-gray-400">
            Cottonbro © {new Date().getFullYear()}
          </div>
        </div>
      </aside>
    </>
  );
}
