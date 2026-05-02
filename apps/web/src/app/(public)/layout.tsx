"use client";

import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        type="text/javascript"
        strategy="afterInteractive"
        id="crispChat"
      >{`window.$crisp=[];window.CRISP_WEBSITE_ID="aa95d932-0746-442e-80dc-34e4f82c0d58";(function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();`}</Script>
      {children}
    </>
  );
}
