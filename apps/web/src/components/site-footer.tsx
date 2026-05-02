import Link from "next/link";
import { Logo } from "@cottonbro/ui";
import type { ReactNode } from "react";

interface SiteFooterProps {
    theme?: "light" | "dark";
    disableLinks?: boolean;
}

function MaybeLink({
    disabled,
    href,
    className,
    children,
}: {
    disabled?: boolean;
    href: string;
    className?: string;
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
        <Link href={href} className={className}>
            {children}
        </Link>
    );
}

export function SiteFooter({ theme = "dark", disableLinks = false }: SiteFooterProps) {
    return (
        <footer 
            className={`flex flex-col md:flex-row justify-between items-start md:items-end py-14 px-6 md:px-[6%] ${
                theme === "light" ? "bg-white text-black border-t border-gray-100" : "bg-black text-white"
            }`}
        >
            <div className="flex flex-col gap-2 mb-10 md:mb-0">
                <MaybeLink disabled={disableLinks} href="#" className="inline-block hover:opacity-80 transition-opacity">
                    <div className="flex items-baseline text-xl font-black uppercase tracking-tighter leading-none">
                        <span className={theme === "light" ? "text-black" : "text-white"}>COTTON</span>
                        <span className="text-[#e60000]">BRO</span>
                        <span className="ml-1 h-2 w-2 rounded-full bg-[#e60000]"></span>
                    </div>
                </MaybeLink>
                <div className={`text-[10px] uppercase tracking-widest font-bold mt-1 text-gray-400`}>
                    TERMS AND PRIVACY &middot; &copy; {new Date().getFullYear()} ALL RIGHTS RESERVED.
                </div>
            </div>

            <div className="flex flex-wrap gap-6 md:gap-10 items-center">
                <MaybeLink disabled={disableLinks} href="#" className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${theme === "light" ? "hover:text-gray-400 text-black" : "hover:text-gray-400 text-white"}`}>
                    TERMS
                </MaybeLink>
                <MaybeLink disabled={disableLinks} href="#" className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${theme === "light" ? "hover:text-gray-400 text-black" : "hover:text-gray-400 text-white"}`}>
                    PRIVACY
                </MaybeLink>
                <MaybeLink disabled={disableLinks} href="#" className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${theme === "light" ? "hover:text-gray-400 text-black" : "hover:text-gray-400 text-white"}`}>
                    ABOUT
                </MaybeLink>
                <MaybeLink disabled={disableLinks} href="#" className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${theme === "light" ? "hover:text-gray-400 text-black" : "hover:text-gray-400 text-white"}`}>
                    CONTACT US
                </MaybeLink>
            </div>
        </footer>
    );
}
