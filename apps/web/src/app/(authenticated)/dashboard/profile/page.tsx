"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import {
  CircleUser as User,
  LoaderCircle,
  Mail,
  Phone,
} from "lucide-react";
import { isValidEmail, normalizeEmail } from "@cottonbro/utils";
import { Card, Input } from "@cottonbro/ui";
import { useUserStore } from "@/stores/user-store";

export default function ProfilePage() {
  const {
    profile,
    profileLoading: loading,
    savingName,
    savingPhone,
    savingAvatar,
    sendingCode,
    confirmingEmail,
    emailStep,
    profileMessage: message,
    profileError: error,
    loadProfile,
    updateName,
    updatePhone,
    updateAvatar,
    startEmailChange,
    confirmEmailChange,
    resetEmailStep,
    setProfileError,
  } = useUserStore();

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarBase64, setAvatarBase64] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pageReady, setPageReady] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canChangeEmail = profile?.canChangeEmail ?? false;

  useEffect(() => {
    let cancelled = false;
    setPageReady(false);

    loadProfile().then((nextProfile) => {
      if (cancelled) return;

      if (nextProfile) {
        setName(nextProfile.name ?? "");
        setPhoneNumber(nextProfile.phoneNumber ?? "");
        setAvatarUrl(nextProfile.avatarUrl ?? "");
        setAvatarBase64("");
        setAvatarLoadFailed(false);
        setEmail(nextProfile.email);
      }

      setPageReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [loadProfile]);

  useEffect(() => {
    if (message || error) {
      scrollDashboardToTop();
    }
  }, [error, message]);

  async function onSaveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = name.trim();
    if (!nextName) {
      setProfileError("Please enter your name.");
      return;
    }

    const nextProfile = await updateName(nextName);
    if (nextProfile) {
      setName(nextProfile.name ?? "");
    }
  }

  async function onSavePhone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextProfile = await updatePhone(phoneNumber.trim());
    if (nextProfile) {
      setPhoneNumber(nextProfile.phoneNumber ?? "");
    }
  }

  async function onAvatarFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setProfileError("Please choose a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileError("Please choose an image under 5MB.");
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    const nextProfile = await updateAvatar(dataUrl);
    if (nextProfile) {
      setAvatarUrl(nextProfile.avatarUrl ?? "");
      setAvatarBase64("");
      setAvatarLoadFailed(false);
    }
  }

  async function onRemoveAvatar() {
    const nextProfile = await updateAvatar("");
    if (nextProfile) {
      setAvatarUrl("");
      setAvatarBase64("");
    }
  }

  async function onStartEmailChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextEmail = normalizeEmail(email);

    if (!isValidEmail(nextEmail)) {
      setProfileError("Please enter a valid email address.");
      return;
    }

    if (profile && nextEmail === profile.email) {
      setProfileError("Enter a different email address.");
      return;
    }

    const sent = await startEmailChange(nextEmail);
    if (sent) {
      setEmail(nextEmail);
      setCode("");
    }
  }

  async function onConfirmEmailChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextEmail = normalizeEmail(email);
    const nextCode = code.trim();

    if (!nextCode) {
      setProfileError("Please enter the verification code.");
      return;
    }

    const nextProfile = await confirmEmailChange(nextEmail, nextCode);
    if (nextProfile) {
      setEmail(nextProfile.email);
      setCode("");
    }
  }

  if (!pageReady) {
    return <DashboardPageLoader label="Loading profile ...." />;
  }

  return (
    <div className="p-6 md:p-12 pb-24">
      <div className="mb-14">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">
          Account
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tight mb-4">
          Profile
        </h1>
        <p className="text-sm font-medium text-gray-500">
          Manage the details connected to your CottonBro account.
        </p>
      </div>

      {message && (
        <p className="mb-8 rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-xs font-bold text-black">
          {message}
        </p>
      )}

      {error && (
        <p className="mb-8 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
          {error}
        </p>
      )}

      <div className="space-y-12">
        <section>
          <div className="mb-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-black">
              Avatar
            </h2>
          </div>

          <Card className="flex flex-col gap-6 lg:flex-row lg:items-center px-6 py-6 border-gray-200 shadow-sm bg-white rounded-xl">
            <div className="flex flex-col md:flex-row gap-6 md:items-center">
              <div
                className="flex h-18 w-18 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 bg-cover bg-center"
                style={
                  avatarUrl.trim()
                    ? { backgroundImage: `url("${avatarUrl.trim()}")` }
                    : undefined
                }
              >
                {!avatarUrl.trim() && (
                  <User
                    className="h-8 w-8 text-gray-400"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-black">
                  Profile Picture
                </p>
                <p className="mt-1 text-[13px] text-gray-500">
                  PNG or JPG. At least 400x400px recommended.
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading || savingAvatar}
                    className="cursor-pointer bg-black text-white px-4 py-2 text-xs font-medium rounded-md hover:opacity-80 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Upload New
                  </button>
                  <button
                    type="button"
                    onClick={onRemoveAvatar}
                    disabled={loading || savingAvatar || !avatarUrl.trim()}
                    className="cursor-pointer bg-white text-black border border-gray-200 px-4 py-2 text-xs font-medium rounded-md hover:border-black transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={onAvatarFileChange}
                  disabled={loading || savingAvatar}
                />
              </div>
            </div>
          </Card>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-black">
              Name
            </h2>
          </div>

          <Card className="px-6 py-6 border-gray-200 shadow-sm bg-white rounded-xl">
            <form
              onSubmit={onSaveName}
              className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
            >
              <div className="flex flex-1 gap-5 items-center">
                <div className="flex h-11.5 w-11.5 shrink-0 items-center justify-center rounded-lg bg-gray-100 mb-0">
                  <User
                    className="h-5 w-5 text-gray-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="w-full">
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">
                    Display name
                  </label>
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={loading || savingName}
                    maxLength={120}
                    placeholder="Your name"
                    className="rounded-md border-gray-200 bg-white shadow-none h-10 w-full"
                  />
                </div>
              </div>

              <div className="shrink-0">
                <button
                  type="submit"
                  disabled={loading || savingName}
                  className="w-full cursor-pointer lg:w-auto bg-black text-white rounded-md text-[10px] px-6 h-10 font-bold uppercase tracking-wide border-none hover:opacity-80 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingName ? "SAVING..." : "SAVE"}
                </button>
              </div>
            </form>
          </Card>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-black">
              Phone Number
            </h2>
          </div>

          <Card className="px-6 py-6 border-gray-200 shadow-sm bg-white rounded-xl">
            <form
              onSubmit={onSavePhone}
              className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
            >
              <div className="flex flex-1 gap-5 items-center">
                <div className="flex h-11.5 w-11.5 shrink-0 items-center justify-center rounded-lg bg-gray-100 mb-0">
                  <Phone
                    className="h-5 w-5 text-gray-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="w-full">
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">
                    Contact phone
                  </label>
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value)}
                    disabled={loading || savingPhone}
                    maxLength={32}
                    placeholder="+256 700 000000"
                    className="rounded-md border-gray-200 bg-white shadow-none h-10 w-full"
                  />
                </div>
              </div>

              <div className="shrink-0">
                <button
                  type="submit"
                  disabled={loading || savingPhone}
                  className="w-full cursor-pointer lg:w-auto bg-black text-white rounded-md text-[10px] px-6 h-10 font-bold uppercase tracking-wide border-none hover:opacity-80 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingPhone ? "SAVING..." : "SAVE"}
                </button>
              </div>
            </form>
          </Card>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-black">
              Email
            </h2>
          </div>

          <Card className="flex flex-col gap-6 px-6 py-6 border-gray-200 shadow-sm bg-white rounded-xl">
            <div className="flex gap-5 items-center">
              <div className="flex h-11.5 w-11.5 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <Mail
                  className="h-5 w-5 text-gray-600"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  To update your email, we&apos;ll send a verification code to
                  the new
                  <br className="hidden lg:block" />
                  address first. Your email must be unique.
                </p>
                {profile && (
                  <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.15em] text-gray-500">
                    Current email:{" "}
                    <span className="text-black">{profile.email}</span>
                  </p>
                )}
              </div>
            </div>

            <form
              onSubmit={onStartEmailChange}
              className="flex flex-col gap-6 lg:flex-row lg:items-end mt-2"
            >
              <div className="flex-1">
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">
                  New email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    resetEmailStep();
                  }}
                  disabled={
                    !canChangeEmail || loading || sendingCode || confirmingEmail
                  }
                  placeholder="name@example.com"
                  className="rounded-md border-gray-200 bg-white shadow-none h-10 w-full"
                />
              </div>
              <div className="shrink-0">
                <button
                  type="submit"
                  disabled={loading || sendingCode || confirmingEmail}
                  className="w-full cursor-pointer lg:w-auto bg-white text-black border border-gray-200 rounded-md text-[10px] px-6 h-10 font-bold uppercase tracking-wide hover:border-black transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sendingCode ? "SENDING..." : "SEND CODE"}
                </button>
              </div>
            </form>

            {canChangeEmail && emailStep === "code_sent" && (
              <form
                onSubmit={onConfirmEmailChange}
                className="flex flex-col gap-6 lg:flex-row lg:items-end border-t border-gray-100 pt-6 mt-2"
              >
                <div className="flex-1">
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">
                    Verification code
                  </label>
                  <Input
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    disabled={confirmingEmail}
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    className="rounded-md border-gray-200 bg-white shadow-none h-10 w-full font-mono tracking-[0.2em]"
                  />
                </div>
                <div className="shrink-0">
                  <button
                    type="submit"
                    disabled={confirmingEmail}
                    className="w-full cursor-pointer lg:w-auto bg-black text-white rounded-md text-[10px] px-6 h-10 font-bold uppercase tracking-wide hover:opacity-80 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {confirmingEmail ? "VERIFYING..." : "CONFIRM EMAIL"}
                  </button>
                </div>
              </form>
            )}
          </Card>
        </section>
      </div>
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
        <LoaderCircle
          className="h-4 w-4 animate-spin"
          aria-hidden="true"
        />
        {label}
      </div>
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
