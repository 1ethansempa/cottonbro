"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useAuth } from "@cottonbro/auth-react";

const baseLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/products/new", label: "Create Product" },
];

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout: authLogout, busy } = useAuth();

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Treat a link as active if pathname matches exactly or is a child path.
  const isActive = (href: string) =>
    pathname === href || (pathname?.startsWith(href) && href !== "/");

  const onLogout = async () => {
    try {
      await authLogout();
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      // Ensure UI state is cleared
      router.push("/auth/login");
      router.refresh();
    }
  };

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        onClick={onClose}
        className={[
          "block rounded-md px-3 py-2 text-sm font-medium tracking-wide",
          "transition-colors duration-300 ease-[cubic-bezier(.22,1,.36,1)]",
          active
            ? "text-cyan bg-cyan/10 ring-1 ring-cyan/20"
            : "text-gray-400 hover:text-cyan hover:bg-white/5 hover:ring-1 hover:ring-white/5",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/30",
        ].join(" ")}
      >
        {label}
      </Link>
    );
  };

  return (
    <aside
      className={[
        "bg-black text-white",
        "fixed inset-y-0 left-0 z-40 w-64",
        "px-4 pb-[env(safe-area-inset-bottom)]",
        "shadow-2xl border-r border-white/5",
        "transform transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]",
        open ? "translate-x-0" : "-translate-x-64",
      ].join(" ")}
      aria-hidden={!open}
    >
      <div className="flex h-full flex-col">
        {/* Sidebar header — clicking the LOGO closes the sidebar */}
        <div className="relative border-b border-white/10">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="mx-6 flex w-full items-center justify-start gap-3 py-4 cursor-pointer select-none
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <Image
              src="/white-logo.png"
              alt="Cotton Bro"
              width={144}
              height={48}
              className="h-12 w-auto"
              priority
            />
          </button>
        </div>

        {/* Scrollable nav */}
        <nav className="relative flex-1 overflow-y-auto px-2 py-4 [mask-image:linear-gradient(to_bottom,transparent_0,black_12px,black_calc(100%-24px),transparent_100%)]">
          <div className="space-y-1">
            {baseLinks.map((l) => (
              <NavLink key={l.href} href={l.href} label={l.label} />
            ))}

            {!loading &&
              (user ? (
                <button
                  onClick={onLogout}
                  disabled={busy}
                  className="w-full text-left block rounded-md px-3 py-2 text-sm font-medium tracking-wide text-gray-400
                             hover:text-cyan hover:bg-white/5 hover:ring-1 hover:ring-white/5
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/30 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  Logout
                </button>
              ) : (
                <NavLink href="/auth/login" label="Login" />
              ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-4 text-[11px] leading-none text-gray-400">
          Cottonbro © {new Date().getFullYear()}
        </div>
      </div>
    </aside>
  );
}
