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
    <div className="min-h-dvh bg-neutral-950 text-neutral-200 antialiased">
      {/* BACKDROP */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(700px_400px_at_10%_-10%,rgba(120,119,198,0.14),transparent_70%),radial-gradient(800px_400px_at_90%_-20%,rgba(56,189,248,0.1),transparent_70%)]"
        aria-hidden
      />

      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-neutral-800/80 bg-neutral-950/70 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="#" className="flex items-center">
            <Logo size="xl" color="white" />
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="text-sm text-neutral-300 hover:text-white"
              >
                {n.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#signin"
              className="rounded-full border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
            >
              Sign in
            </a>
            <a
              href="#signup"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-neutral-200"
            >
              Create account
            </a>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-neutral-950 text-neutral-100">
        {/* background accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(700px_400px_at_10%_-10%,rgba(120,119,198,0.12),transparent_70%),radial-gradient(800px_400px_at_90%_-20%,rgba(56,189,248,0.1),transparent_70%)]"
        />
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-20 md:grid-cols-2">
          {/* Left: text */}
          <div>
            <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Design merch.
              <br />
              We handle delivery, get paid.
            </h1>
            <p className="mt-5 max-w-prose text-neutral-400">
              Turn your ideas into real merch — we take care of printing,
              packing, and shipping while you earn automatically.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#signup"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-neutral-200"
              >
                Start free
              </a>
              <a
                href="#demo"
                className="rounded-full border border-neutral-800 bg-neutral-900 px-5 py-3 text-sm text-neutral-200 hover:bg-neutral-800"
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
            <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl">
              <img
                src="/test-hero.png"
                alt="CottonBro preview"
                className="block h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      {/*
          <section className="mx-auto max-w-7xl px-6 pb-24">
        <p className="mb-6 text-center text-xs uppercase tracking-widest text-neutral-400">
          Trusted by teams and creators at
        </p>
        <div className="grid grid-cols-2 place-items-center gap-6 rounded-xl border border-neutral-800 bg-neutral-900/40 px-6 py-6 sm:grid-cols-4 md:grid-cols-8">
          {brands.map((b) => (
            <div key={b} className="text-sm text-neutral-400">
              {b}
            </div>
          ))}
        </div>
      </section>
        */}

      {/* BENEFITS */}
      <section id="features" className="mx-auto max-w-7xl px-6 pb-24">
        <h2 className="mb-3 text-center text-3xl font-bold md:text-4xl">
          Benefits
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-center text-neutral-400">
          Focus on design and audience. We take care of the rest.
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {benefits.map((f) => (
            <article
              key={f.title}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm hover:bg-neutral-900"
            >
              <h3 className="text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">
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
          <p className="mt-2 text-neutral-400">
            Three simple steps to your first drop.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6"
            >
              <div className="mb-3 inline-grid size-10 place-items-center rounded-full border border-neutral-800 bg-neutral-800/40 text-sm font-bold text-white">
                {s.n}
              </div>
              <h3 className="text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-neutral-400">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING + TESTIMONIALS */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Pricing</h2>
          <p className="mt-2 text-neutral-400">
            Clear plans with creator‑friendly fees. Highlighted plan fits most
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
                  ? "border-neutral-700 bg-neutral-900 shadow-lg"
                  : "border-neutral-800 bg-neutral-900/60",
              ].join(" ")}
            >
              <h3 className="mb-1 text-base font-semibold">{p.name}</h3>
              <div className="mb-4 flex items-end gap-1">
                <span className="text-3xl font-extrabold">{p.price}</span>
                <span className="pb-1 text-sm text-neutral-400">
                  {p.period}
                </span>
              </div>
              <ul className="mb-6 space-y-2 text-sm text-neutral-300">
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
                  "mt-auto rounded-full px-4 py-2 text-center text-sm font-medium",
                  p.highlight
                    ? "bg-white text-black hover:bg-neutral-200"
                    : "border border-neutral-800 bg-neutral-900 hover:bg-neutral-800",
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
              className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6"
            >
              <blockquote className="text-neutral-300">“{t.body}”</blockquote>
              <figcaption className="mt-4 text-sm text-neutral-400">
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
        <div className="divide-y divide-neutral-800 rounded-2xl border border-neutral-800">
          {faqs.map((f, i) => (
            <details key={f.q} className="group p-6 open:bg-neutral-900/40">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="text-sm font-medium text-white">{f.q}</span>
                <span className="text-neutral-500 group-open:rotate-45 transition">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-neutral-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold md:text-2xl">
              Ready to drop your first collection?
            </h2>
            <p className="mt-1 text-neutral-400">
              Create a product and share the link in under 10 minutes.
            </p>
          </div>
          <a
            href="#signup"
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-neutral-200"
          >
            Create free account
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-800/80">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="font-semibold">CottonBro</div>
            <p className="mt-2 text-sm text-neutral-400">
              Design, sell, deliver.
            </p>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold">Product</div>
            <ul className="space-y-1 text-sm text-neutral-400">
              <li>
                <a href="#features" className="hover:text-neutral-200">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-neutral-200">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-neutral-200">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold">Company</div>
            <ul className="space-y-1 text-sm text-neutral-400">
              <li>
                <a href="#" className="hover:text-neutral-200">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-neutral-200">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-neutral-200">
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
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-neutral-700"
              />
              <button className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-neutral-200">
                Join
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-neutral-800/80 py-6 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} CottonBro. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
