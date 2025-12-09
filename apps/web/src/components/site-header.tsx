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
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                <div className="flex items-center gap-12">
                    <Link href="/" className="flex items-center gap-2 grayscale hover:grayscale-0 transition-opacity">
                        <Logo size="md" color="white" fontClassName="font-bold tracking-tight" />
                    </Link>

                    <nav className="hidden md:flex items-center gap-8">
                        {['Features', 'How it works', 'Pricing'].map((item) => (
                            <Link
                                key={item}
                                href={`/#${item.toLowerCase().replace(/\s+/g, '-')}`}
                                className="text-sm font-medium text-secondary hover:text-white transition-colors tracking-wide uppercase"
                            >
                                {item}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="hidden md:flex items-center gap-6">
                    {!isAuthenticated ? (
                        <>
                            <Link
                                href="/auth/login"
                                className="text-sm font-semibold text-secondary hover:text-white transition px-2 uppercase tracking-wide"
                            >
                                Sign In
                            </Link>
                            <Link href="/auth/login">
                                <button className="rounded-full bg-white px-6 py-2 text-sm font-bold text-black shadow-glow-silver hover:bg-neon-red hover:text-white hover:shadow-glow-red transition-all uppercase tracking-wide">
                                    Start Creating
                                </button>
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
                    className="md:hidden p-2 text-white group"
                    onClick={() => setMobileMenuOpen(true)}
                >
                    <div className="space-y-1.5">
                        <span className="block w-6 h-0.5 bg-white transition-colors group-hover:bg-neon-red"></span>
                        <span className="block w-6 h-0.5 bg-white transition-colors group-hover:bg-neon-red"></span>
                        <span className="block w-6 h-0.5 bg-white transition-colors group-hover:bg-neon-red"></span>
                    </div>
                </button>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-50 bg-black p-6 md:hidden flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-12">
                                <Logo size="md" color="white" />
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 text-secondary hover:text-white transition-colors"
                                >
                                    <span className="text-2xl">✕</span>
                                </button>
                            </div>

                            <nav className="flex flex-col gap-8 items-center text-center">
                                {['Features', 'How it works', 'Pricing'].map((item) => (
                                    <Link
                                        key={item}
                                        href={`/#${item.toLowerCase().replace(/\s+/g, '-')}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-4xl font-black tracking-tighter text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-white hover:to-secondary transition-all uppercase italic"
                                    >
                                        {item}
                                    </Link>
                                ))}
                                {!isAuthenticated ? (
                                    <>
                                        <Link
                                            href="/auth/login"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="text-2xl font-bold text-secondary hover:text-white mt-8 uppercase"
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            href="/auth/login"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="rounded-full bg-white px-8 py-4 text-xl font-bold text-black shadow-glow-silver mt-4 uppercase tracking-wide hover:bg-neon-red hover:text-white"
                                        >
                                            Start Creating
                                        </Link>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => { handleLogout(); }}
                                        className="text-2xl font-bold text-secondary hover:text-white mt-8 uppercase"
                                    >
                                        Log Out
                                    </button>
                                )}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}
