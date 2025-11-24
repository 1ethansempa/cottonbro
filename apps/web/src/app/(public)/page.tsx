"use client";

import { Button } from "@cottonbro/ui";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// --- 3D Components ---

export default function LandingPage() {
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
    { title: "Delivery around Kampala", copy: "Coverage across 40+ areas." },
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
      t: "Approval",
      d: "Submit your design for a final check before publishing.",
    },
    {
      n: 4,
      t: "Publish",
      d: "Share a store link. We fulfill and you get paid.",
    },
  ];

  const testimonials = [
    {
      name: "Nia K.",
      role: "Artist",
      body: "Launched a capsule in a weekend. The previews looked exactly like the final pieces.",
      rotate: -2,
    },
    {
      name: "Tendo M.",
      role: "Creator",
      body: "No logistics, just design. Payouts arrive weekly without me touching anything.",
      rotate: 1,
    },
    {
      name: "Jonas O.",
      role: "Brand lead",
      body: "We swapped from spreadsheets to a single link. Conversion went up 18%.",
      rotate: -1,
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

  // Scroll animations
  const { scrollY } = useScroll();
  const heroParallax = useTransform(scrollY, [0, 1000], [0, 150]); // Subtle parallax for background

  return (
    <div className="min-h-dvh bg-black overflow-x-hidden">
      {/* 
        Mobile Nav Depth Effect:
        We wrap the main content in a motion.div that scales down when the menu is open.
      */}
      <motion.div className="bg-white min-h-dvh text-black antialiased selection:bg-street-red selection:text-white origin-top shadow-2xl">
        {/* NAV */}
        <SiteHeader />

        {/* HERO */}
        <section className="relative overflow-hidden border-b border-black pt-12 pb-24 md:pt-32">
          {/* Subtle Parallax Background */}
          <motion.div
            style={{ y: heroParallax }}
            className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
          >
            <div className="absolute top-20 left-20 w-64 h-64 bg-black rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-street-red rounded-full blur-3xl" />
          </motion.div>

          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-2 relative z-10">
            {/* Left: text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-start z-10 max-w-full"
            >
              <h1 className="font-urbanist uppercase leading-[0.9] tracking-tighter text-black text-[12vw] md:text-[8vw] lg:text-[6vw] xl:text-8xl break-words w-full">
                Built for
                <br />
                <span className="text-street-red flex">Creators</span>
              </h1>
              <p className="mt-8 max-w-md text-lg font-medium leading-relaxed text-black">
                Turn your ideas into real merch. You create; we handle printing,
                packing, delivery, and payouts — end to end.
              </p>

              <div className="mt-12 flex flex-wrap items-center gap-6">
                <Link href="/auth/login">
                  <Button className="px-8 py-4 text-base">Start free</Button>
                </Link>
                <a
                  href="#demo"
                  className="border-b-2 border-black pb-1 text-base font-bold uppercase tracking-widest text-black hover:text-street-red hover:border-street-red transition"
                >
                  View demo
                </a>
              </div>
            </motion.div>

            {/* Right: Flat Image Stack */}
            <div className="relative">
              <div className="relative z-10 cursor-pointer group">
                {/* Card Stack Effect */}
                <div className="absolute -inset-4 bg-black/5 border border-black/10 rounded-sm" />
                <div className="absolute -inset-2 bg-black/10 border border-black/20 rounded-sm" />

                <div className="relative aspect-[4/5] overflow-hidden border-2 border-black bg-zinc-100 shadow-2xl">
                  <img
                    src="/test-hero-5.png"
                    alt="CottonBro preview"
                    className="block h-full w-full object-cover grayscale group-hover:grayscale-0 transition duration-500"
                  />
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS ("The Studio") */}
        <section
          id="features"
          className="mx-auto max-w-7xl px-6 py-32 border-b border-black"
        >
          <div className="mb-16 md:mb-24">
            <h2 className="font-jamino text-6xl uppercase text-black md:text-8xl">
              The Studio
            </h2>
            <p className="mt-6 max-w-xl text-xl font-bold text-black">
              Everything you need to run a professional merch brand, minus the
              logistics headache.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:grid-rows-2">
            {benefits.map((f, i) => (
              <motion.div
                key={f.title}
                className={[
                  "group relative flex flex-col justify-between bg-white p-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                  i === 0 || i === 3 ? "md:col-span-2" : "",
                ].join(" ")}
                whileHover={{
                  y: -4,
                  boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)",
                }}
                transition={{ duration: 0.2 }}
              >
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <h3 className="font-marcellus font-semibold text-3xl uppercase text-black group-hover:text-street-red transition-colors">
                      {f.title}
                    </h3>
                    <p className="mt-4 max-w-sm text-black font-medium">
                      {f.copy}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how"
          className="mx-auto max-w-7xl px-6 py-32 border-b border-black"
        >
          <div className="mb-16">
            <h2 className="font-jamino text-6xl uppercase text-black md:text-8xl">
              How it works
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: "backOut" }}
                viewport={{ once: true, margin: "-50px" }}
                className="flex flex-col gap-4 border-l-2 border-black pl-6 group"
              >
                {/* Embossed Number Effect */}
                <span
                  className="font-jamino text-6xl text-street-red transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-110"
                  style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.1)" }}
                >
                  0{s.n}
                </span>
                <h3 className="text-xl font-bold uppercase text-black">
                  {s.t}
                </h3>
                <p className="text-sm font-medium leading-relaxed text-black">
                  {s.d}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section
          id="pricing"
          className="mx-auto max-w-7xl px-6 py-32 border-b border-black"
        >
          <div className="mb-16 text-center">
            <h2 className="font-jamino text-6xl uppercase text-black md:text-8xl">
              Pricing
            </h2>
            <p className="mt-6 text-xl font-bold text-black">
              Clear plans with creator-friendly fees.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col items-center border-4 border-black bg-white p-12 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
              >
                <h3 className="mb-6 font-urbanist text-4xl uppercase text-black md:text-5xl">
                  Transparent Pricing
                </h3>
                <div className="mb-8 flex flex-col items-center gap-2">
                  <span className="text-6xl font-urbanist text-street-red">
                    UGX 10k
                  </span>
                  <span className="text-xl font-bold uppercase tracking-widest text-black">
                    per sale
                  </span>
                </div>
                <div className="mb-8 h-px w-24 bg-black/20" />
                <p className="text-xl font-bold text-black">
                  + 5% payment processing fee
                </p>
                <p className="mt-4 text-sm font-medium text-zinc-500 max-w-md">
                  No monthly fees. No hidden costs. You only pay when you make a
                  sale.
                </p>
              </motion.div>
            </div>
          </div>

          {/* TESTIMONIALS (Polaroid Effect) */}
          <div className="mt-32">
            <h3 className="mb-12 text-center font-jamino text-4xl uppercase text-black md:text-5xl">
              Loved by creators
            </h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <motion.figure
                  key={t.name}
                  initial={{ opacity: 0, rotate: t.rotate }}
                  whileInView={{ opacity: 1 }}
                  whileHover={{
                    rotate: 0,
                    scale: 1.05,
                    zIndex: 10,
                    boxShadow: "0px 20px 40px rgba(0,0,0,0.2)",
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                  viewport={{ once: true }}
                  className="border-2 border-black bg-white p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] origin-center cursor-default"
                >
                  <div className="flex gap-1 text-street-red mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>★</span>
                    ))}
                  </div>
                  <blockquote className="text-lg font-medium text-black">
                    “{t.body}”
                  </blockquote>
                  <figcaption className="mt-6 text-sm font-bold uppercase tracking-widest text-zinc-500">
                    {t.name} — {t.role}
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="mx-auto max-w-4xl px-6 py-32 border-b border-black"
        >
          <h2 className="mb-12 font-jamino text-5xl uppercase text-black text-center md:text-7xl">
            FAQ
          </h2>
          <div className="divide-y divide-black border-y border-black">
            {faqs.map((f) => (
              <details key={f.q} className="group py-8">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="text-xl font-bold text-black uppercase group-hover:text-street-red transition-colors">
                    {f.q}
                  </span>
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

        {/* CTA (3D Slab) */}
        <section className="mx-auto max-w-7xl px-6 py-32">
          <div className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center gap-8 border-4 border-black bg-white p-12 text-center shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]"
            >
              <div>
                <h2 className="font-jamino text-5xl uppercase text-black md:text-7xl">
                  Ready to launch?
                </h2>
                <p className="mt-4 text-xl font-bold text-black">
                  Join the new wave of creators.
                </p>
              </div>
              <Link href="/auth/login">
                <Button className="px-10 py-5 text-lg">
                  Create free account
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* FOOTER */}
        <SiteFooter />
      </motion.div>
    </div>
  );
}
