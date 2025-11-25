import type { ReactNode } from "react";
import Script from "next/script";

export default function AuthLoginLayout({
  children,
}: {
  children: ReactNode;
}) {
  const hasTurnstileSiteKey = Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  );

  return (
    <>
      {hasTurnstileSiteKey && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
      )}
      {children}
    </>
  );
}
