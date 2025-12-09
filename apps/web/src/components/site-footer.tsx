// ...existing imports...
import { Logo } from "@cottonbro/ui";
import Link from "next/link";

export function SiteFooter() {
    return (
        <footer className="border-t border-white/5 bg-page pt-20 pb-10">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-4 lg:gap-16">
                <div className="col-span-2 md:col-span-1">
                    <Link href="/" className="inline-block grayscale hover:grayscale-0 transition-all duration-300">
                        <Logo size="md" color="white" fontClassName="font-bold tracking-tight" />
                    </Link>
                    <p className="mt-6 text-sm leading-relaxed text-secondary max-w-xs font-medium">
                        CottonBro handles the heavy lifting.
                        <br />
                        <span className="text-white">Launch your merch brand in minutes.</span>
                    </p>
                </div>
                <div>
                    <h4 className="mb-6 text-xs font-bold text-white uppercase tracking-widest">
                        Product
                    </h4>
                    <ul className="space-y-4 text-sm font-medium text-secondary">
                        <li>
                            <Link href="/#features" className="hover:text-white transition-colors">
                                Features
                            </Link>
                        </li>
                        <li>
                            <Link href="/#how" className="hover:text-white transition-colors">
                                How it works
                            </Link>
                        </li>
                        <li>
                            <Link href="/#faq" className="hover:text-white transition-colors">
                                FAQ
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className="mb-6 text-xs font-bold text-white uppercase tracking-widest">
                        Company
                    </h4>
                    <ul className="space-y-4 text-sm font-medium text-secondary">
                        <li>
                            <Link href="#" className="hover:text-white transition-colors">
                                About
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="hover:text-white transition-colors">
                                Contact
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="hover:text-white transition-colors">
                                Privacy Policy
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className="mb-6 text-xs font-bold text-white uppercase tracking-widest">
                        Stay Updated
                    </h4>
                    <form className="flex flex-col gap-3">
                        <input
                            type="email"
                            placeholder="Email address"
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-tertiary focus:border-white focus:shadow-glow-silver transition-all"
                        />
                        <button className="w-full rounded-lg bg-white px-4 py-3 text-sm font-bold text-black hover:bg-silver transition shadow-glow-silver hover:shadow-glow-silver">
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>
            <div className="mt-16 border-t border-white/5 pt-8 text-center text-sm font-medium text-tertiary uppercase tracking-wide">
                © {new Date().getFullYear()} CottonBro. All rights reserved.
            </div>
        </footer>
    );
}
