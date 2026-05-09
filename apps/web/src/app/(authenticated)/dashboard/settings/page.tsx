"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Mail, Trash2, X } from "lucide-react";
import { useAuth } from "@cottonbro/auth-react";
import { useAccountSettingsStore } from "@/stores/account-settings-store";

export default function SettingsPage() {
  const { logout } = useAuth();
  const {
    settings,
    loading,
    savingMarketing,
    deletingAccount,
    error,
    load,
    updateMarketingConsent,
    deleteAccount,
  } = useAccountSettingsStore();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDeleteAccount() {
    try {
      await deleteAccount();
      setShowDeleteModal(false);
      await logout();
      window.location.replace("/");
    } catch {
      // Store exposes the user-facing error on the page.
    }
  }

  return (
    <div className="p-6 md:p-12">
      <div className="mb-10">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
          Account
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tight">
          Settings
        </h1>
        <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-gray-500">
          Manage how Cotton Bro communicates with you and control your account
          access.
        </p>
      </div>

      <div className="overflow-hidden border border-gray-200 rounded-2xl">
        {/* Marketing Consent */}
        <div className="flex flex-col gap-6 border-b border-gray-200 bg-white p-5 sm:p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between group">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-gray-200 bg-gray-50 rounded-xl">
              <span className="text-lg font-black font-mono text-black">*</span>
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight text-black">
                Marketing Consent
              </h2>
              <p className="mt-1.5 max-w-2xl text-xs font-medium leading-relaxed text-gray-500">
                You’ll regularly receive marketing updates, creator inspiration,
                and weekly campaigns featuring new merch designs and trends.
              </p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
                Transactional emails are always sent.
              </p>
              {savingMarketing && (
                <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                  Saving preference...
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0 lg:ml-auto">
            <ToggleSwitch
              checked={settings?.marketingEmailsEnabled ?? false}
              disabled={loading || savingMarketing}
              onChange={updateMarketingConsent}
              label="Marketing consent"
            />
          </div>
        </div>

        {/* Delete Account */}
        <div className="flex flex-col gap-6 bg-white p-5 sm:p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between group">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-red-200 bg-red-50 rounded-xl">
              <span className="text-lg font-black font-mono text-red-600">
                !
              </span>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">
                Danger zone
              </p>
              <h2 className="text-sm font-black uppercase tracking-tight text-black">
                Delete Account
              </h2>
              <p className="mt-1.5 max-w-2xl text-xs font-medium leading-relaxed text-gray-500">
                Your account can be reinstated within 30 days after deletion.
                After that period, your account and associated data are
                permanently removed.
              </p>
            </div>
          </div>

          <div className="shrink-0 lg:ml-auto">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 border border-red-600 bg-red-600 px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-white hover:text-red-600 rounded-full"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
          {error}
        </p>
      )}

      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          deleting={deletingAccount}
        />
      )}
    </div>
  );
}

function ToggleSwitch({
  checked,
  disabled = false,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 shrink-0 flex items-center px-1 border transition-colors disabled:cursor-not-allowed disabled:opacity-60 rounded-full ${
        checked ? "border-black bg-black" : "border-gray-300 bg-gray-50"
      }`}
    >
      <span
        className={`h-6 w-6 transition-transform rounded-full ${
          checked
            ? "translate-x-5 bg-white border border-black"
            : "translate-x-0 bg-white border border-gray-300 shadow-sm"
        }`}
      />
    </button>
  );
}

function DeleteAccountModal({
  onClose,
  onConfirm,
  deleting,
}: {
  onClose: () => void;
  onConfirm: () => Promise<void>;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg border border-gray-200 bg-white rounded-3xl shadow-2xl overflow-hidden shadow-black/10">
        <div className="flex items-start justify-between border-b border-gray-200 p-5 sm:p-6 bg-gray-50">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-red-200 bg-red-50 rounded-xl">
              <span className="text-base font-black font-mono text-red-600">
                !
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">
                Confirm deletion
              </p>
              <h2 className="mt-1 text-xl font-black uppercase tracking-tight text-black">
                Delete your account?
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-gray-400 transition-colors hover:text-black"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <p className="text-xs font-medium leading-relaxed text-gray-600">
            Your account will be disabled immediately. You can reinstate it
            within 30 days by following the restore flow. After 30 days, your
            account and associated data are permanently removed.
          </p>
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="border border-gray-300 bg-white px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-black transition-colors hover:border-black rounded-full"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={deleting}
              className="border border-red-600 bg-red-600 px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-white hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 rounded-full"
            >
              {deleting ? "Deleting..." : "Yes, Delete Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
