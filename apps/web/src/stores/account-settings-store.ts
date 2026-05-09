import { create } from "zustand";
import { sessionNetworkRequest } from "@cottonbro/auth-react";

export type AccountSettings = {
  marketingEmailsEnabled: boolean;
  marketingEmailsOptedInAt: string | null;
  marketingEmailsOptedOutAt: string | null;
};

type AccountSettingsState = {
  settings: AccountSettings | null;
  loading: boolean;
  savingMarketing: boolean;
  deletingAccount: boolean;
  error: string | null;
  load: () => Promise<void>;
  updateMarketingConsent: (enabled: boolean) => Promise<void>;
  deleteAccount: () => Promise<void>;
  reset: () => void;
};

export const useAccountSettingsStore = create<AccountSettingsState>((set) => ({
  settings: null,
  loading: false,
  savingMarketing: false,
  deletingAccount: false,
  error: null,
  async load() {
    set({ loading: true, error: null });
    try {
      const response = await sessionNetworkRequest("/api/auth/settings");
      if (!response.ok) {
        throw new Error("settings_load_failed");
      }

      const settings = (await response.json()) as AccountSettings;
      set({ settings, loading: false });
    } catch {
      set({
        error: "Could not load your settings. Please refresh the page.",
        loading: false,
      });
    }
  },

  async updateMarketingConsent(enabled) {
    const previous = useAccountSettingsStore.getState().settings;
    const optimisticSettings: AccountSettings = previous
      ? { ...previous, marketingEmailsEnabled: enabled }
      : {
          marketingEmailsEnabled: enabled,
          marketingEmailsOptedInAt: enabled ? new Date().toISOString() : null,
          marketingEmailsOptedOutAt: enabled ? null : new Date().toISOString(),
        };

    set({
      savingMarketing: true,
      error: null,
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
        error: "Could not update marketing consent. Please try again.",
      });
    }
  },

  async deleteAccount() {
    set({ deletingAccount: true, error: null });
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
        error: "Could not delete your account. Please try again.",
      });
      throw new Error("delete_account_failed");
    }
  },

  reset() {
    set({
      settings: null,
      loading: false,
      savingMarketing: false,
      deletingAccount: false,
      error: null,
    });
  },
}));
