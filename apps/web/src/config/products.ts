
export type ProductType = "t-shirt" | "hoodie" | "crop-top";
export type ViewSide = "front" | "back";

export interface ProductDefinition {
  id: ProductType;
  name: string;
  description: string;
  colors: { name: string; value: string }[];
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
      { name: "White", value: "#ffffff" },
      { name: "Black", value: "#000000" },
      { name: "Heather Grey", value: "#a3a3a3" },
      { name: "Street Red", value: "#b91c1c" },
    ],
    aspectRatio: 0.8,
    printArea: { width: 300, height: 400, top: 120, left: 100 },
    assets: {
      front: "/product-1.png",
      back: "/product-1.png",
    },
  },
  "hoodie": {
    id: "hoodie",
    name: "Premium Hoodie",
    description: "French terry, slight crop.",
    colors: [
      { name: "White", value: "#ffffff" },
      { name: "Black", value: "#000000" },
      { name: "Charcoal", value: "#374151" },
      { name: "Forest", value: "#14532d" },
    ],
    aspectRatio: 0.85,
    printArea: { width: 280, height: 350, top: 140, left: 110 },
    assets: {
      front: "/product-4.png",
      back: "/product-4.png",
    },
  },
  "crop-top": {
    id: "crop-top",
    name: "Crop Top",
    description: "Ribbed fit, Y2K style.",
    colors: [
      { name: "White", value: "#ffffff" },
      { name: "Black", value: "#000000" },
      { name: "Pink", value: "#f472b6" },
      { name: "Baby Blue", value: "#60a5fa" },
    ],
    aspectRatio: 0.9,
    printArea: { width: 220, height: 280, top: 110, left: 140 },
    assets: {
      front: "/product-5.png",
      back: "/product-5.png",
    },
  },
};
