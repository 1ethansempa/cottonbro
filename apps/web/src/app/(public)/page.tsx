"use client";

import { useState } from "react";
import { Button } from "@cottonbro/ui";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Icons - Solid Creative Lab Aesthetic (Cyan/White)
const PaletteIcon = () => (
  <svg
    className="w-6 h-6 text-cyan drop-shadow-[0_0_8px_rgba(216,204,241,0.6)]"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
    />
  </svg>
);
const BoxIcon = () => (
  <svg
    className="w-6 h-6 text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);
const MoneyIcon = () => (
  <svg
    className="w-6 h-6 text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const SparklesIcon = () => (
  <svg
    className="w-6 h-6 text-cyan drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
    />
  </svg>
);

export default function LandingPage() {
  const [hoveredFaqIndex, setHoveredFaqIndex] = useState<number | null>(null);

  const features = [
    {
      title: "Design Studio",
      desc: "A powerful, drag-and-drop editor. Just like Canva, but for your clothes.",
      icon: <PaletteIcon />,
    },
    {
      title: "Real Body 3D",
      desc: "Preview your drops on diverse models and body types instantly.",
      icon: <BoxIcon />,
    },
    {
      title: "Private & Public Drops",
      desc: "Password protect your VIP launches or go public to the world.",
      icon: <MoneyIcon />,
    },
    {
      title: "Kampala Wide",
      desc: "We print, pack, and deliver to every corner of the city.",
      icon: <SparklesIcon />,
    },
  ];

  const steps = [
    { n: 1, title: "Design", desc: "Use our studio tools to create." },
    { n: 2, title: "Sample", desc: "Order a test print to perfect it." },
    { n: 3, title: "Drop", desc: "Share your link. Go viral." },
    { n: 4, title: "Paid", desc: "Weekly payouts to mobile money." },
  ];

  const faqs = [
    { q: "Do I need design skills?", a: "Not at all. Our studio makes it easy to remix templates." },
    {
      q: "What about inventory?",
      a: "Zero. We print on demand, one item at a time.",
    },
    { q: "How do I get paid?", a: "Directly to your Mobile Money or Bank Account every week." },
  ];

  return (
    <div className="font-urbanist bg-page text-primary min-h-screen selection:bg-cyan selection:text-black">
      <SiteHeader />

      {/* HERO SECTION - Solid Creative Lab Vibe */}
      <section className="relative overflow-hidden pt-32 pb-24 lg:pt-48 lg:pb-32">
        {/* Subtle Noise only - No Gradients */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.04] pointer-events-none mix-blend-overlay" />

        <div className="mx-auto max-w-7xl px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white mb-8 leading-[0.95] select-none">
              Your Studio.
              <br />
              <span className="text-cyan">
                Your Brand.
              </span>
            </h1>

            <p className="text-lg md:text-2xl text-secondary max-w-xl mx-auto mb-12 font-medium leading-relaxed">
              The easiest way to design and sell premium merch.
              <br />
              <span className="text-white">No inventory. No tech skills. Just create.</span>
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link href="/auth/login">
                <Button className="group relative overflow-hidden rounded-full px-12 py-6 bg-white text-black font-bold text-lg tracking-wide hover:bg-cyan transition-all duration-300 shadow-glow-cyan hover:shadow-cyan/50 hover:-translate-y-1 cursor-pointer">
                  <span className="relative z-10">Open Studio</span>
                </Button>
              </Link>
              <Link href="#how">
                <span className="text-secondary hover:text-white font-semibold tracking-wide text-sm border-b border-white/20 hover:border-cyan transition-all pb-1 cursor-pointer">
                  See how it works
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>



      {/* STUDIO PREVIEW SECTION - "The Editor" */}
      <section className="relative pb-32">
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative rounded-2xl border border-white/10 bg-black shadow-2xl overflow-hidden group hover:border-cyan/30 transition-colors duration-500"
          >
            {/* Editor Header Fake UI */}
            <div className="h-12 border-b border-white/10 bg-white/5 flex items-center px-4 justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="text-xs font-mono text-white/40">Untitled Drop_01</div>
              <div className="w-20" />
            </div>

            {/* Editor Body Fake UI */}
            <div className="grid grid-cols-12 min-h-[500px]">
              {/* Sidebar Tools */}
              <div className="col-span-2 border-r border-white/10 p-4 space-y-4 hidden md:block">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-full rounded bg-white/5 hover:bg-cyan/20 transition-colors" />
                ))}
              </div>

              {/* Canvas Area */}
              <div className="col-span-12 md:col-span-8 relative bg-dot-pattern flex items-center justify-center p-8 bg-black">
                <div className="relative w-full max-w-md aspect-[3/4] bg-transparent border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center group-hover:border-cyan/40 transition-colors">
                  <span className="text-white/20 font-bold text-xl group-hover:text-cyan/60 transition-colors">Drag Art Here</span>

                  {/* Floating Mockup Image */}
                  <Image
                    src="/img-1.png"
                    alt="T-Shirt Mockup"
                    width={400}
                    height={500}
                    className="absolute inset-0 w-full h-full object-contain p-4 drop-shadow-2xl hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0"
                  />
                </div>

                {/* Floating Tools UI */}
                <div className="absolute bottom-8 flex gap-2 bg-black px-4 py-2 rounded-full border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer" />
                  <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer" />
                  <div className="w-8 h-8 rounded-full bg-cyan hover:bg-cyan/80 cursor-pointer" />
                </div>
              </div>

              {/* Properties Panel */}
              <div className="col-span-2 border-l border-white/10 p-4 space-y-4 hidden md:block">
                <div className="h-4 w-1/2 rounded bg-white/10 mb-6" />
                <div className="h-24 w-full rounded bg-white/5" />
                <div className="h-24 w-full rounded bg-white/5" />
                <div className="h-10 w-full rounded bg-cyan/20 mt-auto" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>




      {/* FEATURES - The Lab */}
      <section
        id="features"
        className="py-32 relative text-center md:text-left bg-black"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-24 flex flex-col md:flex-row justify-between items-end gap-8">
            <div>
              <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-none">
                The <span className="text-cyan">Creative Lab.</span>
              </h2>
              <p className="text-secondary text-xl max-w-md">
                Everything you need to turn pixels into products.
              </p>
            </div>
            <div className="hidden md:block w-px h-24 bg-white/10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan/30 hover:bg-white/[0.04] transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
              >
                <div className="w-14 h-14 flex items-center justify-center mb-8 bg-black border border-white/10 rounded-xl group-hover:border-cyan/30 transition-colors shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-secondary text-sm leading-relaxed font-medium group-hover:text-gray-300 transition-colors">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - The Process */}
      <section id="how" className="py-32 bg-black border-t border-white/5 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-24 items-center">
            <div className="lg:w-1/2 space-y-16">
              <div>
                <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight leading-[0.95]">
                  From Vision
                  <br />
                  <span className="text-cyan">to Reality.</span>
                </h2>
                <p className="text-xl text-secondary font-medium max-w-md">
                  Skip the logistics. Focus on the art. We handle the rest.
                </p>
              </div>

              <div className="space-y-8">
                {steps.map((step) => (
                  <div
                    key={step.n}
                    className="group flex items-center gap-8 border-b border-white/5 pb-8 hover:border-cyan/50 transition-colors duration-500 cursor-default"
                  >
                    <div className="text-transparent text-4xl font-black bg-clip-text bg-gradient-to-br from-white/20 to-transparent group-hover:from-cyan group-hover:to-cyan transition-all font-mono">
                      0{step.n}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-white mb-1 tracking-tight group-hover:translate-x-2 transition-transform duration-300">
                        {step.title}
                      </h4>
                      <p className="text-secondary text-sm group-hover:translate-x-2 transition-transform duration-300 delay-75">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-1/2 w-full">
              <div className="relative aspect-[4/5] w-full max-w-md mx-auto perspective-1000">
                <div className="relative h-full w-full border border-white/10 bg-black rounded-2xl overflow-hidden shadow-2xl transition-all hover:scale-[1.02] duration-700 group hover:border-cyan/20">
                  <Image
                    src="/img-2.png"
                    alt="App Interface"
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute bottom-8 left-8 right-8 p-6 bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-white/70 mb-1">
                          Weekly Payout
                        </p>
                        <p className="text-3xl font-mono text-white tracking-tighter">
                          UGX 102,400
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING - The Pass */}
      <section
        id="pricing"
        className="py-40 relative bg-page border-t border-white/5"
      >
        <div className="mx-auto max-w-5xl px-6 relative z-10">
          <div className="border border-white/10 bg-black p-12 md:p-24 text-center shadow-glow-cyan rounded-3xl relative overflow-hidden group">

            <div className="inline-block px-4 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-bold tracking-widest text-secondary mb-8">
              Transparency Mode
            </div>

            <h2 className="text-6xl md:text-9xl font-black text-white mb-6 tracking-tighter">
              10k{" "}
              <span className="text-3xl md:text-5xl font-bold text-gray-500 align-top">
                UGX
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-secondary mb-16 font-medium max-w-xl mx-auto">
              Flat fee per item sold. <br />
              <span className="text-white">
                5% platform split. You keep the rest.
              </span>
            </p>

            <Link href="/auth/login">
              <Button className="w-full md:w-auto rounded-full px-16 py-6 bg-white hover:bg-cyan text-black font-bold text-lg tracking-wide shadow-glow-cyan transition-all transform hover:scale-105 cursor-pointer">
                Open Your Studio
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-32 border-t border-white/5 bg-page">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-4xl font-black text-white mb-16 text-center tracking-tight">
            Creator <span className='text-cyan'>Questions</span>
          </h2>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="group rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-cyan/20 transition-all overflow-hidden">
                <button
                  onClick={() =>
                    setHoveredFaqIndex(hoveredFaqIndex === i ? null : i)
                  }
                  className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
                >
                  <span className="font-bold text-white text-lg tracking-wide">
                    {f.q}
                  </span>
                  <span
                    className={`text-white/50 transition-transform duration-300 transform ${hoveredFaqIndex === i ? "rotate-45 text-cyan" : ""}`}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: hoveredFaqIndex === i ? "auto" : 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 text-secondary leading-relaxed">
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
