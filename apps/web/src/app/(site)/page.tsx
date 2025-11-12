"use client";
import { Logo } from "@cottonbro/ui";
import Link from "next/link";

export default function SaaSBlackLanding() {
  const nav = [
    { href: "#features", label: "Features" },
    { href: "#how", label: "How it works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
  ];

  const brands = [
    "Axiom",
    "Nimbus",
    "Pulse",
    "Voyage",
    "Matter",
    "North",
    "Iris",
    "Atlas",
  ];

  const benefits = [
    {
      title: "Launch faster",
      copy: "Upload your design, pick a product, publish a checkout link in minutes.",
    },
    {
      title: "Zero ops",
      copy: "We handle printing, packing, shipping, returns and support behind the scenes.",
    },
    {
      title: "Transparent earnings",
      copy: "Set your price and see margin per item before you go live.",
    },
    {
      title: "3D previews",
      copy: "Realistic previews in multiple fits so you can sanity‑check before launch.",
    },
    {
      title: "Delivery around Kampala",
      copy: "Up to 40+ areas.",
    },
    {
      title: "Simple payouts",
      copy: "Connect your account and get paid automatically every week.",
    },
  ];

  const steps = [
    {
      n: 1,
      t: "Create",
      d: "Start with a template or upload artwork. Pick colors, sizes, variants.",
    },
    { n: 2, t: "Preview", d: "Review photo & 3D mockups and confirm quality." },
    {
      n: 3,
      t: "Publish",
      d: "Share a store link. We fulfill and you get paid.",
    },
  ];

  const plans = [
    {
      name: "Starter",
      price: "$0",
      period: "forever",
      cta: "Get started",
      highlight: false,
      features: ["Unlimited products", "Basic mockups", "Standard support"],
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      cta: "Start free trial",
      highlight: true,
      features: ["3D fit previews", "Custom domains", "Priority support"],
    },
    {
      name: "Advanced",
      price: "$79",
      period: "/month",
      cta: "Contact sales",
      highlight: false,
      features: ["Bulk pricing", "Team access", "Dedicated manager"],
    },
  ];

  const testimonials = [
    {
      name: "Nia K.",
      role: "Artist",
      body: "Launched a capsule in a weekend. The previews looked exactly like the final pieces.",
    },
    {
      name: "Tendo M.",
      role: "Creator",
      body: "No logistics, just design. Payouts arrive weekly without me touching anything.",
    },
    {
      name: "Jonas O.",
      role: "Brand lead",
      body: "We swapped from spreadsheets to a single link. Conversion went up 18%.",
    },
  ];

  const faqs = [
    {
      q: "Do I need to buy inventory?",
      a: "No. We print on demand after a customer orders, so there’s no upfront stock.",
    },
    {
      q: "Where do you ship?",
      a: "We currently ship to North America, Europe and parts of Africa and Asia with tracking.",
    },
    {
      q: "How do payouts work?",
      a: "Connect your account once. Earnings are paid out automatically every week.",
    },
    {
      q: "Can I use my own domain?",
      a: "Yes. Pro plan supports custom domains and branded emails.",
    },
  ];

  return (
    <div className="min-h-dvh bg-[#0A0A0B] text-zinc-200 antialiased">
      {/* GLOBAL BACKDROP (subtle vignettes + noise-ready layer) */}
      <div
        className="pointer-events-none fixed inset-0 -z-10
               bg-[radial-gradient(800px_500px_at_10%_-10%,rgba(120,119,198,0.10),transparent_70%),radial-gradient(900px_500px_at_90%_-20%,rgba(56,189,248,0.08),transparent_75%)]
               before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(60%_120%_at_50%_-20%,rgba(255,255,255,0.04),transparent_60%)]
               after:absolute after:inset-0 after:-z-10 after:bg-black/20"
        aria-hidden
      />

      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/30">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="#" className="flex items-center">
            <Logo size="xl" color="white" fontClassName="font-[jamino]" />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="text-sm text-zinc-300/90 hover:text-white transition-colors"
              >
                {n.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#signin"
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-200 hover:bg-white/[0.06] transition"
            >
              Sign in
            </a>
            <a
              href="#signup"
              className="rounded-full bg-zinc-50 px-4 py-2 text-sm font-semibold text-black shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_1px_10px_rgba(255,255,255,0.06)] hover:bg-zinc-200 transition"
            >
              Create account
            </a>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0A0A0B] text-zinc-100">
        {/* background accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10
                 bg-[radial-gradient(750px_420px_at_12%_-10%,rgba(120,119,198,0.10),transparent_70%),radial-gradient(850px_420px_at_88%_-18%,rgba(56,189,248,0.08),transparent_70%)]"
        />
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-20 md:grid-cols-2">
          {/* Left: text */}
          <div>
            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Design merch.
              <br />
              We handle delivery, get you paid.
            </h1>
            <p className="mt-5 max-w-prose text-zinc-400">
              Turn your ideas into real merch — we take care of printing,
              packing, and delivery and get you paid.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#signup"
                className="rounded-full bg-zinc-50 px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-200 transition"
              >
                Start free
              </a>
              <a
                href="#demo"
                className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-zinc-200 hover:bg-white/[0.06] transition"
              >
                View demo
              </a>
            </div>
          </div>

          {/* Right: image */}
          <div className="relative">
            <div
              className="absolute -left-10 -top-10 h-56 w-56 rounded-full bg-white/5 blur-3xl md:-left-16 md:-top-16"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_30px_80px_-20px_rgba(0,0,0,0.7)]">
              <img
                src="/test-hero-4.png"
                alt="CottonBro preview"
                className="block h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERS (unchanged, but surfaces adjusted if you enable) */}

      {/* BENEFITS */}
      <section id="features" className="mx-auto max-w-7xl px-6 pb-24">
        <h2 className="mb-3 text-center text-3xl font-bold md:text-4xl">
          Benefits
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-center text-zinc-400">
          Focus on design and audience. We take care of the rest.
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {benefits.map((f) => (
            <article
              key={f.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-sm hover:bg-white/[0.05] transition"
            >
              <h3 className="text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {f.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-8 max-w-prose">
          <h2 className="text-2xl font-bold md:text-3xl">How it works</h2>
          <p className="mt-2 text-zinc-400">
            Three simple steps to your first drop.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="mb-3 inline-grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-sm font-bold text-white">
                {s.n}
              </div>
              <h3 className="text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-zinc-400">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING + TESTIMONIALS */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Pricing</h2>
          <p className="mt-2 text-zinc-400">
            Clear plans with creator-friendly fees. Highlighted plan fits most
            teams.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={[
                "flex flex-col rounded-2xl border p-6",
                p.highlight
                  ? "border-white/10 bg-white/[0.04] shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_20px_60px_-20px_rgba(0,0,0,0.6)]"
                  : "border-white/10 bg-white/[0.03]",
              ].join(" ")}
            >
              <h3 className="mb-1 text-base font-semibold">{p.name}</h3>
              <div className="mb-4 flex items-end gap-1">
                <span className="text-3xl font-extrabold">{p.price}</span>
                <span className="pb-1 text-sm text-zinc-400">{p.period}</span>
              </div>
              <ul className="mb-6 space-y-2 text-sm text-zinc-300">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span aria-hidden>•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#signup"
                className={[
                  "mt-auto rounded-full px-4 py-2 text-center text-sm font-medium transition",
                  p.highlight
                    ? "bg-zinc-50 text-black hover:bg-zinc-200"
                    : "border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-zinc-200",
                ].join(" ")}
              >
                {p.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Testimonials beside pricing on wide screens */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <blockquote className="text-zinc-300">“{t.body}”</blockquote>
              <figcaption className="mt-4 text-sm text-zinc-400">
                {t.name} • {t.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-6 pb-24">
        <h2 className="mb-6 text-2xl font-bold md:text-3xl">
          Frequently asked questions
        </h2>
        <div className="divide-y divide-white/10 rounded-2xl border border-white/10">
          {faqs.map((f) => (
            <details key={f.q} className="group p-6 open:bg-white/[0.03]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="text-sm font-medium text-white">{f.q}</span>
                <span className="text-zinc-500 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-zinc-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold md:text-2xl">
              Ready to drop your first collection?
            </h2>
            <p className="mt-1 text-zinc-400">
              Create a product and share the link in under 10 minutes.
            </p>
          </div>
          <a
            href="#signup"
            className="rounded-full bg-zinc-50 px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-200 transition"
          >
            Create free account
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="font-semibold">CottonBro</div>
            <p className="mt-2 text-sm text-zinc-400">Design, sell, deliver.</p>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold">Product</div>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>
                <a href="#features" className="hover:text-zinc-200">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-zinc-200">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-zinc-200">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold">Company</div>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>
                <a href="#" className="hover:text-zinc-200">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-zinc-200">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-zinc-200">
                  Privacy
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold">Stay in the loop</div>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-white/10"
              />
              <button className="rounded-lg bg-zinc-50 px-3 py-2 text-sm font-medium text-black hover:bg-zinc-200 transition">
                Join
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-white/10 py-6 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} CottonBro. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
