// ...existing imports...
import { Logo } from "@cottonbro/ui";
import Link from "next/link";

interface SiteFooterProps {
    theme?: "light" | "dark";
}

export function SiteFooter({ theme = "dark" }: SiteFooterProps) {
    // ...existing code...
    return (
        <footer className={`border-t pt-20 pb-10 transition-colors duration-300 ${theme === "light"
            ? "bg-white border-black/5 text-gray-900"
            : "bg-page border-white/5 text-primary"
            }`}>
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-4 lg:gap-16 relative z-10">
                <div className="col-span-2 md:col-span-1">
                    <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
                        <Logo size="md" color={theme === "light" ? "black" : "white"} fontClassName="font-bold tracking-tight" />
                    </Link>
                    <p className={`mt-6 text-sm leading-relaxed max-w-xs font-medium ${theme === "light" ? "text-gray-500" : "text-secondary"}`}>
                        CottonBro is the engine for the next generation of brands.
                        <br />
                        <span className={theme === "light" ? "text-black" : "text-white"}>Design to drop in minutes.</span>
                    </p>
                </div>
                <div>
                    <h4 className={`mb-6 text-xs font-bold uppercase tracking-widest ${theme === "light" ? "text-black" : "text-white"}`}>
                        Studio
                    </h4>
                    <ul className={`space-y-4 text-sm font-medium ${theme === "light" ? "text-gray-500" : "text-secondary"}`}>
                        <li>
                            <Link href="/#features" className="hover:underline transition-all">
                                The Lab
                            </Link>
                        </li>
                        <li>
                            <Link href="/#how" className="hover:underline transition-all">
                                Process
                            </Link>
                        </li>
                        <li>
                            <Link href="/#pricing" className="hover:underline transition-all">
                                Pricing
                            </Link>
                        </li>
                        <li>
                            <Link href="/#faq" className="hover:text-cyan hover:underline transition-all">
                                Q&A
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className={`mb-6 text-xs font-bold uppercase tracking-widest ${theme === "light" ? "text-black" : "text-white"}`}>
                        Company
                    </h4>
                    <ul className={`space-y-4 text-sm font-medium ${theme === "light" ? "text-gray-500" : "text-secondary"}`}>
                        <li>
                            <Link href="#" className="hover:underline transition-all">
                                About
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="hover:underline transition-all">
                                Contact
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="hover:text-cyan hover:underline transition-all">
                                Privacy Policy
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className={`mb-6 text-xs font-bold uppercase tracking-widest ${theme === "light" ? "text-black" : "text-white"}`}>
                        The Drop List
                    </h4>
                    <form className="flex flex-col gap-3">
                        <input
                            type="email"
                            placeholder="Email address"
                            className={`w-full border-b px-4 py-3 text-sm outline-none transition-all placeholder:tracking-wide placeholder:uppercase placeholder:text-xs rounded-t-lg ${theme === "light"
                                ? "bg-transparent border-gray-200 text-black placeholder:text-gray-400 focus:border-black"
                                : "bg-transparent border-white/20 text-white placeholder:text-tertiary focus:border-white"
                                }`}
                        />
                        <button className={`w-full px-4 py-4 text-xs font-bold transition uppercase tracking-widest border rounded-full ${theme === "light"
                            ? "border-black bg-black text-white hover:bg-white hover:text-black"
                            : "border-white bg-white text-black hover:bg-cyan hover:border-cyan hover:text-black"
                            }`}>
                            Join Waitlist
                        </button>
                    </form>
                </div>
            </div>

            <div className={`mt-16 border-t pt-8 text-center text-sm font-medium uppercase tracking-wide ${theme === "light"
                ? "border-black/5 text-gray-400"
                : "border-white/5 text-tertiary"
                }`}>
                © {new Date().getFullYear()} CottonBro. Built for creators.
            </div>
        </footer >
    );
}
