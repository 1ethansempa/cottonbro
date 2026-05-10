"use client";

import { useEffect, useState } from "react";
import {
  EnvelopeIcon as Mail,
  TrashIcon as Trash2,
  WarningCircleIcon as AlertTriangle,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@cottonbro/auth-react";
import { Button, Card, ConfirmDialog, Switch } from "@cottonbro/ui";
import { useAccountSettingsStore } from "@/stores/account-settings-store";

export default function SettingsPage() {
  const router = useRouter();
  const { logout, role } = useAuth();
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
  const canAccessSettings = role === "user" || role === undefined;

  useEffect(() => {
    if (!canAccessSettings) {
      router.replace("/dashboard/profile");
    }
  }, [canAccessSettings, router]);

  useEffect(() => {
    if (!canAccessSettings) return;
    load();
  }, [canAccessSettings, load]);

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
    canAccessSettings && (
    <div className="p-6 md:p-12">
      <div className="mb-14">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">
          Account
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tight mb-4">
          Settings
        </h1>
        <p className="text-sm font-medium text-gray-500">
          Manage how CottonBro communicates with you and control your account access.
        </p>
      </div>

      <div className="space-y-12">
        <section>
          <div className="mb-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-black">
              Marketing Consent
            </h2>
          </div>

          <Card className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between px-6 py-6 border-gray-200 shadow-sm bg-white rounded-[12px]">
            <div className="flex gap-5 items-center">
              <div className="flex shrink-0 items-center justify-center bg-gray-100 rounded-lg p-3">
                <Mail className="h-5 w-5 text-black" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  You&apos;ll receive marketing updates, creator inspiration, and weekly campaigns
                  <br className="hidden lg:block" />
                  featuring new merch designs and trends.
                </p>
                {savingMarketing && (
                  <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400">
                    Saving preference...
                  </p>
                )}
              </div>
            </div>

            <div className="shrink-0 lg:ml-auto pr-2">
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
            <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-black">
              Delete Account
            </h2>
          </div>

          <Card
            tone="danger"
            className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between px-6 py-6 border-[#fde8e8] shadow-sm bg-[#fdf5f5] rounded-[12px]"
          >
            <div className="flex gap-5 items-center">
              <div className="flex shrink-0 items-center justify-center bg-[#fde8e8] rounded-lg p-3">
                <AlertTriangle
                  className="h-5 w-5 text-red-700"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="max-w-xl text-sm font-medium text-gray-700 leading-relaxed">
                  Your account can be reinstated within 30 days after
                  <br className="hidden lg:block" />
                  deletion. After that period, your account and associated
                  <br className="hidden lg:block" />
                  data are permanently removed.
                </p>
              </div>
            </div>

            <div className="shrink-0 lg:ml-auto">
              <Button
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                className="w-full sm:w-auto bg-[#c81e1e] hover:bg-[#a51a1a] text-white rounded-[6px] text-[10px] px-5 py-3 font-bold uppercase tracking-wide border-none"
              >
                <Trash2 className="h-4 w-4 mr-2" weight="regular" aria-hidden="true" />
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
    )
  );
}
