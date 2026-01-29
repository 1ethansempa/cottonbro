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
    {
      n: 3,
      title: "Drop",
      desc: "Share your link. Cashless checkout. Mobile Money supported.",
    },
    {
      n: 4,
      title: "Earn",
      desc: "Track every order, revenue & payout in one place. Weekly settlements.",
    },
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
    <div className="font-urbanist bg-page text-primary min-h-screen selection:bg-gray-200 selection:text-black">
      <SiteHeader theme="light" />

      {/* HERO SECTION - Editorial Studio */}
      <section className="relative pt-48 pb-20 flex flex-col items-center justify-center overflow-hidden">
        <div className="mx-auto max-w-5xl px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-primary mb-8 leading-[0.9] select-none uppercase">
              Create.
              <br />
              <span className="text-gray-400">Wear. Sell.</span>
            </h1>

            <p className="text-lg md:text-xl text-secondary max-w-xl mx-auto mb-10 font-medium leading-relaxed">
              Design merch, launch a link, and we print + deliver in Kampala.
              <br className="hidden md:block" />
              No inventory. No limits. Just style.
            </p>

            <div className="flex flex-col items-center gap-8 mb-24">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <Link href="/auth/login">
                  <Button className="group rounded-full px-12 py-6 bg-primary text-white font-bold text-base tracking-widest uppercase hover:bg-black/90 hover:scale-[1.02] transition-all duration-200 ease-out cursor-pointer shadow-xl">
                    <span className="relative z-10">Start Creating</span>
                  </Button>
                </Link>
                <Link href="#how">
                  <span className="text-secondary font-bold tracking-wide text-sm hover:text-primary hover:underline underline-offset-4 decoration-1 decoration-gray-300 transition-all duration-200 cursor-pointer">
                    How it works
                  </span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* HERO IMAGE - Clean Visual */}
        <div className="relative w-full max-w-[1400px] px-6 mx-auto z-10 mt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          >
            <div className="relative rounded-sm overflow-hidden w-full aspect-video md:aspect-[21/9]">
              <Image
                src="/hero-1.png"
                alt="Cotton Bro Creator"
                fill
                className="object-cover"
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* PRODUCT GRID - Clean Reference Style */}
      <section className="pt-24 pb-24 bg-page">
        <div className="mx-auto max-w-[1400px] px-6">
          {/* Header & Filters */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8 border-b border-border-subtle pb-6">
            <div className="flex gap-8 items-center overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <h2 className="text-xl font-bold text-primary tracking-tight shrink-0 mr-4 uppercase">
                Trending Drops
              </h2>
              {["Most Popular", "Just Launched"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-base font-medium transition-colors duration-200 ease-out whitespace-nowrap relative ${activeTab === tab
                      ? "text-black"
                      : "text-secondary hover:text-primary"
                    }`}
                >
                  {tab}
                  {/* Underline Indicator */}
                  {activeTab === tab && (
                    <span className="absolute -bottom-7 md:-bottom-7 left-0 w-full h-0.5 bg-black" />
                  )}
                </button>
              ))}
            </div>

            <Link
              href="/products"
              className="hidden md:flex items-center gap-2 group"
            >
              <span className="text-sm font-bold uppercase tracking-widest text-primary group-hover:text-black transition-colors duration-200">
                Shop All Products
              </span>
              <svg
                className="w-4 h-4 text-primary group-hover:text-black transform group-hover:translate-x-1 transition-all duration-200"
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
                <div className="relative aspect-[3/4] w-full mb-4 overflow-hidden bg-silver/50">
                  <Image
                    src={product.img}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />

                  {/* Hover Interaction: Minimal Button */}
                  <div className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none pb-6">
                    <span className="bg-white text-black px-6 py-3 text-xs font-bold uppercase tracking-widest shadow-xl">
                      View Item
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-primary tracking-tight uppercase">
                    {product.name}
                  </h3>
                  <p className="text-sm text-secondary font-medium">
                    by <span className="text-primary">{product.creator}</span>
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
        className="py-24 relative text-center md:text-left bg-silver/30"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-24 flex flex-col md:flex-row justify-between items-end gap-8">
            <div>
              <h2 className="text-5xl md:text-6xl font-black text-primary mb-6 tracking-tight leading-none uppercase">
                The <span className="text-gray-400">Platform.</span>
              </h2>
              <p className="text-secondary text-xl max-w-md">
                Tools for the modern fashion entrepreneur.
              </p>
            </div>
            <div className="hidden md:block w-px h-24 bg-gray-200" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group pt-6 border-t border-gray-200 hover:border-black transition-colors duration-200 ease-out"
              >
                <div className="mb-6 text-black">{feature.icon}</div>
                <h3 className="text-lg font-black text-primary mb-3 tracking-wide uppercase">
                  {feature.title}
                </h3>
                <p className="text-secondary text-base leading-relaxed font-medium max-w-xs">
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
        className="py-24 bg-primary text-white relative overflow-hidden"
      >
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-24 items-center">
            <div className="lg:w-1/2 space-y-16">
              <div>
                <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight leading-[0.95] uppercase">
                  From Vision
                  <br />
                  <span className="text-gray-400">To Reality.</span>
                </h2>
                <p className="text-xl text-gray-400 font-medium max-w-md">
                  We handle the logistics. You own the brand.
                </p>
              </div>

              <div className="space-y-12">
                {steps.map((step) => (
                  <div
                    key={step.n}
                    className="group flex flex-col md:flex-row gap-6 md:gap-12 border-b border-white/10 pb-12 hover:border-white/30 transition-colors duration-200 ease-out cursor-default"
                  >
                    <div className="text-white/20 text-6xl md:text-7xl font-black font-mono leading-none tracking-tighter group-hover:text-white transition-all duration-200 ease-out">
                      0{step.n}
                    </div>
                    <div className="flex-1 pt-2">
                      <h4 className="text-3xl font-black text-white mb-2 tracking-tight uppercase">
                        {step.title}
                      </h4>
                      <p className="text-gray-400 text-lg font-medium max-w-sm">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-1/2 w-full sticky top-32">
              <div className="relative aspect-[3/4] w-full max-w-md mx-auto">
                <div className="relative h-full w-full bg-white/5 overflow-hidden group">
                  <Image
                    src="/img-2.png"
                    alt="App Interface"
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 ease-out"
                  />

                  <div className="absolute bottom-8 left-8">
                    <div className="bg-white p-6 max-w-xs shadow-2xl">
                      <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">
                        Success Story
                      </div>
                      <p className="text-primary font-bold leading-tight">
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
      <section id="pricing" className="py-24 relative bg-page">
        <div className="mx-auto max-w-5xl px-6 relative z-10">
          <div className="border border-gray-100 bg-white p-6 md:p-24 text-center relative overflow-hidden shadow-2xl">
            <h2 className="text-6xl md:text-9xl font-black text-primary mb-6 tracking-tighter">
              10k{" "}
              <span className="text-3xl md:text-5xl font-bold text-secondary align-top">
                UGX
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-secondary mb-8 font-medium max-w-xl mx-auto">
              Flat platform fee. <br />
              <span className="text-primary">
                Plus base cost. You set the price & keep the profit.
              </span>
            </p>

            <Link href="/auth/login">
              <Button className="w-full md:w-auto rounded-full px-6 md:px-16 py-6 bg-black hover:bg-gray-900 text-white font-bold text-sm md:text-lg tracking-widest uppercase transition-all duration-200 ease-out transform cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.02]">
                Open Your Studio
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ - Support */}
      <section className="py-24 bg-page">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-black text-primary tracking-tight uppercase">
              Help & Support
            </h2>
          </div>
          <div className="space-y-0">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border-t border-gray-100 overflow-hidden cursor-pointer group"
                onClick={() =>
                  setOpenFaqIndex(openFaqIndex === idx ? null : idx)
                }
              >
                <div className="py-8 flex justify-between items-center group-hover:bg-gray-50/50 px-4 transition-colors duration-200">
                  <h3 className="text-xl font-bold text-primary uppercase tracking-wide group-hover:text-black transition-colors duration-200">
                    {faq.q}
                  </h3>
                  <div
                    className={`transform transition-transform duration-300 ${openFaqIndex === idx ? "rotate-45" : "rotate-0"}`}
                  >
                    <svg
                      className="w-6 h-6 text-primary group-hover:text-black"
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
                  className={`px-4 text-secondary text-lg font-medium leading-relaxed overflow-hidden transition-all duration-300 ease-out ${openFaqIndex === idx
                      ? "max-h-40 pb-8 opacity-100"
                      : "max-h-0 opacity-0"
                    }`}
                >
                  {faq.a}
                </div>
              </div>
            ))}
            <div className="border-t border-gray-100" />
          </div>
        </div>
      </section>

      <SiteFooter theme="light" />
    </div>
  );
}
