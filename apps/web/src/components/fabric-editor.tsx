"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Type,
  Download,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Upload,
  Undo2,
  Redo2,
  X,
  Minus,
  Plus,
  CloudUpload,
  Copy,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Circle,
  Eye,
  Wand2,
  Loader2,
} from "lucide-react";
import { POPULAR_GOOGLE_FONTS, loadGoogleFont } from "../lib/fonts";
import { publicEnv } from "../config/env";
import { PRODUCTS, ProductType, ProductDefinition } from "../config/products";
import { PreviewModal } from "./preview-modal";

const ARTBOARD = { w: 500, h: 500 }; // “shirt design area” units

// --- Text Style Presets ---
const TEXT_PRESETS = [
  {
    id: "street-bold",
    name: "Street Bold",
    description: "Loud & proud for tees",
    fontFamily: "Anton",
    charSpacing: 40,
    lineHeight: 1.05,
    fill: "#18181B", // Dark zinc for white artboards
    shadow: null,
  },
  {
    id: "blobby-vintage",
    name: "Blobby Vintage",
    description: "Cooper-ish warm vibe",
    fontFamily: "Baloo 2",
    charSpacing: 5,
    lineHeight: 1.1,
    fill: "#7C2D12", // Warm brown/orange
    shadow: { color: "rgba(0,0,0,0.2)", blur: 6, offsetX: 2, offsetY: 2 },
  },
  {
    id: "pop-cartoon",
    name: "Pop Cartoon",
    description: "Fun & punchy",
    fontFamily: "Luckiest Guy",
    charSpacing: 0,
    lineHeight: 1.1,
    fill: "#DC2626", // Bright red
    shadow: { color: "rgba(0,0,0,0.4)", blur: 0, offsetX: 3, offsetY: 3 },
  },
  {
    id: "luxury-minimal",
    name: "Luxury Minimal",
    description: "Elegant & spaced",
    fontFamily: "Playfair Display",
    charSpacing: 80,
    lineHeight: 1.3,
    fill: "#1F2937", // Dark gray
    shadow: null,
  },
  {
    id: "tech-clean",
    name: "Tech Clean",
    description: "Modern brand text",
    fontFamily: "Inter",
    charSpacing: 10,
    lineHeight: 1.2,
    fill: "#0F172A", // Slate dark
    shadow: null,
  },
  {
    id: "poster-outline",
    name: "Poster Outline",
    description: "Bold with shadow outline",
    fontFamily: "Archivo Black",
    charSpacing: 20,
    lineHeight: 1.0,
    fill: "#000000", // Black
    shadow: { color: "#A3A3A3", blur: 0, offsetX: 3, offsetY: 3 }, // Gray shadow for outline effect
  },
];

// --- Geometry Helpers (Consistent Coordinate Space) ---

// Execute fn with identity viewport, then restore
const withIdentityViewport = <T,>(c: any, fn: () => T): T => {
  const vpt = c.viewportTransform;
  c.setViewportTransform([1, 0, 0, 1, 0, 0]);
  const result = fn();
  c.setViewportTransform(vpt);
  return result;
};

// Get artboard rect in canvas space (with identity viewport)
const getArtboardRect = (c: any, ab: any) => {
  if (!c || !ab)
    return { left: 0, top: 0, width: ARTBOARD.w, height: ARTBOARD.h };
  return withIdentityViewport(c, () => {
    ab.setCoords();
    return ab.getBoundingRect(true, true);
  });
};

// Clamp object to artboard bounds (viewport-independent)
const clampToArtboard = (c: any, ab: any, obj: any) => {
  if (!c || !ab || !obj) return;
  withIdentityViewport(c, () => {
    obj.setCoords();
    ab.setCoords();
    const r = obj.getBoundingRect(true, true);
    const a = ab.getBoundingRect(true, true);
    let dx = 0,
      dy = 0;

    // Only clamp if object is smaller than artboard (otherwise allow free movement/bleed)
    // Advanced Clamping:
    // - If object < artboard: Strict containment (edges inside)
    // - If object > artboard: Center containment (center inside)

    // Horizontal
    if (r.width <= a.width) {
      // Strict Contain
      if (r.left < a.left) dx = a.left - r.left;
      else if (r.left + r.width > a.left + a.width)
        dx = a.left + a.width - (r.left + r.width);
    } else {
      // Center Contain
      const cx = r.left + r.width / 2;
      if (cx < a.left)
        dx = a.left - cx; // Center too far left
      else if (cx > a.left + a.width) dx = a.left + a.width - cx; // Center too far right
    }

    // Vertical
    if (r.height <= a.height) {
      // Strict Contain
      if (r.top < a.top) dy = a.top - r.top;
      else if (r.top + r.height > a.top + a.height)
        dy = a.top + a.height - (r.top + r.height);
    } else {
      // Center Contain
      const cy = r.top + r.height / 2;
      if (cy < a.top) dy = a.top - cy;
      else if (cy > a.top + a.height) dy = a.top + a.height - cy;
    }

    if (dx || dy) {
      obj.left += dx;
      obj.top += dy;
      obj.setCoords();
    }
  });
};

// Get object's origin point in artboard-relative coordinates (origin-aware)
const getOriginInArtboardSpace = (c: any, ab: any, obj: any) => {
  if (!c || !ab || !obj) return { x: 0, y: 0 };
  return withIdentityViewport(c, () => {
    ab.setCoords();
    obj.setCoords();
    const a = ab.getBoundingRect(true, true);
    const p = obj.getPointByOrigin(obj.originX, obj.originY);
    return { x: p.x - a.left, y: p.y - a.top };
  });
};

const isTextObject = (obj: any) =>
  obj && (obj.type === "textbox" || obj.type === "i-text" || obj.type === "text");

type Tool = "select" | "text" | "uploads";

export default function FabricEditor() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fabricCanvasRef = useRef<any>(null);
  const artboardRef = useRef<any>(null);

  // Preview mode (triggered after design is ready)
  const [showPreview, setShowPreview] = useState(false);

  // UI State
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [zoom, setZoom] = useState(1);
  const [selectedObjects, setSelectedObjects] = useState<any[]>([]);
  const [exportedJson, setExportedJson] = useState<string>("");

  const [canvasReady, setCanvasReady] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<
    { id: string; src: string; name: string }[]
  >([]);
  const [isRemovingBg, setIsRemovingBg] = useState(false);

  // Selection Properties
  const [fill, setFill] = useState("#e2e8f0");
  const [fontFamily, setFontFamily] = useState<string>("Inter");
  const [fontSize, setFontSize] = useState(42);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left");
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [fontSearch, setFontSearch] = useState("");
  const [fontLoadCount, setFontLoadCount] = useState(15);
  const fontListRef = useRef<HTMLDivElement>(null);

  // Navigation State
  const isPanningRef = useRef(false);

  // Text Tool State
  const isAddingTextRef = useRef(false);
  const [editingTextObj, setEditingTextObj] = useState<any>(null);

  // History State
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const historyRef = useRef<string[]>([]);
  const redoStackRef = useRef<string[]>([]);
  const isHistoryProcessing = useRef(false);

  const renderCanvas = () => {
    fabricCanvasRef.current?.requestRenderAll();
  };

  const saveHistorySnapshot = () => {
    fabricCanvasRef.current?.__saveHistory?.();
  };

  const renderAndSave = () => {
    renderCanvas();
    saveHistorySnapshot();
  };

  // --- Preload Fonts on Mount ---
  useEffect(() => {
    TEXT_PRESETS.forEach(p => loadGoogleFont(p.fontFamily));
  }, []);

  // --- Export design as data URL for preview ---
  const getDesignDataUrl = (): string | null => {
    const c = fabricCanvasRef.current;
    if (!c) return null;

    // Export just the design content (no background)
    return c.toDataURL({ format: 'png', multiplier: 2 });
  };


  // --- Editor Logic (now runs immediately) ---

  useEffect(() => {

    let disposed = false;
    let cleanup: undefined | (() => void);
    let fabricModule: any = null;

    async function init() {
      if (!canvasElRef.current || !containerRef.current) return;

      if (!fabricModule) {
        fabricModule = await import(/* webpackChunkName: "fabric" */ "fabric");
      }
      const { Canvas, Rect, Textbox } = fabricModule as any;
      if (disposed) return;

      const c = new Canvas(canvasElRef.current, {
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        backgroundColor: "#030303",
        selection: true,
        preserveObjectStacking: true,
      });

      // Update viewport size on init
      const updateDimensions = () => {
        if (!containerRef.current) return;
        c.setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
        centerArtboard(c);
      };

      const setupArtboard = (canvas: any) => {
        const artboard = new Rect({
          width: ARTBOARD.w,
          height: ARTBOARD.h,
          fill: "transparent",
          stroke: "transparent",
          selectable: false,
          evented: false,
          hoverCursor: "default",
          shadow: {
            color: "rgba(0,0,0,0.5)",
            blur: 50,
            offsetX: 0,
            offsetY: 0,
          },
          id: "artboard",
          absolutePositioned: false,
        });
        artboardRef.current = artboard;

        canvas.add(artboard);

        const clipRect = new Rect({
          width: ARTBOARD.w,
          height: ARTBOARD.h,
          originX: "center",
          originY: "center",
          absolutePositioned: false,
        });

        canvas.clipPath = clipRect;
        (canvas as any).__clipRect = clipRect;
      };

      setupArtboard(c);
      fabricCanvasRef.current = c;
      setCanvasReady(true);
      (c as any).__setupArtboard = setupArtboard;

      // --- Interaction Logic ---
      c.on("mouse:wheel", (opt: any) => {
        // Disabled per request, but keeping structure if needed
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });

      let lastTap = 0;
      c.on("mouse:down", (opt: any) => {
        const evt = opt.e;
        if (isPanningRef.current || evt.altKey || evt.metaKey) {
          c.isDragging = true;
          c.selection = false;
          c.lastPosX = evt.clientX;
          c.lastPosY = evt.clientY;
          c.defaultCursor = "grabbing";
          return;
        }

        if (isAddingTextRef.current) {
          const pointer = c.getPointer(evt);
          addTextAtPoint(pointer);
          isAddingTextRef.current = false;
          c.defaultCursor = "default";
          setActiveTool("select");
          return;
        }

        const now = Date.now();
        if (
          opt.target &&
          (opt.target.type === "textbox" || opt.target.type === "i-text")
        ) {
          if (now - lastTap < 400) {
            opt.target.enterEditing();
            opt.target.hiddenTextarea?.focus();
          }
          lastTap = now;
        }
        lastTap = now;
      });

      c.on("mouse:move", (opt: any) => {
        if (c.isDragging) {
          const e = opt.e;
          const vpt = c.viewportTransform;
          vpt[4] += e.clientX - c.lastPosX;
          vpt[5] += e.clientY - c.lastPosY;
          c.requestRenderAll();
          c.lastPosX = e.clientX;
          c.lastPosY = e.clientY;
        }
      });

      c.on("mouse:up", (opt: any) => {
        c.setViewportTransform(c.viewportTransform);
        c.isDragging = false;
        c.selection = !isPanningRef.current;
        c.defaultCursor = isPanningRef.current ? "grab" : "default";
      });

      const clampObject = (obj: any) =>
        clampToArtboard(c, artboardRef.current, obj);

      c.on("object:moving", (e: any) => clampObject(e.target));
      c.on("object:scaling", (e: any) => clampObject(e.target));

      const syncSelection = () => {
        const active = c.getActiveObjects();
        setSelectedObjects(active);

        if (active.length === 1) {
          const obj = active[0];
          if (obj.fill && typeof obj.fill === "string") setFill(obj.fill);
          if (obj.fontSize) setFontSize(obj.fontSize);
          if (obj.fontFamily) setFontFamily(obj.fontFamily);
          setBold(obj.fontWeight === "bold");
          setItalic(obj.fontStyle === "italic");
          if (obj.textAlign) setTextAlign(obj.textAlign);

        }
      };

      c.on("selection:created", () => {
        syncSelection();
      });
      c.on("selection:updated", () => {
        syncSelection();
      });
      c.on("selection:cleared", () => {
        syncSelection();
      });

      // --- Text Editing Events ---
      c.on("text:editing:entered", (e: any) => {
        setEditingTextObj(e.target);
      });

      c.on("text:editing:exited", () => {
        setEditingTextObj(null);
      });

      // --- History ---
      const saveHistory = () => {
        if (isHistoryProcessing.current) return;
        const json = JSON.stringify(
          c.toJSON([
            "objectId",
            "excludeFromExport",
            "id",
            "lockMovementX",
            "lockMovementY",
            "lockScalingX",
            "lockScalingY",
            "lockRotation",
          ])
        );

        historyRef.current.push(json);
        redoStackRef.current = [];
        if (historyRef.current.length > 50) historyRef.current.shift();

        setCanUndo(historyRef.current.length > 1);
        setCanRedo(false);
      };

      if (historyRef.current.length === 0) {
        saveHistory();
      }

      c.on("object:modified", saveHistory);
      c.on("object:added", (e: any) => {
        if (!isHistoryProcessing.current && !e.target?.excludeFromExport) {
          saveHistory();
        }
      });
      c.on("object:removed", (e: any) => {
        if (!isHistoryProcessing.current && !e.target?.excludeFromExport) {
          saveHistory();
        }
      });

      const undo = async () => {
        if (historyRef.current.length <= 1) return;
        isHistoryProcessing.current = true;
        const current = historyRef.current.pop();
        if (current) redoStackRef.current.push(current);
        const previous = historyRef.current[historyRef.current.length - 1];

        if (previous) {
          await c.loadFromJSON(JSON.parse(previous));
          const objs = c.getObjects();
          const ab = objs.find((o: any) => o.id === "artboard");
          if (ab) {
            artboardRef.current = ab;
          } else {
            setupArtboard(c);
            centerArtboard(c);
          }
          if (c.clipPath) {
            (c as any).__clipRect = c.clipPath;
          }
          c.renderAll();
          syncSelection();
        }

        setCanUndo(historyRef.current.length > 1);
        setCanRedo(redoStackRef.current.length > 0);
        isHistoryProcessing.current = false;
      };

      const redo = async () => {
        if (redoStackRef.current.length === 0) return;
        isHistoryProcessing.current = true;
        const next = redoStackRef.current.pop();

        if (next) {
          historyRef.current.push(next);
          await c.loadFromJSON(JSON.parse(next));
          const objs = c.getObjects();
          const ab = objs.find((o: any) => o.id === "artboard");
          if (ab) {
            artboardRef.current = ab;
          } else {
            setupArtboard(c);
            centerArtboard(c);
          }
          if (c.clipPath) {
            (c as any).__clipRect = c.clipPath;
          }
          c.renderAll();
          syncSelection();
        }
        setCanUndo(historyRef.current.length > 1);
        setCanRedo(redoStackRef.current.length > 0);
        isHistoryProcessing.current = false;
      };

      (c as any).__undo = undo;
      (c as any).__redo = redo;
      (c as any).__saveHistory = saveHistory;

      const centerArtboard = (canvas: any) => {
        if (!artboardRef.current) return;
        // Used Fabric's native centering to be sure
        canvas.centerObject(artboardRef.current);
        artboardRef.current.setCoords();

        const clipRect = (canvas as any).__clipRect;
        if (clipRect) {
          canvas.centerObject(clipRect);
          clipRect.set({ dirty: true });
        }
        canvas.requestRenderAll();
      };
      (c as any).__centerArtboard = centerArtboard;

      const fitToScreen = () => {
        if (!containerRef.current || !artboardRef.current) return;
        const vpt = c.viewportTransform;
        c.setViewportTransform([1, 0, 0, 1, 0, 0]);
        const abRect = artboardRef.current.getBoundingRect();

        const cw = containerRef.current.clientWidth;
        const ch = containerRef.current.clientHeight;
        const padding = 50;

        const scaleX = (cw - padding * 2) / abRect.width;
        const scaleY = (ch - padding * 2) / abRect.height;
        const scale = Math.min(scaleX, scaleY, 1);

        const centerX = cw / 2;
        const centerY = ch / 2;

        const newVpt = [
          scale,
          0,
          0,
          scale,
          centerX - (abRect.left + abRect.width / 2) * scale,
          centerY - (abRect.top + abRect.height / 2) * scale,
        ];

        c.setViewportTransform(newVpt);
        setZoom(scale);
        c.requestRenderAll();
      };

      fitToScreen();
      (c as any).__fitToScreen = fitToScreen;

      updateDimensions();
      // Keyboard shortcuts
      const handleKeyDown = (e: KeyboardEvent) => {
        // Don't handle if typing in text
        const activeObject = c.getActiveObject();
        if (activeObject && activeObject.isEditing) return;

        // Delete/Backspace to delete selected objects
        if (e.key === 'Delete' || e.key === 'Backspace') {
          const active = c.getActiveObjects();
          if (active.length > 0) {
            active.forEach((obj: any) => {
              if (obj.id !== 'artboard' && obj.id !== 'product-bg') {
                c.remove(obj);
              }
            });
            c.discardActiveObject();
            c.requestRenderAll();
            c.__saveHistory && c.__saveHistory();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      // Use ResizeObserver for robust responsiveness
      const resizeObserver = new ResizeObserver(() => {
        if (!containerRef.current) return;
        c.setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
        fitToScreen();
      });

      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      cleanup = () => {
        resizeObserver.disconnect();
        document.removeEventListener('keydown', handleKeyDown);
        c.dispose();
        setCanvasReady(false);
        fabricCanvasRef.current = null;
      };
    }

    init();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []); // Run once on mount

  // Preload popular fonts on mount
  useEffect(() => {
    const preloadFonts = async () => {
      // Preload first 15 popular fonts for quick access
      const fontsToPreload = POPULAR_GOOGLE_FONTS.slice(0, 15);
      await Promise.all(fontsToPreload.map(f => loadGoogleFont(f)));
    };
    preloadFonts();
  }, []);



  // --- Artboard Setup Effect ---
  useEffect(() => {
    if (!canvasReady) return;
    const c = fabricCanvasRef.current;
    if (!c) return;

    // Use white artboard as default design canvas
    let ab = artboardRef.current || c.getObjects().find((o: any) => o.id === "artboard");
    if (ab) {
      const vpCenter = c.getVpCenter();
      ab.set({
        width: ARTBOARD.w,
        height: ARTBOARD.h,
        fill: "#ffffff",
        stroke: "rgba(255, 255, 255, 0.3)",
        strokeWidth: 2,
        visible: true,
        originX: "center",
        originY: "center",
        left: vpCenter.x,
        top: vpCenter.y
      });
      ab.setCoords();
      artboardRef.current = ab;
    }
    c.requestRenderAll();
  }, [canvasReady]);


  // --- Helper Functions (Same as before) ---
  const addTextAtPoint = async (point: { x: number; y: number }, sub: string = "Heading") => {
    const c = fabricCanvasRef.current;
    if (!c) return;

    const { Textbox } = (await import("fabric")) as any;

    const text = new Textbox(sub, {
      left: point.x,
      top: point.y,
      fontSize: fontSize,
      fontFamily: fontFamily,
      fill: fill,
      textAlign: textAlign,
      fontWeight: bold ? "bold" : "normal",
      fontStyle: italic ? "italic" : "normal",
      width: 300,
      splitByGrapheme: true,
      originX: "center",
      originY: "center",
    });

    c.add(text);
    c.setActiveObject(text);
    text.enterEditing();
    text.selectAll();
    c.defaultCursor = "default";
    c.selection = true;

    c.__saveHistory && c.__saveHistory();
  };

  const applyTextPreset = async (preset: typeof TEXT_PRESETS[number]) => {
    const c = fabricCanvasRef.current;
    if (!c) return;

    // Add center of screen
    const center = c.getVpCenter();
    const { Textbox } = (await import("fabric")) as any;

    const text = new Textbox("YOUR TEXT", {
      left: center.x,
      top: center.y,
      fontSize: 60,
      fontFamily: preset.fontFamily,
      fill: preset.fill,
      textAlign: "center",
      charSpacing: preset.charSpacing,
      lineHeight: preset.lineHeight,
      shadow: preset.shadow,
      originX: "center",
      originY: "center",
      // ... preset props
    });

    // Load font if needed
    loadGoogleFont(preset.fontFamily);

    c.add(text);
    c.setActiveObject(text);
    c.requestRenderAll();
    c.__saveHistory && c.__saveHistory();
  };

  const handleZoomChange = (nextZoom: number) => {
    const c = fabricCanvasRef.current;
    if (!c) return;
    const clamped = Math.min(2, Math.max(0.2, nextZoom));
    const point = { x: c.getWidth() / 2, y: c.getHeight() / 2 };
    c.zoomToPoint(point, clamped);
    setZoom(clamped);
    c.requestRenderAll();
  };


  const exportJson = () => {
    const c = fabricCanvasRef.current;
    if (!c) return;

    // 0. Stabilize Viewport
    const vpt = c.viewportTransform;
    c.setViewportTransform([1, 0, 0, 1, 0, 0]);

    // 1. Fabric Design Intent (Canvas)
    const designIntent = c.toJSON([
      "objectId",
      "excludeFromExport",
      "id",
      "lockMovementX",
      "lockMovementY",
      "lockScalingX",
      "lockScalingY",
      "lockRotation",
      "visible",
    ]);

    // Filter for JSON export 
    designIntent.objects = designIntent.objects.filter(
      (obj: any) =>
        obj.visible !== false &&
        !obj.excludeFromExport &&
        obj.id !== "artboard"
    );

    // 2. Normalized for Print (Artboard Relative)
    const ab = artboardRef.current;
    const artboardRect = ab
      ? getArtboardRect(c, ab)
      : { left: 0, top: 0, width: ARTBOARD.w, height: ARTBOARD.h };

    const filteredObjects = c
      .getObjects()
      .filter(
        (obj: any) =>
          obj.visible !== false &&
          !obj.excludeFromExport &&
          obj.id !== "artboard"
      );

    const normalizedObjects = filteredObjects.map((obj: any) => {
      const origin = getOriginInArtboardSpace(c, ab, obj);
      const bounds = obj.getBoundingRect(true, true);
      const boundingBox = {
        left: bounds.left - artboardRect.left,
        top: bounds.top - artboardRect.top,
        width: bounds.width,
        height: bounds.height,
      };

      const style: Record<string, any> = {
        fill: obj.fill,
        opacity: obj.opacity,
        blendMode: obj.globalCompositeOperation,
      };

      if (isTextObject(obj)) {
        Object.assign(style, {
          text: obj.text,
          fontFamily: obj.fontFamily,
          fontSize: obj.fontSize,
          fontWeight: obj.fontWeight,
          fontStyle: obj.fontStyle,
          textAlign: obj.textAlign,
          lineHeight: obj.lineHeight,
          charSpacing: obj.charSpacing,
          textBackgroundColor: obj.textBackgroundColor,
        });
      }

      if (obj.type === "image") {
        style.src = obj.getSrc ? obj.getSrc() : undefined;
      }

      return {
        id: obj.objectId,
        type: obj.type,
        boundingBox,
        transform: {
          originLeft: origin.x,
          originTop: origin.y,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          angle: obj.angle,
          flipX: obj.flipX,
          flipY: obj.flipY,
        },
        style,
      };
    });


    // Restore viewport
    c.setViewportTransform(vpt);

    const payload = {
      design: designIntent,
      printData: normalizedObjects
    };

    console.log("Export Payload:", payload);
    setExportedJson(JSON.stringify(payload, null, 2));
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (f) => {
      const data = f.target?.result;
      if (typeof data === "string" && fabricCanvasRef.current) {
        const c = fabricCanvasRef.current;
        const { FabricImage } = await import("fabric");

        try {
          const img = await FabricImage.fromURL(data);
          if (!img) return;

          // Get viewport center for proper positioning
          const vpCenter = c.getVpCenter();

          // Generate unique ID
          const imageId = `upload-${Date.now()}`;

          img.set({
            left: vpCenter.x,
            top: vpCenter.y,
            originX: 'center',
            originY: 'center',
            scaleX: 0.3,
            scaleY: 0.3,
            id: imageId
          } as any);

          c.add(img);
          c.setActiveObject(img);
          c.requestRenderAll();
          c.__saveHistory && c.__saveHistory();

          // Track the upload
          setUploadedImages(prev => [...prev, {
            id: imageId,
            src: data,
            name: file.name
          }]);
        } catch (err) {
          console.error("Failed to load image:", err);
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // reset
  };

  const handleUploadClick = () => {
    setActiveTool("uploads");
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const addUploadedImageToCanvas = async (src: string) => {
    if (!fabricCanvasRef.current) return;
    const c = fabricCanvasRef.current;
    const { FabricImage } = await import("fabric");

    try {
      const img = await FabricImage.fromURL(src);
      if (!img) return;

      const vpCenter = c.getVpCenter();
      img.set({
        left: vpCenter.x,
        top: vpCenter.y,
        originX: 'center',
        originY: 'center',
        scaleX: 0.3,
        scaleY: 0.3
      } as any);

      c.add(img);
      c.setActiveObject(img);
      c.requestRenderAll();
      c.__saveHistory && c.__saveHistory();
    } catch (err) {
      console.error("Failed to add image:", err);
    }
  };

  const apiBaseUrl = publicEnv.API_BASE_URL?.trim() || "/api";

  // Remove background from selected image using NestJS API (which proxies to Python)
  const removeBackground = async () => {
    const selected = fabricCanvasRef.current?.getActiveObject();
    if (!selected || selected.type !== 'image') return;

    setIsRemovingBg(true);
    try {
      // Get image data as base64
      const imgElement = (selected as any).getElement();
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imgElement.naturalWidth || imgElement.width;
      tempCanvas.height = imgElement.naturalHeight || imgElement.height;
      const ctx = tempCanvas.getContext('2d');
      ctx?.drawImage(imgElement, 0, 0);
      const base64 = tempCanvas.toDataURL('image/png');

      // Call NestJS API via Next.js proxy so cookies work on same origin
      // The proxy rewrites /api/* → API backend /v1/*
      const response = await fetch('/api/images/remove-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Send session cookie
        body: JSON.stringify({ image_base64: base64 }),
      });

      if (!response.ok) throw new Error('API request failed');

      const result = await response.json();

      // Replace image source with transparent version
      const { FabricImage } = await import('fabric');
      const newImg = await FabricImage.fromURL(result.image_base64);
      if (!newImg) throw new Error('Failed to load result image');

      // Copy properties from old image
      newImg.set({
        left: selected.left,
        top: selected.top,
        scaleX: selected.scaleX,
        scaleY: selected.scaleY,
        angle: selected.angle,
        originX: selected.originX,
        originY: selected.originY,
      });

      const c = fabricCanvasRef.current;
      c.remove(selected);
      c.add(newImg);
      c.setActiveObject(newImg);
      c.requestRenderAll();
      c.__saveHistory && c.__saveHistory();
    } catch (err) {
      console.error('Background removal failed:', err);
      alert('Background removal failed. Please make sure you are logged in.');
    } finally {
      setIsRemovingBg(false);
    }
  };

  const activeObj = selectedObjects[0];

  // --- Render ---

  return (
    <div className="flex h-screen w-full bg-[#09090b] text-white font-urbanist overflow-hidden selection:bg-cyan selection:text-black">
      {/* Left Sidebar - Tools */}
      <aside className="w-20 border-r border-white/5 flex flex-col items-center py-6 gap-6 bg-[#0c0c0e] z-30 shadow-2xl">
        <Link href="/" className="mb-2 p-2 bg-cyan text-black rounded-lg font-bold text-lg hover:scale-110 transition-transform cursor-pointer" title="Back to Home">
          CB
        </Link>


        <ToolButton
          active={activeTool === "text"}
          onClick={() => setActiveTool("text")}
          icon={<Type className="w-6 h-6" />}
          label="Text"
        />
        <ToolButton
          active={activeTool === "uploads"}
          onClick={handleUploadClick}
          icon={<Upload className="w-6 h-6" />}
          label="Uploads"
        />
      </aside>

      {/* Sub-Sidebar (Drawer) - Hidden when in Select mode */}
      {activeTool !== "select" && (
        <div className="w-80 border-r border-white/10 bg-[#0c0c0e] flex flex-col z-20 shadow-2xl">
          <div className="h-16 px-6 font-bold text-sm tracking-wider uppercase text-zinc-400 flex items-center border-b border-white/5">
            {activeTool === "text" ? "Add Text" : "Your Uploads"}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {activeTool === "text" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      isAddingTextRef.current = true;
                      fabricCanvasRef.current.defaultCursor = "text";
                    }}
                    className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5 hover:border-cyan/50 hover:bg-zinc-900 transition-all flex flex-col items-center gap-2 group"
                  >
                    <Type className="w-6 h-6 text-zinc-400 group-hover:text-white" />
                    <span className="text-xs font-bold text-zinc-400 group-hover:text-white">Click Canvas</span>
                  </button>
                  <button
                    onClick={() => {
                      const ab = artboardRef.current;
                      if (ab) {
                        const center = ab.getCenterPoint();
                        addTextAtPoint({ x: center.x, y: center.y });
                      } else {
                        addTextAtPoint({ x: ARTBOARD.w / 2, y: ARTBOARD.h / 2 });
                      }
                    }}
                    className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 transition-all flex flex-col items-center gap-2 group"
                  >
                    <Plus className="w-6 h-6 text-zinc-400 group-hover:text-white" />
                    <span className="text-xs font-bold text-zinc-400 group-hover:text-white">Quick Add</span>
                  </button>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Presets</h3>
                  <div className="space-y-3">
                    {TEXT_PRESETS.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => applyTextPreset(preset)}
                        className="w-full text-left p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-600 transition-all group"
                      >
                        <span
                          style={{ fontFamily: preset.fontFamily }}
                          className="text-xl text-white block mb-1 group-hover:scale-105 transition-transform origin-left"
                        >
                          {preset.name}
                        </span>
                        <span className="text-xs text-zinc-500">{preset.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTool === "uploads" && (
              <div className="space-y-6">
                <button
                  onClick={triggerFileUpload}
                  className="w-full p-4 bg-white text-black rounded-2xl font-black uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-gray-200 transition-transform active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                >
                  <Plus className="w-5 h-5" />
                  Upload Image
                </button>

                <div>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Your Gallery</h3>
                  {uploadedImages.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-zinc-800 rounded-xl px-4">
                      <CloudUpload className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                      <p className="text-zinc-500 text-sm italic">No uploads yet. Your uploaded images will appear here.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {uploadedImages.map((img) => (
                        <button
                          key={img.id}
                          onClick={() => addUploadedImageToCanvas(img.src)}
                          className="group relative aspect-square bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden hover:border-white/40 transition-all"
                        >
                          <img src={img.src} alt={img.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Plus className="w-6 h-6 text-white" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}


          </div>
        </div>
      )}

      {/* --- Main Area --- */}
      <div className="flex-1 min-w-0 relative bg-[#09090b] flex flex-col">
        {/* Top Header */}
        <header className="h-14 shrink-0 border-b border-white/5 flex items-center justify-between px-4 bg-[#09090b] z-20 gap-2">
          <div className="flex items-center gap-2 shrink-0">
            {/* History */}
            <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1">
              <button onClick={() => fabricCanvasRef.current?.__undo()} disabled={!canUndo} className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30">
                <Undo2 className="w-4 h-4" />
              </button>
              <button onClick={() => fabricCanvasRef.current?.__redo()} disabled={!canRedo} className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30">
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800">
              <button
                onClick={() => handleZoomChange(zoom * 0.9)}
                className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
                aria-label="Zoom out"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-xs font-mono text-zinc-400">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => handleZoomChange(zoom * 1.1)}
                className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
                aria-label="Zoom in"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportJson}
              className="bg-black text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-zinc-900 transition-all flex items-center gap-2 shrink-0 border border-white/10 hover:border-white/20"
            >
              <Download className="w-4 h-4" /> EXPORT
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className="bg-cyan text-black px-6 py-2 rounded-full font-black text-sm uppercase tracking-wider hover:bg-cyan-400 hover:scale-105 transition-all flex items-center gap-2 shrink-0 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
            >
              <Eye className="w-4 h-4" /> Preview
            </button>
          </div>
        </header>

        {/* Canvas Wrapper */}
        <div
          ref={containerRef}
          className="flex-1 relative overflow-hidden bg-[#09090b]"
          style={{
            backgroundImage: "radial-gradient(#1a1a1a 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          <canvas
            ref={canvasElRef}
            className="absolute inset-0"
          />

          {/* Floating Context Toolbar - Fixed at top center of canvas */}
          {activeObj && (
            <div
              className="absolute left-1/2 top-4 -translate-x-1/2 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-xl shadow-2xl flex flex-col gap-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="flex items-center gap-2 p-2">
                {/* --- Text Specific Tools --- */}
                {isTextObject(activeObj) && (
                  <>
                    <input
                      type="color"
                      value={fill}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFill(val);
                        if (editingTextObj && editingTextObj.isEditing) {
                          const start = editingTextObj.selectionStart;
                          const end = editingTextObj.selectionEnd;
                          if (start !== end) editingTextObj.setSelectionStyles({ fill: val }, start, end);
                          else activeObj.set("fill", val);
                        } else {
                          activeObj.set("fill", val);
                        }
                        renderAndSave();
                      }}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-zinc-600 p-0 hover:border-zinc-400"
                      title="Text Color"
                    />
                    <div className="w-px h-6 bg-zinc-700 mx-1" />

                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        const val = !bold;
                        setBold(val);
                        if (editingTextObj && editingTextObj.isEditing) {
                          // Apply to selection
                          const start = editingTextObj.selectionStart;
                          const end = editingTextObj.selectionEnd;
                          const newWeight = val ? 'bold' : 'normal';
                          if (start !== end) editingTextObj.setSelectionStyles({ fontWeight: newWeight }, start, end);
                          else editingTextObj.set("fontWeight", newWeight);
                        } else {
                          activeObj.set("fontWeight", val ? 'bold' : 'normal');
                        }
                        renderAndSave();
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${bold ? 'bg-white text-black' : 'hover:bg-zinc-800 text-zinc-400'}`}
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        const val = !italic;
                        setItalic(val);
                        // logic for selection vs object 
                        if (editingTextObj && editingTextObj.isEditing) {
                          const start = editingTextObj.selectionStart;
                          const end = editingTextObj.selectionEnd;
                          const newStyle = val ? 'italic' : 'normal';
                          if (start !== end) editingTextObj.setSelectionStyles({ fontStyle: newStyle }, start, end);
                          else editingTextObj.set("fontStyle", newStyle);
                        } else {
                          activeObj.set("fontStyle", val ? 'italic' : 'normal');
                        }
                        renderAndSave();
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${italic ? 'bg-white text-black' : 'hover:bg-zinc-800 text-zinc-400'}`}
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        const isHollow = activeObj.fill === 'transparent';
                        if (isHollow) {
                          // Turn off hollow - restore fill, remove stroke
                          activeObj.set({
                            fill: fill || '#e2e8f0',
                            stroke: undefined,
                            strokeWidth: 0
                          });
                        } else {
                          // Turn on hollow - transparent fill, add stroke
                          activeObj.set({
                            fill: 'transparent',
                            stroke: fill || '#e2e8f0',
                            strokeWidth: 2
                          });
                        }
                        renderAndSave();
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${activeObj.fill === 'transparent' ? 'bg-white text-black' : 'hover:bg-zinc-800 text-zinc-400'}`}
                      title="Hollow Text"
                    >
                      <Circle className="w-4 h-4" />
                    </button>

                    {/* Font Size Controls */}
                    <div className="flex items-center bg-zinc-800 rounded-lg border border-zinc-700">
                      <button
                        onClick={() => {
                          const newSize = Math.max(8, fontSize - 2);
                          setFontSize(newSize);
                          activeObj.set("fontSize", newSize);
                          renderAndSave();
                        }}
                        className="w-7 h-8 flex items-center justify-center hover:bg-zinc-700 rounded-l-lg text-zinc-400 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-mono text-white">{fontSize}</span>
                      <button
                        onClick={() => {
                          const newSize = Math.min(200, fontSize + 2);
                          setFontSize(newSize);
                          activeObj.set("fontSize", newSize);
                          renderAndSave();
                        }}
                        className="w-7 h-8 flex items-center justify-center hover:bg-zinc-700 rounded-r-lg text-zinc-400 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Font Family Quick Switch */}
                    <div className="relative">
                      <button
                        onClick={() => setFontDropdownOpen(!fontDropdownOpen)}
                        className="h-8 px-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-medium text-white flex items-center gap-1 hover:bg-zinc-700"
                      >
                        Aa <span className="max-w-[60px] truncate">{fontFamily}</span>
                      </button>
                      {/* Dropdown - click based */}
                      {fontDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-1 w-40 z-50">
                          {POPULAR_GOOGLE_FONTS.slice(0, 15).map(f => (
                            <button key={f} onClick={async () => {
                              setFontFamily(f);
                              await loadGoogleFont(f);
                              activeObj.set("fontFamily", f);
                              renderAndSave();
                              setFontDropdownOpen(false);
                            }} className="w-full text-left px-2 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 rounded">{f}</button>
                          ))}
                          <div className="border-t border-zinc-700 mt-1 pt-1">
                            <button
                              onClick={() => {
                                setFontDropdownOpen(false);
                                setShowFontPicker(true);
                              }}
                              className="w-full text-left px-2 py-1.5 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-zinc-800 rounded"
                            >
                              More fonts...
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="w-px h-6 bg-zinc-700 mx-1" />

                    {/* Alignment */}
                    <div className="flex bg-zinc-800/50 rounded-lg border border-zinc-700/50 p-0.5 gap-0.5">
                      {['left', 'center', 'right'].map((align) => (
                        <button
                          key={align}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setTextAlign(align as any);
                            if (editingTextObj && editingTextObj.isEditing) {
                              // Align usually applies to whole object in basic fabric, but let's just set it
                              editingTextObj.set("textAlign", align);
                            } else {
                              activeObj.set("textAlign", align);
                            }
                            renderAndSave();
                          }}
                          className={`w-7 h-7 rounded flex items-center justify-center transition-all ${textAlign === align ? 'bg-zinc-600 text-white' : 'text-zinc-500 hover:text-white'}`}
                          title={`Align ${align}`}
                        >
                          {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                          {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                          {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* --- Image Specific Tools --- */}
                {activeObj.type === "image" && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white flex flex-col items-center gap-0.5"
                      title="Replace Image"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span className="text-[9px] font-medium">Replace</span>
                    </button>
                    <button
                      onClick={removeBackground}
                      disabled={isRemovingBg}
                      className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-cyan flex flex-col items-center gap-0.5 disabled:opacity-50"
                      title="Remove Background (AI)"
                    >
                      {isRemovingBg ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4" />
                      )}
                      <span className="text-[9px] font-medium">{isRemovingBg ? "Working..." : "Remove BG"}</span>
                    </button>
                  </>
                )}


                <div className="w-px h-6 bg-zinc-700 mx-1" />

                {/* --- Common Actions --- */}

                {/* Layer Handling */}
                <div className="flex bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                  <button
                    onClick={() => {
                      const c = fabricCanvasRef.current;
                      if (c) {
                        activeObj.bringForward();
                        c.requestRenderAll();
                        c.__saveHistory();
                      }
                    }}
                    className="w-7 h-8 flex items-center justify-center hover:bg-zinc-700 rounded-l-lg text-zinc-400 hover:text-white"
                    title="Bring Forward"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      const c = fabricCanvasRef.current;
                      // Prevent sending behind bg/artboard
                      // Complex logic handled in sidepanel, simplifying for updated
                      // Just sendBackwards
                      if (c) {
                        activeObj.sendBackwards();
                        c.requestRenderAll();
                        c.__saveHistory();
                      }
                    }}
                    className="w-7 h-8 flex items-center justify-center hover:bg-zinc-700 rounded-r-lg text-zinc-400 hover:text-white"
                    title="Send Backward"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Duplicate */}
                <button
                  onClick={async () => {
                    const c = fabricCanvasRef.current;
                    if (!c) return;
                    activeObj.clone((cloned: any) => {
                      c.discardActiveObject();
                      cloned.set({
                        left: cloned.left + 20,
                        top: cloned.top + 20,
                        evented: true,
                      });
                      if (cloned.type === 'activeSelection') {
                        // active selection needs special handling
                        cloned.canvas = c;
                        cloned.forEachObject((obj: any) => c.add(obj));
                        cloned.setCoords();
                      } else {
                        c.add(cloned);
                      }
                      c.setActiveObject(cloned);
                      c.requestRenderAll();
                      c.__saveHistory();
                    });
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  title="Duplicate"
                >
                  <Copy className="w-4 h-4" />
                </button>


                {/* Delete */}
                <button
                  onClick={() => {
                    const c = fabricCanvasRef.current;
                    c.remove(activeObj);
                    c.discardActiveObject();
                    c.requestRenderAll();
                    setSelectedObjects([]);
                    c.__saveHistory();
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/20 text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div >

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={uploadImage}
      />

      {/* Preview Modal with Interactive Design Positioning */}
      {showPreview && (
        <PreviewModal
          onClose={() => setShowPreview(false)}
          getDesignImage={() => {
            const c = fabricCanvasRef.current;
            if (!c) return null;

            // Save viewport, reset to identity
            const vpt = c.viewportTransform;
            c.setViewportTransform([1, 0, 0, 1, 0, 0]);

            // Get design area only (artboard content)
            const ab = artboardRef.current;
            if (!ab) {
              c.setViewportTransform(vpt);
              return null;
            }

            // Export just the artboard area
            const dataUrl = c.toDataURL({
              format: 'png',
              multiplier: 2,
              left: ab.left - ab.width / 2,
              top: ab.top - ab.height / 2,
              width: ab.width,
              height: ab.height,
            });

            c.setViewportTransform(vpt);
            return dataUrl;
          }}
        />
      )}

      {/* Export JSON Modal */}
      {
        exportedJson && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-white font-bold text-lg">Export Result</h3>
                <button onClick={() => setExportedJson("")} className="text-zinc-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-[#0c0c0e]">
                <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap break-all">
                  {exportedJson}
                </pre>
              </div>
              <div className="p-4 border-t border-zinc-800 flex justify-end gap-2 bg-zinc-900">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(exportedJson);
                  }}
                  className="px-4 py-2 bg-white text-black rounded-lg font-bold hover:bg-zinc-200 transition-colors"
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Font Picker Modal */}
      {showFontPicker && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between gap-4">
              <input
                type="text"
                placeholder="Search fonts..."
                value={fontSearch}
                onChange={(e) => {
                  setFontSearch(e.target.value);
                  setFontLoadCount(15); // Reset count on search
                }}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
              <button onClick={() => { setShowFontPicker(false); setFontSearch(""); setFontLoadCount(15); }} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div
              ref={fontListRef}
              className="flex-1 overflow-auto p-4 custom-scrollbar bg-[#0c0c0e]"
              onScroll={(e) => {
                const target = e.target as HTMLDivElement;
                if (target.scrollHeight - target.scrollTop - target.clientHeight < 100) {
                  setFontLoadCount(prev => Math.min(prev + 15, POPULAR_GOOGLE_FONTS.length));
                }
              }}
            >
              {(() => {
                const filteredFonts = POPULAR_GOOGLE_FONTS.filter(f =>
                  f.toLowerCase().includes(fontSearch.toLowerCase())
                );
                const displayFonts = filteredFonts.slice(0, fontLoadCount);

                // Load fonts as they appear
                displayFonts.forEach(f => loadGoogleFont(f));

                return (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {displayFonts.map(f => (
                        <button
                          key={f}
                          onClick={async () => {
                            setFontFamily(f);
                            await loadGoogleFont(f);
                            if (activeObj) {
                              activeObj.set("fontFamily", f);
                              renderAndSave();
                            }
                            setShowFontPicker(false);
                            setFontSearch("");
                            setFontLoadCount(15);
                          }}
                          className={`p-3 rounded-lg border text-left transition-all ${fontFamily === f
                            ? 'border-white bg-zinc-800'
                            : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800'
                            }`}
                        >
                          <span className="text-white font-medium text-sm">{f}</span>
                          <span className="block text-zinc-500 text-xs mt-1" style={{ fontFamily: f }}>
                            Sample Text
                          </span>
                        </button>
                      ))}
                    </div>
                    {displayFonts.length < filteredFonts.length && (
                      <div className="text-center py-4 text-zinc-500 text-sm">
                        Scroll for more fonts ({displayFonts.length}/{filteredFonts.length})
                      </div>
                    )}
                    {filteredFonts.length === 0 && (
                      <div className="text-center py-8 text-zinc-500">
                        No fonts found matching &ldquo;{fontSearch}&rdquo;
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

    </div >
  );
}

const ToolButton = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`group relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${active
      ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-110"
      : "text-zinc-500 hover:text-white hover:bg-white/10"
      }`}
  >
    {icon}
    <span className="absolute left-14 bg-zinc-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
      {label}
    </span>
  </button>
);
