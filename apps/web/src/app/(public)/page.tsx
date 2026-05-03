"use client";

import { useState } from "react";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Marquee } from "@/components/home/Marquee";
import { ProfitCalculator } from "@/components/home/ProfitCalculator";

export default function LandingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const assetsBaseUrl = process.env.NEXT_PUBLIC_ASSETS_BASE_URL?.replace(
    /\/+$/,
    "",
  );

  if (!assetsBaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_ASSETS_BASE_URL");
  }

  const latestDrops = [
    {
      id: 1,
      name: "Yuri Tee",
      price: "UGX 60,000",
      colors: 1,
      img: `${assetsBaseUrl}/site-images/product-1.png`,
      badge: null,
    },
    {
      id: 2,
      name: "Oversized Heavyweight",
      price: "UGX 90,000",
      colors: 4,
      img: `${assetsBaseUrl}/site-images/product-2.png`,
      badge: "SOLD OUT",
    },
    {
      id: 3,
      name: "Peach Muscle T",
      price: "UGX 45,000",
      colors: 2,
      img: `${assetsBaseUrl}/site-images/product-3.png`,
      badge: null,
    },
    {
      id: 4,
      name: "Classic Polo",
      price: "UGX 85,000",
      colors: 5,
      img: `${assetsBaseUrl}/site-images/product-4.png`,
      badge: null,
    },
  ];

  const stillInterested = [
    {
      id: 5,
      name: "Yuri Tee",
      price: "UGX 60,000",
      colors: 3,
      img: `${assetsBaseUrl}/site-images/product-5.png`,
    },
    {
      id: 6,
      name: "Premium Soft",
      price: "UGX 55,000",
      colors: 6,
      img: `${assetsBaseUrl}/site-images/product-1.png`,
    },
  ];

  const steps = [
    {
      n: "01",
      title: "Design",
      desc: "Create your products right here on our platform.",
    },
    {
      n: "02",
      title: "Create",
      desc: "Add your logos, text, patches and styling details.",
    },
    {
      n: "03",
      title: "Sell",
      desc: "Share your link or store. We print & fulfill every order.",
    },
    {
      n: "04",
      title: "Earn",
      desc: "You earn profit on every sale, straight to your bank account.",
    },
  ];

  const faqs = [
    {
      q: "How much does it cost to start?",
      a: "It costs nothing to design. We handle the manufacturing and take a flat fee per item + base blank cost.",
    },
    {
      q: "How do I get paid?",
      a: "Profits are deposited weekly directly into your registered mobile money or bank account.",
    },
    {
      q: "What if I don't have a design?",
      a: "Our built-in studio has typography tools, royalty-free assets, and AI generation to help you get started.",
    },
    {
      q: "Can I cancel my store?",
      a: "Yes, you can close your store and withdraw your remaining balance at any time.",
    },
  ];

  // Shared product card renderer
  const ProductCard = ({
    item,
    faded = false,
  }: {
    item: (typeof latestDrops)[0];
    faded?: boolean;
  }) => (
    <div
      className={`group cursor-pointer ${faded ? "opacity-80 hover:opacity-100 transition-opacity duration-300" : ""}`}
    >
      <div className="relative aspect-[4/5] bg-[#e5e5e5] mb-2 overflow-hidden flex items-center justify-center">
        <div className="relative w-full h-full mix-blend-multiply transition-transform duration-700 group-hover:scale-105">
          <Image
            src={item.img}
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between items-baseline">
          <h3 className="text-[13px] sm:text-sm font-medium text-black leading-tight truncate mr-2">
            {item.name}
          </h3>
          <span className="text-[13px] sm:text-sm font-medium text-black whitespace-nowrap">
            {item.price}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
          <span className="text-[9px] font-semibold text-black/70 tracking-wide">
            {item.badge || "APPAREL"}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans bg-white text-black min-h-screen selection:bg-black selection:text-white">
      <SiteHeader theme="light" />

      {/* ═══════ HERO ═══════ */}
      <section className="relative w-full min-h-[90vh] flex flex-col md:flex-row items-stretch overflow-hidden bg-white">
        {/* Left: Text */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-[8%] pt-28 pb-16 md:py-20 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-xl"
          >
            <h1 className="text-[54px] md:text-[64px] lg:text-[92px] font-bold text-black leading-[0.92] mb-8">
              Turn your
              <br />
              ideas into
              <br />a brand.
            </h1>

            <p className="text-base text-black/60 font-medium leading-relaxed mb-10 max-w-md">
              Create pieces people want to wear. Design your first drop, launch
              your store, and earn from every sale.
            </p>

            <div className="flex flex-row items-center gap-3">
              <button
                type="button"
                className="group inline-flex items-center justify-center bg-black text-white hover:opacity-80 px-8 py-5 rounded-none text-xs font-semibold tracking-wide transition-all cursor-pointer"
              >
                Start designing
                <ArrowUpRight className="h-3.5 w-0 -translate-x-2 opacity-0 transition-all duration-300 group-hover:w-3.5 group-hover:translate-x-0 group-hover:opacity-100 group-hover:ml-2" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="group inline-flex items-center justify-center border border-gray-300 bg-white text-black hover:border-black px-8 py-5 rounded-none text-xs font-semibold tracking-wide transition-all cursor-pointer"
              >
                Shop now
                <ArrowUpRight className="h-3.5 w-0 -translate-x-2 opacity-0 transition-all duration-300 group-hover:w-3.5 group-hover:translate-x-0 group-hover:opacity-100 group-hover:ml-2" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right: Image */}
        <div className="flex-1 relative min-h-[450px] md:min-h-full bg-gray-100 overflow-hidden">
          <Image
            src={`${assetsBaseUrl}/site-images/hero-new-2.png`}
            alt="Model wearing brand tee"
            fill
            className="object-cover object-top"
            priority
            unoptimized
          />
        </div>
      </section>

      {/* ═══════ MARQUEE ═══════ */}
      <Marquee />

      {/* ═══════ LATEST DROPS ═══════ */}
      {/* anchor for hero SHOP NOW button */}
      <div id="drops" className="scroll-mt-24" />
      <section className="py-20 px-6 md:px-[6%]">
        <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-black">
            Latest drops
          </h2>
          <span
            aria-disabled="true"
            className="text-xs font-semibold text-black/55 tracking-wide cursor-default"
          >
            View all →
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-x-5 gap-y-10">
          {latestDrops.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* ═══════ STILL INTERESTED ═══════ */}
      <section className="pt-8 pb-20 px-6 md:px-[6%] border-t border-gray-100">
        <div className="mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-2xl text-black">
            <span className="font-bold">Still</span>{" "}
            <span className="font-normal">interested?</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-x-5 gap-y-10">
          {stillInterested.map((item) => (
            <ProductCard
              key={item.id}
              item={item as (typeof latestDrops)[0]}
              faded
            />
          ))}
        </div>
      </section>

      {/* ═══════ FROM VISION TO REALITY ═══════ */}
      <section
        id="how-it-works"
        className="bg-[#111] text-white flex flex-col lg:flex-row items-stretch lg:min-h-[700px] scroll-mt-24"
      >
        {/* Left: Steps */}
        <div className="flex-1 px-8 md:px-[8%] py-20 lg:py-28 flex flex-col justify-center">
          <h2 className="text-5xl md:text-6xl font-bold leading-[0.94] mb-4 text-white">
            From vision
            <br />
            to reality.
          </h2>
          <p className="text-sm font-medium text-white/60 mb-16">
            We handle the logistics. You earn the profit.
          </p>

          <div className="space-y-8 max-w-md">
            {steps.map((step) => (
              <div key={step.n} className="flex items-start gap-6 group">
                <span
                  className="text-5xl md:text-6xl font-black leading-none tracking-[-0.04em] shrink-0 select-none"
                  style={{
                    WebkitTextStroke: "1px rgba(255, 255, 255, 0.15)",
                    color: "transparent",
                  }}
                >
                  {step.n}
                </span>
                <div className="pt-2 space-y-1">
                  <h4 className="text-sm font-bold tracking-wide">
                    {step.title}
                  </h4>
                  <p className="text-xs text-white/50 font-medium leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Image + Testimonial */}
        <div className="flex-1 relative min-h-[360px] md:min-h-[420px] lg:min-h-full overflow-hidden">
          <div className="absolute inset-0 opacity-40">
            <Image
              src={`${assetsBaseUrl}/site-images/studio-lights.png`}
              alt="Studio Space"
              fill
              className="object-cover"
            />
          </div>

          <div className="absolute bottom-8 left-6 right-6 z-10 bg-white p-6 shadow-2xl border-l-4 border-[#e60000] sm:left-auto sm:right-10 sm:max-w-[300px]">
            <p className="text-xs font-semibold text-black/55 tracking-wide mb-2">
              Success story
            </p>
            <p className="text-black font-semibold text-sm leading-relaxed italic">
              &quot;The quality is unmatched. My customers love the heavyweight
              tees.&quot;
            </p>
          </div>
        </div>
      </section>

      {/* ═══════ 4K SIMULATION + CREATIVE SPACE ═══════ */}
      <section className="flex flex-col md:flex-row items-stretch bg-black min-h-[500px]">
        {/* Left: 4K Textile */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-50">
            <Image
              src={`${assetsBaseUrl}/site-images/textile-4k.png`}
              alt="Fabric"
              fill
              className="object-cover brightness-[0.5]"
            />
          </div>

          <div className="relative z-10 flex-1 p-10 md:p-16 flex flex-col justify-end">
            <h2 className="text-4xl md:text-5xl font-bold mb-3 text-white leading-[0.98]">
              4K textile
              <br />
              simulation
            </h2>
            <p className="text-xs font-medium text-white/60 leading-relaxed max-w-[260px]">
              Experience textures of physical swatch before buying a sample.
            </p>
          </div>

          <div className="relative z-10 bg-[#e60000] px-10 md:px-16 py-5">
            <p className="text-xs font-semibold tracking-wide text-white">
              The future of fashion is owned by you
            </p>
          </div>
        </div>

        {/* Right: Creative Space */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[#e5e5e5] text-black">
          <div className="absolute inset-0 opacity-30">
            <Image
              src={`${assetsBaseUrl}/site-images/studio-new.png`}
              alt="Creative Space"
              fill
              className="object-cover grayscale"
            />
          </div>

          <div className="relative z-10 flex-1 p-10 md:p-16 flex flex-col justify-center items-center text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-3 leading-[0.98]">
              Your creative
              <br />
              space.
            </h2>
            <p className="text-sm font-medium text-black/60 mb-10 max-w-[260px]">
              The best ideas start here. We give you the tools.
            </p>
            <button
              type="button"
              className="group inline-flex items-center justify-center bg-white text-black hover:opacity-80 px-8 py-5 rounded-none text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-lg border border-gray-200"
            >
              Start designing
              <ArrowUpRight className="h-3.5 w-0 -translate-x-2 opacity-0 transition-all duration-300 group-hover:w-3.5 group-hover:translate-x-0 group-hover:opacity-100 group-hover:ml-2" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════ 10K CALCULATOR ═══════ */}
      <section
        id="calculator"
        className="pt-28 pb-16 px-6 flex flex-col items-center justify-center bg-white scroll-mt-24"
      >
        <div className="mb-14 text-center">
          <h2 className="text-[80px] md:text-[110px] font-bold text-black leading-none mb-2">
            <span className="text-3xl md:text-4xl font-bold tracking-normal align-middle text-black/40">
              UGX
            </span>{" "}
            10k
          </h2>
          <p className="text-sm font-medium text-black/60 sm:max-w-sm max-w-md mx-auto leading-relaxed">
            UGX 10K platform fee + base blank cost per item sold. You set the
            price & keep the profit.
          </p>
        </div>
      </section>

      {/* ═══════ PROFIT CALCULATOR ═══════ */}
      <section className="pb-28 px-6 bg-white">
        <ProfitCalculator />
      </section>

      {/* ═══════ HELP & SUPPORT ═══════ */}
      <section className="py-20 px-6 md:px-[6%] bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-black">
              Help & support
            </h2>
          </div>

          <div className="border-t border-gray-200">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border-b border-gray-200 cursor-pointer group"
                onClick={() =>
                  setOpenFaqIndex(openFaqIndex === idx ? null : idx)
                }
              >
                <div className="py-6 flex justify-between items-center group-hover:bg-gray-50/50 transition-colors">
                  <h3 className="text-sm font-semibold tracking-wide text-black pr-8">
                    {faq.q}
                  </h3>
                  <span
                    className={`text-lg font-bold text-black select-none transition-transform duration-300 ${openFaqIndex === idx ? "rotate-45" : "rotate-0"}`}
                  >
                    +
                  </span>
                </div>
                <AnimatePresence>
                  {openFaqIndex === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 text-sm font-medium text-black/70 leading-relaxed max-w-xl">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter theme="dark" disableLinks />
    </div>
  );
}
