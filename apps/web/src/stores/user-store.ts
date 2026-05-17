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

export type AccountSettings = {
  marketingEmailsEnabled: boolean;
  marketingEmailsOptedInAt: string | null;
  marketingEmailsOptedOutAt: string | null;
};

type EmailChangeStep = "idle" | "code_sent";
type RestoreAccountStatus = "loading" | "success" | "error";

type UserStore = {
  profile: AccountProfile | null;
  profileLoading: boolean;
  savingName: boolean;
  savingPhone: boolean;
  savingAvatar: boolean;
  sendingCode: boolean;
  confirmingEmail: boolean;
  emailStep: EmailChangeStep;
  profileError: string | null;
  loadProfile: () => Promise<AccountProfile | null>;
  updateName: (name: string) => Promise<AccountProfile | null>;
  updatePhone: (phoneNumber: string) => Promise<AccountProfile | null>;
  updateAvatar: (imageBase64: string) => Promise<AccountProfile | null>;
  startEmailChange: (email: string) => Promise<boolean>;
  confirmEmailChange: (
    email: string,
    code: string,
  ) => Promise<AccountProfile | null>;
  resetEmailStep: () => void;
  clearProfileError: () => void;
  setProfileError: (error: string) => void;

  settings: AccountSettings | null;
  settingsLoading: boolean;
  savingMarketing: boolean;
  deletingAccount: boolean;
  settingsError: string | null;
  loadSettings: () => Promise<void>;
  updateMarketingConsent: (enabled: boolean) => Promise<void>;
  deleteAccount: () => Promise<void>;

  restoreAccountStatus: RestoreAccountStatus;
  restoreAccount: (token: string) => Promise<void>;
  resetRestoreAccount: () => void;

  reset: () => void;
};

const initialState = {
  profile: null,
  profileLoading: false,
  savingName: false,
  savingPhone: false,
  savingAvatar: false,
  sendingCode: false,
  confirmingEmail: false,
  emailStep: "idle" as EmailChangeStep,
  profileError: null,

  settings: null,
  settingsLoading: false,
  savingMarketing: false,
  deletingAccount: false,
  settingsError: null,

  restoreAccountStatus: "loading" as RestoreAccountStatus,
};

export const useUserStore = create<UserStore>((set) => ({
  ...initialState,

  async loadProfile() {
    set({ profileLoading: true, profileError: null });
    try {
      const response = await sessionNetworkRequest("/api/auth/profile");
      if (!response.ok) {
        throw new Error("profile_load_failed");
      }

      const profile = (await response.json()) as AccountProfile;
      set({ profile, profileLoading: false });
      return profile;
    } catch {
      set({
        profileLoading: false,
        profileError: "Could not load your profile. Please refresh the page.",
      });
      return null;
    }
  },

  async updateName(name) {
    set({ savingName: true, profileError: null });
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
      set({ profile, savingName: false });
      return profile;
    } catch {
      set({
        savingName: false,
        profileError: "Could not update your name. Please try again.",
      });
      return null;
    }
  },

  async updatePhone(phoneNumber) {
    set({ savingPhone: true, profileError: null });
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
      set({ profile, savingPhone: false });
      return profile;
    } catch {
      set({
        savingPhone: false,
        profileError: "Could not update your phone number. Please try again.",
      });
      return null;
    }
  },

  async updateAvatar(imageBase64) {
    set({ savingAvatar: true, profileError: null });
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
      set({ profile, savingAvatar: false });
      return profile;
    } catch {
      set({
        savingAvatar: false,
        profileError:
          "Could not update your profile picture. Please use a JPEG, PNG, or WebP image under 5MB.",
      });
      return null;
    }
  },

  async startEmailChange(email) {
    set({ sendingCode: true, profileError: null });
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

      set({ sendingCode: false, emailStep: "code_sent" });
      return true;
    } catch (err) {
      set({
        sendingCode: false,
        profileError: toProfileError(
          err,
          "Could not send a verification code.",
        ),
      });
      return false;
    }
  },

  async confirmEmailChange(email, code) {
    set({ confirmingEmail: true, profileError: null });
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
      set({ profile, confirmingEmail: false, emailStep: "idle" });
      return profile;
    } catch (err) {
      set({
        confirmingEmail: false,
        profileError: toProfileError(err, "Could not verify that code."),
      });
      return null;
    }
  },

  resetEmailStep() {
    set({ emailStep: "idle" });
  },

  clearProfileError() {
    set({ profileError: null });
  },

  setProfileError(error) {
    set({ profileError: error });
  },

  async loadSettings() {
    set({ settingsLoading: true, settingsError: null });
    try {
      const response = await sessionNetworkRequest("/api/auth/settings");
      if (!response.ok) {
        throw new Error("settings_load_failed");
      }

      const settings = (await response.json()) as AccountSettings;
      set({ settings, settingsLoading: false });
    } catch {
      set({
        settingsError: "Could not load your settings. Please refresh the page.",
        settingsLoading: false,
      });
    }
  },

  async updateMarketingConsent(enabled) {
    const previous = useUserStore.getState().settings;
    const optimisticSettings: AccountSettings = previous
      ? { ...previous, marketingEmailsEnabled: enabled }
      : {
          marketingEmailsEnabled: enabled,
          marketingEmailsOptedInAt: enabled ? new Date().toISOString() : null,
          marketingEmailsOptedOutAt: enabled ? null : new Date().toISOString(),
        };

    set({
      savingMarketing: true,
      settingsError: null,
      settings: optimisticSettings,
    });

    try {
      const response = await sessionNetworkRequest(
        "/api/auth/settings/marketing",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ enabled }),
        },
      );

      if (!response.ok) {
        throw new Error("settings_update_failed");
      }

      const settings = (await response.json()) as AccountSettings;
      set({ settings, savingMarketing: false });
    } catch {
      set({
        settings: previous,
        savingMarketing: false,
        settingsError: "Could not update marketing consent. Please try again.",
      });
    }
  },

  async deleteAccount() {
    set({ deletingAccount: true, settingsError: null });
    try {
      const response = await sessionNetworkRequest("/api/auth/delete-account", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("delete_account_failed");
      }

      set({ deletingAccount: false });
    } catch {
      set({
        deletingAccount: false,
        settingsError: "Could not delete your account. Please try again.",
      });
      throw new Error("delete_account_failed");
    }
  },

  async restoreAccount(token) {
    set({ restoreAccountStatus: "loading" });

    if (!token) {
      set({ restoreAccountStatus: "error" });
      return;
    }

    try {
      const response = await sessionNetworkRequest("/api/auth/restore", {
        protected: false,
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error("restore_failed");
      }

      set({ restoreAccountStatus: "success" });
    } catch {
      set({ restoreAccountStatus: "error" });
    }
  },

  resetRestoreAccount() {
    set({ restoreAccountStatus: "loading" });
  },

  reset() {
    set(initialState);
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
