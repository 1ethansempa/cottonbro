"use server";

import { cookies } from "next/headers";

type RemoveBackgroundResult = {
  image_base64: string;
  success: boolean;
  message: string;
};

function getApiBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (raw) return raw;

  throw new Error("missing_api_base_url");
}

export async function removeBackgroundAction(
  imageBase64: string
): Promise<RemoveBackgroundResult> {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;
  if (!session) {
    throw new Error("missing_session");
  }

  const response = await fetch(
    `${getApiBaseUrl()}/v1/images/remove-background`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `__session=${session}`,
      },
      body: JSON.stringify({ image_base64: imageBase64 }),
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || "remove_background_failed");
  }

  return response.json();
}
