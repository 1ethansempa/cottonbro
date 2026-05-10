"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import {
  EnvelopeIcon as Mail,
  ImageSquareIcon,
  PhoneIcon,
  UploadSimpleIcon,
  UserCircleIcon as User,
} from "@phosphor-icons/react";
import { isValidEmail, normalizeEmail } from "@cottonbro/utils";
import { Button, Card, Input } from "@cottonbro/ui";
import { useAccountProfileStore } from "@/stores/account-profile-store";

export default function ProfilePage() {
  const {
    profile,
    loading,
    savingName,
    savingPhone,
    savingAvatar,
    sendingCode,
    confirmingEmail,
    emailStep,
    message,
    error,
    load,
    updateName,
    updatePhone,
    updateAvatar,
    startEmailChange,
    confirmEmailChange,
    resetEmailStep,
    setError,
  } = useAccountProfileStore();

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarBase64, setAvatarBase64] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canChangeEmail = profile?.canChangeEmail ?? false;

  useEffect(() => {
    let cancelled = false;

    load().then((nextProfile) => {
      if (!cancelled && nextProfile) {
        setName(nextProfile.name ?? "");
        setPhoneNumber(nextProfile.phoneNumber ?? "");
        setAvatarUrl(nextProfile.avatarUrl ?? "");
        setAvatarBase64("");
        setEmail(nextProfile.email);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [load]);

  async function onSaveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = name.trim();
    if (!nextName) {
      setError("Please enter your name.");
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
      setError("Please choose a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Please choose an image under 5MB.");
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    setAvatarBase64(dataUrl);
    setAvatarUrl(dataUrl);
  }

  async function onSaveAvatar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextProfile = await updateAvatar(avatarBase64);
    if (nextProfile) {
      setAvatarUrl(nextProfile.avatarUrl ?? "");
      setAvatarBase64("");
    }
  }

  async function onStartEmailChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextEmail = normalizeEmail(email);

    if (!isValidEmail(nextEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (profile && nextEmail === profile.email) {
      setError("Enter a different email address.");
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
      setError("Please enter the verification code.");
      return;
    }

    const nextProfile = await confirmEmailChange(nextEmail, nextCode);
    if (nextProfile) {
      setEmail(nextProfile.email);
      setCode("");
    }
  }

  return (
    <div className="p-6 md:p-12">
      <div className="mb-10">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
          Account
        </p>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-black">
          Profile
        </h1>
        <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-gray-500">
          Manage the details connected to your Cotton Bro account.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-black uppercase tracking-tight text-black">
              Profile Picture
            </h2>
          </div>

          <Card>
            <form
              onSubmit={onSaveAvatar}
              className="flex flex-col gap-6 lg:flex-row lg:items-end"
            >
              <div className="flex flex-1 gap-4">
                <div
                  className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 bg-cover bg-center"
                  style={
                    avatarUrl.trim()
                      ? { backgroundImage: `url("${avatarUrl.trim()}")` }
                      : undefined
                  }
                >
                  {!avatarUrl.trim() && (
                    <ImageSquareIcon
                      className="h-6 w-6 text-black"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="w-full">
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                    Profile image
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={onAvatarFileChange}
                    disabled={loading || savingAvatar}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading || savingAvatar}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-black transition-colors hover:border-black disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    <UploadSimpleIcon className="h-4 w-4" aria-hidden="true" />
                    Choose image
                  </button>
                  <p className="mt-2 text-[10px] font-medium text-gray-400">
                    JPEG, PNG, or WebP. Max 5MB.
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || savingAvatar || !avatarBase64}
                className="w-full lg:w-auto"
              >
                {savingAvatar ? "Saving..." : "Save Picture"}
              </Button>
            </form>
          </Card>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-black uppercase tracking-tight text-black">
              Name
            </h2>
          </div>

          <Card>
            <form
              onSubmit={onSaveName}
              className="flex flex-col gap-6 lg:flex-row lg:items-end"
            >
              <div className="flex flex-1 gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
                  <User className="h-5 w-5 text-black" aria-hidden="true" />
                </div>
                <div className="w-full">
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                    Display name
                  </label>
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={loading || savingName}
                    maxLength={120}
                    placeholder="Your name"
                    className="rounded-xl border-gray-200 bg-gray-50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || savingName}
                className="w-full lg:w-auto"
              >
                {savingName ? "Saving..." : "Save Name"}
              </Button>
            </form>
          </Card>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-black uppercase tracking-tight text-black">
              Phone Number
            </h2>
          </div>

          <Card>
            <form
              onSubmit={onSavePhone}
              className="flex flex-col gap-6 lg:flex-row lg:items-end"
            >
              <div className="flex flex-1 gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
                  <PhoneIcon className="h-5 w-5 text-black" aria-hidden="true" />
                </div>
                <div className="w-full">
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                    Contact phone
                  </label>
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value)}
                    disabled={loading || savingPhone}
                    maxLength={32}
                    placeholder="+256 700 000000"
                    className="rounded-xl border-gray-200 bg-gray-50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || savingPhone}
                className="w-full lg:w-auto"
              >
                {savingPhone ? "Saving..." : "Save Phone"}
              </Button>
            </form>
          </Card>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-black uppercase tracking-tight text-black">
              Email
            </h2>
          </div>

          <Card>
            <div className="flex flex-col gap-6">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
                  <Mail className="h-5 w-5 text-black" aria-hidden="true" />
                </div>
                <div>
                  <p className="max-w-2xl text-xs font-medium leading-relaxed text-gray-500">
                    {canChangeEmail
                      ? "To update your email, we’ll send a verification code to the new address first. Your email must be unique."
                      : "This email is managed by Cotton Bro for your account type. Contact support if it needs to change."}
                  </p>
                  {profile && (
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
                      Current email: {profile.email}
                    </p>
                  )}
                </div>
              </div>

              <form
                onSubmit={onStartEmailChange}
                className="flex flex-col gap-4 lg:flex-row lg:items-end"
              >
                <div className="flex-1">
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                    {canChangeEmail ? "New email" : "Email address"}
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
                    className="rounded-xl border-gray-200 bg-gray-50"
                  />
                </div>
                {canChangeEmail && (
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={loading || sendingCode || confirmingEmail}
                    className="w-full lg:w-auto"
                  >
                    {sendingCode ? "Sending..." : "Send Code"}
                  </Button>
                )}
              </form>

              {canChangeEmail && emailStep === "code_sent" && (
                <form
                  onSubmit={onConfirmEmailChange}
                  className="flex flex-col gap-4 border-t border-gray-100 pt-6 lg:flex-row lg:items-end"
                >
                  <div className="flex-1">
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                      Verification code
                    </label>
                    <Input
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                      disabled={confirmingEmail}
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      className="rounded-xl border-gray-200 bg-gray-50 font-mono tracking-[0.2em]"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={confirmingEmail}
                    className="w-full lg:w-auto"
                  >
                    {confirmingEmail ? "Verifying..." : "Confirm Email"}
                  </Button>
                </form>
              )}
            </div>
          </Card>
        </section>
      </div>

      {message && (
        <p className="mt-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs font-bold text-black">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
