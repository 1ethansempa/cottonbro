export default function Home() {
  return (
    <main className="min-h-dvh text-black">
      {" "}
      {/* Background */}{" "}
      <div
        className="fixed inset-0 -z-10 bg-[url('/cream-bg.png')] bg-cover bg-center bg-fixed"
        aria-hidden="true"
      />{" "}
      <div className="fixed inset-0 -z-10 bg-cream/90" aria-hidden="true" />{" "}
      {/* Hero */}{" "}
      <section className="mx-auto grid max-w-screen-xl grid-cols-1 gap-7 px-4 py-20 md:grid-cols-2">
        {" "}
        <div>
          {" "}
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-sm font-semibold shadow">
            {" "}
            Create • Sell • Get Paid{" "}
          </span>{" "}
          <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-[-0.02em] md:text-6xl">
            {" "}
            Design & promote your own merch — we handle everything else.{" "}
          </h1>{" "}
          <p className="mt-3 max-w-prose text-lg text-neutral-700">
            {" "}
            Create custom tee shirts, hoodies,beanies, sweatshirts, crop tops,
            tanks and more. Share your merch link, let fans order in their size
            with a realistic 3D preview, and get paid — we take care of
            printing, sales, and delivery.{" "}
          </p>{" "}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {" "}
            <a
              href="#signup"
              className="rounded-full bg-black px-6 py-3 font-bold text-white shadow hover:shadow-lg"
            >
              {" "}
              Start creating →{" "}
            </a>{" "}
            <a
              href="#live-demo"
              className="rounded-full border border-black/10 bg-white px-6 py-3 font-bold hover:shadow"
            >
              {" "}
              View demo{" "}
            </a>{" "}
          </div>{" "}
          <p className="mt-3 text-sm text-neutral-600">
            {" "}
            No upfront cost • We handle fulfillment{" "}
          </p>{" "}
        </div>{" "}
        {/* Mock preview */}{" "}
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-xl">
          {" "}
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-neutral-100">
            {" "}
            <div className="absolute left-4 top-4 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-semibold shadow">
              {" "}
              3D Fit Preview · Unisex M{" "}
            </div>{" "}
            <img
              src="/white-shirt.png"
              alt="3D preview of merch design on model"
              className="h-full w-full object-cover"
            />{" "}
          </div>{" "}
          <div className="mt-4 flex gap-3">
            {" "}
            <a
              href="#editor"
              className="rounded-full border border-black/10 bg-white px-4 py-2 font-bold hover:shadow"
            >
              {" "}
              Create Merch{" "}
            </a>{" "}
            <a
              href="#publish"
              className="rounded-full bg-black px-4 py-2 font-bold text-white shadow hover:shadow-lg"
            >
              {" "}
              Publish Link{" "}
            </a>{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
      {/* Features */}{" "}
      <section id="features" className="mx-auto max-w-screen-xl px-4">
        {" "}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {" "}
          {[
            {
              title: "Design your merch",
              copy: "Easily create and customize shirts, hoodies, crop tops, and more with your own assets and branding.",
            },
            {
              title: "3D fit preview",
              copy: "Visualize how your designs look on realistic 3D models across different sizes and styles.",
            },
            {
              title: "Publish your link",
              copy: "Share a private proof or public store link. Let your fans view, order, and pay instantly.",
            },
            {
              title: "Sell and earn",
              copy: "Set your prices and get paid automatically for every sale.",
            },
            {
              title: "We handle fulfillment",
              copy: "We take care of printing, packing, and shipping — so you can focus on your brand.",
            },
            {
              title: "Track your success",
              copy: "Monitor sales, orders, and payouts from your creator dashboard in real time.",
            },
          ].map((f) => (
            <article
              key={f.title}
              className="rounded-xl border border-black/10 bg-white p-5 shadow"
            >
              {" "}
              <h3 className="text-xl font-bold">{f.title}</h3>{" "}
              <p className="mt-1 text-neutral-700">{f.copy}</p>{" "}
            </article>
          ))}{" "}
        </div>{" "}
      </section>{" "}
      {/* How it works */}{" "}
      <section id="workflow" className="mx-auto max-w-screen-xl px-4 py-14">
        {" "}
        <h2 className="text-3xl font-extrabold">How it works</h2>{" "}
        <p className="mt-1 max-w-prose text-neutral-700">
          {" "}
          From idea to income in five steps.{" "}
        </p>{" "}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-5">
          {" "}
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
              className="rounded-xl border border-black/10 bg-white p-5 shadow"
            >
              {" "}
              <div className="mb-2 inline-grid size-9 place-items-center rounded-full border border-black/10 bg-cream font-extrabold">
                {" "}
                {s.n}{" "}
              </div>{" "}
              <h3 className="text-lg font-bold">{s.t}</h3>{" "}
              <p className="mt-1 text-neutral-700">{s.d}</p>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </section>{" "}
      {/* CTA */}{" "}
      <section id="publish" className="mx-auto max-w-screen-xl px-4 pb-16">
        {" "}
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-black/10 bg-gradient-to-b from-black/5 to-black/0 p-6 shadow md:flex-row md:items-center">
          {" "}
          <div>
            {" "}
            <h2 className="text-2xl font-extrabold">
              {" "}
              Start creating. Start selling.{" "}
            </h2>{" "}
            <p className="mt-1 text-neutral-700">
              {" "}
              Launch your first merch collection today — we’ll handle the
              rest.{" "}
            </p>{" "}
          </div>{" "}
          <a
            href="#signup"
            className="rounded-full bg-black px-5 py-3 font-bold text-white shadow hover:shadow-lg"
          >
            {" "}
            Create free account{" "}
          </a>{" "}
        </div>{" "}
      </section>{" "}
      {/* Footer */}{" "}
      <footer className="border-t border-black/10 bg-cream/40 backdrop-blur-sm">
        {" "}
        <div className="mx-auto max-w-screen-xl px-4 py-14">
          {" "}
          <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
            {" "}
            {/* Brand */}{" "}
            <div className="md:col-span-2">
              {" "}
              <div className="flex items-center gap-2 font-extrabold text-lg tracking-tight">
                {" "}
                <span
                  className="size-8 rounded-lg border border-black/10 shadow-inner"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 30%, #ffffff, #C8B89F)",
                  }}
                />{" "}
                Cottonbro{" "}
              </div>{" "}
              <p className="mt-3 max-w-sm text-sm text-neutral-700">
                {" "}
                Empowering creators to design, sell, and deliver merch
                effortlessly. We handle printing, fulfillment, and payouts — you
                focus on your brand.{" "}
              </p>{" "}
              {/* Social icons (optional) */}{" "}
              <div className="mt-4 flex gap-4">
                {" "}
                <a
                  href="https://twitter.com"
                  aria-label="Twitter"
                  className="text-neutral-600 transition hover:text-black"
                >
                  {" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-5"
                  >
                    {" "}
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.24 4.24 0 0 0 1.88-2.34 8.49 8.49 0 0 1-2.69 1.03 4.23 4.23 0 0 0-7.21 3.86 12 12 0 0 1-8.72-4.42 4.23 4.23 0 0 0 1.31 5.65 4.22 4.22 0 0 1-1.91-.52v.05a4.23 4.23 0 0 0 3.39 4.15 4.25 4.25 0 0 1-1.9.07 4.24 4.24 0 0 0 3.96 2.94A8.5 8.5 0 0 1 2 19.54a12 12 0 0 0 6.29 1.84c7.55 0 11.68-6.26 11.68-11.68v-.53A8.36 8.36 0 0 0 22.46 6z" />{" "}
                  </svg>{" "}
                </a>{" "}
                <a
                  href="https://instagram.com"
                  aria-label="Instagram"
                  className="text-neutral-600 transition hover:text-black"
                >
                  {" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="size-5"
                  >
                    {" "}
                    <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h10zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm4.5-.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z" />{" "}
                  </svg>{" "}
                </a>{" "}
              </div>{" "}
            </div>{" "}
            {/* Columns */}{" "}
            <div>
              {" "}
              <h4 className="text-sm font-bold uppercase tracking-wide text-neutral-800">
                {" "}
                Product{" "}
              </h4>{" "}
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                {" "}
                <li>
                  {" "}
                  <a href="#features" className="hover:text-black">
                    {" "}
                    Features{" "}
                  </a>{" "}
                </li>{" "}
                <li>
                  {" "}
                  <a href="#workflow" className="hover:text-black">
                    {" "}
                    How it works{" "}
                  </a>{" "}
                </li>{" "}
                <li>
                  {" "}
                  <a href="#publish" className="hover:text-black">
                    {" "}
                    Sell{" "}
                  </a>{" "}
                </li>{" "}
              </ul>{" "}
            </div>{" "}
            <div>
              {" "}
              <h4 className="text-sm font-bold uppercase tracking-wide text-neutral-800">
                {" "}
                Resources{" "}
              </h4>{" "}
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                {" "}
                <li>
                  {" "}
                  <a href="#live-demo" className="hover:text-black">
                    {" "}
                    Demo{" "}
                  </a>{" "}
                </li>{" "}
                <li>
                  {" "}
                  <a href="#templates" className="hover:text-black">
                    {" "}
                    Templates{" "}
                  </a>{" "}
                </li>{" "}
                <li>
                  {" "}
                  <a href="#docs" className="hover:text-black">
                    {" "}
                    Docs{" "}
                  </a>{" "}
                </li>{" "}
              </ul>{" "}
            </div>{" "}
            <div>
              {" "}
              <h4 className="text-sm font-bold uppercase tracking-wide text-neutral-800">
                {" "}
                Company{" "}
              </h4>{" "}
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                {" "}
                <li>
                  {" "}
                  <a href="#about" className="hover:text-black">
                    {" "}
                    About{" "}
                  </a>{" "}
                </li>{" "}
                <li>
                  {" "}
                  <a href="#careers" className="hover:text-black">
                    {" "}
                    Careers{" "}
                  </a>{" "}
                </li>{" "}
                <li>
                  {" "}
                  <a href="#contact" className="hover:text-black">
                    {" "}
                    Contact{" "}
                  </a>{" "}
                </li>{" "}
              </ul>{" "}
            </div>{" "}
          </div>{" "}
          {/* Divider */}{" "}
          <div className="mt-10 border-t border-black/10 pt-6 flex flex-col items-center justify-between gap-3 md:flex-row">
            {" "}
            <p className="text-sm text-neutral-600">
              {" "}
              © {new Date().getFullYear()} Cottonbro. All rights reserved.{" "}
            </p>{" "}
            <div className="flex gap-4 text-sm text-neutral-600">
              {" "}
              <a href="#privacy" className="hover:text-black">
                {" "}
                Privacy{" "}
              </a>{" "}
              <a href="#terms" className="hover:text-black">
                {" "}
                Terms{" "}
              </a>{" "}
              <a href="#cookies" className="hover:text-black">
                {" "}
                Cookies{" "}
              </a>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </footer>{" "}
    </main>
  );
}
