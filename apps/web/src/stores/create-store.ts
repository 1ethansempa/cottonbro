import { create } from "zustand";

/**
 * Merch creation flow — step 1 is design upload.
 * More steps will be added as the product flow expands.
 */

export type MerchProduct =
  | "tee"
  | "hoodie"
  | "crop-top"
  | "sweatshirt"
  | "beanie";

export type DesignFile = {
  name: string;
  type: string;
  sizeBytes: number;
  dataUrl: string;
};

type CreateStore = {
  // Step tracking
  step: number;

  // Step 1: design upload
  design: DesignFile | null;
  selectedProducts: MerchProduct[];
  uploading: boolean;
  uploadError: string | null;

  // Actions
  setDesign: (file: DesignFile) => void;
  clearDesign: () => void;
  toggleProduct: (product: MerchProduct) => void;
  setStep: (step: number) => void;
  reset: () => void;
};

const ALL_PRODUCTS: MerchProduct[] = [
  "tee",
  "hoodie",
  "crop-top",
  "sweatshirt",
  "beanie",
];

const initialState = {
  step: 1,
  design: null,
  selectedProducts: [...ALL_PRODUCTS] as MerchProduct[],
  uploading: false,
  uploadError: null,
};

export const useCreateStore = create<CreateStore>((set, get) => ({
  ...initialState,

  setDesign(file) {
    set({ design: file, uploadError: null });
  },

  clearDesign() {
    set({ design: null, uploadError: null });
  },

  toggleProduct(product) {
    const current = get().selectedProducts;
    const next = current.includes(product)
      ? current.filter((p) => p !== product)
      : [...current, product];

    // Keep at least one product selected
    if (next.length === 0) return;
    set({ selectedProducts: next });
  },

  setStep(step) {
    set({ step });
  },

  reset() {
    set(initialState);
  },
}));
