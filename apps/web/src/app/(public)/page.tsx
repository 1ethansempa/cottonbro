"use client";

import { useState } from "react";
import { Button } from "@cottonbro/ui";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Icons - Silver/Chrome Aesthetic
const RocketIcon = () => (
  <svg className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);
const CubeIcon = () => (
  <svg className="w-6 h-6 text-silver drop-shadow-[0_0_8px_rgba(200,200,200,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);
const WalletIcon = () => (
  <svg className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);
const GlobeIcon = () => (
  <svg className="w-6 h-6 text-silver drop-shadow-[0_0_8px_rgba(200,200,200,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function LandingPage() {
  const [hoveredFaqIndex, setHoveredFaqIndex] = useState<number | null>(null);

  const features = [
    {
      title: "Launch Instantly",
      desc: "Upload art. Pick blanks. Go live. No tech skills needed.",
      icon: <RocketIcon />,
    },
    {
      title: "Zero Inventory",
      desc: "We print and ship. You never touch a box.",
      icon: <CubeIcon />,
    },
    {
      title: "Fast Payouts",
      desc: "Money in your account weekly. No holding periods.",
      icon: <WalletIcon />,
    },
    {
      title: "Kampala Wide",
      desc: "We handle delivery to your customers across Kampala.",
      icon: <GlobeIcon />,
    },
  ];

  const steps = [
    { n: 1, title: "Create", desc: "Premium blanks. Your vision." },
    { n: 2, title: "Preview", desc: "Realistic 3D mockups." },
    { n: 3, title: "Drop", desc: "Push to store instantly." },
    { n: 4, title: "Paid", desc: "We ship. You cash out." },
  ];

  const faqs = [
    { q: "Monthly fees?", a: "Zero. We only make money when you sell." },
    { q: "Shipping logistics?", a: "Handled completely by us. Delivery across Kampala." },
    { q: "Payout schedule?", a: "Weekly deposits to your preferred account." },
  ];

  return (
    <div className="font-urbanist bg-page text-primary min-h-screen selection:bg-white selection:text-black">
      <SiteHeader />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-40 lg:pb-40">
        {/* Silver Spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-spotlight opacity-50 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] pointer-events-none mix-blend-overlay" />

        <div className="mx-auto max-w-7xl px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >

            <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white mb-8 leading-[0.85] uppercase">
              Make. Sell.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
                Cash Out.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-secondary max-w-xl mx-auto mb-12 font-medium leading-relaxed">
              Your merch, your money. <span className="text-white">Zero fluff.</span><br />
              Built for creators who are ready to build an empire.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link href="/auth/login">
                <Button className="group relative overflow-hidden rounded-full px-12 py-6 bg-white text-black font-black text-lg tracking-wider hover:bg-neon-red hover:text-white transition-all duration-300 shadow-glow-silver hover:shadow-glow-red hover:scale-105">
                  <span className="relative z-10">START CREATING</span>
                </Button>
              </Link>
              <Link href="#how">
                <span className="text-secondary hover:text-white font-bold tracking-widest text-xs uppercase border-b border-transparent hover:border-white transition-all pb-1 cursor-pointer">
                  View Lookbook
                </span>
              </Link>
            </div>
          </motion.div>

          {/* Hero Visual - Chrome/Monochrome */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mt-24 relative max-w-5xl mx-auto"
          >
            {/* Chrome Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-xl opacity-50" />

            <div className="relative z-10 rounded-sm overflow-hidden border border-white/10 shadow-2xl bg-black group">
              <Image
                src="/test-hero-7.png"
                alt="Premium Merch"
                width={1200}
                height={800}
                className="w-full h-auto object-cover transition-all duration-700 ease-out"
                priority
              />

              {/* Overlay UI - Minimal */}
              <div className="absolute top-6 right-6 px-4 py-2 bg-black/80 backdrop-blur-md border border-white/20 text-xs font-mono text-white uppercase tracking-widest">
                {"/// LIVE_PREVIEW"}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES - High Gloss */}
      <section id="features" className="py-32 relative text-center md:text-left">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-24">
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tighter">
              Built for <span className="text-stroke-white text-transparent">Scale.</span>
            </h2>
            <p className="text-secondary text-xl max-w-xl mx-auto md:mx-0">
              A complete infrastructure stack. We handle the atoms, you handle the bits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-8 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/40 hover:bg-white/[0.05] backdrop-blur-md transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="w-12 h-12 flex items-center justify-center mb-8 bg-black border border-white/10 rounded-lg group-hover:border-white transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wide">{feature.title}</h3>
                <p className="text-secondary text-sm leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-32 bg-black border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col lg:flex-row gap-24 items-center">
            <div className="lg:w-1/2 space-y-16">
              <div>
                <h2 className="text-6xl md:text-8xl font-black text-white mb-8 uppercase leading-[0.8]">
                  Pure<br /><span className="text-secondary">Speed.</span>
                </h2>
                <p className="text-xl text-secondary font-medium max-w-md">
                  From design file to customer doorstep in record time.
                </p>
              </div>

              <div className="space-y-6">
                {steps.map((step) => (
                  <div key={step.n} className="group flex items-baseline gap-8 border-b border-white/10 pb-6 hover:border-white transition-colors duration-300 cursor-default">
                    <div className="text-secondary text-sm font-mono group-hover:text-white transition-colors">
                      0{step.n}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-white mb-1 uppercase tracking-tight">{step.title}</h4>
                      <p className="text-secondary text-sm">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-1/2 w-full">
              <div className="relative aspect-[4/5] w-full max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-sm" />
                <div className="relative h-full w-full border border-white/10 bg-black overflow-hidden shadow-2xl transition-all duration-700">
                  <Image
                    src="/test-img-2.png"
                    alt="App Interface"
                    fill
                    className="object-cover opacity-90 contrast-125"
                  />
                  <div className="absolute bottom-0 inset-x-0 p-8 bg-black/80 backdrop-blur-sm border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-secondary mb-1">Weekly Profit</p>
                        <p className="text-3xl font-mono text-white">$12,450.00</p>
                      </div>
                      <div className="px-3 py-1 bg-white text-black text-xs font-bold uppercase tracking-wider">
                        +42%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING - Black Card */}
      <section id="pricing" className="py-40 relative bg-black border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 relative z-10">
          <div className="border border-white/20 bg-black p-12 md:p-24 text-center shadow-[0_0_100px_rgba(255,255,255,0.05)] relative overflow-hidden group">
            {/* Shine Effect */}
            <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out" />

            <h2 className="text-6xl md:text-9xl font-black text-white mb-8 tracking-tighter">
              10k <span className="text-3xl md:text-5xl font-bold text-zinc-600 align-top">UGX</span>
            </h2>
            <p className="text-xl md:text-2xl text-white mb-16 font-medium max-w-xl mx-auto">
              Flat fee per item. <br />
              <span className="text-secondary">We take 5%. You keep the rest.</span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 text-left border-t border-b border-white/10 py-12">
              <div>
                <div className="text-white font-bold uppercase tracking-widest text-xs mb-2">No Fees</div>
                <p className="text-secondary text-sm">Pay only when you sell.</p>
              </div>
              <div>
                <div className="text-white font-bold uppercase tracking-widest text-xs mb-2">Kampala Delivery</div>
                <p className="text-secondary text-sm">We handle logistics.</p>
              </div>
              <div>
                <div className="text-white font-bold uppercase tracking-widest text-xs mb-2">Payouts</div>
                <p className="text-secondary text-sm">Paid weekly. Automatic.</p>
              </div>
            </div>

            <Link href="/auth/login">
              <Button className="w-full md:w-auto rounded-full px-16 py-6 bg-white hover:bg-neon-red text-black hover:text-white font-black text-lg tracking-widest shadow-glow-silver hover:shadow-glow-red transition-all transform hover:scale-105 uppercase">
                Launch Empire
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-32 border-t border-white/5 bg-page">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-4xl font-black text-white mb-16 text-center uppercase tracking-tight">Protocol Details</h2>
          <div className="space-y-px bg-white/10 border border-white/10">
            {faqs.map((f, i) => (
              <div key={i} className="bg-black group">
                <button
                  onClick={() => setHoveredFaqIndex(hoveredFaqIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-8 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-bold text-white uppercase tracking-wide text-sm">{f.q}</span>
                  <span className={`text-white transition-transform duration-300 ${hoveredFaqIndex === i ? "rotate-45 text-neon-red" : ""}`}>+</span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: hoveredFaqIndex === i ? "auto" : 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-8 pt-0 text-secondary leading-relaxed max-w-2xl">
                    {f.a}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
