"use client";

import { useAuth } from "@cottonbro/auth-react";

const rolePanels = {
  admin: {
    title: "Admin Only",
    body: "This panel is visible only when the authenticated role is admin.",
  },
  partner: {
    title: "Partner Only",
    body: "This panel is visible only when the authenticated role is partner.",
  },
  user: {
    title: "User Only",
    body: "This panel is visible only when the authenticated role is user.",
  },
} as const;

export default function RoleTestPage() {
  const { role } = useAuth();
  const panel = role ? rolePanels[role] : null;

  return (
    <div className="p-6 md:p-12">
      <div className="mb-10">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">
          Dashboard
        </p>
        <h1 className="text-4xl font-black uppercase tracking-tight text-black md:text-5xl">
          Role Test
        </h1>
      </div>

      <p
        data-testid="active-role"
        className="mb-8 text-xs font-bold uppercase tracking-[0.15em] text-gray-500"
      >
        Active role: {role ?? "none"}
      </p>

      {panel ? (
        <section
          aria-label={panel.title}
          className="border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-sm font-black uppercase tracking-[0.15em] text-black">
            {panel.title}
          </h2>
          <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-gray-600">
            {panel.body}
          </p>
        </section>
      ) : (
        <p className="text-sm font-medium text-gray-600">
          No role-specific panel is available.
        </p>
      )}
    </div>
  );
}
