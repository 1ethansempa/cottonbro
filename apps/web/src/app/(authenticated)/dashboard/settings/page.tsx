"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Mail, Trash2 } from "lucide-react";
import { useAuth } from "@cottonbro/auth-react";
import { Button, Card, ConfirmDialog, Switch } from "@cottonbro/ui";
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

      <div className="space-y-8">
        <section>
          <div className="mb-4">
            <h2 className="mt-1 text-xl font-black uppercase tracking-tight text-black">
              Marketing Consent
            </h2>
          </div>

          <Card className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-gray-200 bg-gray-50 rounded-xl">
                <Mail className="h-5 w-5 text-black" aria-hidden="true" />
              </div>
              <div>
                <p className="mt-1.5 max-w-2xl text-xs font-medium leading-relaxed text-gray-500">
                  You’ll receive marketing updates, creator inspiration, and
                  weekly campaigns featuring new merch designs and trends.
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
              <Switch
                checked={settings?.marketingEmailsEnabled ?? false}
                disabled={loading || savingMarketing}
                onCheckedChange={updateMarketingConsent}
                label="Marketing consent"
              />
            </div>
          </Card>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="mt-1 text-xl font-black uppercase tracking-tight text-black">
              Delete Account
            </h2>
          </div>

          <Card
            tone="danger"
            className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-red-200 bg-red-50 rounded-xl">
                <AlertTriangle
                  className="h-5 w-5 text-red-600"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="mt-1.5 max-w-2xl text-xs font-medium leading-relaxed text-gray-500">
                  Your account can be reinstated within 30 days after deletion.
                  After that period, your account and associated data are
                  permanently removed.
                </p>
              </div>
            </div>

            <div className="shrink-0 lg:ml-auto">
              <Button
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                className="w-full sm:w-auto"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete Account
              </Button>
            </div>
          </Card>
        </section>
      </div>

      {error && (
        <p className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
          {error}
        </p>
      )}

      {showDeleteModal && (
        <ConfirmDialog
          open={showDeleteModal}
          title="Delete your account?"
          eyebrow="Confirm deletion"
          description={
            <>
              Your account will be disabled immediately. You can reinstate it
              within 30 days by following the restore flow. After 30 days, your
              account and associated data are permanently removed.
            </>
          }
          confirmLabel="Yes, Delete Account"
          confirming={deletingAccount}
          tone="danger"
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
        />
      )}
    </div>
  );
}
