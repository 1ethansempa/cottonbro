"use client";

import Link from "next/link";
import { ArrowUpRight, Plus } from "@phosphor-icons/react";

type DashboardProduct = {
  id: string;
  name: string;
  status: "draft" | "published";
  updatedAt: string;
  orders: number;
  revenue: string;
};

const products: DashboardProduct[] = [];

export default function DashboardPage() {
  if (products.length === 0) {
    return <CreateFirstProduct />;
  }

  return <ProductsDashboard products={products} />;
}

function CreateFirstProduct() {
  return (
    <div className="min-h-[calc(100vh-72px)] p-6 md:p-12 flex items-center">
      <section className="w-full border border-gray-200 rounded-3xl shadow-sm bg-gray-50 px-6 py-12 sm:px-10 md:px-14 md:py-16">
        <div className="max-w-2xl">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            Get started
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-black uppercase tracking-tight leading-none">
            Create your first product.
          </h1>
          <p className="mt-6 max-w-xl text-sm md:text-base font-medium leading-7 text-gray-500">
            Start with a product canvas, add your artwork, and prepare it for
            sale when you are ready.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/create-product"
              className="group inline-flex items-center justify-center gap-3 bg-black px-7 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80 rounded-full"
            >
              <Plus className="h-4 w-4" />
              Create Product
              <ArrowUpRight
                className="h-3.5 w-0 -translate-x-2 opacity-0 transition-all duration-300 group-hover:w-3.5 group-hover:translate-x-0 group-hover:opacity-100"
                weight="regular"
                aria-hidden="true"
              />
            </Link>
            <Link
              href="/design"
              className="inline-flex items-center justify-center border border-gray-200 bg-white px-7 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-black transition-colors hover:border-black rounded-full"
            >
              Open design tools
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductsDashboard({ products }: { products: DashboardProduct[] }) {
  const totalOrders = products.reduce((sum, product) => sum + product.orders, 0);

  return (
    <div className="p-6 md:p-12">
      <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            Products
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tight">
            Your products
          </h1>
          <p className="mt-2 max-w-lg text-sm font-medium leading-relaxed text-gray-500">
            Review drafts, track published products, and create the next item
            when you are ready.
          </p>
        </div>
        <Link
          href="/create-product"
          className="inline-flex items-center justify-center gap-2 bg-black px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80 rounded-full"
        >
          <Plus className="h-3.5 w-3.5" />
          New Product
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Metric label="Products" value={String(products.length)} />
        <Metric label="Orders" value={String(totalOrders)} />
        <Metric label="Revenue" value="UGX 0" />
      </div>

      <div className="overflow-hidden border border-gray-200 rounded-2xl">
        <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-gray-200 bg-gray-50 px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 md:grid-cols-[1fr_120px_120px_140px]">
          <span>Product</span>
          <span className="hidden md:block">Status</span>
          <span className="hidden md:block">Orders</span>
          <span>Updated</span>
        </div>
        {products.map((product) => (
          <div
            key={product.id}
            className="grid grid-cols-[1fr_auto] gap-4 border-b border-gray-100 px-5 py-5 last:border-b-0 md:grid-cols-[1fr_120px_120px_140px]"
          >
            <div>
              <p className="text-sm font-bold text-black">{product.name}</p>
              <p className="mt-1 text-xs font-medium text-gray-500 md:hidden">
                {product.status} · {product.orders} orders
              </p>
            </div>
            <span className="hidden text-xs font-bold uppercase tracking-[0.15em] text-gray-500 md:block">
              {product.status}
            </span>
            <span className="hidden text-sm font-bold text-black md:block">
              {product.orders}
            </span>
            <span className="text-xs font-medium text-gray-500">
              {product.updatedAt}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-200 rounded-2xl bg-gray-50 p-6">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
        {label}
      </span>
      <div className="mt-5 text-3xl font-black tracking-tight text-black">
        {value}
      </div>
    </div>
  );
}
