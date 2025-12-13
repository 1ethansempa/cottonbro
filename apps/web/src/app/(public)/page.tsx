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
    className="w-10 h-10 text-current"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
    />
  </svg>
);
const BoxIcon = () => (
  <svg
    className="w-10 h-10 text-current"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);
const MoneyIcon = () => (
  <svg
    className="w-10 h-10 text-current"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const SparklesIcon = () => (
  <svg
    className="w-10 h-10 text-current"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
    />
  </svg>
);

export default function LandingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("Most Popular");

  const products = [
    {
      id: 1,
      name: "Street Soul Shirt",
      creator: "Cotton Bro",
      price: "UGX 45,000",
      img: "/product-1.png",
    },
    {
      id: 2,
      name: "Mira Tee",
      creator: "Mira Studios",
      price: "UGX 85,000",
      img: "/product-2.png",
    },
    {
      id: 3,
      name: "Ribbed Beanie",
      creator: "Headwear Co",
      price: "UGX 35,000",
      img: "/product-3.png",
    },
    {
      id: 4,
      name: "Sweat Shirt",
      creator: "Urban Fits",
      price: "UGX 40,000",
      img: "/product-4.png",
    },
    {
      id: 5,
      name: "Happy Vibes Crop Top",
      creator: "Vibe Check",
      price: "UGX 45,000",
      img: "/product-5.png",
    },
    {
      id: 6,
      name: "Cargo Utility Pant",
      creator: "Utility Gear",
      price: "UGX 95,000",
      img: "/product-1.png",
    },
    {
      id: 7,
      name: "Graphic Art Tee",
      creator: "Art House",
      price: "UGX 50,000",
      img: "/product-2.png",
    },
    {
      id: 8,
      name: "Essential Zip-Up",
      creator: "Cotton Bro",
      price: "UGX 90,000",
      img: "/product-3.png",
    },
    {
      id: 9,
      name: "Running Short",
      creator: "Active Lab",
      price: "UGX 45,000",
      img: "/product-4.png",
    },
    {
      id: 10,
      name: "Performance Tank",
      creator: "Active Lab",
      price: "UGX 40,000",
      img: "/product-5.png",
    },
    {
      id: 11,
      name: "Relaxed Fit Chino",
      creator: "Urban Fits",
      price: "UGX 80,000",
      img: "/product-1.png",
    },
    {
      id: 12,
      name: "Vintage Crewneck",
      creator: "Cotton Bro",
      price: "UGX 75,000",
      img: "/product-2.png",
    },
  ];

  const features = [
    {
      title: "Design Studio",
      desc: "Pro tools. Zero learning curve. Build it fast.",
      icon: <PaletteIcon />,
    },
    {
      title: "Real Body 3D",
      desc: "Preview sizes S–XXL on real models. Front, back, and angles.",
      icon: <BoxIcon />,
    },
    {
      title: "Asset Protection",
      desc: "First-to-upload ownership. We protect your original designs.",
      icon: <MoneyIcon />,
    },
    {
      title: "Fulfillment",
      desc: "Printed locally. No imports. No customs delays.",
      icon: <SparklesIcon />,
    },
  ];

  const steps = [
    {
      n: 1,
      title: "Design",
      desc: "Create your piece using our studio tools.",
    },
    {
      n: 2,
      title: "Submit",
      desc: "Send your design for quality & safety review.",
    },
    { n: 3, title: "Drop", desc: "Share your link. Cashless checkout. Mobile Money supported." },
    { n: 4, title: "Earn", desc: "Track every order, revenue & payout in one place. Weekly settlements." },
  ];

  const faqs = [
    {
      q: "Skills Required?",
      a: "None. We provide the tools. You bring the vision.",
    },
    {
      q: "Inventory?",
      a: "Zero. We print on demand. Never overstock.",
    },
    { q: "Payouts?", a: "Weekly. Direct to Mobile Money." },
  ];

  return (
    <div className="font-urbanist bg-page text-primary min-h-screen selection:bg-cyan selection:text-black">
      <SiteHeader theme="dark" />

      {/* HERO SECTION - Centered Typography & Dashboard */}
      <section className="relative pt-48 pb-20 flex flex-col items-center justify-center overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[600px] bg-cyan/20 blur-[120px] rounded-full opacity-20 pointer-events-none" />

        <div className="mx-auto max-w-5xl px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white mb-8 leading-[0.9] select-none">
              Your Studio.
              <br />
              <span className="text-cyan">Your Brand.</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto mb-10 font-medium leading-relaxed">
              Design merch, launch a link, and we print + deliver in Kampala.
              <br className="hidden md:block" />
              No inventory. No limits. Just create.
            </p>

            <div className="flex flex-col items-center gap-8 mb-24">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <Link href="/auth/login">
                  <Button className="group rounded-full px-12 py-6 bg-white text-black font-bold text-base tracking-widest uppercase hover:bg-gray-200 hover:scale-[1.02] transition-all duration-200 ease-out cursor-pointer border border-transparent shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <span className="relative z-10">Open Studio</span>
                  </Button>
                </Link>
                <Link href="#how">
                  <span className="text-gray-400 font-bold tracking-wide text-sm hover:text-white hover:underline underline-offset-4 decoration-1 decoration-gray-500 transition-all duration-200 cursor-pointer">
                    See how it works
                  </span>
                </Link>
              </div>
              <p className="text-sm text-gray-500 font-medium max-w-sm mx-auto">
                Get a shareable checkout link for every design. <br className="hidden md:block" /> Ready for WhatsApp & Instagram.
              </p>
            </div>
          </motion.div>
        </div>

        {/* HERO IMAGE - Clean Visual */}
        <div className="relative w-full max-w-[1600px] px-6 mx-auto z-10 mt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          >
            <div className="relative rounded-3xl border border-white/10 overflow-hidden shadow-2xl group w-full aspect-video">
              <Image
                src="/hero-1.png"
                alt="Cotton Bro Creator"
                fill
                className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700 ease-in-out"
                priority
              />

              {/* Subtle Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

              {/* Optional: Floating CTA or Badge if needed, currently kept clean as requested */}
            </div>
          </motion.div>
        </div>
      </section>

      {/* PRODUCT GRID - Clean Reference Style */}
      <section className="pt-12 pb-24 bg-page border-b border-white/10">
        <div className="mx-auto max-w-[1400px] px-6">
          {/* Header & Filters */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
            <div className="flex gap-8 items-center overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <h2 className="text-xl font-bold text-white tracking-tight shrink-0 mr-4">
                Trending Creator Drops
              </h2>
              {["Most Popular", "Just Launched"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-base font-medium transition-colors duration-200 ease-out whitespace-nowrap relative ${activeTab === tab
                    ? "text-cyan drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                    : "text-gray-500 hover:text-cyan"
                    }`}
                >
                  {tab}
                  {/* Dot Indicator */}
                  {activeTab === tab && (
                    <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-cyan rounded-full shadow-[0_0_5px_#22d3ee]" />
                  )}
                </button>
              ))}
            </div>

            <Link
              href="/products"
              className="hidden md:flex items-center gap-2 group"
            >
              <span className="text-sm font-bold uppercase tracking-widest text-white group-hover:text-cyan transition-colors duration-200">
                Shop All Products
              </span>
              <svg
                className="w-4 h-4 text-white group-hover:text-cyan transform group-hover:translate-x-1 transition-all duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
            {products.map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer text-center"
              >
                <div className="relative aspect-[3/4] w-full mb-4 overflow-hidden bg-zinc-900 border border-white/5 group-hover:border-cyan/30 transition-colors duration-300">
                  <Image
                    src={product.img}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] opacity-90 group-hover:opacity-100"
                  />

                  {/* Hover Interaction: Circle Arrow */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="w-14 h-14 bg-cyan rounded-full shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center justify-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <svg
                        className="w-6 h-6 text-black"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="square"
                          strokeLinejoin="miter"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </div>
                  </div>


                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white tracking-tight group-hover:text-cyan transition-colors duration-200 uppercase">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-400 font-medium">
                    by <span className="text-gray-300">{product.creator}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES - The Lab */}
      <section
        id="features"
        className="py-20 relative text-center md:text-left bg-page"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-24 flex flex-col md:flex-row justify-between items-end gap-8">
            <div>
              <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-none uppercase">
                The{" "}
                <span className="text-cyan underline decoration-2 underline-offset-4 decoration-cyan/50">
                  Platform.
                </span>
              </h2>
              <p className="text-gray-400 text-xl max-w-md">
                Tools for the modern creator.
              </p>
            </div>
            <div className="hidden md:block w-px h-24 bg-white/10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group pt-6 border-t border-white/10 hover:border-cyan transition-colors duration-200 ease-out"
              >
                <div className="mb-6 text-cyan drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-black text-white mb-3 tracking-wide uppercase group-hover:text-cyan transition-colors duration-200">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-base leading-relaxed font-medium max-w-xs group-hover:text-gray-300">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - The Process */}
      <section
        id="how"
        className="py-20 bg-zinc-950 border-t border-white/5 relative overflow-hidden"
      >
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-24 items-center">
            <div className="lg:w-1/2 space-y-16">
              <div>
                <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight leading-[0.95]">
                  From Vision
                  <br />
                  <span className="text-cyan underline decoration-2 underline-offset-4 decoration-cyan/30">
                    To Reality.
                  </span>
                </h2>
                <p className="text-xl text-gray-400 font-medium max-w-md">
                  We handle the logistics. You own the brand.
                </p>
              </div>

              <div className="space-y-12">
                {steps.map((step) => (
                  <div
                    key={step.n}
                    className="group flex flex-col md:flex-row gap-6 md:gap-12 border-b border-white/5 pb-12 hover:border-cyan/50 transition-colors duration-200 ease-out cursor-default"
                  >
                    <div className="text-zinc-800 text-6xl md:text-7xl font-black font-mono leading-none tracking-tighter group-hover:text-cyan group-hover:drop-shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all duration-200 ease-out">
                      0{step.n}
                    </div>
                    <div className="flex-1 pt-2">
                      <h4 className="text-3xl font-black text-white mb-2 tracking-tight group-hover:translate-x-1 group-hover:text-cyan transition-all duration-200 ease-out uppercase">
                        {step.title}
                      </h4>
                      <p className="text-gray-500 text-lg font-medium max-w-sm group-hover:text-gray-400">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-1/2 w-full sticky top-32">
              <div className="relative aspect-[3/4] w-full max-w-md mx-auto">
                <div className="relative h-full w-full bg-zinc-900 border border-white/10 overflow-hidden group">
                  <Image
                    src="/img-2.png"
                    alt="App Interface"
                    fill
                    className="object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 ease-out"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                  <div className="absolute bottom-8 left-8">
                    <div className="bg-black/50 backdrop-blur-md border border-white/10 p-6 max-w-xs">
                      <div className="text-cyan text-xs font-bold uppercase tracking-widest mb-2">
                        Success Story
                      </div>
                      <p className="text-white font-bold leading-tight">
                        &quot;The quality is unmatched. My customers love the
                        heavyweight tees.&quot;
                      </p>
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
        className="py-24 relative bg-page border-t border-white/5"
      >
        <div className="mx-auto max-w-5xl px-6 relative z-10">
          <div className="border border-white/10 bg-zinc-900/50 p-6 md:p-24 text-center relative overflow-hidden group hover:border-cyan/30 transition-colors duration-500">


            <h2 className="text-6xl md:text-9xl font-black text-white mb-6 tracking-tighter drop-shadow-lg">
              10k{" "}
              <span className="text-3xl md:text-5xl font-bold text-gray-500 align-top">
                UGX
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 mb-8 font-medium max-w-xl mx-auto">
              Flat platform fee. <br />
              <span className="text-white">Plus base cost. You set the price & keep the profit.</span>
            </p>


            <Link href="/auth/login">
              <Button className="w-full md:w-auto rounded-full px-6 md:px-16 py-6 bg-cyan hover:bg-cyan-bold border border-transparent text-black font-bold text-sm md:text-lg tracking-widest uppercase transition-all duration-200 ease-out transform cursor-pointer shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-[1.02]">
                Open Your Studio
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ - Support */}
      <section className="py-20 bg-page border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-black text-white tracking-tight uppercase">
              Help & Support
            </h2>
          </div>
          <div className="space-y-0">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border-t border-white/10 overflow-hidden cursor-pointer group"
                onClick={() =>
                  setOpenFaqIndex(openFaqIndex === idx ? null : idx)
                }
              >
                <div className="py-8 flex justify-between items-center group-hover:bg-white/5 px-4 transition-colors duration-200">
                  <h3 className="text-xl font-bold text-white uppercase tracking-wide group-hover:text-cyan transition-colors duration-200">
                    {faq.q}
                  </h3>
                  <div
                    className={`transform transition-transform duration-300 ${openFaqIndex === idx ? "rotate-45" : "rotate-0"}`}
                  >
                    <svg
                      className="w-6 h-6 text-white group-hover:text-cyan"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                </div>
                <div
                  className={`px-4 text-gray-400 text-lg font-medium leading-relaxed overflow-hidden transition-all duration-300 ease-out ${openFaqIndex === idx
                    ? "max-h-40 pb-8 opacity-100"
                    : "max-h-0 opacity-0"
                    }`}
                >
                  {faq.a}
                </div>
              </div>
            ))}
            <div className="border-t border-white/10" />
          </div>
        </div>
      </section>

      <SiteFooter theme="dark" />
    </div>
  );
}
