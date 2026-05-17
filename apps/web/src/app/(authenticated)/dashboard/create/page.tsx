"use client";

import { useCallback, useRef, useState, type ElementType } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CloudUpload,
  Package,
  Shirt,
  X,
} from "lucide-react";
import {
  useCreateStore,
  type DesignFile,
  type MerchProduct,
} from "@/stores/create-store";

type FlowStep = "setup" | "preview";

const FLOW_STEPS: Array<{
  id: FlowStep;
  label: string;
  eyebrow: string;
  title: string;
}> = [
  {
    id: "setup",
    label: "Setup",
    eyebrow: "Create",
    title: "Artwork and products.",
  },
  {
    id: "preview",
    label: "Preview",
    eyebrow: "Review",
    title: "Ready to preview.",
  },
];

const PRODUCT_ICONS: Record<MerchProduct, ElementType> = {
  tee: Shirt,
  hoodie: Shirt,
  "crop-top": Shirt,
  sweatshirt: Shirt,
  beanie: Package,
};

const PRODUCT_LABELS: Record<MerchProduct, string> = {
  tee: "Heavy Tee",
  hoodie: "Hoodie",
  "crop-top": "Crop Top",
  sweatshirt: "Sweatshirt",
  beanie: "Beanie",
};

const ACCEPTED_DESIGN_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];

const MAX_DESIGN_SIZE_BYTES = 10 * 1024 * 1024;

export default function CreatePage() {
  const { design, selectedProducts, setDesign, clearDesign, toggleProduct } =
    useCreateStore();
  const [stepIndex, setStepIndex] = useState(0);

  const currentStep = FLOW_STEPS[stepIndex] ?? FLOW_STEPS[0]!;
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === FLOW_STEPS.length - 1;
  const canContinueFromSetup = Boolean(design && selectedProducts.length > 0);
  const nextDisabled = currentStep.id === "setup" && !canContinueFromSetup;

  function goBack() {
    setStepIndex((current) => Math.max(0, current - 1));
  }

  function goNext() {
    if (nextDisabled) return;
    setStepIndex((current) => Math.min(FLOW_STEPS.length - 1, current + 1));
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f9f9f9]">
      <section className="px-6 py-8 md:px-12 md:py-12 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8 border-b border-brand-gray pb-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
                  Create Product
                </p>
                <h1 className="text-4xl font-black uppercase leading-none tracking-tight text-primary md:text-6xl">
                  Create product.
                </h1>
                <p className="mt-5 max-w-2xl text-sm font-medium leading-6 text-secondary md:text-base">
                  Add artwork and choose products.
                </p>
              </div>

              <div className="min-w-[220px]">
                <p className="mb-3 text-right text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
                  Step {stepIndex + 1} of {FLOW_STEPS.length}
                </p>
                <div className="flex gap-2">
                  {FLOW_STEPS.map((step, index) => (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => {
                        if (index < stepIndex || index === 0) {
                          setStepIndex(index);
                        }
                      }}
                      className={`h-2 flex-1 cursor-pointer rounded-full transition-colors ${
                        index <= stepIndex ? "bg-primary" : "bg-brand-gray"
                      }`}
                      aria-label={step.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </header>

          <main className="rounded-[2rem] border border-brand-gray bg-white shadow-sm">
            <div className="min-h-[520px] p-6 md:p-8 lg:p-12">
              {currentStep.id === "setup" && (
                <ContinueStep
                  design={design}
                  selectedProducts={selectedProducts}
                  onUpload={setDesign}
                  onClearDesign={clearDesign}
                  onToggleProduct={toggleProduct}
                />
              )}

              {currentStep.id === "preview" && (
                <PreviewStep
                  design={design}
                  selectedProducts={selectedProducts}
                  onEdit={() => setStepIndex(1)}
                />
              )}
            </div>

            <footer className="flex flex-col gap-3 border-t border-brand-gray px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-8">
              <button
                type="button"
                onClick={goBack}
                disabled={isFirstStep}
                className="inline-flex cursor-pointer items-center justify-center gap-3 rounded-full border border-brand-gray bg-white px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </button>

              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                {currentStep.id === "setup" && !canContinueFromSetup && (
                  <p className="text-center text-[10px] font-bold uppercase tracking-[0.15em] text-secondary sm:text-right">
                    Add a design to preview
                  </p>
                )}
                <button
                  type="button"
                  onClick={goNext}
                  disabled={isLastStep || nextDisabled}
                  className="inline-flex cursor-pointer items-center justify-center gap-3 rounded-full bg-primary px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                >
                  {isLastStep ? "Final Step" : "Continue"}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </footer>
          </main>
        </div>
      </section>
    </div>
  );
}

function ContinueStep({
  design,
  selectedProducts,
  onUpload,
  onClearDesign,
  onToggleProduct,
}: {
  design: DesignFile | null;
  selectedProducts: MerchProduct[];
  onUpload: (file: DesignFile) => void;
  onClearDesign: () => void;
  onToggleProduct: (product: MerchProduct) => void;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <section>
        <div className="mb-6">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
            Artwork
          </p>
          <h3 className="text-3xl font-black uppercase tracking-tight text-primary">
            Design file
          </h3>
        </div>
        <DesignUploadZone
          design={design}
          onUpload={onUpload}
          onClear={onClearDesign}
        />
      </section>

      <section>
        <div className="mb-6">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
            Products
          </p>
          <h3 className="text-3xl font-black uppercase tracking-tight text-primary">
            Choose products
          </h3>
        </div>
        <ProductSelector
          selectedProducts={selectedProducts}
          onToggleProduct={onToggleProduct}
        />
      </section>
    </div>
  );
}

function ProductSelector({
  selectedProducts,
  onToggleProduct,
}: {
  selectedProducts: MerchProduct[];
  onToggleProduct: (product: MerchProduct) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {(Object.keys(PRODUCT_LABELS) as MerchProduct[]).map((product) => {
        const active = selectedProducts.includes(product);
        const Icon = PRODUCT_ICONS[product];
        return (
          <button
            key={product}
            type="button"
            onClick={() => onToggleProduct(product)}
            className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-5 text-left transition-all active:scale-[0.98] ${
              active
                ? "border-primary bg-primary text-white shadow-lg shadow-black/10"
                : "border-brand-gray bg-brand-offwhite text-primary hover:border-primary"
            }`}
          >
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                active ? "bg-white/20" : "bg-white"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold uppercase tracking-[0.15em]">
                {PRODUCT_LABELS[product]}
              </span>
              <span
                className={`mt-1 block text-[9px] font-bold uppercase tracking-[0.15em] ${
                  active ? "text-white/70" : "text-secondary"
                }`}
              >
                {active ? "Selected" : "Tap to select"}
              </span>
            </span>
            {active && (
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function PreviewStep({
  design,
  selectedProducts,
  onEdit,
}: {
  design: DesignFile | null;
  selectedProducts: MerchProduct[];
  onEdit: () => void;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
          Setup Complete
        </p>
        <h3 className="max-w-2xl text-4xl font-black uppercase leading-tight tracking-tight text-primary md:text-5xl">
          Ready to preview.
        </h3>
        <button
          type="button"
          onClick={onEdit}
          className="mt-10 inline-flex cursor-pointer items-center justify-center rounded-full border border-brand-gray bg-white px-7 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary transition-colors hover:border-primary"
        >
          Edit setup
        </button>
      </div>

      <aside className="rounded-3xl border border-brand-gray bg-brand-offwhite p-6">
        <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
          Current Setup
        </p>
        <div className="space-y-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-secondary">
              Design
            </p>
            <p className="mt-2 truncate text-sm font-bold text-primary">
              {design?.name ?? "No design added"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-secondary">
              Product Types
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedProducts.map((product) => (
                <span
                  key={product}
                  className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary"
                >
                  {PRODUCT_LABELS[product]}
                </span>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function DesignUploadZone({
  design,
  onUpload,
  onClear,
}: {
  design: DesignFile | null;
  onUpload: (file: DesignFile) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);

      if (!ACCEPTED_DESIGN_TYPES.includes(file.type)) {
        setError("Use a PNG, JPG, WebP, or SVG file.");
        return;
      }

      if (file.size > MAX_DESIGN_SIZE_BYTES) {
        setError("File must be under 10 MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        onUpload({
          name: file.name,
          type: file.type,
          sizeBytes: file.size,
          dataUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    },
    [onUpload],
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  if (design) {
    return (
      <div className="flex flex-col gap-5 rounded-3xl border border-brand-gray bg-brand-offwhite p-6 transition-all sm:flex-row sm:items-center">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-brand-gray bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={design.dataUrl}
            alt="Design preview"
            className="h-full w-full object-contain p-2"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-primary">
            {design.name}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              {design.type.split("/")[1]?.toUpperCase()}
            </span>
            <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              {formatFileSize(design.sizeBytes)}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-brand-gray bg-white text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white"
          aria-label="Remove design"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={`group flex cursor-pointer flex-col items-center justify-center gap-5 rounded-3xl border-2 border-dashed px-6 py-20 text-center transition-all duration-300 ${
          dragOver
            ? "scale-[0.99] border-primary bg-brand-offwhite"
            : "border-brand-gray bg-brand-offwhite hover:border-primary"
        }`}
      >
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 ${
            dragOver
              ? "scale-110 bg-primary text-white"
              : "bg-white text-primary group-hover:bg-primary group-hover:text-white"
          }`}
        >
          <CloudUpload className="h-10 w-10" aria-hidden="true" />
        </div>
        <div className="max-w-sm px-4">
          <p className="text-lg font-bold leading-tight text-primary">
            Drag and drop your design here or{" "}
            <span className="underline decoration-brand-gray decoration-2 underline-offset-4 transition-colors group-hover:decoration-primary">
              browse
            </span>
          </p>
          <p className="mt-3 text-xs font-bold uppercase tracking-wide text-secondary">
            PNG, JPG, WEBP, SVG · MAX 10MB
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.svg"
        className="hidden"
        onChange={onFileChange}
      />
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-accent"
        >
          <X className="h-3 w-3" />
          {error}
        </motion.div>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
