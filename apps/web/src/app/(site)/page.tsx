export default function Home() {
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
    <div className="min-h-dvh text-neutral-100 bg-neutral-950">
      {/* Background */}
      <div
        className="fixed inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_20%_0%,rgba(120,119,198,0.12),transparent_60%),radial-gradient(900px_500px_at_80%_20%,rgba(56,189,248,0.12),transparent_60%)]"
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 -z-10 bg-black/40 backdrop-blur-[2px]"
        aria-hidden="true"
      />

      {/* Hero */}
      <section className="mx-auto max-w-screen-lg px-6 py-28 text-center">
        <h1 className="text-4xl font-semibold leading-tight tracking-[-0.02em] md:text-6xl">
          Design merch. We handle everything else.
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-400">
          Create custom t-shirts, hoodies, beanies, crop tops, and more. Let
          fans order in their size, and get paid. We take care of printing,
          sales, and delivery.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <a
            href="#signup"
            className="rounded-full bg-white px-6 py-3 font-bold text-black shadow hover:bg-neutral-200 hover:shadow-lg"
          >
            Create Product →
          </a>
          <a
            href="#live-demo"
            className="rounded-full border border-white/15 bg-white/5 px-6 py-3 font-bold hover:bg-white/10"
          >
            View Shop
          </a>
        </div>

        <div className="mt-16">
          <img
            src="/hero.png"
            alt="CottonBro hero visual"
            className="mx-auto w-full max-w-4xl rounded-2xl border border-white/10 bg-white/5 shadow-xl object-cover"
          />
        </div>
      </section>

      <section id="shop" className="mx-auto max-w-screen-xl px-6 py-24">
        {/* Hero / Promo Banner */}
        <div className="relative mb-12 overflow-hidden rounded-2xl shadow-lg">
          <img
            src="/shop-hero.png"
            alt="Shop hero"
            className="w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center">
            <h2 className="text-4xl font-bold text-white">New Drop Incoming</h2>
            <a
              href="#collection"
              className="mt-4 rounded-full bg-white px-6 py-3 text-black font-semibold hover:bg-neutral-200"
            >
              Explore the Drop
            </a>
          </div>
        </div>

        {/* Product Grid */}
        <div
          id="collection"
          className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        >
          {sampleProducts.map((product) => (
            <div
              key={product.id}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/10"
                aria-label={`View ${product.name}`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-screen-xl px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
            Everything you need to launch your merch brand
          </h2>
          <p className="mt-3 text-neutral-400 max-w-2xl mx-auto">
            From design to delivery — CottonBro handles the hard parts so you
            can focus on your creativity.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              title: "Design your merch",
              copy: "Create and customize shirts, hoodies, crop tops, and more with your own assets and branding.",
            },
            {
              title: "3D fit preview",
              copy: "See your designs come to life on realistic 3D models across sizes and styles.",
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
              copy: "We print, pack, and ship — so you can focus on your brand.",
            },
            {
              title: "Track your success",
              copy: "Monitor sales and payouts from your creator dashboard in real time.",
            },
          ].map((f, i) => (
            <article
              key={f.title}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-md transition-transform duration-300 hover:-translate-y-1 hover:bg-white/10"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-lg font-bold text-emerald-300">
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

      {/* How it works */}
      <section id="workflow" className="mx-auto max-w-screen-xl px-4 py-14">
        <h2 className="text-3xl font-extrabold">How it works</h2>
        <p className="mt-1 max-w-prose text-neutral-300">
          From idea to income in five steps.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-5">
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
              d: "Fans browse, select size, and purchase directly through your page.",
            },
            {
              n: "5",
              t: "Get Paid",
              d: "We print, pack, ship, and send your earnings automatically.",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="rounded-xl border border-white/10 bg-white/5 p-5 shadow"
            >
              <div className="mb-2 inline-grid size-9 place-items-center rounded-full border border-white/10 bg-white/5 font-extrabold">
                {s.n}
              </div>
              <h3 className="text-lg font-bold">{s.t}</h3>
              <p className="mt-1 text-neutral-300">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="publish" className="mx-auto max-w-screen-xl px-4 pb-16">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 shadow md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-extrabold">
              Start creating. Start selling.
            </h2>
            <p className="mt-1 text-neutral-300">
              Launch your first merch collection today — we’ll handle the rest.
            </p>
          </div>
          <a
            href="#signup"
            className="rounded-full bg-white px-5 py-3 font-bold text-black shadow hover:shadow-lg hover:bg-neutral-200"
          >
            Create free account
          </a>
        </div>
      </section>
    </div>
  );
}
