"use client";

import { Logo } from "@cottonbro/ui";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SiteHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const nav = [
        { href: "/#features", label: "Features" },
        { href: "/#how", label: "How it works" },
        { href: "/#pricing", label: "Pricing" },
        { href: "/#faq", label: "FAQ" },
    ];

    return (
        <>
            <header className="sticky top-0 z-40 border-b border-black bg-white/90 backdrop-blur-md">
                <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <Link href="/" className="flex items-center text-black">
                        <Logo size="xl" color="current" fontClassName="font-jamino" />
                    </Link>

                    <div className="hidden items-center gap-8 md:flex">
                        {nav.map((n) => (
                            <Link
                                key={n.href}
                                href={n.href}
                                className="text-sm font-bold uppercase tracking-widest text-black hover:text-street-red transition-colors"
                            >
                                {n.label}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <Link
                            href="/auth/login"
                            className="text-sm font-bold uppercase tracking-widest text-black hover:text-street-red transition"
                        >
                            Sign in
                        </Link>
                        <Link
                            href="/auth/login"
                            className="bg-black border-2 border-black px-6 py-2 text-sm font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition"
                        >
                            Create account
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="flex md:hidden flex-col gap-1.5 p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <div
                            className={`h-0.5 w-6 bg-black transition-transform ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""
                                }`}
                        />
                        <div
                            className={`h-0.5 w-6 bg-black transition-opacity ${mobileMenuOpen ? "opacity-0" : ""
                                }`}
                        />
                        <div
                            className={`h-0.5 w-6 bg-black transition-transform ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                                }`}
                        />
                    </button>
                </nav>
            </header>

            {/* Fixed Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, z: -100, scale: 0.9 }}
                        animate={{ opacity: 1, z: 0, scale: 1 }}
                        exit={{ opacity: 0, z: -100, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[200] bg-white/95 backdrop-blur-lg w-screen h-screen overflow-y-auto md:hidden"
                    >
                        <div className="flex flex-col h-full p-6">
                            <div className="flex justify-between items-center mb-8">
                                <Logo size="xl" color="current" fontClassName="font-jamino" />
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2"
                                    aria-label="Close menu"
                                >
                                    <svg
                                        className="w-8 h-8 text-black"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex flex-col gap-6 items-center text-center">
                                {nav.map((n) => (
                                    <Link
                                        key={n.href}
                                        href={n.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-3xl font-jamino uppercase text-black hover:text-street-red transition-colors"
                                    >
                                        {n.label}
                                    </Link>
                                ))}
                            </div>
                            <div className="mt-auto flex flex-col gap-4 pb-8">
                                <Link
                                    href="/auth/login"
                                    className="text-xl font-bold uppercase tracking-widest text-black text-center hover:text-street-red transition"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/auth/login"
                                    className="bg-black border-2 border-black px-6 py-4 text-center text-xl font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition"
                                >
                                    Create account
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
