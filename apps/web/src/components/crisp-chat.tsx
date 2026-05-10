"use client";

import { useEffect } from "react";

const CRISP_WEBSITE_ID = "aa95d932-0746-442e-80dc-34e4f82c0d58";
const CRISP_SCRIPT_ID = "crisp-chat-script";

declare global {
  interface Window {
    $crisp?: unknown[];
    CRISP_WEBSITE_ID?: string;
  }
}

export function CrispChat() {
  useEffect(() => {
    window.$crisp = window.$crisp ?? [];
    window.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID;

    if (document.getElementById(CRISP_SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = CRISP_SCRIPT_ID;
    script.src = "https://client.crisp.chat/l.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return null;
}
