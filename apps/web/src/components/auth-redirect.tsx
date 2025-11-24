"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AuthRedirect() {
    const pathname = usePathname();

    useEffect(() => {
        // Redirect to login with the current pathname
        const redirectUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
        window.location.replace(redirectUrl);
    }, [pathname]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-zinc-500">Redirecting to login...</p>
        </div>
    );
}
