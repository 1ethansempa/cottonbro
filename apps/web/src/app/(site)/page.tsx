"use client";
import { Logo } from "@cottonbro/ui";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

export default function SaaSBlackLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const nav = [
    { href: "#features", label: "Features" },
    { href: "#how", label: "How it works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
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

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

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

          <div className="hidden md:flex items-center gap-3">
            <a
              href="/auth/login"
              className="text-sm font-bold uppercase tracking-widest text-black hover:text-street-red transition"
            >
              Sign in
            </a>
            <a
              href="/auth/login"
              className="bg-black border-2 border-black px-6 py-2 text-sm font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition"
            >
              Create account
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="flex md:hidden flex-col gap-1.5 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className={`h-0.5 w-6 bg-black transition-transform ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <div className={`h-0.5 w-6 bg-black transition-opacity ${mobileMenuOpen ? "opacity-0" : ""}`} />
            <div className={`h-0.5 w-6 bg-black transition-transform ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </nav>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 z-[200] bg-white w-screen h-screen overflow-y-auto transition-opacity duration-300 md:hidden ${
            mobileMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex flex-col h-full p-6">
            <div className="flex justify-between items-center mb-8">
              <Logo size="xl" color="current" fontClassName="font-jamino" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2"
                aria-label="Close menu"
              >
                <svg
                  className="w-8 h-8 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-6 items-center text-center">
              {nav.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-3xl font-jamino uppercase text-black hover:text-street-red transition-colors"
                >
                  {n.label}
                </a>
              ))}
            </div>

            <div className="mt-auto flex flex-col gap-4 pb-8">
              <a
                href="/auth/login"
                className="text-xl font-bold uppercase tracking-widest text-black text-center hover:text-street-red transition"
              >
                Sign in
              </a>
              <a
                href="/auth/login"
                className="bg-black border-2 border-black px-6 py-4 text-center text-xl font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition"
              >
                Create account
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-black pt-12 pb-24 md:pt-32">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 px-6 md:grid-cols-2">
          {/* Left: text */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex flex-col items-start z-10 max-w-full"
          >
            <motion.h1 variants={fadeInUp} className="font-jamino uppercase leading-[0.9] tracking-tighter text-black text-[12vw] md:text-[8vw] lg:text-[6vw] xl:text-8xl break-words w-full">
              Built for
              <br />
              <span className="text-street-red">Creators</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="mt-8 max-w-md text-lg font-medium leading-relaxed text-black">
              Turn your ideas into real merch. You create; we handle printing,
              packing, delivery, and payouts — end to end.
            </motion.p>

            <motion.div variants={fadeInUp} className="mt-12 flex flex-wrap items-center gap-6">
              <a
                href="/auth/login"
                className="bg-black border-2 border-black px-8 py-4 text-base font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition"
              >
                Start free
              </a>
              <a
                href="#demo"
                className="border-b-2 border-black pb-1 text-base font-bold uppercase tracking-widest text-black hover:text-street-red hover:border-street-red transition"
              >
                View demo
              </a>
            </motion.div>
          </motion.div>

          {/* Right: image */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden border border-black bg-zinc-100">
              <img
                src="/test-hero-4.png"
                alt="CottonBro preview"
                className="block h-full w-full object-cover grayscale hover:grayscale-0 transition duration-500"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-32 border-b border-black">
        <div className="mb-16 md:mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-jamino text-6xl uppercase text-black md:text-8xl"
          >
            The Studio
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-6 max-w-xl text-xl font-bold text-black"
          >
            Everything you need to run a professional merch brand, minus the
            logistics headache.
          </motion.p>
        </div>
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 gap-px bg-black border border-black md:grid-cols-3 md:grid-rows-2"
        >
          {benefits.map((f, i) => (
            <motion.article
              key={f.title}
              variants={fadeInUp}
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
            </motion.article>
          ))}
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-7xl px-6 py-32 border-b border-black">
        <div className="mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-jamino text-6xl uppercase text-black md:text-8xl"
          >
            How it works
          </motion.h2>
        </div>
        
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div 
              key={s.n} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col gap-4 border-l-2 border-black pl-6"
            >
              <span className="font-jamino text-6xl text-street-red">
                0{s.n}
              </span>
              <h3 className="text-xl font-bold uppercase text-black">{s.t}</h3>
              <p className="text-sm font-medium leading-relaxed text-black">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PRICING + TESTIMONIALS */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-32 border-b border-black">
        <div className="mb-16 text-center">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="font-jamino text-6xl uppercase text-black md:text-8xl"
          >
            Pricing
          </motion.h2>
          <p className="mt-6 text-xl font-bold text-black">
            Clear plans with creator-friendly fees.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 items-start">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className={[
                "flex flex-col border-2 border-black p-8 transition duration-300",
                p.highlight
                  ? "bg-black text-white shadow-[8px_8px_0px_0px_#D90429] -translate-y-4"
                  : "bg-white text-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
              ].join(" ")}
            >
              <h3 className="mb-2 text-xl font-bold uppercase tracking-widest">{p.name}</h3>
              <div className="mb-6 flex items-end gap-1">
                <span className="text-5xl font-jamino">{p.price}</span>
                <span className={[
                    "pb-1 text-sm font-medium",
                    p.highlight ? "text-zinc-400" : "text-zinc-500"
                ].join(" ")}>{p.period}</span>
              </div>
              <ul className="mb-8 space-y-4 text-sm font-medium">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="text-street-red font-bold">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#signup"
                className={[
                  "mt-auto px-6 py-3 text-center text-sm font-bold uppercase tracking-widest transition border-2",
                  p.highlight
                    ? "bg-street-red border-street-red text-white hover:bg-white hover:text-street-red"
                    : "border-black bg-transparent hover:bg-black hover:text-white",
                ].join(" ")}
              >
                {p.cta}
              </a>
            </motion.div>
          ))}
        </div>

        <div className="mt-32">
            <h3 className="mb-12 text-center font-jamino text-4xl uppercase text-black md:text-5xl">Loved by people worldwide</h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((t, i) => (
                <motion.figure
                  key={t.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="border-2 border-black bg-white p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                <div className="flex gap-1 text-street-red mb-4">
                    {[1,2,3,4,5].map(i => <span key={i}>★</span>)}
                </div>
                <blockquote className="text-lg font-medium text-black">“{t.body}”</blockquote>
                <figcaption className="mt-6 text-sm font-bold uppercase tracking-widest text-zinc-500">
                    {t.name} — {t.role}
                </figcaption>
                </motion.figure>
            ))}
            </div>
        </div>
      </section>

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
              <motion.p 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="mt-4 text-lg font-medium text-black"
              >
                {f.a}
              </motion.p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-32">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center gap-8 border-4 border-black bg-white p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
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
            className="bg-black border-2 border-black px-10 py-5 text-lg font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition"
          >
            Create free account
          </a>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-16 md:grid-cols-4">
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
              <button className="w-full bg-black border-2 border-black px-3 py-2 text-sm font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition">
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
