"use client";

import { Logo } from "@cottonbro/ui";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@cottonbro/auth-react";

export function SiteHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const { user, logout, busy } = useAuth();

    // ...existing logout logic...
    const isAuthenticated = Boolean(user);

    async function handleLogout() {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
            await logout();
        } finally {
            setLoggingOut(false);
            setMobileMenuOpen(false);
        }
    }

    const nav = [
        { href: "/#features", label: "Features" },
        { href: "/#how", label: "How it works" },
        { href: "/#pricing", label: "Pricing" },
        { href: "/#faq", label: "FAQ" },
    ];

    return (
        <>
            <header className="sticky top-0 z-40 border-b border-white/5 bg-page/80 backdrop-blur-xl transition-all">
                <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <Link href="/" className="flex items-center grayscale hover:grayscale-0 transition-all duration-300">
                        {/* Assuming Logo can accept different props, or we wrap it to reset styles if needed.
                             For now, keeping it simple. If Logo enforces Jamino, we might need to adjust it later. */}
                        <Logo size="xl" color="white" fontClassName="font-bold tracking-tight" />
                    </Link>

                    <div className="hidden items-center gap-8 md:flex">
                        {nav.map((n) => (
                            <Link
                                key={n.href}
                                href={n.href}
                                className="text-sm font-medium text-secondary hover:text-white transition-colors tracking-wide uppercase"
                            >
                                {n.label}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        {!isAuthenticated ? (
                            <>
                                <Link
                                    href="/auth/login"
                                    className="text-sm font-semibold text-secondary hover:text-white transition px-2 uppercase tracking-wide"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/auth/login"
                                    className="relative group overflow-hidden rounded-full bg-white px-6 py-2 text-sm font-bold text-black shadow-glow-silver transition-all hover:scale-105 hover:bg-neon-red hover:text-white hover:shadow-glow-red"
                                >
                                    <span className="relative z-10 uppercase tracking-widest text-xs">Start Creating</span>
                                </Link>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={handleLogout}
                                disabled={loggingOut || busy}
                                className="rounded-full border border-white/10 bg-glass px-5 py-2 text-sm font-medium text-secondary hover:text-white hover:bg-white/10 transition disabled:opacity-60 uppercase tracking-wide"
                            >
                                {loggingOut ? "Logging out…" : "Log out"}
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button - White */}
                    <button
                        className="flex md:hidden flex-col gap-1.5 p-2 justify-center items-center group"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <div className={`h-0.5 w-5 bg-white rounded-full transition-all group-hover:bg-neon-red ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
                        <div className={`h-0.5 w-5 bg-white rounded-full transition-all group-hover:bg-neon-red ${mobileMenuOpen ? "opacity-0" : ""}`} />
                        <div className={`h-0.5 w-5 bg-white rounded-full transition-all group-hover:bg-neon-red ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                    </button>
                </nav>
            </header>

            {/* Fixed Mobile Menu Overlay - Dark */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100] bg-page pt-20 px-6 md:hidden"
                    >
                        <div className="flex flex-col gap-8">
                            {nav.map((n) => (
                                <Link
                                    key={n.href}
                                    href={n.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-4xl font-black tracking-tighter text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-white hover:to-secondary transition-all uppercase italic"
                                >
                                    {n.label}
                                </Link>
                            ))}
                            <hr className="border-white/10 my-2" />
                            {!isAuthenticated ? (
                                <div className="flex flex-col gap-6">
                                    <Link
                                        href="/auth/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-xl font-medium text-secondary uppercase tracking-widest"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href="/auth/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="rounded-full bg-white px-6 py-4 text-center text-lg font-bold text-black shadow-glow-silver hover:bg-neon-red hover:text-white transition-colors uppercase tracking-widest"
                                    >
                                        Start Creating
                                    </Link>
                                </div>
                            ) : (
                                <button
                                    onClick={handleLogout}
                                    className="rounded-full border border-white/10 bg-glass px-6 py-4 text-lg font-semibold text-white text-left uppercase tracking-widest"
                                >
                                    Log out
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
