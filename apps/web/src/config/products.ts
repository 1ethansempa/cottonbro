
export type ProductType = "t-shirt" | "hoodie" | "crop-top";
export type ViewSide = "front" | "back";

export interface ProductDefinition {
  id: ProductType;
  name: string;
  description: string;
  colors: { name: string; value: string; mockup: string }[];
  aspectRatio: number; // width/height
  printArea: {
    width: number;
    height: number;
    top: number; // % from top
    left: number; // % from left
  };
  assets: {
    front: string;
    back: string;
  };
}

export const PRODUCTS: Record<ProductType, ProductDefinition> = {
  "t-shirt": {
    id: "t-shirt",
    name: "Classic Tee",
    description: "Heavyweight cotton, boxy fit.",
    colors: [
      { name: "White", value: "#ffffff", mockup: "/mockup-white-tee.png" },
      { name: "Black", value: "#000000", mockup: "/mockup-black-tee.png" },
      { name: "Heather Grey", value: "#a3a3a3", mockup: "/mockup-white-tee.png" },
      { name: "Street Red", value: "#b91c1c", mockup: "/mockup-black-tee.png" },
    ],
    aspectRatio: 0.8,
    printArea: { width: 300, height: 400, top: 120, left: 100 },
    assets: {
      front: "/mockup-white-tee.png",
      back: "/mockup-white-tee.png",
    },
  },
  "hoodie": {
    id: "hoodie",
    name: "Premium Hoodie",
    description: "French terry, slight crop.",
    colors: [
      { name: "White", value: "#ffffff", mockup: "/mockup-white-hoodie.png" },
      { name: "Black", value: "#000000", mockup: "/mockup-black-hoodie.png" },
      { name: "Charcoal", value: "#374151", mockup: "/mockup-black-hoodie.png" },
      { name: "Forest", value: "#14532d", mockup: "/mockup-black-hoodie.png" },
    ],
    aspectRatio: 0.85,
    printArea: { width: 280, height: 350, top: 140, left: 110 },
    assets: {
      front: "/mockup-white-hoodie.png",
      back: "/mockup-white-hoodie.png",
    },
  },
  "crop-top": {
    id: "crop-top",
    name: "Crop Top",
    description: "Ribbed fit, Y2K style.",
    colors: [
      { name: "White", value: "#ffffff", mockup: "/mockup-croptop-white.png" },
      { name: "Black", value: "#000000", mockup: "/mockup-croptop-black.png" },
      { name: "Pink", value: "#f472b6", mockup: "/mockup-croptop-white.png" },
      { name: "Baby Blue", value: "#60a5fa", mockup: "/mockup-croptop-white.png" },
    ],
    aspectRatio: 0.9,
    printArea: { width: 220, height: 280, top: 110, left: 140 },
    assets: {
      front: "/mockup-croptop-white.png",
      back: "/mockup-croptop-white.png",
    },
  },
};

