"use client";

import { useState } from "react";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Marquee } from "@/components/home/Marquee";
import { ProfitCalculator } from "@/components/home/ProfitCalculator";

export default function LandingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const latestDrops = [
    { id: 1, name: "YURI TEE", price: "UGX 60,000", colors: 1, img: "/product-1.png", badge: null },
    { id: 2, name: "OVERSIZED HEAVYWEIGHT", price: "UGX 90,000", colors: 4, img: "/product-2.png", badge: "SOLD OUT FAST" },
    { id: 3, name: "PEACH MUSCLE T", price: "UGX 45,000", colors: 2, img: "/product-3.png", badge: null },
    { id: 4, name: "CLASSIC POLO", price: "UGX 85,000", colors: 5, img: "/product-4.png", badge: null },
  ];

  const stillInterested = [
    { id: 5, name: "YURI TEE", price: "UGX 60,000", colors: 3, img: "/product-5.png" },
    { id: 6, name: "PREMIUM SOFT", price: "UGX 55,000", colors: 6, img: "/product-1.png" },
  ];

  const steps = [
    { n: "01", title: "DESIGN", desc: "Create your products right here on our platform." },
    { n: "02", title: "CREATE", desc: "Add your logos, text, patches and styling details." },
    { n: "03", title: "SELL", desc: "Share your link or store. We print & fulfill every order." },
    { n: "04", title: "EARN", desc: "You earn profit on every sale, straight to your bank account." },
  ];

  const faqs = [
    { q: "HOW MUCH DOES IT COST TO START?", a: "It costs nothing to design. We handle the manufacturing and take a flat fee per item + base blank cost." },
    { q: "HOW DO I GET PAID?", a: "Profits are deposited weekly directly into your registered mobile money or bank account." },
    { q: "WHAT IF I DON'T HAVE A DESIGN?", a: "Our built-in studio has typography tools, royalty-free assets, and AI generation to help you get started." },
    { q: "CAN I CANCEL MY STORE?", a: "Yes, you can close your store and withdraw your remaining balance at any time." },
  ];

  // Shared product card renderer
  const ProductCard = ({ item, faded = false }: { item: typeof latestDrops[0]; faded?: boolean }) => (
    <div className={`group cursor-pointer ${faded ? "opacity-80 hover:opacity-100 transition-opacity duration-300" : ""}`}>
      <div className="relative aspect-square bg-[#f5f5f5] mb-4 overflow-hidden flex items-center justify-center p-6">
        <div className="relative w-full h-full mix-blend-multiply transition-transform duration-700 group-hover:scale-105">
          <Image src={item.img} alt={item.name} fill className="object-contain" />
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between items-start">
          <h3 className="text-[11px] md:text-xs font-black tracking-[0.15em] text-black uppercase max-w-[65%] leading-tight">
            {item.name}
          </h3>
          <span className="text-[10px] md:text-xs font-medium text-gray-500 tracking-wide whitespace-nowrap">
            {item.price}
          </span>
        </div>
        {item.badge ? (
          <p className="text-[10px] font-bold text-[#e60000] tracking-[0.15em] uppercase">{item.badge}</p>
        ) : (
          <p className="text-[10px] font-medium text-gray-400 tracking-[0.1em] uppercase">{item.colors} COLOR{item.colors > 1 ? "S" : ""}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="font-sans bg-white text-black min-h-screen selection:bg-black selection:text-white">
      <SiteHeader theme="light" disableLinks />

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
            <h1 className="text-[56px] md:text-[80px] lg:text-[96px] font-bold tracking-[-0.04em] text-black leading-[0.88] uppercase mb-8">
              TURN YOUR<br />
              IDEAS INTO<br />
              A BRAND.
            </h1>

            <p className="text-sm text-gray-500 font-medium tracking-[0.15em] uppercase mb-10">
              Create your brand. Design. Launch. Get Paid.
            </p>

            <div className="flex flex-row items-center gap-3">
              <button type="button" className="bg-black text-white hover:opacity-80 px-8 py-5 rounded-none text-[10px] font-bold tracking-[0.2em] uppercase transition-all cursor-default">
                START DESIGNING
              </button>
              <button type="button" className="border border-gray-300 bg-white text-black hover:border-black px-8 py-5 rounded-none text-[10px] font-bold tracking-[0.2em] uppercase transition-all cursor-default">
                SHOP NOW
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right: Image */}
        <div className="flex-1 relative min-h-[450px] md:min-h-full bg-gray-100 overflow-hidden">
          <Image
            src="/hero-new-2.png"
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
      <div id="drops" />
      <section className="py-20 px-6 md:px-[6%]">
        <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-xl font-black tracking-[-0.02em] uppercase text-black">LATEST DROPS</h2>
          <span aria-disabled="true" className="text-[10px] font-bold text-gray-400 tracking-[0.15em] uppercase cursor-default">
            VIEW ALL →
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-x-5 gap-y-10">
          {latestDrops.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* ═══════ STILL INTERESTED ═══════ */}
      <section className="pt-8 pb-20 px-6 md:px-[6%] border-t border-gray-100">
        <div className="mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-xl tracking-[-0.02em] uppercase text-black">
            <span className="font-black">STILL</span> <span className="font-light">INTERESTED?</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-x-5 gap-y-10">
          {stillInterested.map((item) => (
            <ProductCard key={item.id} item={item as typeof latestDrops[0]} faded />
          ))}
        </div>
      </section>

      {/* ═══════ FROM VISION TO REALITY ═══════ */}
      <section className="bg-[#111] text-white flex flex-col lg:flex-row items-stretch min-h-[700px]">
        {/* Left: Steps */}
        <div className="flex-1 px-8 md:px-[8%] py-20 lg:py-28 flex flex-col justify-center">
          <h2 className="text-5xl md:text-6xl font-black tracking-[-0.04em] leading-[0.88] uppercase mb-4 text-white">
            FROM VISION<br />TO REALITY.
          </h2>
          <p className="text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase mb-16">
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
                  <h4 className="text-sm font-black tracking-[0.2em] uppercase">{step.title}</h4>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Image + Testimonial */}
        <div className="flex-1 relative min-h-[500px] lg:min-h-full overflow-hidden">
          <div className="absolute inset-0 opacity-40">
            <Image src="/studio-lights.png" alt="Studio Space" fill className="object-cover" />
          </div>

          <div className="absolute bottom-10 right-10 z-10 bg-white p-6 max-w-[300px] shadow-2xl border-l-4 border-[#e60000]">
            <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-2">SUCCESS STORY</p>
            <p className="text-black font-semibold text-sm leading-relaxed italic">
              &quot;The quality is unmatched. My customers love the heavyweight tees.&quot;
            </p>
          </div>
        </div>
      </section>

      {/* ═══════ 4K SIMULATION + CREATIVE SPACE ═══════ */}
      <section className="flex flex-col md:flex-row items-stretch bg-black min-h-[500px]">
        {/* Left: 4K Textile */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-50">
            <Image src="/textile-4k.png" alt="Fabric" fill className="object-cover brightness-[0.5]" />
          </div>

          <div className="relative z-10 flex-1 p-10 md:p-16 flex flex-col justify-end">
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em] uppercase mb-3 text-white leading-[0.95]">
              4K TEXTILE<br />SIMULATION
            </h2>
            <p className="text-xs font-medium text-gray-400 leading-relaxed max-w-[260px]">
              Experience textures of physical swatch before buying a sample.
            </p>
          </div>

          <div className="relative z-10 bg-[#e60000] px-10 md:px-16 py-5">
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-white">
              THE FUTURE OF FASHION IS OWNED BY YOU
            </p>
          </div>
        </div>

        {/* Right: Creative Space */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[#e5e5e5] text-black">
          <div className="absolute inset-0 opacity-30">
            <Image src="/studio-new.png" alt="Creative Space" fill className="object-cover grayscale" />
          </div>

          <div className="relative z-10 flex-1 p-10 md:p-16 flex flex-col justify-center items-center text-center">
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em] uppercase mb-3 leading-[0.95]">
              YOUR CREATIVE<br />SPACE.
            </h2>
            <p className="text-[10px] font-bold text-gray-600 tracking-[0.2em] uppercase mb-10 max-w-[240px]">
              The best ideas start here. We give you the tools.
            </p>
            <button type="button" className="bg-white text-black hover:opacity-80 px-8 py-5 rounded-none text-[10px] font-black tracking-[0.2em] uppercase transition-all cursor-default shadow-lg border border-gray-200">
              START DESIGNING
            </button>
          </div>
        </div>
      </section>

      {/* ═══════ 10K PRICING ═══════ */}
      <section id="calculator" className="pt-28 pb-16 px-6 flex flex-col items-center justify-center bg-white">
        <div className="mb-14 text-center">
          <h2 className="text-[80px] md:text-[110px] font-black tracking-[-0.04em] text-black leading-none mb-2">
            <span className="text-3xl md:text-4xl font-black tracking-normal align-middle text-gray-500">UGX</span> 10k
          </h2>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 max-w-sm mx-auto mb-10">
            UGX 10K platform fee + base blank cost per item sold. You set the price & keep the profit.
          </p>
          <button type="button" className="bg-black text-white px-10 py-5 text-[10px] font-black tracking-[0.2em] uppercase rounded-none hover:opacity-80 transition-all cursor-default shadow-xl">
            START YOUR BRAND TODAY
          </button>
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
            <h2 className="text-2xl font-black tracking-[-0.02em] text-black uppercase">
              HELP & SUPPORT
            </h2>
          </div>

          <div className="border-t border-gray-200">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border-b border-gray-200 cursor-pointer group"
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
              >
                <div className="py-6 flex justify-between items-center group-hover:bg-gray-50/50 transition-colors">
                  <h3 className="text-xs font-bold tracking-[0.15em] text-black uppercase pr-8">
                    {faq.q}
                  </h3>
                  <span className={`text-lg font-bold text-black select-none transition-transform duration-300 ${openFaqIndex === idx ? "rotate-45" : "rotate-0"}`}>
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
                      <div className="pb-6 text-sm font-medium text-gray-500 leading-relaxed max-w-xl">
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
