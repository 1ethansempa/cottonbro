import { create } from "zustand";
import { sessionNetworkRequest } from "@cottonbro/auth-react";

export type AccountProfile = {
  name: string | null;
  email: string;
  emailVerified: boolean;
  phoneNumber: string | null;
  avatarUrl: string | null;
  role: "admin" | "user" | "partner";
  canChangeEmail: boolean;
};

type EmailChangeStep = "idle" | "code_sent";

type AccountProfileState = {
  profile: AccountProfile | null;
  loading: boolean;
  savingName: boolean;
  savingPhone: boolean;
  savingAvatar: boolean;
  sendingCode: boolean;
  confirmingEmail: boolean;
  emailStep: EmailChangeStep;
  message: string | null;
  error: string | null;
  load: () => Promise<AccountProfile | null>;
  updateName: (name: string) => Promise<AccountProfile | null>;
  updatePhone: (phoneNumber: string) => Promise<AccountProfile | null>;
  updateAvatar: (imageBase64: string) => Promise<AccountProfile | null>;
  startEmailChange: (email: string) => Promise<boolean>;
  confirmEmailChange: (
    email: string,
    code: string,
  ) => Promise<AccountProfile | null>;
  resetEmailStep: () => void;
  clearMessages: () => void;
  setError: (error: string) => void;
  reset: () => void;
};

export const useAccountProfileStore = create<AccountProfileState>((set) => ({
  profile: null,
  loading: false,
  savingName: false,
  savingPhone: false,
  savingAvatar: false,
  sendingCode: false,
  confirmingEmail: false,
  emailStep: "idle",
  message: null,
  error: null,

  async load() {
    set({ loading: true, error: null });
    try {
      const response = await sessionNetworkRequest("/api/auth/profile");
      if (!response.ok) {
        throw new Error("profile_load_failed");
      }

      const profile = (await response.json()) as AccountProfile;
      set({ profile, loading: false });
      return profile;
    } catch {
      set({
        loading: false,
        error: "Could not load your profile. Please refresh the page.",
      });
      return null;
    }
  },

  async updateName(name) {
    set({ savingName: true, error: null, message: null });
    try {
      const response = await sessionNetworkRequest("/api/auth/profile/name", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      const profile = (await response.json()) as AccountProfile;
      set({
        profile,
        savingName: false,
        message: "Your name has been updated.",
      });
      return profile;
    } catch {
      set({
        savingName: false,
        error: "Could not update your name. Please try again.",
      });
      return null;
    }
  },

  async updatePhone(phoneNumber) {
    set({ savingPhone: true, error: null, message: null });
    try {
      const response = await sessionNetworkRequest("/api/auth/profile/phone", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      const profile = (await response.json()) as AccountProfile;
      set({
        profile,
        savingPhone: false,
        message: "Your phone number has been updated.",
      });
      return profile;
    } catch {
      set({
        savingPhone: false,
        error: "Could not update your phone number. Please try again.",
      });
      return null;
    }
  },

  async updateAvatar(imageBase64) {
    set({ savingAvatar: true, error: null, message: null });
    try {
      const response = await sessionNetworkRequest("/api/auth/profile/avatar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      const profile = (await response.json()) as AccountProfile;
      set({
        profile,
        savingAvatar: false,
        message: imageBase64.trim()
          ? "Your profile picture has been updated."
          : "Your profile picture has been removed.",
      });
      return profile;
    } catch {
      set({
        savingAvatar: false,
        error: "Could not update your profile picture. Please use a JPEG, PNG, or WebP image under 5MB.",
      });
      return null;
    }
  },

  async startEmailChange(email) {
    set({ sendingCode: true, error: null, message: null });
    try {
      const response = await sessionNetworkRequest(
        "/api/auth/profile/email/start",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      set({
        sendingCode: false,
        emailStep: "code_sent",
        message: "We sent a verification code to your new email.",
      });
      return true;
    } catch (err) {
      set({
        sendingCode: false,
        error: toProfileError(err, "Could not send a verification code."),
      });
      return false;
    }
  },

  async confirmEmailChange(email, code) {
    set({ confirmingEmail: true, error: null, message: null });
    try {
      const response = await sessionNetworkRequest(
        "/api/auth/profile/email/confirm",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, code }),
        },
      );

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      const profile = (await response.json()) as AccountProfile;
      set({
        profile,
        confirmingEmail: false,
        emailStep: "idle",
        message: "Your email has been updated.",
      });
      return profile;
    } catch (err) {
      set({
        confirmingEmail: false,
        error: toProfileError(err, "Could not verify that code."),
      });
      return null;
    }
  },

  resetEmailStep() {
    set({ emailStep: "idle" });
  },

  clearMessages() {
    set({ error: null, message: null });
  },

  setError(error) {
    set({ error, message: null });
  },

  reset() {
    set({
      profile: null,
      loading: false,
      savingName: false,
      savingPhone: false,
      savingAvatar: false,
      sendingCode: false,
      confirmingEmail: false,
      emailStep: "idle",
      message: null,
      error: null,
    });
  },
}));

async function readError(response: Response) {
  const raw = await response.text().catch(() => "");

  try {
    const parsed = JSON.parse(raw) as { message?: unknown };
    if (typeof parsed.message === "string") return parsed.message;
    if (Array.isArray(parsed.message) && typeof parsed.message[0] === "string") {
      return parsed.message[0];
    }
  } catch {
    // Plain text errors fall through.
  }

  return raw || "request_failed";
}

function toProfileError(error: unknown, fallback: string) {
  const message =
    error instanceof Error && error.message ? error.message : "request_failed";

  if (message === "email_in_use") {
    return "That email is already connected to another account.";
  }
  if (message === "email_unchanged") {
    return "Enter a different email address.";
  }
  if (message === "Invalid or expired code") {
    return "That code is incorrect or expired.";
  }
  if (message === "email_change_forbidden") {
    return "Email changes are not available for this account.";
  }

  return fallback;
}
