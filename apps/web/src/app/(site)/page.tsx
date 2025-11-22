"use client";

import { Logo } from "@cottonbro/ui";
import Link from "next/link";
import { useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from "framer-motion";

// --- 3D Components ---

function TiltCard({ children, className, intensity = 15 }: { children: React.ReactNode; className?: string; intensity?: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    // Calculate rotation based on mouse position relative to center
    x.set((clientY - centerY) / height * -intensity); // Rotate X (up/down tilt)
    y.set((clientX - centerX) / width * intensity);   // Rotate Y (left/right tilt)
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: mouseX,
        rotateY: mouseY,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  );
}

export default function SaaSBlackLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const nav = [
    { href: "#features", label: "Features" },
    { href: "#how", label: "How it works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
  ];

  const benefits = [
    { title: "Launch with confidence", copy: "Upload your design, pick a product, and publish once your design is approved." },
    { title: "Zero ops", copy: "We handle printing, packing, shipping, returns, and customer support behind the scenes." },
    { title: "Transparent earnings", copy: "Set your price and see your margin per item before going live." },
    { title: "3D previews", copy: "Realistic photo and 3D previews so you can sanity-check before launch." },
    { title: "Delivery around Kampala", copy: "Coverage across 40+ areas." },
    { title: "Simple payouts", copy: "Connect your account and get paid automatically every week." },
  ];

  const steps = [
    { n: 1, t: "Create", d: "Start with a template or upload artwork. Pick colors, sizes, variants." },
    { n: 2, t: "Preview", d: "Review photo & 3D mockups and confirm quality." },
    { n: 3, t: "Approval", d: "Submit your design for a final check before publishing." },
    { n: 4, t: "Publish", d: "Share a store link. We fulfill and you get paid." },
  ];

  const plans = [
    { name: "Starter", price: "$0", period: "forever", cta: "Get started", highlight: false, features: ["Unlimited products", "Basic mockups", "Standard support"] },
    { name: "Pro", price: "$29", period: "/month", cta: "Start free trial", highlight: true, features: ["3D fit previews", "Custom domains", "Priority support"] },
    { name: "Advanced", price: "$79", period: "/month", cta: "Contact sales", highlight: false, features: ["Bulk pricing", "Team access", "Dedicated manager"] },
  ];

  const testimonials = [
    { name: "Nia K.", role: "Artist", body: "Launched a capsule in a weekend. The previews looked exactly like the final pieces.", rotate: -2 },
    { name: "Tendo M.", role: "Creator", body: "No logistics, just design. Payouts arrive weekly without me touching anything.", rotate: 1 },
    { name: "Jonas O.", role: "Brand lead", body: "We swapped from spreadsheets to a single link. Conversion went up 18%.", rotate: -1 },
  ];

  const faqs = [
    { q: "Do I need to buy inventory?", a: "No. We print on demand after a customer orders, so there’s no upfront stock." },
    { q: "Where do you deliver?", a: "We currently deliver all around Kampala." },
    { q: "How do payouts work?", a: "Connect your account once. Earnings are paid out automatically every week." },
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
      <motion.div
        animate={mobileMenuOpen ? { scale: 0.92, opacity: 0.6, borderRadius: "20px" } : { scale: 1, opacity: 1, borderRadius: "0px" }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="bg-white min-h-dvh text-black antialiased selection:bg-street-red selection:text-white origin-top shadow-2xl"
      >
        {/* NAV */}
        <header className="sticky top-0 z-40 border-b border-black bg-white/90 backdrop-blur-md">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <Link href="#" className="flex items-center text-black">
              <Logo size="xl" color="current" fontClassName="font-jamino" />
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              {nav.map((n) => (
                <a key={n.href} href={n.href} className="text-sm font-bold uppercase tracking-widest text-black hover:text-street-red transition-colors">
                  {n.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <a href="/auth/login" className="text-sm font-bold uppercase tracking-widest text-black hover:text-street-red transition">
                Sign in
              </a>
              <a href="/auth/login" className="bg-black border-2 border-black px-6 py-2 text-sm font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition">
                Create account
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button className="flex md:hidden flex-col gap-1.5 p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <div className={`h-0.5 w-6 bg-black transition-transform ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <div className={`h-0.5 w-6 bg-black transition-opacity ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <div className={`h-0.5 w-6 bg-black transition-transform ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </nav>
        </header>

        {/* HERO */}
        <section className="relative overflow-hidden border-b border-black pt-12 pb-24 md:pt-32 perspective-1000">
          {/* Subtle Parallax Background */}
          <motion.div style={{ y: heroParallax }} className="absolute inset-0 pointer-events-none opacity-[0.03] z-0">
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
              <h1 className="font-jamino uppercase leading-[0.9] tracking-tighter text-black text-[12vw] md:text-[8vw] lg:text-[6vw] xl:text-8xl break-words w-full">
                Built for
                <br />
                <span className="text-street-red flex">Creators</span>
              </h1>
              <p className="mt-8 max-w-md text-lg font-medium leading-relaxed text-black">
                Turn your ideas into real merch. You create; we handle printing,
                packing, delivery, and payouts — end to end.
              </p>

              <div className="mt-12 flex flex-wrap items-center gap-6">
                <a href="/auth/login" className="bg-black border-2 border-black px-8 py-4 text-base font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                  Start free
                </a>
                <a href="#demo" className="border-b-2 border-black pb-1 text-base font-bold uppercase tracking-widest text-black hover:text-street-red hover:border-street-red transition">
                  View demo
                </a>
              </div>
            </motion.div>

            {/* Right: 3D Tilt Image */}
            <div className="relative perspective-1000">
              <TiltCard className="relative z-10 cursor-pointer group" intensity={20}>
                {/* Card Stack Effect */}
                <div className="absolute -inset-4 bg-black/5 border border-black/10 translate-z-[-20px] rounded-sm" />
                <div className="absolute -inset-2 bg-black/10 border border-black/20 translate-z-[-10px] rounded-sm" />
                
                <motion.div 
                  className="relative aspect-[4/5] overflow-hidden border-2 border-black bg-zinc-100 shadow-2xl"
                  style={{ transformStyle: "preserve-3d" }}
                  // Floating animation for mobile/idle
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                >
                  <img
                    src="/test-hero-5.png"
                    alt="CottonBro preview"
                    className="block h-full w-full object-cover grayscale group-hover:grayscale-0 transition duration-500"
                  />
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay" />
                </motion.div>
              </TiltCard>
            </div>
          </div>
        </section>

        {/* BENEFITS ("The Studio") */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-32 border-b border-black">
          <div className="mb-16 md:mb-24">
            <h2 className="font-jamino text-6xl uppercase text-black md:text-8xl">The Studio</h2>
            <p className="mt-6 max-w-xl text-xl font-bold text-black">
              Everything you need to run a professional merch brand, minus the logistics headache.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:grid-rows-2 perspective-1000">
            {benefits.map((f, i) => (
              <TiltCard 
                key={f.title}
                className={[
                  "group relative flex flex-col justify-between bg-white p-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                  i === 0 || i === 3 ? "md:col-span-2" : "",
                ].join(" ")}
                intensity={5} // Subtle tilt for grid items
              >
                <motion.div 
                  className="h-full flex flex-col justify-between"
                  style={{ transformStyle: "preserve-3d" }}
                  whileHover={{ translateZ: 20 }} // Lift content on hover
                >
                  <div>
                    <h3 className="font-jamino text-3xl uppercase text-black group-hover:text-street-red transition-colors">{f.title}</h3>
                    <p className="mt-4 max-w-sm text-black font-medium">{f.copy}</p>
                  </div>
                </motion.div>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="mx-auto max-w-7xl px-6 py-32 border-b border-black">
          <div className="mb-16">
            <h2 className="font-jamino text-6xl uppercase text-black md:text-8xl">How it works</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4 perspective-1000">
            {steps.map((s, i) => (
              <motion.div 
                key={s.n} 
                initial={{ opacity: 0, y: 50, rotateX: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
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
                <h3 className="text-xl font-bold uppercase text-black">{s.t}</h3>
                <p className="text-sm font-medium leading-relaxed text-black">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="mx-auto max-w-7xl px-6 py-32 border-b border-black">
          <div className="mb-16 text-center">
            <h2 className="font-jamino text-6xl uppercase text-black md:text-8xl">Pricing</h2>
            <p className="mt-6 text-xl font-bold text-black">Clear plans with creator-friendly fees.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 items-start perspective-1000">
            {plans.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: p.highlight ? 1.05 : 1.02, 
                  rotateY: p.highlight ? 5 : 2,
                  rotateX: p.highlight ? 5 : 2,
                  zIndex: 10 
                }}
                className={[
                  "flex flex-col border-2 border-black p-8 transition-all duration-300 transform-style-3d",
                  p.highlight
                    ? "bg-black text-white shadow-[12px_12px_0px_0px_#D90429] -translate-y-4 z-10"
                    : "bg-white text-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
                ].join(" ")}
              >
                <h3 className="mb-2 text-xl font-bold uppercase tracking-widest">{p.name}</h3>
                <div className="mb-6 flex items-end gap-1">
                  <span className="text-5xl font-jamino">{p.price}</span>
                  <span className={["pb-1 text-sm font-medium", p.highlight ? "text-zinc-400" : "text-zinc-500"].join(" ")}>{p.period}</span>
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
                      ? "bg-street-red border-street-red text-white hover:bg-white hover:text-street-red shadow-lg"
                      : "border-black bg-transparent hover:bg-black hover:text-white",
                  ].join(" ")}
                >
                  {p.cta}
                </a>
              </motion.div>
            ))}
          </div>

          {/* TESTIMONIALS (Polaroid Effect) */}
          <div className="mt-32">
            <h3 className="mb-12 text-center font-jamino text-4xl uppercase text-black md:text-5xl">Loved by people worldwide</h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 perspective-1000">
              {testimonials.map((t, i) => (
                <motion.figure
                  key={t.name}
                  initial={{ opacity: 0, rotate: t.rotate }}
                  whileInView={{ opacity: 1 }}
                  whileHover={{ rotate: 0, scale: 1.05, zIndex: 10, boxShadow: "0px 20px 40px rgba(0,0,0,0.2)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                  viewport={{ once: true }}
                  className="border-2 border-black bg-white p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] origin-center cursor-default"
                >
                  <div className="flex gap-1 text-street-red mb-4">
                    {[1,2,3,4,5].map(star => <span key={star}>★</span>)}
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
          <h2 className="mb-12 font-jamino text-5xl uppercase text-black text-center md:text-7xl">FAQ</h2>
          <div className="divide-y divide-black border-y border-black">
            {faqs.map((f) => (
              <details key={f.q} className="group py-8">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="text-xl font-bold text-black uppercase group-hover:text-street-red transition-colors">{f.q}</span>
                  <span className="text-street-red transition group-open:rotate-45 text-2xl">+</span>
                </summary>
                <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4 text-lg font-medium text-black">
                  {f.a}
                </motion.p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA (3D Slab) */}
        <section className="mx-auto max-w-7xl px-6 py-32 perspective-1000">
          <TiltCard intensity={10} className="w-full">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              // Floating loop
              animate={{ y: [0, -10, 0] }}
              transition={{ y: { repeat: Infinity, duration: 5, ease: "easeInOut" } }}
              className="flex flex-col items-center justify-center gap-8 border-4 border-black bg-white p-12 text-center shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transform-style-3d"
            >
              <div style={{ transform: "translateZ(20px)" }}>
                <h2 className="font-jamino text-5xl uppercase text-black md:text-7xl">Ready to launch?</h2>
                <p className="mt-4 text-xl font-bold text-black">Join the new wave of creators.</p>
              </div>
              <motion.a
                href="/auth/login"
                whileHover={{ scale: 1.05, translateZ: 30 }}
                whileTap={{ scale: 0.95, translateZ: 10 }}
                className="bg-black border-2 border-black px-10 py-5 text-lg font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition shadow-xl"
                style={{ transformStyle: "preserve-3d" }}
              >
                Create free account
              </motion.a>
            </motion.div>
          </TiltCard>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-black bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-16 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1 text-black">
              <Logo size="md" color="current" fontClassName="font-jamino" />
              <p className="mt-4 text-sm font-bold text-black">CottonBro handles the heavy lifting so you can focus on the art.</p>
            </div>
            {/* ... Footer links ... */}
            <div>
              <div className="mb-4 text-sm font-bold uppercase tracking-widest text-black">Product</div>
              <ul className="space-y-2 text-sm font-medium text-black">
                <li><a href="#features" className="hover:text-street-red transition-colors">Features</a></li>
                <li><a href="#how" className="hover:text-street-red transition-colors">How it works</a></li>
                <li><a href="#faq" className="hover:text-street-red transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <div className="mb-4 text-sm font-bold uppercase tracking-widest text-black">Company</div>
              <ul className="space-y-2 text-sm font-medium text-black">
                <li><a href="#" className="hover:text-street-red transition-colors">About</a></li>
                <li><a href="#" className="hover:text-street-red transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-street-red transition-colors">Privacy</a></li>
              </ul>
            </div>
            <div>
              <div className="mb-4 text-sm font-bold uppercase tracking-widest text-black">Newsletter</div>
              <form className="flex flex-col gap-2">
                <input type="email" placeholder="Email address" className="w-full border-2 border-black bg-white px-3 py-2 text-sm text-black outline-none placeholder:text-zinc-400 focus:border-street-red transition" />
                <button className="w-full bg-black border-2 border-black px-3 py-2 text-sm font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition">Subscribe</button>
              </form>
            </div>
          </div>
          <div className="border-t border-black py-8 text-center text-xs font-bold uppercase tracking-widest text-black">
            © {new Date().getFullYear()} CottonBro. All rights reserved.
          </div>
        </footer>
      </motion.div>

      {/* Fixed Mobile Menu Overlay (Outside the scaled wrapper) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, z: -100, scale: 0.9 }}
            animate={{ opacity: 1, z: 0, scale: 1 }}
            exit={{ opacity: 0, z: -100, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] bg-white/95 backdrop-blur-lg w-screen h-screen overflow-y-auto md:hidden"
          >
            <div className="flex flex-col h-full p-6">
              <div className="flex justify-between items-center mb-8">
                <Logo size="xl" color="current" fontClassName="font-jamino" />
                <button onClick={() => setMobileMenuOpen(false)} className="p-2" aria-label="Close menu">
                  <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-col gap-6 items-center text-center">
                {nav.map((n) => (
                  <a key={n.href} href={n.href} onClick={() => setMobileMenuOpen(false)} className="text-3xl font-jamino uppercase text-black hover:text-street-red transition-colors">
                    {n.label}
                  </a>
                ))}
              </div>
              <div className="mt-auto flex flex-col gap-4 pb-8">
                <a href="/auth/login" className="text-xl font-bold uppercase tracking-widest text-black text-center hover:text-street-red transition">Sign in</a>
                <a href="/auth/login" className="bg-black border-2 border-black px-6 py-4 text-center text-xl font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition">Create account</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
