"use client";

import React, { useState } from "react";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const onGoogle = () => {};
  const onApple = () => {};
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-12 
             "
    >
      {/* Card */}
      <div className="w-full max-w-md">
        <div className="relative rounded-2xl bg-white shadow-xl p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Sign in to your Cottonbro account
            </p>
          </div>

          {/* OAuth */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={onGoogle}
              className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black transition"
            >
              {/* Official multicolor Google "G" */}
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.82-.07-1.42-.22-2.04H12v3.71h6.53c-.13 1.04-.84 2.62-2.42 3.68l-.02.11 3.51 2.73.24.02c2.2-2.03 3.47-5.02 3.47-8.21"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.07 7.94-2.91l-3.78-2.94c-1.01.7-2.36 1.19-4.16 1.19-3.18 0-5.88-2.14-6.84-5.11l-.1.01-3.7 2.86-.05.1C3.94 21.62 7.64 24 12 24"
                />
                <path
                  fill="#FBBC05"
                  d="M5.16 14.23a7.26 7.26 0 0 1-.4-2.23c0-.78.15-1.54.38-2.23l-.01-.15-3.74-2.9-.12.06A11.95 11.95 0 0 0 0 12c0 1.93.46 3.74 1.27 5.33l3.89-3.1"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c2.25 0 3.76.97 4.63 1.79l3.39-3.32C17.93 1.44 15.24 0 12 0 7.64 0 3.94 2.38 1.27 6.67l3.88 3.1c.98-2.97 3.66-5.02 6.85-5.02"
                />
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={onApple}
              className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black transition"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-current"
              >
                <path d="M16.365 12.403c-.014-1.59.711-2.79 2.17-3.676-.814-1.176-2.046-1.82-3.673-1.934-1.539-.122-3.214.894-3.815.894-.633 0-2.087-.86-3.223-.86-2.34.037-4.834 1.92-4.834 5.73 0 1.124.206 2.283.618 3.48.55 1.59 2.533 5.486 4.594 5.424 1.08-.026 1.846-.776 3.246-.776 1.36 0 2.07.776 3.26.776 2.08-.03 3.88-3.53 4.41-5.127-2.79-1.32-2.753-4.06-2.753-4.93zM14.3 4.97c1.173-1.42 1.066-2.7 1.03-2.97-1.06.06-2.29.73-2.99 1.56-.77.89-1.15 1.98-1.06 3.12 1.14.08 2.29-.57 3.02-1.71z" />
              </svg>
              Continue with Apple
            </button>
          </div>

          {/* Separator */}
          <div className="relative my-6">
            <div className="h-px w-full bg-gray-200" />
            <span className="absolute inset-0 -top-3 mx-auto w-fit px-3 text-[11px] uppercase tracking-wider text-gray-500 bg-white">
              or
            </span>
          </div>

          {/* Email / Password */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm text-gray-700"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-xs text-black hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black rounded px-1 py-0.5"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded-md border-gray-300 text-black focus:ring-black focus:ring-offset-0"
                />
                Remember me
              </label>
              <a
                href="/auth/forgot-password"
                className="text-xs text-black hover:opacity-70 underline-offset-4 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-black text-white px-4 py-2.5 text-sm font-semibold tracking-wide hover:bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-black transition disabled:opacity-60"
            >
              Sign In
            </button>
          </form>

          {/* Footer hint */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <a
              href="/auth/register"
              className="text-black hover:opacity-70 underline-offset-4 hover:underline"
            >
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
