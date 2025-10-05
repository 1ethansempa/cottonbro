"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type ProductType = "tshirt" | "hoodie" | "sweatshirt" | "beanie" | "crop-top";
type PrintArea = "front" | "back" | "sleeve_left" | "sleeve_right" | "label";

const PRODUCT_TYPES: {
  value: ProductType;
  label: string;
  baseCost: number;
  artboardInches: [number, number];
}[] = [
  {
    value: "tshirt",
    label: "T-Shirt",
    baseCost: 9.5,
    artboardInches: [12, 16],
  },
  { value: "hoodie", label: "Hoodie", baseCost: 18, artboardInches: [12, 16] },
  {
    value: "sweatshirt",
    label: "Sweatshirt",
    baseCost: 16,
    artboardInches: [12, 16],
  },
  { value: "beanie", label: "Beanie", baseCost: 7, artboardInches: [4, 2.5] },
  {
    value: "crop-top",
    label: "Crop Top",
    baseCost: 12,
    artboardInches: [10, 12],
  },
];

const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const;
const COLORS = [
  { name: "Black", hex: "#111111" },
  { name: "White", hex: "#ffffff", ring: true },
  { name: "Heather Gray", hex: "#d1d5db" },
  { name: "Navy", hex: "#1f2937" },
  { name: "Forest", hex: "#065f46" },
] as const;

const PRINT_AREAS: { value: PrintArea; label: string }[] = [
  { value: "front", label: "Front" },
  { value: "back", label: "Back" },
  { value: "sleeve_left", label: "Left Sleeve" },
  { value: "sleeve_right", label: "Right Sleeve" },
  { value: "label", label: "Inside Label" },
];

export default function CreateProductPage() {
  // ----- FORM STATE -----
  const [title, setTitle] = useState("");
  const [productType, setProductType] = useState<ProductType>("tshirt");
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["S", "M", "L"]);
  const [selectedColors, setSelectedColors] = useState<string[]>([
    "Black",
    "White",
  ]);
  const [printAreas, setPrintAreas] = useState<PrintArea[]>(["front"]);
  const [baseCostOverride, setBaseCostOverride] = useState<string>("");
  const [margin, setMargin] = useState<string>("10");
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [designUrl, setDesignUrl] = useState<string>(""); // local preview
  const [description, setDescription] = useState("");

  // ----- DERIVED -----
  const productMeta = useMemo(
    () => PRODUCT_TYPES.find((p) => p.value === productType)!,
    [productType]
  );
  const actualBase =
    Number.isFinite(parseFloat(baseCostOverride)) && baseCostOverride !== ""
      ? Math.max(0, parseFloat(baseCostOverride))
      : productMeta.baseCost;

  const retail = useMemo(() => {
    const m = parseFloat(margin || "0");
    return Math.max(0, parseFloat((actualBase + m).toFixed(2)));
  }, [actualBase, margin]);

  // Artboard size for preview aspect
  const [artW, artH] = productMeta.artboardInches;
  const artboardAspect = artW / artH; // width:height

  // ----- HANDLERS -----
  const toggleSize = (s: string) =>
    setSelectedSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const toggleColor = (c: string) =>
    setSelectedColors((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );

  const toggleArea = (a: PrintArea) =>
    setPrintAreas((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );

  const onUpload = (file?: File) => {
    if (!file) return;
    setDesignFile(file);
    const url = URL.createObjectURL(file);
    setDesignUrl(url);
  };

  const onSubmit = async () => {
    // Fake submit; replace with your API call
    const payload = {
      title,
      productType,
      sizes: selectedSizes,
      colors: selectedColors,
      printAreas,
      baseCost: actualBase,
      margin: parseFloat(margin || "0"),
      retail,
      description,
      hasDesign: !!designFile,
    };
    console.log("Create product →", payload);
    alert("Product saved (console has payload). Connect your API next.");
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create a New Product
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Attach your design, pick variants, set price, and publish.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/products"
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            onClick={onSubmit}
            className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
          >
            Save product
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr,420px]">
        {/* Left: form */}
        <div className="space-y-6">
          {/* Basics */}
          <section className="rounded-lg border p-5">
            <h2 className="text-sm font-semibold text-gray-900">Basics</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Minimal Logo Tee"
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Product type
                </label>
                <select
                  value={productType}
                  onChange={(e) =>
                    setProductType(e.target.value as ProductType)
                  }
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  {PRODUCT_TYPES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Base cost defaults to provider; override if needed.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Base cost (USD)
                </label>
                <input
                  inputMode="decimal"
                  value={baseCostOverride}
                  onChange={(e) => setBaseCostOverride(e.target.value)}
                  placeholder={productMeta.baseCost.toFixed(2)}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave blank to use default: ${productMeta.baseCost.toFixed(2)}
                </p>
              </div>
            </div>
          </section>

          {/* Variants */}
          <section className="rounded-lg border p-5">
            <h2 className="text-sm font-semibold text-gray-900">Variants</h2>

            {/* Sizes */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Sizes
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSize(s)}
                    className={[
                      "rounded-md border px-3 py-1.5 text-sm",
                      selectedSizes.includes(s)
                        ? "bg-black text-white border-black"
                        : "bg-white hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">
                Colors
              </label>
              <div className="mt-2 flex flex-wrap gap-3">
                {COLORS.map((c) => {
                  const active = selectedColors.includes(c.name);
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => toggleColor(c.name)}
                      className={[
                        "flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm",
                        active
                          ? "bg-black text-white border-black"
                          : "bg-white hover:bg-gray-50",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "inline-block h-4 w-4 rounded ring-1",
                          //@ts-ignore
                          !!c.ring ? "ring-gray-300" : "ring-transparent",
                        ].join(" ")}
                        style={{ backgroundColor: c.hex }}
                      />
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Print areas */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">
                Print areas
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRINT_AREAS.map((a) => {
                  const active = printAreas.includes(a.value);
                  return (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => toggleArea(a.value)}
                      className={[
                        "rounded-md border px-3 py-1.5 text-sm",
                        active
                          ? "bg-black text-white border-black"
                          : "bg-white hover:bg-gray-50",
                      ].join(" ")}
                    >
                      {a.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="rounded-lg border p-5">
            <h2 className="text-sm font-semibold text-gray-900">Pricing</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Base cost
                </label>
                <div className="mt-1 flex items-center rounded-md border px-3 py-2 text-sm bg-gray-50">
                  ${actualBase.toFixed(2)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Creator margin
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    inputMode="decimal"
                    value={margin}
                    onChange={(e) => setMargin(e.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                  <span className="text-sm text-gray-500">$</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Your earnings per unit.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Retail price
                </label>
                <div className="mt-1 flex items-center rounded-md border px-3 py-2 text-sm font-semibold">
                  ${retail.toFixed(2)}
                </div>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="rounded-lg border p-5">
            <h2 className="text-sm font-semibold text-gray-900">Description</h2>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Tell buyers about fit, fabric, and care."
              className="mt-3 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </section>
        </div>

        {/* Right: design + preview */}
        <aside className="space-y-6">
          {/* Design upload */}
          <section className="rounded-lg border p-5">
            <h2 className="text-sm font-semibold text-gray-900">Artwork</h2>
            <p className="mt-1 text-xs text-gray-600">
              Upload SVG, PDF, EPS, or a PNG/JPG preview (300 DPI recommended
              for raster).
            </p>

            <div className="mt-3">
              <label className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                <input
                  type="file"
                  accept=".svg,.pdf,.eps,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => onUpload(e.target.files?.[0]!)}
                />
                <span>Upload file</span>
              </label>

              {designUrl && (
                <div className="mt-3 flex items-center justify-between rounded-md border bg-gray-50 px-3 py-2">
                  <span className="truncate text-sm text-gray-700">
                    {designFile?.name ?? "Artwork"}
                  </span>
                  <button
                    className="text-xs underline underline-offset-2"
                    onClick={() => {
                      if (designUrl) URL.revokeObjectURL(designUrl);
                      setDesignFile(null);
                      setDesignUrl("");
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Mockup / Safe zone preview */}
          <section className="rounded-lg border p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Preview</h2>
              <span className="text-xs text-gray-500">
                Artboard {productMeta.artboardInches[0]}″ ×{" "}
                {productMeta.artboardInches[1]}″
              </span>
            </div>

            <div className="mt-3">
              {/* Container keeps aspect ratio similar to artboard */}
              <div
                className="relative w-full border rounded-md bg-white overflow-hidden"
                style={{
                  aspectRatio: `${artboardAspect} / 1`,
                }}
              >
                {/* Safe zone (10% inset) */}
                <div className="absolute inset-[10%] rounded-sm ring-1 ring-gray-300 pointer-events-none" />
                {/* Mock garment bg */}
                <div className="absolute inset-0 grid place-items-center bg-gray-50">
                  <div className="relative h-[85%] w-[85%] rounded-md border bg-white grid place-items-center">
                    {!designUrl ? (
                      <span className="text-sm text-gray-400">
                        Your artwork will appear here
                      </span>
                    ) : (
                      // Render the uploaded raster preview; vector previews still show as browser can
                      <Image
                        src={designUrl}
                        alt="Design preview"
                        fill
                        sizes="400px"
                        className="object-contain p-6"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Print area badges */}
              <div className="mt-3 flex flex-wrap gap-2">
                {printAreas.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-gray-600"
                  >
                    {PRINT_AREAS.find((p) => p.value === a)?.label}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Actions */}
          <section className="rounded-lg border p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedSizes.length} sizes • {selectedColors.length} colors
              </div>
              <button
                onClick={onSubmit}
                className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
              >
                Save product
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
