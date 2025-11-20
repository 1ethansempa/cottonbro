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
      title: "Launch with confidence",
      copy: "Upload your design, pick a product, and publish once your design is approved.",
    },
    {
      title: "Zero ops",
      copy: "We handle printing, packing, shipping, returns, and customer support behind the scenes.",
    },
    {
      title: "Transparent earnings",
      copy: "Set your price and see your margin per item before going live.",
    },
    {
      title: "3D previews",
      copy: "Realistic photo and 3D previews so you can sanity-check before launch.",
    },
    {
      title: "Delivery around Kampala",
      copy: "Coverage across 40+ areas.",
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
    {
      n: 2,
      t: "Preview",
      d: "Review photo & 3D mockups and confirm quality.",
    },
    {
      n: 3,
      t: "Approval",
      d: "Submit your design for a final check before publishing.",
    },
    {
      n: 4,
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
      q: "Where do you deliver?",
      a: "We currently deliver all around Kampala.",
    },
    {
      q: "How do payouts work?",
      a: "Connect your account once. Earnings are paid out automatically every week.",
    },
  ];

  return (
    <div className="min-h-dvh bg-white text-black antialiased selection:bg-street-red selection:text-white">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-black bg-white/90 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="#" className="flex items-center text-black">
            <Logo size="xl" color="current" fontClassName="font-jamino" />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="text-sm font-bold uppercase tracking-widest text-black hover:text-street-red transition-colors"
              >
                {n.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/auth/login"
              className="text-sm font-bold uppercase tracking-widest text-black hover:text-street-red transition"
            >
              Sign in
            </a>
            <a
              href="/auth/login"
              className="bg-street-red px-6 py-2 text-sm font-bold uppercase tracking-widest text-white hover:bg-black transition"
            >
              Create account
            </a>
          </div>
        </nav>
      </header>

      {/* HERO */}
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-black pt-12 pb-24 md:pt-32">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 px-6 md:grid-cols-2">
          {/* Left: text */}
          <div className="flex flex-col items-start z-10 max-w-full">
            <h1 className="font-jamino uppercase leading-[0.9] tracking-tighter text-black text-[12vw] md:text-[8vw] lg:text-[6vw] xl:text-8xl break-words w-full">
              Built for
              <br />
              <span className="text-street-red">Creators</span>
            </h1>
            <p className="mt-8 max-w-md text-lg font-medium leading-relaxed text-black">
              Turn your ideas into real merch. You create; we handle printing,
              packing, delivery, and payouts — end to end.
            </p>

            <div className="mt-12 flex flex-wrap items-center gap-6">
              <a
                href="/auth/login"
                className="bg-black px-8 py-4 text-base font-bold uppercase tracking-widest text-white hover:bg-street-red transition"
              >
                Start free
              </a>
              <a
                href="#demo"
                className="border-b-2 border-black pb-1 text-base font-bold uppercase tracking-widest text-black hover:text-street-red hover:border-street-red transition"
              >
                View demo
              </a>
            </div>
          </div>

          {/* Right: image */}
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden border border-black bg-zinc-100">
              <img
                src="/test-hero-4.png"
                alt="CottonBro preview"
                className="block h-full w-full object-cover grayscale hover:grayscale-0 transition duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERS (unchanged, but surfaces adjusted if you enable) */}

      {/* BENEFITS */}
      {/* BENEFITS */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-32 border-b border-black">
        <div className="mb-16 md:mb-24">
          <h2 className="font-jamino text-6xl uppercase text-black md:text-8xl">
            The Studio
          </h2>
          <p className="mt-6 max-w-xl text-xl font-bold text-black">
            Everything you need to run a professional merch brand, minus the
            logistics headache.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-px bg-black border border-black md:grid-cols-3 md:grid-rows-2">
          {benefits.map((f, i) => (
            <article
              key={f.title}
              className={[
                "group relative flex flex-col justify-between bg-white p-8 transition hover:bg-zinc-50 hover:shadow-[inset_0_0_0_2px_#D90429]",
                i === 0 || i === 3 ? "md:col-span-2" : "",
              ].join(" ")}
            >
              <div>
                <h3 className="font-jamino text-3xl uppercase text-black group-hover:text-street-red transition-colors">{f.title}</h3>
                <p className="mt-4 max-w-sm text-black font-medium">
                  {f.copy}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-7xl px-6 py-32 border-b border-black">
        <div className="mb-16">
          <h2 className="font-jamino text-6xl uppercase text-black md:text-8xl">
            How it works
          </h2>
        </div>
        
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="flex flex-col gap-4 border-l-2 border-black pl-6">
              <span className="font-jamino text-6xl text-street-red">
                0{s.n}
              </span>
              <h3 className="text-xl font-bold uppercase text-black">{s.t}</h3>
              <p className="text-sm font-medium leading-relaxed text-black">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING + TESTIMONIALS */}
      {/*
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
        */}

      {/* FAQ */}
      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-4xl px-6 py-32 border-b border-black">
        <h2 className="mb-12 font-jamino text-5xl uppercase text-black text-center md:text-7xl">
          FAQ
        </h2>
        <div className="divide-y divide-black border-y border-black">
          {faqs.map((f) => (
            <details key={f.q} className="group py-8">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="text-xl font-bold text-black uppercase group-hover:text-street-red transition-colors">{f.q}</span>
                <span className="text-street-red transition group-open:rotate-45 text-2xl">
                  +
                </span>
              </summary>
              <p className="mt-4 text-lg font-medium text-black">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-32">
        <div className="flex flex-col items-center justify-center gap-8 border-4 border-black bg-white p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div>
            <h2 className="font-jamino text-5xl uppercase text-black md:text-7xl">
              Ready to launch?
            </h2>
            <p className="mt-4 text-xl font-bold text-black">
              Join the new wave of creators.
            </p>
          </div>
          <a
            href="/auth/login"
            className="bg-street-red px-10 py-5 text-lg font-bold uppercase tracking-widest text-white hover:bg-black transition"
          >
            Create free account
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-12 px-6 py-16 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1 text-black">
            <Logo size="md" color="current" fontClassName="font-jamino" />
            <p className="mt-4 text-sm font-bold text-black">
              CottonBro handles the heavy lifting so you can focus on the art.
            </p>
          </div>
          <div>
            <div className="mb-4 text-sm font-bold uppercase tracking-widest text-black">Product</div>
            <ul className="space-y-2 text-sm font-medium text-black">
              <li>
                <a href="#features" className="hover:text-street-red transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how" className="hover:text-street-red transition-colors">
                  How it works
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-street-red transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="mb-4 text-sm font-bold uppercase tracking-widest text-black">Company</div>
            <ul className="space-y-2 text-sm font-medium text-black">
              <li>
                <a href="#" className="hover:text-street-red transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-street-red transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-street-red transition-colors">
                  Privacy
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="mb-4 text-sm font-bold uppercase tracking-widest text-black">Newsletter</div>
            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="w-full border-2 border-black bg-white px-3 py-2 text-sm text-black outline-none placeholder:text-zinc-400 focus:border-street-red transition"
              />
              <button className="w-full bg-street-red px-3 py-2 text-sm font-bold uppercase tracking-widest text-white hover:bg-black transition">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-black py-8 text-center text-xs font-bold uppercase tracking-widest text-black">
          © {new Date().getFullYear()} CottonBro. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
