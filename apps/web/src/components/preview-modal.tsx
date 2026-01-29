"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { X, Move } from "lucide-react";
import { PRODUCTS, ProductType, ProductDefinition } from "../config/products";

interface PreviewModalProps {
    onClose: () => void;
    getDesignImage: () => string | null;
}

export function PreviewModal({ onClose, getDesignImage }: PreviewModalProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<any>(null);
    const designImageRef = useRef<any>(null);

    const [designUrl, setDesignUrl] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] =
        useState<ProductType>("t-shirt");
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [designPosition, setDesignPosition] = useState({
        left: 0,
        top: 0,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
    });

    const currentProduct = PRODUCTS[selectedProduct];
    const currentColor =
        currentProduct.colors.find((c) => c.value === selectedColor) ||
        currentProduct.colors[0];

    // Capture design on mount
    useEffect(() => {
        const url = getDesignImage();
        setDesignUrl(url);
        // Set default color
        setSelectedColor(currentProduct.colors[0]?.value || "");
    }, []);

    // Initialize Fabric canvas
    useEffect(() => {
        if (!canvasRef.current || !designUrl) return;

        let disposed = false;

        async function initCanvas() {
            const fabric = await import("fabric");
            if (disposed || !canvasRef.current) return;

            // Clean up existing canvas
            if (fabricCanvasRef.current) {
                fabricCanvasRef.current.dispose();
            }

            const canvas = new fabric.Canvas(canvasRef.current, {
                width: 400,
                height: 400,
                backgroundColor: "transparent",
                selection: false,
            });
            fabricCanvasRef.current = canvas;

            // Load mockup as background
            const mockupUrl = currentColor?.mockup || currentProduct.assets.front;

            try {
                const bgImg = await fabric.FabricImage.fromURL(mockupUrl);
                if (disposed) return;

                // Scale to fit canvas
                const scale = Math.min(400 / bgImg.width!, 400 / bgImg.height!);
                bgImg.scale(scale);
                bgImg.set({
                    left: 200,
                    top: 200,
                    originX: "center",
                    originY: "center",
                    selectable: false,
                    evented: false,
                });
                canvas.add(bgImg);
                canvas.sendObjectToBack(bgImg);

                // Load design image
                const designImg = await fabric.FabricImage.fromURL(designUrl!);
                if (disposed) return;

                // Scale design to reasonable size
                const designScale = Math.min(
                    150 / designImg.width!,
                    150 / designImg.height!,
                );
                designImg.scale(designScale);
                designImg.set({
                    left: 200,
                    top: 180,
                    originX: "center",
                    originY: "center",
                    cornerColor: "#00d4ff",
                    cornerStrokeColor: "#00d4ff",
                    borderColor: "#00d4ff",
                    cornerSize: 12,
                    transparentCorners: false,
                    cornerStyle: "circle",
                });
                canvas.requestRenderAll();

                designImageRef.current = designImg;
                canvas.add(designImg);
                canvas.setActiveObject(designImg);
                canvas.requestRenderAll();

                // Track position changes
                canvas.on("object:modified", (e: any) => {
                    if (e.target === designImg) {
                        setDesignPosition({
                            left: designImg.left || 0,
                            top: designImg.top || 0,
                            scaleX: designImg.scaleX || 1,
                            scaleY: designImg.scaleY || 1,
                            angle: designImg.angle || 0,
                        });
                    }
                });
            } catch (err) {
                console.error("Failed to load images:", err);
            }
        }

        initCanvas();

        return () => {
            disposed = true;
            if (fabricCanvasRef.current) {
                fabricCanvasRef.current.dispose();
                fabricCanvasRef.current = null;
            }
        };
    }, [designUrl, selectedProduct, selectedColor]);

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm animate-in fade-in duration-200 font-urbanist selection:bg-gray-200 selection:text-black">
            <div className="w-full h-full flex flex-col">
                {/* Header */}
                <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
                    <h2 className="text-xl font-bold text-black">
                        Preview on <span className="text-gray-400">Products</span>
                    </h2>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-500 hover:text-black transition-colors uppercase tracking-widest text-xs font-bold flex items-center gap-2"
                        >
                            <span className="text-lg">←</span> BACK TO EDITOR
                        </button>
                        <button
                            onClick={() => {
                                alert("Publish flow coming soon!");
                            }}
                            className="px-6 py-2 bg-black text-white font-bold rounded-full hover:bg-gray-900 transition-all hover:scale-[1.05] shadow-lg uppercase tracking-widest text-sm"
                        >
                            PUBLISH PRODUCTS
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar - Product Selection */}
                    <div className="w-64 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                            Products
                        </h3>
                        <div className="space-y-2">
                            {(Object.values(PRODUCTS) as ProductDefinition[]).map(
                                (product) => (
                                    <button
                                        key={product.id}
                                        onClick={() => {
                                            setSelectedProduct(product.id);
                                            setSelectedColor(product.colors[0]?.value || "");
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selectedProduct === product.id
                                                ? "border-black bg-black shadow-md"
                                                : "border-gray-200 bg-white hover:border-black hover:shadow-sm"
                                            }`}
                                    >
                                        <span
                                            className={`font-medium ${selectedProduct === product.id ? "text-white" : "text-black"}`}
                                        >
                                            {product.name}
                                        </span>
                                    </button>
                                ),
                            )}
                        </div>

                        {/* Colors */}
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 mt-6">
                            Colors
                        </h3>
                        <div className="grid grid-cols-4 gap-2">
                            {currentProduct.colors.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => setSelectedColor(color.value)}
                                    className={`w-10 h-10 rounded-lg border-2 transition-all ${selectedColor === color.value
                                            ? "border-black scale-110 shadow-sm"
                                            : "border-gray-200 hover:border-black"
                                        }`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Main Canvas Area */}
                    <div className="flex-1 flex flex-col items-center justify-center bg-gray-100/50 p-8">
                        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xl">
                            <canvas ref={canvasRef} className="rounded-xl bg-gray-50" />
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-gray-400 text-sm font-medium">
                            <Move className="w-4 h-4" />
                            <span>
                                Drag to position • Corners to resize • Top handle to rotate
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
