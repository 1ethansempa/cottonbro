"use client";

import { Logo } from "@cottonbro/ui";
import Link from "next/link";

export function SiteFooter() {
    return (
        <footer className="border-t border-black bg-white">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-16 md:grid-cols-4">
                <div className="col-span-2 md:col-span-1 text-black">
                    <Logo size="md" color="current" fontClassName="font-jamino" />
                    <p className="mt-4 text-sm font-bold text-black">
                        CottonBro handles the heavy lifting so you can focus on the art.
                    </p>
                </div>
                <div>
                    <div className="mb-4 text-sm font-bold uppercase tracking-widest text-black">
                        Product
                    </div>
                    <ul className="space-y-2 text-sm font-medium text-black">
                        <li>
                            <Link
                                href="/#features"
                                className="hover:text-street-red transition-colors"
                            >
                                Features
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/#how"
                                className="hover:text-street-red transition-colors"
                            >
                                How it works
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/#faq"
                                className="hover:text-street-red transition-colors"
                            >
                                FAQ
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <div className="mb-4 text-sm font-bold uppercase tracking-widest text-black">
                        Company
                    </div>
                    <ul className="space-y-2 text-sm font-medium text-black">
                        <li>
                            <Link href="#" className="hover:text-street-red transition-colors">
                                About
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="hover:text-street-red transition-colors">
                                Contact
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="hover:text-street-red transition-colors">
                                Privacy
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <div className="mb-4 text-sm font-bold uppercase tracking-widest text-black">
                        Newsletter
                    </div>
                    <form className="flex flex-col gap-2">
                        <input
                            type="email"
                            placeholder="Email address"
                            className="w-full border-2 border-black bg-white px-3 py-2 text-sm text-black outline-none placeholder:text-zinc-400 focus:border-street-red transition"
                        />
                        <button className="w-full bg-black border-2 border-black px-3 py-2 text-sm font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition">
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>
            <div className="border-t border-black py-8 text-center text-xs font-bold uppercase tracking-widest text-black">
                © {new Date().getFullYear()} CottonBro. All rights reserved.
            </div>
        </footer>
    );
}
