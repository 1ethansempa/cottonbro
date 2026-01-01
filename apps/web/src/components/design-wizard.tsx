"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Upload, Check, ArrowRight, ArrowLeft, AlertTriangle, Move } from "lucide-react";
import { PRODUCTS, ProductType, ProductDefinition } from "../config/products";
import { Canvas, FabricImage } from "fabric";
import { Logo } from "@cottonbro/ui";

type WizardStep = "choice" | "upload" | "preview" | "confirm";

interface DesignWizardProps {
    onComplete: (designUrl: string, selectedProducts: ProductType[], designPosition: DesignPosition) => void;
    onSkipToEditor: () => void;
}

interface DesignPosition {
    left: number;
    top: number;
    scaleX: number;
    scaleY: number;
    angle: number;
}

export default function DesignWizard({ onComplete, onSkipToEditor }: DesignWizardProps) {
    const [step, setStep] = useState<WizardStep>("choice");
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
    const [qualityPassed, setQualityPassed] = useState<boolean | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<ProductType>("t-shirt");
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [designPosition, setDesignPosition] = useState<DesignPosition>({
        left: 150, top: 150, scaleX: 0.5, scaleY: 0.5, angle: 0
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasElRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<Canvas | null>(null);
    const designObjRef = useRef<FabricImage | null>(null);

    const MIN_DIMENSION = 1000;
    const CANVAS_WIDTH = 500;
    const CANVAS_HEIGHT = 625; // 4:5 aspect ratio

    const currentProduct = PRODUCTS[selectedProduct];
    const currentColor = currentProduct.colors[selectedColorIndex] || currentProduct.colors[0];

    const handleFileSelect = useCallback((file: File) => {
        if (!file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;

            const img = new window.Image();
            img.onload = () => {
                const minSide = Math.min(img.width, img.height);
                setImageDimensions({ width: img.width, height: img.height });
                setQualityPassed(minSide >= MIN_DIMENSION);
                setUploadedImage(dataUrl);
                setStep("preview");
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (step !== "preview" || !canvasElRef.current || !uploadedImage || !currentColor) return;

        // Dispose existing canvas
        if (fabricCanvasRef.current) {
            fabricCanvasRef.current.dispose();
            fabricCanvasRef.current = null;
        }

        const canvas = new Canvas(canvasElRef.current, {
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            backgroundColor: "transparent",
            selection: true,
        });

        fabricCanvasRef.current = canvas;

        // Load mockup as background
        FabricImage.fromURL(currentColor.mockup).then((mockupImg) => {
            if (!mockupImg || !canvas) return;

            // Scale mockup to fit canvas
            const scale = Math.min(
                CANVAS_WIDTH / (mockupImg.width || 1),
                CANVAS_HEIGHT / (mockupImg.height || 1)
            );
            mockupImg.scale(scale);
            mockupImg.set({
                left: (CANVAS_WIDTH - (mockupImg.width || 0) * scale) / 2,
                top: (CANVAS_HEIGHT - (mockupImg.height || 0) * scale) / 2,
                selectable: false,
                evented: false,
            });
            canvas.add(mockupImg);
            canvas.sendObjectToBack(mockupImg);

            // Load user design
            FabricImage.fromURL(uploadedImage).then((designImg) => {
                if (!designImg) return;

                // Position in print area
                const printArea = currentProduct.printArea;
                const designScale = Math.min(
                    (printArea.width * scale) / (designImg.width || 1),
                    (printArea.height * scale) / (designImg.height || 1)
                ) * 0.4; // 40% of print area - smaller initial size

                designImg.set({
                    left: designPosition.left,
                    top: designPosition.top,
                    scaleX: designPosition.scaleX || designScale,
                    scaleY: designPosition.scaleY || designScale,
                    angle: designPosition.angle,
                    cornerColor: "#22D3EE",
                    cornerStyle: "circle",
                    borderColor: "#22D3EE",
                    transparentCorners: false,
                    centeredRotation: true,
                });

                designObjRef.current = designImg;
                canvas.add(designImg);
                canvas.setActiveObject(designImg);
                canvas.requestRenderAll();
            });
        });

        // Track position changes
        canvas.on("object:modified", (e) => {
            if (e.target === designObjRef.current) {
                setDesignPosition({
                    left: e.target.left || 0,
                    top: e.target.top || 0,
                    scaleX: e.target.scaleX || 1,
                    scaleY: e.target.scaleY || 1,
                    angle: e.target.angle || 0,
                });
            }
        });

        return () => {
            canvas.dispose();
            fabricCanvasRef.current = null;
        };
    }, [step, uploadedImage, currentColor?.mockup, selectedProduct]);

    useEffect(() => {
        if (step !== "preview" || !fabricCanvasRef.current || !currentColor) return;

        const canvas = fabricCanvasRef.current;
        const objects = canvas.getObjects();
        const mockup = objects.find(obj => obj !== designObjRef.current);

        if (mockup) {
            FabricImage.fromURL(currentColor.mockup).then((newMockup) => {
                if (!newMockup) return;

                const scale = Math.min(
                    CANVAS_WIDTH / (newMockup.width || 1),
                    CANVAS_HEIGHT / (newMockup.height || 1)
                );
                newMockup.scale(scale);
                newMockup.set({
                    left: (CANVAS_WIDTH - (newMockup.width || 0) * scale) / 2,
                    top: (CANVAS_HEIGHT - (newMockup.height || 0) * scale) / 2,
                    selectable: false,
                    evented: false,
                });

                canvas.remove(mockup);
                canvas.add(newMockup);
                canvas.sendObjectToBack(newMockup);
                canvas.requestRenderAll();
            });
        }
    }, [currentColor?.mockup, step]);

    // Guard after all hooks
    if (!currentColor) return null;

    return (
        <div className="min-h-screen bg-page text-white font-urbanist selection:bg-cyan selection:text-black">
            {/* Header */}
            <div className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="hover:opacity-80 transition-opacity">
                        <Logo size="md" color="white" fontClassName="font-bold tracking-tight" />
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <span className={step === "choice" ? "text-cyan" : ""}>Start</span>
                        <ArrowRight className="w-3 h-3" />
                        <span className={step === "upload" ? "text-cyan" : ""}>Upload</span>
                        <ArrowRight className="w-3 h-3" />
                        <span className={step === "preview" ? "text-cyan" : ""}>Preview</span>
                        <ArrowRight className="w-3 h-3" />
                        <span className={step === "confirm" ? "text-cyan" : ""}>Confirm</span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-16">
                {/* Step 1: Choice */}
                {step === "choice" && (
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-5xl font-black mb-6 tracking-tight">
                            Do you have a <span className="text-cyan">design</span> ready?
                        </h2>
                        <p className="text-xl text-zinc-400 mb-12">
                            Upload your artwork to preview on products, or create one in our editor.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => setStep("upload")}
                                className="px-8 py-4 bg-cyan text-black font-bold rounded-full hover:bg-cyan/90 transition-all hover:scale-[1.02] shadow-glow-cyan uppercase tracking-widest text-sm"
                            >
                                YES, I HAVE A DESIGN
                            </button>
                            <button
                                onClick={onSkipToEditor}
                                className="px-8 py-4 bg-zinc-800 text-white font-bold rounded-full hover:bg-zinc-700 transition-all border border-zinc-700 uppercase tracking-widest text-sm"
                            >
                                NO, CREATE IN EDITOR
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Upload */}
                {step === "upload" && (
                    <div className="max-w-xl mx-auto">
                        <button
                            onClick={() => setStep("choice")}
                            className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>

                        <h2 className="text-4xl font-black mb-4 tracking-tight">
                            Upload your <span className="text-cyan">design</span>
                        </h2>
                        <p className="text-zinc-400 mb-8">
                            For best quality, use an image at least {MIN_DIMENSION}px on the shortest side.
                        </p>

                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${isDragging
                                ? "border-cyan bg-cyan/10"
                                : "border-zinc-700 hover:border-zinc-500 bg-zinc-900/50"
                                }`}
                        >
                            <Upload className="w-12 h-12 mx-auto mb-4 text-zinc-500" />
                            <p className="text-lg font-medium text-white mb-2">
                                Drag & drop your image here
                            </p>
                            <p className="text-sm text-zinc-500">or click to browse</p>
                            <p className="text-xs text-zinc-600 mt-4">PNG, JPG, WebP supported</p>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                            className="hidden"
                        />
                    </div>
                )}

                {/* Step 3: Preview with Interactive Canvas */}
                {step === "preview" && uploadedImage && (
                    <div>
                        <button
                            onClick={() => setStep("upload")}
                            className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>

                        {/* Quality Warning */}
                        {qualityPassed === false && (
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-8 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-amber-400">Low Resolution Warning</p>
                                    <p className="text-sm text-zinc-400">
                                        Your image is {imageDimensions?.width}×{imageDimensions?.height}px.
                                        For best print quality, use at least {MIN_DIMENSION}px on the shortest side.
                                    </p>
                                </div>
                            </div>
                        )}

                        {qualityPassed === true && (
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-8 flex items-center gap-3">
                                <Check className="w-5 h-5 text-emerald-500" />
                                <p className="text-emerald-400">
                                    Great! Your image ({imageDimensions?.width}×{imageDimensions?.height}px) meets quality requirements.
                                </p>
                            </div>
                        )}

                        <h2 className="text-4xl font-black mb-4 tracking-tight">
                            Position your <span className="text-cyan">design</span>
                        </h2>
                        <p className="text-zinc-400 mb-8 flex items-center gap-2">
                            <Move className="w-4 h-4" /> Drag, resize, or rotate your design on the product
                        </p>

                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Interactive Canvas */}
                            <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 flex items-center justify-center p-4">
                                <canvas
                                    ref={canvasElRef}
                                    className="max-w-full"
                                />
                            </div>

                            {/* Product & Color Selection */}
                            <div className="space-y-8">
                                {/* Product Selection */}
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">
                                        Product Type
                                    </h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {(Object.values(PRODUCTS) as ProductDefinition[]).map((product) => (
                                            <button
                                                key={product.id}
                                                onClick={() => {
                                                    setSelectedProduct(product.id);
                                                    setSelectedColorIndex(0);
                                                }}
                                                className={`p-4 rounded-xl border text-center transition-all ${selectedProduct === product.id
                                                    ? "border-cyan bg-cyan/10 text-white"
                                                    : "border-zinc-700 hover:border-zinc-500 text-zinc-400"
                                                    }`}
                                            >
                                                <span className="font-bold text-sm">{product.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Color Selection */}
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">
                                        Color
                                    </h3>
                                    <div className="flex gap-3">
                                        {currentProduct.colors.map((color, idx) => (
                                            <button
                                                key={color.value}
                                                onClick={() => setSelectedColorIndex(idx)}
                                                className={`w-12 h-12 rounded-full border-2 transition-all ${selectedColorIndex === idx
                                                    ? "border-cyan scale-110"
                                                    : "border-zinc-600 hover:border-zinc-400"
                                                    }`}
                                                style={{ backgroundColor: color.value }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-4 space-y-3">
                                    <button
                                        onClick={() => setStep("confirm")}
                                        className="w-full px-8 py-4 bg-cyan text-black font-bold rounded-full hover:bg-cyan/90 transition-all hover:scale-[1.02] shadow-glow-cyan uppercase tracking-widest text-sm"
                                    >
                                        LOOKS GOOD! CONTINUE
                                    </button>
                                    <button
                                        onClick={() => {
                                            setUploadedImage(null);
                                            setStep("upload");
                                        }}
                                        className="w-full px-8 py-4 bg-zinc-800 text-white font-bold rounded-full hover:bg-zinc-700 transition-all border border-zinc-700"
                                    >
                                        Replace design
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Confirm */}
                {step === "confirm" && uploadedImage && (
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Check className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h2 className="text-5xl font-black mb-6 tracking-tight">
                            Ready to <span className="text-cyan">launch</span>!
                        </h2>
                        <p className="text-xl text-zinc-400 mb-12">
                            Your design is set. Choose which products to offer.
                        </p>
                        <button
                            onClick={() => onComplete(uploadedImage, [selectedProduct], designPosition)}
                            className="px-12 py-4 bg-cyan text-black font-bold rounded-full hover:bg-cyan/90 transition-all hover:scale-[1.02] shadow-glow-cyan text-lg uppercase tracking-widest"
                        >
                            PUBLISH PRODUCTS
                        </button>
                    </div>
                )}
            </div>
        </div >
    );
}
