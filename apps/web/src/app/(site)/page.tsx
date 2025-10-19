"use client";

import React from "react";

export default function ModernHome() {
  const sampleProducts = [
    {
      id: "cottonbro-tee-white",
      name: "CottonBro Tee — White",
      price: "$29.99",
      imageUrl: "https://placehold.co/400x400.png?text=CottonBro+Tee+White",
    },
    {
      id: "cottonbro-hoodie-ivory",
      name: "CottonBro Hoodie — Ivory",
      price: "$59.99",
      imageUrl: "https://placehold.co/400x400.png?text=CottonBro+Hoodie+Ivory",
    },
    {
      id: "cottonbro-crop-top-sand",
      name: "CottonBro Crop Top — Sand",
      price: "$34.99",
      imageUrl: "https://placehold.co/400x400.png?text=CottonBro+Crop+Top+Sand",
    },
    {
      id: "cottonbro-beanie-navy",
      name: "CottonBro Beanie — Navy",
      price: "$19.99",
      imageUrl: "https://placehold.co/400x400.png?text=CottonBro+Beanie+Navy",
    },
    {
      id: "cottonbro-tank-emerald",
      name: "CottonBro Tank — Emerald",
      price: "$24.99",
      imageUrl: "https://placehold.co/400x400.png?text=CottonBro+Tank+Emerald",
    },
    {
      id: "cottonbro-sweatshirt-cream",
      name: "CottonBro Sweatshirt — Cream",
      price: "$49.99",
      imageUrl:
        "https://placehold.co/400x400.png?text=CottonBro+Sweatshirt+Cream",
    },
  ];

  return (
    <div className="relative min-h-dvh overflow-hidden bg-neutral-950 text-neutral-100">
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(1000px_600px_at_25%_0%,rgba(120,119,198,0.18),transparent_70%),radial-gradient(900px_600px_at_80%_20%,rgba(56,189,248,0.15),transparent_70%)]"
        aria-hidden="true"
      />
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 h-[28rem] w-[28rem] rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#5eead4,#818cf8,#ec4899,#fbbf24,#5eead4)] opacity-30 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 bg-black/40 backdrop-blur-[2px]"
        aria-hidden="true"
      />

      <section className="mx-auto max-w-screen-xl px-6 pb-32 pt-40 text-center">
        <h1 className="mx-auto max-w-4xl bg-gradient-to-r from-emerald-300 via-sky-400 to-purple-500 bg-clip-text text-5xl font-extrabold leading-tight tracking-tight text-transparent md:text-7xl">
          Design merch. We handle everything else.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-400">
          Create custom t‑shirts, hoodies, beanies and more. Set your price and
          share a link—our platform takes care of printing, sales and delivery.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#signup"
            className="rounded-full bg-gradient-to-r from-white to-neutral-200 px-7 py-3 text-base font-bold text-black shadow transition-transform duration-300 hover:scale-105 hover:shadow-lg"
          >
            Create Product →
          </a>
          <a
            href="#live-demo"
            className="rounded-full border border-white/20 bg-white/5 px-7 py-3 text-base font-bold text-neutral-100 transition-colors duration-300 hover:bg-white/10"
          >
            View Shop
          </a>
        </div>
        <div className="pointer-events-none mt-16">
          <img
            src="/hero.png"
            alt="CottonBro hero visual"
            className="mx-auto w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 object-cover shadow-xl"
          />
        </div>
      </section>

      <section id="shop" className="mx-auto max-w-screen-xl px-6 pb-24">
        <div className="relative mb-14 overflow-hidden rounded-3xl shadow-lg">
          <img
            src="/shop-hero.png"
            alt="Shop hero"
            className="h-72 w-full object-cover md:h-96"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
            <h2 className="text-3xl font-bold md:text-5xl">
              New Drop Incoming
            </h2>
            <a
              href="#collection"
              className="mt-4 rounded-full bg-gradient-to-r from-emerald-300 via-sky-400 to-purple-500 px-6 py-3 text-base font-semibold text-black shadow transition-transform duration-300 hover:scale-105 hover:shadow-lg"
            >
              Explore the Drop
            </a>
          </div>
        </div>

        <div
          id="collection"
          className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        >
          {sampleProducts.map((product) => (
            <div
              key={product.id}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white">
                  {product.name}
                </h3>
                <p className="mt-1 text-neutral-400">{product.price}</p>
              </div>
              <a
                href={`/product/${product.id}`}
                className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10"
                aria-label={`View ${product.name}`}
              />
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-screen-xl px-6 pb-24">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
            Everything you need to launch your merch brand
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-neutral-400">
            From design to delivery — CottonBro handles the hard parts so you
            can focus on your creativity.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              title: "Design your merch",
              copy: "Create and customize shirts, hoodies, crop tops and more with your own assets and branding.",
            },
            {
              title: "3D fit preview",
              copy: "See your designs come to life on realistic models across sizes and styles.",
            },
            {
              title: "Publish your link",
              copy: "Share a private proof or a public store link — let your fans order instantly.",
            },
            {
              title: "Sell and earn",
              copy: "Set your prices and get paid automatically for every sale.",
            },
            {
              title: "We handle fulfillment",
              copy: "We print, pack and ship — so you can focus on your brand.",
            },
            {
              title: "Track your success",
              copy: "Monitor sales and payouts from your dashboard in real time.",
            },
          ].map((f, i) => (
            <article
              key={f.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-md transition-transform duration-300 hover:-translate-y-1 hover:bg-white/10"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-300 via-sky-400 to-purple-500 text-base font-bold text-black shadow-inner">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {f.title}
                  </h3>
                  <p className="mt-1 text-neutral-400 leading-relaxed">
                    {f.copy}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-screen-xl px-6 pb-24">
        <h2 className="text-3xl font-extrabold md:text-4xl">How it works</h2>
        <p className="mt-2 max-w-prose text-neutral-300">
          From idea to income in five steps.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-5">
          {[
            {
              n: "1",
              t: "Create",
              d: "Design and customize your merch directly in the editor.",
            },
            {
              n: "2",
              t: "Preview",
              d: "See your product on a realistic 3D model in any size.",
            },
            {
              n: "3",
              t: "Publish",
              d: "Make your product live with a shareable private or public link.",
            },
            {
              n: "4",
              t: "Sell",
              d: "Fans browse, select size and purchase directly through your page.",
            },
            {
              n: "5",
              t: "Get Paid",
              d: "We print, pack, ship and send your earnings automatically.",
            },
          ].map((step) => (
            <div
              key={step.n}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left shadow transition-all duration-300 hover:-translate-y-1 hover:bg-white/10"
            >
              <div className="mb-3 inline-grid size-10 place-items-center rounded-full border border-white/10 bg-gradient-to-br from-emerald-300 via-sky-400 to-purple-500 text-lg font-extrabold text-black shadow-inner">
                {step.n}
              </div>
              <h3 className="text-lg font-bold">{step.t}</h3>
              <p className="mt-1 text-neutral-300">{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="publish" className="mx-auto max-w-screen-xl px-6 pb-24">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-transparent p-6 shadow md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-extrabold md:text-3xl">
              Start creating. Start selling.
            </h2>
            <p className="mt-1 text-neutral-300">
              Launch your first merch collection today — we’ll handle the rest.
            </p>
          </div>
          <a
            href="#signup"
            className="rounded-full bg-gradient-to-r from-emerald-300 via-sky-400 to-purple-500 px-6 py-3 text-base font-bold text-black shadow transition-transform duration-300 hover:scale-105 hover:shadow-lg"
          >
            Create free account
          </a>
        </div>
      </section>
    </div>
  );
}
