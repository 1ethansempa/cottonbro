// ...existing imports...
import { Logo } from "@cottonbro/ui";
import Link from "next/link";

export function SiteFooter() {
    // ...existing code...
    return (
        <footer className="border-t border-white/5 bg-page pt-20 pb-10">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-4 lg:gap-16 relative z-10">
                <div className="col-span-2 md:col-span-1">
                    <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
                        <Logo size="md" color="white" fontClassName="font-bold tracking-tight" />
                    </Link>
                    <p className="mt-6 text-sm leading-relaxed text-secondary max-w-xs font-medium">
                        CottonBro is the engine for the next generation of brands.
                        <br />
                        <span className="text-white">Design to drop in minutes.</span>
                    </p>
                </div>
                <div>
                    <h4 className="mb-6 text-xs font-bold text-white uppercase tracking-widest">
                        Studio
                    </h4>
                    <ul className="space-y-4 text-sm font-medium text-secondary">
                        <li>
                            <Link href="/#features" className="hover:text-cyan transition-colors">
                                The Lab
                            </Link>
                        </li>
                        <li>
                            <Link href="/#how" className="hover:text-cyan transition-colors">
                                Process
                            </Link>
                        </li>
                        <li>
                            <Link href="/#pricing" className="hover:text-cyan transition-colors">
                                Pricing
                            </Link>
                        </li>
                        <li>
                            <Link href="/#faq" className="hover:text-cyan transition-colors">
                                Q&A
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
                            <Link href="#" className="hover:text-cyan transition-colors">
                                About
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="hover:text-cyan transition-colors">
                                Contact
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="hover:text-cyan transition-colors">
                                Privacy Policy
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className="mb-6 text-xs font-bold text-white uppercase tracking-widest">
                        The Drop List
                    </h4>
                    <form className="flex flex-col gap-3">
                        <input
                            type="email"
                            placeholder="Email address"
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-tertiary focus:border-soft-blue focus:shadow-glow-soft transition-all"
                        />
                        <button className="w-full rounded-lg bg-white px-4 py-3 text-sm font-bold text-black hover:bg-soft-blue transition shadow-glow-pearl hover:shadow-glow-soft uppercase tracking-wide">
                            Join Waitlist
                        </button>
                    </form>
                </div>
            </div>
            <div className="mt-16 border-t border-white/5 pt-8 text-center text-sm font-medium text-tertiary uppercase tracking-wide">
                © {new Date().getFullYear()} CottonBro. Built for creators.
            </div>
        </footer>
    );
}
