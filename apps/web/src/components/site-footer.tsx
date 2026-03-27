import Link from "next/link";
import { Logo } from "@cottonbro/ui";

interface SiteFooterProps {
    theme?: "light" | "dark";
}

export function SiteFooter({ theme = "dark" }: SiteFooterProps) {
    return (
        <footer 
            className={`flex flex-col md:flex-row justify-between items-start md:items-end py-14 px-6 md:px-[6%] ${
                theme === "light" ? "bg-white text-black border-t border-gray-100" : "bg-black text-white"
            }`}
        >
            <div className="flex flex-col gap-2 mb-10 md:mb-0">
                <Link href="#" className="inline-block hover:opacity-80 transition-opacity">
                    <Logo size="md" color={theme === "light" ? "black" : "white"} fontClassName="font-black tracking-tighter uppercase" />
                </Link>
                <div className={`text-[10px] uppercase tracking-widest font-bold mt-1 text-gray-400`}>
                    TERMS AND PRIVACY &middot; &copy; {new Date().getFullYear()} ALL RIGHTS RESERVED.
                </div>
            </div>

            <div className="flex flex-wrap gap-6 md:gap-10 items-center">
                <Link href="#" className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${theme === "light" ? "hover:text-gray-400 text-black" : "hover:text-gray-400 text-white"}`}>
                    TERMS
                </Link>
                <Link href="#" className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${theme === "light" ? "hover:text-gray-400 text-black" : "hover:text-gray-400 text-white"}`}>
                    PRIVACY
                </Link>
                <Link href="#" className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${theme === "light" ? "hover:text-gray-400 text-black" : "hover:text-gray-400 text-white"}`}>
                    ABOUT
                </Link>
                <Link href="#" className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${theme === "light" ? "hover:text-gray-400 text-black" : "hover:text-gray-400 text-white"}`}>
                    CONTACT US
                </Link>
            </div>
        </footer>
    );
}
