"use client";

import { Logo } from "@cottonbro/ui";
import Link from "next/link";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@cottonbro/auth-react";
import { ArrowUpRight, Menu, X } from "lucide-react";

interface SiteHeaderProps {
    theme?: "light" | "dark";
    disableLinks?: boolean;
}

function MaybeLink({
    disabled,
    href,
    className,
    onClick,
    children,
}: {
    disabled?: boolean;
    href: string;
    className?: string;
    onClick?: () => void;
    children: ReactNode;
}) {
    if (disabled) {
        return (
            <span aria-disabled="true" className={`${className ?? ""} pointer-events-none cursor-default`}>
                {children}
            </span>
        );
    }

    return (
        <Link href={href} onClick={onClick} className={className}>
            {children}
        </Link>
    );
}

export function SiteHeader({ theme = "dark", disableLinks = false }: SiteHeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, logout, busy } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
        { href: "/#drops", label: "Drops" },
        { href: "/#how-it-works", label: "How it works" },
        { href: "/#calculator", label: "Pricing" },
    ];
    const loginHref = "/auth/login";
    const startHref = "/auth/login?redirect=%2Fdesign";
    const navTextClass =
        theme === "light"
            ? "text-black/60 hover:text-black"
            : "text-white/55 hover:text-white";
    const floatingHeaderClass =
        theme === "light"
            ? "border border-black bg-white/90 shadow-[4px_4px_0_rgba(0,0,0,1)]"
            : "border border-white bg-black/90 shadow-[4px_4px_0_rgba(255,255,255,1)]";
            
    const staticHeaderClass =
        theme === "light"
            ? "border-b border-black/10 bg-white/85 shadow-[0_1px_0_rgba(0,0,0,0.04)]"
            : "border-b border-white/10 bg-black/75 shadow-[0_1px_0_rgba(255,255,255,0.05)]";

    const headerClass = isScrolled ? floatingHeaderClass : staticHeaderClass;

    return (
        <>
            <div className={`fixed inset-x-0 top-0 z-50 flex justify-center pointer-events-none transition-all duration-300 ${isScrolled ? "px-4 pt-4 sm:px-6 sm:pt-6" : "px-0 pt-0"}`}>
                <header
                    className={`pointer-events-auto w-full transition-all duration-300 backdrop-blur-xl rounded-none ${isScrolled ? "max-w-6xl" : "max-w-full"} ${headerClass}`}
                >
                    <div className={`grid grid-cols-2 md:grid-cols-[1fr_auto_1fr] items-center transition-all duration-300 ${isScrolled ? "h-14 px-4 sm:h-16 sm:px-6" : "h-[72px] px-5 sm:px-6"}`}>
                        <div className="flex items-center">
                            <MaybeLink disabled={disableLinks} href="/" className="group flex items-center transition-transform duration-300 hover:scale-105">
                                <div className="flex items-baseline text-xl font-black uppercase tracking-tighter leading-none">
                                    <span className={theme === "light" ? "text-black" : "text-white"}>COTTON</span>
                                    <span className="text-[#e60000]">BRO</span>
                                    <span className="ml-1 h-2 w-2 rounded-full bg-[#e60000]"></span>
                                </div>
                            </MaybeLink>
                        </div>

                        <nav className="hidden items-center gap-1 md:flex sm:gap-2">
                            {nav.map((item) => (
                                <MaybeLink
                                    key={item.label}
                                    disabled={disableLinks}
                                    href={item.href}
                                    className={`relative rounded-none px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${theme === "light" ? "hover:bg-black text-black/60 hover:text-white" : "hover:bg-white text-white/55 hover:text-black"} `}
                                >
                                    {item.label}
                                </MaybeLink>
                            ))}
                        </nav>

                        <div className="hidden items-center justify-end gap-3 md:flex">
                            {!isAuthenticated ? (
                                <>
                                    <MaybeLink
                                        disabled={disableLinks}
                                        href={loginHref}
                                        className={`rounded-none px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:opacity-80 ${navTextClass}`}
                                    >
                                        Login
                                    </MaybeLink>
                                    <MaybeLink
                                        disabled={disableLinks}
                                        href={startHref}
                                        className={`inline-flex items-center gap-2 rounded-none px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:opacity-80 ${theme === "light"
                                                ? "bg-black text-white"
                                                : "bg-white text-black"
                                                }`}
                                    >
                                        Start Designing
                                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                                    </MaybeLink>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    disabled={loggingOut || busy}
                                    className={`cursor-pointer rounded-none border px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-60 hover:opacity-80 ${theme === "light"
                                            ? "border-black/20 bg-white text-black hover:border-black"
                                            : "border-white/20 bg-black text-white hover:border-white"
                                        }`}
                                >
                                    {loggingOut ? "Logging out…" : "Log out"}
                                </button>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            type="button"
                            aria-label="Open menu"
                            className={`justify-self-end rounded-none p-2 transition-colors hover:bg-black/5 md:hidden ${theme === "light" ? "text-black hover:text-black/60" : "text-white hover:text-white/70"}`}
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                        </button>
                    </div>
                </header>
            </div>

            {/* Mobile Menu Overlay - Portal/Outside Header */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[99] bg-black p-6 md:hidden flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-12">
                            <Logo size="md" color="white" />
                            <button
                                type="button"
                                aria-label="Close menu"
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 text-white/60 hover:text-white transition-colors cursor-pointer"
                            >
                                <X className="h-7 w-7" aria-hidden="true" />
                            </button>
                        </div>

                        <nav className="flex flex-col gap-7 items-start">
                            {nav.map((item) => (
                                <MaybeLink
                                    key={item.label}
                                    disabled={disableLinks}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-4xl font-black uppercase tracking-[-0.02em] text-white hover:text-white/70 transition-all"
                                >
                                    {item.label}
                                </MaybeLink>
                            ))}
                            {!isAuthenticated ? (
                                <>
                                    <MaybeLink
                                        disabled={disableLinks}
                                        href={loginHref}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="mt-8 text-xl font-black uppercase tracking-[0.16em] text-white/55 hover:text-white"
                                    >
                                        Login
                                    </MaybeLink>
                                    <MaybeLink
                                        disabled={disableLinks}
                                        href={startHref}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="mt-2 inline-flex items-center gap-2 bg-white px-7 py-4 text-[11px] font-black uppercase tracking-[0.18em] text-black transition-all hover:bg-zinc-100"
                                    >
                                        Start Designing
                                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                                    </MaybeLink>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        handleLogout();
                                    }}
                                    className="text-2xl font-bold text-secondary hover:text-white mt-8 uppercase cursor-pointer"
                                >
                                    Log Out
                                </button>
                            )}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
