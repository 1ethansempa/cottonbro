"use client";

import { useState } from "react";
import { Button } from "@cottonbro/ui";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function LandingPage() {
  const [hoveredFaqIndex, setHoveredFaqIndex] = useState<number | null>(null);

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
  const heroParallax = useTransform(scrollY, [0, 1000], [0, 150]); // Subtle parallax for background (currently unused but kept)

  return (
    <div className="min-h-dvh bg-black overflow-x-hidden font-urbanist">
      {/* 
        Mobile Nav Depth Effect:
        We wrap the main content in a motion.div that scales down when the menu is open.
      */}
      <motion.div className="bg-white min-h-dvh text-black antialiased selection:bg-street-red selection:text-white origin-top shadow-2xl">
        {/* NAV */}
        <SiteHeader />

        {/* HERO */}
        <section className="relative overflow-hidden border-b-2 border-black pt-12 pb-0 md:pt-32">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-2 relative z-10 pb-24">
            {/* Left: text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-start z-10 max-w-full"
            >
              <h1 className="font-marcellus uppercase leading-[0.9] tracking-tighter text-black text-[12vw] md:text-[8vw] lg:text-[6vw] xl:text-8xl break-words w-full">
                Built for
                <br />
                <span className="text-street-red flex italic">Creators</span>
              </h1>
              <p className="mt-8 max-w-md text-xl font-bold leading-relaxed text-black uppercase tracking-wide">
                Turn your ideas into real merch. You create; we handle printing,
                packing, delivery, and payouts.
              </p>

              <div className="mt-12 flex flex-wrap items-center gap-6">
                <Link href="/auth/login">
                  <Button className="px-10 py-5 text-lg rounded-none border-2 border-black bg-white text-black hover:bg-street-red hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all uppercase font-bold tracking-widest">
                    Start free
                  </Button>
                </Link>
                <a
                  href="#demo"
                  className="border-b-2 border-black pb-1 text-lg font-black uppercase tracking-widest text-black hover:text-street-red hover:border-street-red transition"
                >
                  View demo
                </a>
              </div>
            </motion.div>

            {/* Right: Flat Image Stack */}
            <div className="relative">
              <div className="relative z-10 cursor-pointer group">
                {/* Stack Effect */}
                <div className="absolute -inset-4 bg-street-red border-2 border-black translate-x-3 translate-y-3" />
                <div className="absolute -inset-4 bg-black border-2 border-black" />

                <div className="relative aspect-square overflow-hidden border-2 border-black bg-zinc-100">
                  <Image
                    src="/test-hero-7.png"
                    alt="CottonBro preview"
                    fill
                    priority
                    className="object-cover contrast-125 transition duration-500"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                  />
                  {/* Glitch/Shine effect on hover */}
                  <div className="absolute inset-0 bg-street-red/10 opacity-0 group-hover:opacity-100 transition-opacity duration-100 pointer-events-none mix-blend-multiply" />
                </div>
              </div>
            </div>
          </div>

          {/* SCROLLING MARQUEE */}
          <div className="w-full border-t-2 border-black bg-black py-4 overflow-hidden whitespace-nowrap">
            <motion.div
              className="inline-block"
              animate={{ x: [0, -1000] }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            >
              {[...Array(10)].map((_, i) => (
                <span
                  key={i}
                  className="text-3xl md:text-5xl font-black uppercase text-white tracking-widest mx-8 font-urbanist"
                >
                  Launch Your Merch{" "}
                  <span className="text-street-red mx-2">•</span> No Inventory
                  Needed <span className="text-street-red mx-2">•</span> We
                  Handle Production{" "}
                  <span className="text-street-red mx-2">•</span> Kampala
                  Delivery <span className="text-street-red mx-2">•</span>
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* NEW SECTION: COLLECTIONS (Balanced Edition) */}
        <section className="mx-auto max-w-7xl px-6 py-24 border-b-2 border-black">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1 — Apparel Studio */}
            <div className="group cursor-pointer relative">
              <div className="relative aspect-[3/4] overflow-hidden border-2 border-black mb-6 bg-black">
                <Image
                  src="/test-hero-7.png"
                  alt="Apparel"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                />
              </div>
              <h3 className="font-marcellus text-3xl uppercase text-black mb-2 group-hover:text-street-red transition-colors">
                Apparel Studio
              </h3>
              <p className="text-sm font-bold text-zinc-600 mb-4 uppercase tracking-wide group-hover:text-black transition-colors">
                Redefining streetwear.
              </p>
              <span className="inline-block border-b-2 border-black pb-0.5 text-sm font-black uppercase tracking-widest group-hover:text-street-red group-hover:border-street-red transition-all">
                Explore Apparel
              </span>
            </div>

            {/* Column 2 — Outerwear */}
            <div className="group cursor-pointer relative">
              <div className="relative aspect-[3/4] overflow-hidden border-2 border-black mb-6 bg-black">
                <Image
                  src="/test-img-2.png"
                  alt="Outerwear"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                />
              </div>
              <h3 className="font-marcellus text-3xl uppercase text-black mb-2 group-hover:text-street-red transition-colors">
                Outerwear
              </h3>
              <p className="text-sm font-bold text-zinc-600 mb-4 uppercase tracking-wide group-hover:text-black transition-colors">
                Beyond bold layers.
              </p>
              <span className="inline-block border-b-2 border-black pb-0.5 text-sm font-black uppercase tracking-widest group-hover:text-street-red group-hover:border-street-red transition-all">
                Shop Outerwear
              </span>
            </div>

            {/* Column 3 — Limited Editions */}
            <div className="group cursor-pointer relative">
              <div className="relative aspect-[3/4] overflow-hidden border-2 border-black mb-6 bg-black">
                <Image
                  src="/test-img-1.png"
                  alt="Limited Editions"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                />
              </div>
              <h3 className="font-marcellus text-3xl uppercase text-black mb-2 group-hover:text-street-red transition-colors">
                Limited Editions
              </h3>
              <p className="text-sm font-bold text-zinc-600 mb-4 uppercase tracking-wide group-hover:text-black transition-colors">
                Exclusive drops.
              </p>
              <span className="inline-block border-b-2 border-black pb-0.5 text-sm font-black uppercase tracking-widest group-hover:text-street-red group-hover:border-street-red transition-all">
                View Drops
              </span>
            </div>
          </div>
        </section>

        {/* BENEFITS ("The Studio") */}
        <section
          id="features"
          className="mx-auto max-w-7xl px-6 py-32 border-b-2 border-black"
        >
          <div className="mb-16 md:mb-24">
            <h2 className="font-marcellus text-6xl uppercase text-black md:text-8xl leading-[0.9]">
              The Studio
            </h2>
            <p className="mt-8 max-w-xl text-xl font-black uppercase text-white bg-black inline-block px-3 py-1 transform -rotate-1">
              No logistics.{" "}
              <span className="text-street-red">Just design.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:grid-rows-2">
            {benefits.map((f, i) => (
              <motion.div
                key={f.title}
                className={[
                  "group relative flex flex-col justify-between bg-white p-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all",
                  i === 0 || i === 3 ? "md:col-span-2" : "",
                ].join(" ")}
              >
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <h3 className="font-marcellus font-bold text-3xl uppercase text-black group-hover:text-street-red transition-colors">
                      {f.title}
                    </h3>
                    <p className="mt-4 max-w-sm text-black font-bold uppercase tracking-wide text-sm">
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
          className="mx-auto max-w-7xl px-6 py-32 border-b-2 border-black"
        >
          <div className="mb-16">
            <h2 className="font-marcellus text-6xl uppercase text-black md:text-8xl leading-[0.9]">
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
                  className="font-jamino text-7xl text-transparent stroke-black stroke-1 transition-transform duration-300 group-hover:-translate-y-2 group-hover:text-street-red"
                  style={{ WebkitTextStroke: "1px black" }}
                >
                  0{s.n}
                </span>
                <h3 className="text-xl font-black uppercase text-black bg-zinc-100 inline-block px-2 self-start transform -rotate-1 group-hover:rotate-0 transition-transform group-hover:bg-street-red group-hover:text-white">
                  {s.t}
                </h3>
                <p className="text-sm font-bold uppercase leading-relaxed text-zinc-700 group-hover:text-black transition-colors">
                  {s.d}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section
          id="pricing"
          className="mx-auto max-w-7xl px-6 py-32 border-b-2 border-black"
        >
          <div className="mb-16 text-center">
            <h2 className="font-marcellus text-6xl uppercase text-black md:text-8xl leading-[0.9]">
              Pricing
            </h2>
            <p className="mt-6 text-xl font-black uppercase text-black">
              Clear plans.{" "}
              <span className="text-street-red underline decoration-4 decoration-black">
                Zero bs.
              </span>
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col items-center border-2 border-black bg:white bg-white p-12 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[16px_16px_0px_0px_rgba(217,4,41,1)] transition-shadow"
              >
                <h3 className="mb-6 font-urbanist text-4xl font-black uppercase text-black">
                  Transparent Pricing
                </h3>
                <div className="mb-8 flex flex-col items-center gap-2">
                  <span className="text-7xl font-urbanist font-black text-street-red tracking-tighter">
                    UGX 10k
                  </span>
                  <span className="text-xl font-black uppercase tracking-widest text-white bg-black px-4 py-1 transform -rotate-2">
                    per sale
                  </span>
                </div>
                <div className="mb-8 h-px w-24 bg-black" />
                <p className="text-xl font-bold text-black uppercase">
                  + 5% payment processing fee
                </p>
                <p className="mt-4 text-xs font-bold uppercase text-zinc-500 max-w-md">
                  No monthly fees. No hidden costs. You only pay when you make a
                  sale.
                </p>
              </motion.div>
            </div>
          </div>

          {/* TESTIMONIALS */}
          <div className="mt-32">
            <h3 className="mb-12 text-center font-marcellus text-4xl uppercase text-black md:text-5xl">
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
                    boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)",
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                  viewport={{ once: true }}
                  className="border-2 border-black bg-white p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] origin-center cursor-default"
                >
                  <div className="flex gap-1 text-street-red mb-4 text-xl">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>★</span>
                    ))}
                  </div>
                  <blockquote className="text-lg font-bold uppercase text-black leading-tight">
                    “{t.body}”
                  </blockquote>
                  <figcaption className="mt-6 text-xs font-black uppercase tracking-widest text-zinc-500 border-t-2 border-black pt-4 inline-block">
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
          className="mx-auto max-w-4xl px-6 py-32 border-b-2 border-black"
        >
          <h2 className="mb-12 font-marcellus text-5xl uppercase text-black text-center md:text-7xl">
            FAQ
          </h2>
          <div className="divide-y-2 divide-black border-y-2 border-black">
            {faqs.map((f, i) => (
              <div
                key={f.q}
                className="group py-8 cursor-pointer"
                onMouseEnter={() => setHoveredFaqIndex(i)}
                onMouseLeave={() => setHoveredFaqIndex(null)}
              >
                <div className="flex list-none items-center justify-between gap-4">
                  <span className="text-xl font-black text-black uppercase group-hover:text-street-red transition-colors">
                    {f.q}
                  </span>
                  <span
                    className={`text-street-red transition-transform duration-300 text-3xl font-black ${
                      hoveredFaqIndex === i ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </div>
                <motion.div
                  initial={false}
                  animate={{
                    height: hoveredFaqIndex === i ? "auto" : 0,
                    opacity: hoveredFaqIndex === i ? 1 : 0,
                  }}
                  className="overflow-hidden"
                >
                  <p className="mt-4 text-lg font-bold uppercase text-zinc-700">
                    {f.a}
                  </p>
                </motion.div>
              </div>
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
              className="flex flex-col items-center justify-center gap-8 border-2 border-black bg-white p-12 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
            >
              <div>
                <h2 className="font-marcellus text-5xl uppercase text-black md:text-7xl">
                  Ready to launch?
                </h2>
                <p className="mt-4 text-xl font-black uppercase text-black">
                  Join the new wave of creators.
                </p>
              </div>
              <Link href="/auth/login">
                <Button className="px-10 py-5 text-lg rounded-none border-2 border-black bg-black text-white hover:bg-street-red hover:text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all uppercase font-black tracking-widest">
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
