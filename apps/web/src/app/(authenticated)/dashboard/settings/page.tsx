"use client";

import { useEffect, useState } from "react";
import {
  CircleNotchIcon,
  EnvelopeIcon as Mail,
  TrashIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@cottonbro/auth-react";
import { Card, ConfirmDialog, Switch } from "@cottonbro/ui";
import { useUserStore } from "@/stores/user-store";

export default function SettingsPage() {
  const router = useRouter();
  const { logout, role } = useAuth();
  const {
    settings,
    settingsLoading: loading,
    savingMarketing,
    deletingAccount,
    settingsError: error,
    loadSettings,
    updateMarketingConsent,
    deleteAccount,
  } = useUserStore();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const canAccessSettings = role === "user" || role === undefined;

  useEffect(() => {
    if (!canAccessSettings) {
      router.replace("/dashboard/profile");
    }
  }, [canAccessSettings, router]);

  useEffect(() => {
    if (!canAccessSettings) return;
    let cancelled = false;
    setPageReady(false);

    loadSettings().finally(() => {
      if (!cancelled) {
        setPageReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [canAccessSettings, loadSettings]);

  useEffect(() => {
    if (error) {
      scrollDashboardToTop();
    }
  }, [error]);

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

  if (!canAccessSettings) {
    return null;
  }

  if (!pageReady) {
    return <DashboardPageLoader label="Loading settings ...." />;
  }

  return (
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

      {error && (
        <p className="mb-8 border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
          {error}
        </p>
      )}

      <div className="space-y-12">
        <section>
          <div className="mb-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-black">
              Marketing Consent
            </h2>
          </div>

          <Card className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between px-6 py-6 border-gray-200 shadow-sm bg-white rounded-[12px]">
            <div className="flex gap-5 items-center">
              <Mail
                className="h-6 w-6 shrink-0 text-black"
                weight="regular"
                aria-hidden="true"
              />
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
            <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-red-600">
              Delete Account
            </h2>
          </div>

          <Card
            tone="danger"
            className="flex flex-col gap-6 rounded-[12px] border-[#fde8e8] bg-[#fdf5f5] px-6 py-6 shadow-sm lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="flex gap-5">
              <WarningCircleIcon
                className="h-6 w-6 shrink-0 text-red-700"
                weight="regular"
                aria-hidden="true"
              />
              <div>
                <p className="max-w-xl text-sm font-medium leading-relaxed text-gray-700">
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
                className="inline-flex w-full items-center justify-center rounded-[6px] border-none bg-[#c81e1e] px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#a51a1a] sm:w-auto"
              >
                <TrashIcon
                  className="mr-2 h-4 w-4"
                  weight="regular"
                  aria-hidden="true"
                />
                Delete Account
              </button>
            </div>
          </Card>
        </section>
      </div>

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

function scrollDashboardToTop() {
  const scrollContainer = document.querySelector(
    "[data-dashboard-scroll-container]",
  );

  if (scrollContainer) {
    scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function DashboardPageLoader({ label }: { label: string }) {
  return (
    <div className="flex min-h-[55vh] items-center justify-center p-6 md:p-12">
      <div className="inline-flex items-center gap-3 text-xs font-semibold tracking-wide text-gray-500">
        <CircleNotchIcon
          className="h-4 w-4 animate-spin"
          weight="regular"
          aria-hidden="true"
        />
        {label}
      </div>
    </div>
  );
}
