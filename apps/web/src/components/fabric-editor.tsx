"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  MousePointer2,
  Type,
  Square,
  Image as ImageIcon,
  Download,
  Trash2,
  Layers,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  ChevronDown,
  Upload,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  FlipHorizontal,
  Maximize,
  Undo2,
  Redo2,
  Eraser,
} from "lucide-react";
import { POPULAR_GOOGLE_FONTS, loadGoogleFont } from "../lib/fonts";

const ARTBOARD = { w: 500, h: 500 }; // “shirt design area” units

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

type Tool = "select" | "text" | "uploads" | "layers" | "erase";

export default function FabricEditor() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fabricCanvasRef = useRef<any>(null);
  const artboardRef = useRef<any>(null);

  // UI State
  const [activeTool, setActiveTool] = useState<Tool>("select");
  // Zoom state kept for internal logic but UI removed
  const [zoom, setZoom] = useState(1);
  const [selectedObjects, setSelectedObjects] = useState<any[]>([]);
  const [layers, setLayers] = useState<any[]>([]); // New Layers State
  const [exportedJson, setExportedJson] = useState<string>("");
  const [artboardColor, setArtboardColor] = useState<string>("#ffffff"); // Artboard Background Color
  // Removed allowOverflow state per user request

  // Selection Properties
  const [fill, setFill] = useState("#e2e8f0");
  const [fontFamily, setFontFamily] = useState<string>("Inter");
  const [fontSize, setFontSize] = useState(42);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">(
    "left"
  );

  // New Props (Spec V2)
  const [lineHeight, setLineHeight] = useState(1.16);
  const [charSpacing, setCharSpacing] = useState(0);
  const [textBackgroundColor, setTextBackgroundColor] = useState<string>("");
  const [opacity, setOpacity] = useState(1);
  const [blendMode, setBlendMode] = useState<string>("source-over"); // source-over = Normal
  const [eraserSize, setEraserSize] = useState(20);
  const eraserPathsRef = useRef<any[]>([]);
  const originalImageSrcRef = useRef<string | null>(null);

  // Navigation State
  const isPanningRef = useRef(false);

  // Text Tool State
  const isAddingTextRef = useRef(false);

  // History State
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // History Refs (to avoid re-renders)
  const historyRef = useRef<string[]>([]);
  const redoStackRef = useRef<string[]>([]);
  const isHistoryProcessing = useRef(false);

  // Font Picker State
  const [isFontOpen, setIsFontOpen] = useState(false);
  const [fontSearch, setFontSearch] = useState("");
  const fontSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let disposed = false;
    let cleanup: undefined | (() => void);
    // Cache fabric module to reduce HMR churn
    let fabricModule: any = null;

    async function init() {
      if (!canvasElRef.current || !containerRef.current) return;

      // Lazy load and cache fabric module
      if (!fabricModule) {
        fabricModule = await import(/* webpackChunkName: "fabric" */ "fabric");
      }
      const { Canvas, Rect, Textbox } = fabricModule as any;
      if (disposed) return;

      const c = new Canvas(canvasElRef.current, {
        width: containerRef.current.clientWidth, // Fix: Use full container width (was -300)
        height: containerRef.current.clientHeight,
        backgroundColor: "#030303", // bg-page
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

      // --- Artboard Visuals Helper ---
      const setupArtboard = (canvas: any) => {
        // 1. Main Artboard (White)
        // We don't necessarily need a visual Rect if we use backgroundColor or clipPath,
        // but a visual Rect at the bottom is good for clicking/selection behavior if we wanted it.
        // User wants "White" artboard.

        const artboard = new Rect({
          width: ARTBOARD.w,
          height: ARTBOARD.h,
          fill: artboardColor,
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
          // excludeFromExport: true, // Removed to ensure it saves to History
          id: "artboard",
          absolutePositioned: true, // Important for clipPath if we used it there, but here it's just visual
        });
        artboardRef.current = artboard;

        canvas.add(artboard);

        // Implement Cropping (Clipping)
        // We clip the entire canvas area to this path.
        // Note: clipPath coordinates are relative to the center of the canvas if using a simple Rect?
        // Fabric `clipPath` defines the visible area.

        // We need a stable clipPath object that moves with the artboard logic?
        // Actually, we can reuse the `artboard` rect as the clipPath,
        // BUT if we add `artboard` to canvas AND use it as clipPath, standard fabric behavior might be weird.
        // Standard way: Create a separate clone for clipPath.

        // Let's create a specific clipRect.
        const clipRect = new Rect({
          width: ARTBOARD.w,
          height: ARTBOARD.h,
          originX: "center",
          originY: "center",
          absolutePositioned: true, // Defines coords in absolute canvas space
        });

        canvas.clipPath = clipRect;
        // Store ref to update its position on resize/center
        (canvas as any).__clipRect = clipRect;
      };

      setupArtboard(c);

      fabricCanvasRef.current = c;
      // Expose setup for external reset
      (c as any).__setupArtboard = setupArtboard;

      // --- Zoom & Pan Logic ---

      // Zoom on Wheel - DISABLED per user request
      c.on("mouse:wheel", (opt: any) => {
        const delta = opt.e.deltaY;
        let zoom = c.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 5) zoom = 5;
        if (zoom < 0.1) zoom = 0.1;

        // Zoom to point (mouse pointer)
        c.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);

        opt.e.preventDefault();
        opt.e.stopPropagation();
        setZoom(zoom);
      });

      // Mouse Interaction (Pan & Tap)
      let lastTap = 0;
      c.on("mouse:down", (opt: any) => {
        const evt = opt.e;

        // Pan Start
        if (isPanningRef.current || evt.altKey || evt.metaKey) {
          c.isDragging = true;
          c.selection = false;
          c.lastPosX = evt.clientX;
          c.lastPosY = evt.clientY;
          c.defaultCursor = "grabbing";
          return;
        }

        // Add Text Click
        if (isAddingTextRef.current) {
          const pointer = c.getPointer(evt); // Get pointer in canvas coords (handles zoom/pan)

          // We need to trigger the actual add logic now
          // But we need to switch back to normal mode
          addTextAtPoint(pointer);

          isAddingTextRef.current = false;
          c.defaultCursor = "default";
          // Set active tool back to select or keep text?
          // Usually select after add.
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
        // on mouse up we want to recalculate new interaction
        // for all objects, so we call setViewportTransform
        c.setViewportTransform(c.viewportTransform);
        c.isDragging = false;
        c.selection = !isPanningRef.current; // Restore selection if not in pan mode
        c.defaultCursor = isPanningRef.current ? "grab" : "default";
      });

      // --- Clamping Logic (now uses unified helper) ---
      const clampObject = (obj: any) =>
        clampToArtboard(c, artboardRef.current, obj);

      c.on("object:moving", (e: any) => clampObject(e.target));
      c.on("object:scaling", (e: any) => clampObject(e.target));

      // Sync Selection
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

          if (obj.lineHeight) setLineHeight(obj.lineHeight);
          if (obj.charSpacing) setCharSpacing(obj.charSpacing);
          if (obj.textBackgroundColor)
            setTextBackgroundColor(obj.textBackgroundColor);
          if (typeof obj.opacity !== "undefined") setOpacity(obj.opacity);
          // Sync Blend Mode
          if (obj.globalCompositeOperation) {
            setBlendMode(obj.globalCompositeOperation);
          } else {
            setBlendMode("source-over");
          }
        }
      };

      // Sync Layers
      const syncLayers = () => {
        const objs = c
          .getObjects()
          .filter((o: any) => o.id !== "artboard" && !o.excludeFromExport)
          .slice()
          .reverse();
        setLayers(objs);
      };

      c.on("object:added", syncLayers);
      c.on("object:removed", syncLayers);
      c.on("object:modified", syncLayers);
      c.on("object:skewing", syncLayers);
      c.on("object:scaling", syncLayers);

      c.on("selection:created", () => {
        syncSelection();
        syncLayers();
      });
      c.on("selection:updated", () => {
        syncSelection();
        syncLayers();
      });
      c.on("selection:cleared", () => {
        syncSelection();
        syncLayers();
      });

      // --- History Logic ---

      const saveHistory = () => {
        if (isHistoryProcessing.current) return;

        // Push current state to history
        // uses includeDefaults: false usually, but we want full state?
        // Let's use the export helpers, or simpler JSON.
        // We need 'artboard' to be consistent.
        // But for undo/redo, we just need the canvas state including objects.
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
        redoStackRef.current = []; // Clear redo on new action

        // Limit history?
        if (historyRef.current.length > 50) historyRef.current.shift();

        setCanUndo(historyRef.current.length > 1); // Need at least initial state + 1
        setCanRedo(false);
      };

      // Initial State Save
      if (historyRef.current.length === 0) {
        saveHistory();
      }

      // Hook events
      // We debounce? Or just save on modified.
      // object:modified is end of drag/scale/rotate.
      c.on("object:modified", saveHistory);
      c.on("object:added", (e: any) => {
        // Prevent saving history when re-loading from undo
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
        const current = historyRef.current.pop(); // Pop current state
        if (current) redoStackRef.current.push(current); // Save to redo

        const previous = historyRef.current[historyRef.current.length - 1]; // Peek previous

        if (previous) {
          await c.loadFromJSON(JSON.parse(previous));

          // 1. Restore Artboard Reference
          const objs = c.getObjects();
          const ab = objs.find((o: any) => o.id === "artboard");
          if (ab) {
            artboardRef.current = ab;
          } else {
            // Vital Safety: If artboard missing (e.g. init glitch), re-create it
            // This ensures visual container never disappears
            setupArtboard(c);
            centerArtboard(c); // Ensure it is positioned correctly
          }

          // 2. Restore ClipRect Reference
          // loadFromJSON restores c.clipPath. We must update our internal ref.
          if (c.clipPath) {
            (c as any).__clipRect = c.clipPath;
          } else if (artboardRef.current) {
            // Safety: If clipPath missing, re-apply it based on artboard?
            // Ideally setupArtboard handles this, but if artboard exists but clipPath lost:
            //Re-create clip rect logic if needed.
            // For now, assume if artboard exists, we are okay, or setupArtboard ran.
          }

          c.renderAll();
          syncLayers();
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

          // 1. Restore Artboard Reference
          const objs = c.getObjects();
          const ab = objs.find((o: any) => o.id === "artboard");
          if (ab) {
            artboardRef.current = ab;
          } else {
            setupArtboard(c);
            centerArtboard(c);
          }

          // 2. Restore ClipRect Reference
          if (c.clipPath) {
            (c as any).__clipRect = c.clipPath;
          }

          c.renderAll();
          syncLayers();
          syncSelection();
        }

        setCanUndo(historyRef.current.length > 1);
        setCanRedo(redoStackRef.current.length > 0);
        isHistoryProcessing.current = false;
      };

      // Expose to refs/external
      (c as any).__undo = undo;
      (c as any).__redo = redo;
      (c as any).__saveHistory = saveHistory;

      // Initial Center
      const centerArtboard = (canvas: any) => {
        if (!artboardRef.current) return;

        // Custom centering logic
        const vCenter = canvas.getVpCenter();

        // Move Artboard
        artboardRef.current.setPositionByOrigin(vCenter, "center", "center");

        // Move ClipRect if exists
        const clipRect = (canvas as any).__clipRect;
        if (clipRect) {
          // Important: clipPath coordinates usually need to be adjusted or are absolute.
          // With visible rect, we just move center.
          clipRect.setPositionByOrigin(vCenter, "center", "center");
          // Force recalculation for Fabric version quirks
          clipRect.set({ dirty: true });
        }

        // Recalculate layers after position changes? Not needed usually, but safe.
        canvas.requestRenderAll();
      };

      // Expose for external reset
      (c as any).__centerArtboard = centerArtboard;

      const fitToScreen = () => {
        if (!containerRef.current || !artboardRef.current) return;
        // Reset viewport to measure artboard
        const vpt = c.viewportTransform;
        c.setViewportTransform([1, 0, 0, 1, 0, 0]);
        const abRect = artboardRef.current.getBoundingRect();

        const cw = containerRef.current.clientWidth;
        const ch = containerRef.current.clientHeight;
        const padding = 50;

        const scaleX = (cw - padding * 2) / abRect.width;
        const scaleY = (ch - padding * 2) / abRect.height;
        const scale = Math.min(scaleX, scaleY, 1); // Max scale 1 (optional) or allow zoom in? Standard is Fit.

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

      // Initial Fit
      fitToScreen();
      // Expose for external
      (c as any).__fitToScreen = fitToScreen;

      updateDimensions();
      window.addEventListener("resize", updateDimensions);

      cleanup = () => {
        window.removeEventListener("resize", updateDimensions);
        c.dispose();
      };
    }

    init();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  // Sync activeTool state to canvas instance so events can read it
  useEffect(() => {
    if (
      activeTool === "select" ||
      activeTool === "text" ||
      activeTool === "uploads" ||
      activeTool === "layers"
    ) {
      if (fabricCanvasRef.current) {
        (fabricCanvasRef.current as any).__activeTool = activeTool;
      }
    }
  }, [activeTool]);

  // Sync artboard color
  useEffect(() => {
    if (artboardRef.current) {
      if (artboardColor === "transparent" || !artboardColor) {
        artboardRef.current.set({
          fill: "", // Fabric uses empty string or null for transparent
          stroke: "#333333", // Visible border when transparent
          strokeWidth: 1,
          strokeDashArray: [5, 5],
        });
      } else {
        artboardRef.current.set({
          fill: artboardColor,
          stroke: "transparent",
          strokeWidth: 0,
        });
      }
      fabricCanvasRef.current?.requestRenderAll();
    }
  }, [artboardColor]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const c = fabricCanvasRef.current;
      if (!c) return;

      const active = c.getActiveObjects();
      const activeObj = c.getActiveObject();

      if (
        activeObj &&
        (activeObj.isEditing ||
          (activeObj.type === "i-text" && activeObj.isEditing))
      ) {
        return;
      }

      // Panning Toggle (Space)
      if (e.code === "Space" && !activeObj?.isEditing) {
        if (!isPanningRef.current) {
          isPanningRef.current = true;
          if (c) {
            c.defaultCursor = "grab";
            c.selection = false; // Disable selection while panning
            c.requestRenderAll();
          }
        }
        // Prevent scrolling page on Space
        e.preventDefault();
      }

      // Delete
      if (e.key === "Delete" || e.key === "Backspace") {
        if (active.length > 0) {
          active.forEach((obj: any) => c.remove(obj));
          c.discardActiveObject();
          c.requestRenderAll();
          setSelectedObjects([]);
        }
      }

      // Nudge (Arrow keys)
      if (activeObj) {
        const STEP = e.shiftKey ? 10 : 1;
        let handled = false;

        if (e.key === "ArrowUp") {
          activeObj.top -= STEP;
          handled = true;
        }
        if (e.key === "ArrowDown") {
          activeObj.top += STEP;
          handled = true;
        }
        if (e.key === "ArrowLeft") {
          activeObj.left -= STEP;
          handled = true;
        }
        if (e.key === "ArrowRight") {
          activeObj.left += STEP;
          handled = true;
        }

        if (handled) {
          e.preventDefault();
          activeObj.setCoords();

          // clamp after nudges (using unified helper)
          clampToArtboard(c, artboardRef.current, activeObj);

          c.requestRenderAll();
          // Trigger save history for nudge
          c.fire("object:modified");
        }
      }

      // Undo/Redo Shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          if (c.__redo) c.__redo();
        } else {
          if (c.__undo) c.__undo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const handleKeyUp = (e: KeyboardEvent) => {
      const c = fabricCanvasRef.current;
      if (e.code === "Space") {
        isPanningRef.current = false;
        if (c) {
          c.defaultCursor = "default";
          c.selection = true;
          c.isDragging = false; // Stop drag
          c.requestRenderAll();
        }
      }
    };
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // FIX: Access `addTextAtPoint` from canvas instance in the listener
  const addTextAtPoint = async (
    point: { x: number; y: number },
    sub: string = "Heading"
  ) => {
    const c = getCanvas();
    if (!c) return;
    const { Textbox } = (await import("fabric")) as any;

    const t = new Textbox(sub, {
      left: point.x,
      top: point.y,
      originX: "center",
      originY: "center",
      width: 200,
      fontSize: sub === "Heading" ? 48 : 24,
      fill: "#18181b",
      fontFamily: "Inter",
      textAlign: "center",
      shadow: { color: "rgba(0,0,0,0.5)", blur: 4, offsetX: 2, offsetY: 2 },
    });
    (t as any).objectId = crypto.randomUUID();
    c.add(t);
    clampToArtboard(c, artboardRef.current, t);
    if (artboardRef.current) c.moveObjectTo(artboardRef.current, 0);
    c.setActiveObject(t);
    c.requestRenderAll();
  };

  // Attach helper to ref so the listener can find it
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.__addTextAtPoint = addTextAtPoint;
    }
  }, [fabricCanvasRef.current]);

  const getCanvas = () => fabricCanvasRef.current;

  // --- Actions ---

  // Refactored to ENTER "Add Text Mode"
  const setAddTextMode = () => {
    const c = getCanvas();
    if (!c) return;

    isAddingTextRef.current = true;
    c.defaultCursor = "text";
    c.selection = false; // Disable selection box
  };

  // Immediate add for Drawer Buttons (Canva style)
  const addTextImmediate = async (sub: string = "Heading") => {
    const c = getCanvas();
    if (!c) return;
    const { Textbox } = (await import("fabric")) as any;

    const vCenter = c.getVpCenter();

    // Use helper logic but at center
    const t = new Textbox(sub, {
      left: vCenter.x,
      top: vCenter.y,
      originX: "center",
      originY: "center",
      width: 200,
      fontSize: sub === "Heading" || sub === "HEADING" ? 48 : 24, // Case insensitive check
      fill: "#18181b",
      fontFamily: "Inter",
      textAlign: "center",
      shadow: { color: "rgba(0,0,0,0.5)", blur: 4, offsetX: 2, offsetY: 2 },
    });
    (t as any).objectId = crypto.randomUUID();
    c.add(t);
    clampToArtboard(c, artboardRef.current, t);
    if (artboardRef.current) c.moveObjectTo(artboardRef.current, 0);
    c.setActiveObject(t);
    c.requestRenderAll();

    // Also reset add mode if it was active?
    if (isAddingTextRef.current) {
      isAddingTextRef.current = false;
      c.defaultCursor = "default";
      c.selection = true;
    }
  };

  // --- Eraser Logic ---

  const canvasPointToImagePoint = (targetImage: any, point: { x: number, y: number }, fabricUtil: any) => {
    // 1. Invert image matrix to convert global point -> local point
    // Note: Fabric's calcTransformMatrix() returns global matrix.
    // We need inverse to go global -> local.
    const invMatrix = fabricUtil.invertTransform(targetImage.calcTransformMatrix());
    const localPoint = fabricUtil.transformPoint(point, invMatrix);

    // 2. Local point is centered relative to image center (because origin is center/center).
    // Convert to top-left relative for HTML Canvas drawing (0,0 is top-left).
    const width = targetImage.width;
    const height = targetImage.height;

    return {
      x: localPoint.x + width / 2,
      y: localPoint.y + height / 2
    };
  };

  const applyEraseToImage = async (image: any, paths: any[]) => {
    if (!image || paths.length === 0) return;

    // Dynamically import fabric to get util
    const { util } = (await import("fabric")) as any;

    // 1. Create offscreen canvas sized to ORIGINAL image dimensions (natural size)
    // We access ._element usually for the HTMLImageElement or internal canvas
    const originalElem = image.getElement();
    if (!originalElem) return;

    const w = originalElem.naturalWidth || originalElem.width;
    const h = originalElem.naturalHeight || originalElem.height;

    const offCanvas = document.createElement("canvas");
    offCanvas.width = w;
    offCanvas.height = h;
    const ctx = offCanvas.getContext("2d");
    if (!ctx) return;

    // 2. Draw current image state
    ctx.drawImage(originalElem, 0, 0, w, h);

    // 3. Setup Erasure
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // 4. Draw paths converted to local space
    paths.forEach(path => {
      // Path has a list of points or complex commands.
      // Simplest strategy for FreeDrawingBrush paths (which are usually "M ... Q ... L ...")
      // is to iterate points if path is complex, OR just look at path object properties.

      // Fabric's PENCIL brush outputs a Path object which has 'path' data (commands).
      // It's hard to parse "M 10 20 Q 30 40 50 60" manually and transform perfectly.
      // BETTER STRATEGY: 
      // Iterate path points? 
      // Actually, Fabric paths are just objects.
      // We can transform the path object itself into the local coordinate system!
      // But context drawing is pixels.

      // Alternative: For every path in global space:
      // We need to stroke it on the local canvas.
      // The stroke width must be scaled.
      // Eraser Size is global pixels. e.g. 20px.
      // Image ScaleX might be 0.5. So 20px global = 40px local.

      // Let's use points approach for simplicity with PencilBrush (simplest paths).
      // Fabric.Path.path is array of commands: [['M', x, y], ['Q', c1x, c1y, x, y], ...]

      const scaleX = image.scaleX; // We need to divide by this to get local width
      // Rough approximation of scale (assuming simple uniform scale for brush)
      // If image is zoomed out (small), brush needs to be huge in local space.
      const localBrushSize = eraserSize / scaleX;
      ctx.lineWidth = localBrushSize;

      const commands = path.path;
      ctx.beginPath();

      commands.forEach((cmd: any) => {
        const type = cmd[0];
        if (type === "M") {
          const p = canvasPointToImagePoint(image, { x: cmd[1], y: cmd[2] }, util);
          ctx.moveTo(p.x, p.y);
        } else if (type === "L") {
          const p = canvasPointToImagePoint(image, { x: cmd[1], y: cmd[2] }, util);
          ctx.lineTo(p.x, p.y);
        } else if (type === "Q") {
          const c1 = canvasPointToImagePoint(image, { x: cmd[1], y: cmd[2] }, util);
          const p = canvasPointToImagePoint(image, { x: cmd[3], y: cmd[4] }, util);
          ctx.quadraticCurveTo(c1.x, c1.y, p.x, p.y);
        }
      });
      ctx.stroke();
    });

    // 5. Update Image
    // Set src to new data URL
    const newData = offCanvas.toDataURL("image/png");

    // We need to update the Source.
    // image.setSrc is async
    return new Promise<void>((resolve) => {
      image.setSrc(newData, () => {
        // Force re-render?
        // Reset width/height potentially? usually setSrc handles it.
        resolve();
      });
    });
  };

  const enterEraseMode = async () => {
    const c = getCanvas();
    if (!c) return;

    // Check selection
    const active = c.getActiveObject();
    if (!active || active.type !== "image") {
      // Cannot erase. Show hint?
      // Handled in UI layer or assume handled before calling.
      // Here we force drawing mode.
      return;
    }

    // Save initial state for Cancel
    // Store original src on the object if not exists
    if (!active.__originalSrc) {
      active.__originalSrc = active.getSrc();
    }
    // Store for THIS session (to revert on Cancel)
    originalImageSrcRef.current = active.getSrc();

    // Import pencil brush dynamically
    const { PencilBrush } = (await import("fabric")) as any;

    c.isDrawingMode = true;
    c.freeDrawingBrush = new PencilBrush(c);
    c.freeDrawingBrush.color = "rgba(255, 255, 255, 0.5)"; // Visual preview
    c.freeDrawingBrush.width = eraserSize;

    // Disable selection logic while erasing
    c.selection = false;
    // Lock the image so we don't drag it
    active.selectable = false;
    active.evented = false; // Let clicks pass through? Or catch them for drawing.
    // Drawing mode handles events.
  };

  const exitEraseMode = (restoreSelection = true) => {
    const c = getCanvas();
    if (!c) return;

    c.isDrawingMode = false;
    c.selection = true;

    // Clear path refs
    eraserPathsRef.current = [];
    originalImageSrcRef.current = null;

    // Unlock objects
    // We need to re-find the image we were editing? 
    // Or just unlock all images? 
    // Optimization: we could track the target image in a ref.
    const imgs = c.getObjects("image");
    imgs.forEach((img: any) => {
      img.selectable = true;
      img.evented = true;
    });

    if (restoreSelection) {
      // Maybe restore selection?
    }
  };

  const handleApplyErase = async () => {
    const c = getCanvas();
    if (!c) return;

    // Find the image (it should be the only non-selectable one, or we track it)
    // Actually we are in a state where we just finished drawing. Use selection?
    // When isDrawingMode=true, getActiveObject might be null.
    // Let's assume the user hasn't changed selection because interaction was locked.
    // But we made it unselectable.
    // Let's find the image that has __originalSrc or just use the last known.
    // Better: find drawn paths.
    // Actually, we must know WHICH image to apply to.
    // Use getObjects("image").find...
    // OR: we track `editingImageRef`.
    // Let's find the image that has `selectable: false`.
    const targetImage = c.getObjects().find((o: any) => o.type === "image" && !o.selectable);

    if (targetImage && eraserPathsRef.current.length > 0) {
      await applyEraseToImage(targetImage, eraserPathsRef.current);

      // Remove temp paths
      eraserPathsRef.current.forEach(p => c.remove(p));
      eraserPathsRef.current = [];

      // Save History NOW
      const saveHist = (c as any).__saveHistory;
      if (saveHist) saveHist();

      c.requestRenderAll();
    }

    // Exit and re-select image
    exitEraseMode(false);
    if (targetImage) {
      targetImage.selectable = true;
      targetImage.evented = true;
      c.setActiveObject(targetImage);
    }
    setActiveTool("select");
  };

  const handleCancelErase = () => {
    const c = getCanvas();
    if (!c) return;

    // Revert image src
    const targetImage = c.getObjects().find((o: any) => o.type === "image" && !o.selectable);
    if (targetImage && originalImageSrcRef.current) {
      targetImage.setSrc(originalImageSrcRef.current, () => {
        c.requestRenderAll();
      });
    }

    // Remove temp paths
    eraserPathsRef.current.forEach(p => c.remove(p));
    eraserPathsRef.current = [];

    exitEraseMode();
    setActiveTool("select");
  };

  // Effect to handle paths created during Erase Mode
  useEffect(() => {
    const c = getCanvas();
    if (!c) return;

    const onPathCreated = (e: any) => {
      if (activeTool === "erase") {
        // Store path
        eraserPathsRef.current.push(e.path);
        // Make visual path clearer?
        // e.path.set({ stroke: 'rgba(255,255,255,0.8)', strokeWidth: eraserSize });
        // e.path.selectable = false;
      }
    };

    c.on("path:created", onPathCreated);
    return () => {
      c.off("path:created", onPathCreated);
    }
  }, [activeTool, eraserSize]);


  // Auto-enter Text Add Mode
  useEffect(() => {
    if (activeTool === "text") {
      setAddTextMode();
    } else if (activeTool === "erase") {
      enterEraseMode();
    } else {
      // Reset if switching away from Text
      if (isAddingTextRef.current) {
        isAddingTextRef.current = false;
        const c = getCanvas();
        if (c) {
          c.defaultCursor = "default";
          c.selection = true;
        }
      }
      // Reset if switching away from Erase
      // (Handled by checking if we were erasing?)
      // Safe to call exitEraseMode just in case
      exitEraseMode();
    }
  }, [activeTool]);

  const uploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (f) => {
      const data = f.target?.result as string;
      const c = getCanvas();
      if (!c) return;
      const { FabricImage } = (await import("fabric")) as any;
      const img = await FabricImage.fromURL(data);

      // TARGET: Center of Artboard (not viewport)
      const ab = artboardRef.current;
      let targetLeft = 0;
      let targetTop = 0;

      if (ab) {
        // Get artboard center
        const abRect = ab.getBoundingRect(); // This is in canvas coords (affected by zoom/pan if not carefully handled, but getBoundingRect usually returns current coords)
        // Wait, getBoundingRect is canvas coords.

        targetLeft = ab.left + (ab.width * ab.scaleX) / 2;
        targetTop = ab.top + (ab.height * ab.scaleY) / 2;

        // Fabric objects usually store center in left/top if origin is center
      } else {
        const center = c.getVpCenter();
        targetLeft = center.x;
        targetTop = center.y;
      }

      img.set({
        left: targetLeft,
        top: targetTop,
        originX: "center",
        originY: "center",
      });

      if (img.width > 500) img.scaleToWidth(400);

      (img as any).objectId = crypto.randomUUID();
      c.add(img);
      // Ensure artboard stays at index 0
      if (artboardRef.current) c.moveObjectTo(artboardRef.current, 0);
      c.setActiveObject(img);
      c.requestRenderAll();
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const adjustProp = async (prop: string, value: any) => {
    const c = getCanvas();
    if (!c) return;

    if (prop === "fontFamily") {
      // Load font first
      await loadGoogleFont(value);
    }

    // ... existing logic ...
    const active = c.getActiveObjects();
    if (!active.length) return;
    active.forEach((obj: any) => {
      obj.set(prop, value);
    });
    c.requestRenderAll();

    if (prop === "fill") setFill(value);
    if (prop === "fontFamily") setFontFamily(value);
    if (prop === "fontSize") setFontSize(value);
    if (prop === "fontWeight") setBold(value === "bold");
    if (prop === "fontStyle") setItalic(value === "italic");
    if (prop === "textAlign") setTextAlign(value);

    if (prop === "lineHeight") setLineHeight(value);
    if (prop === "charSpacing") setCharSpacing(value);
    if (prop === "textBackgroundColor") setTextBackgroundColor(value);
    if (prop === "opacity") setOpacity(value);
    if (prop === "globalCompositeOperation") setBlendMode(value);

    const saveHistory = (c as any).__saveHistory;
    if (typeof saveHistory === "function") {
      saveHistory();
    } else {
      c.fire("object:modified", { target: active[0] });
    }
  };

  const deleteSelected = () => {
    const c = getCanvas();
    if (!c) return;
    const active = c.getActiveObjects();
    if (active.length) {
      active.forEach((obj: any) => c.remove(obj));
      c.discardActiveObject();
      c.requestRenderAll();
      setSelectedObjects([]);
    }
  };

  const bringToFront = () => {
    const c = getCanvas();
    if (!c) return;
    const active = c.getActiveObject();
    if (active) {
      c.bringObjectToFront(active);
      c.requestRenderAll();
    }
  };

  const sendToBack = () => {
    const c = getCanvas();
    if (!c) return;
    const active = c.getActiveObject();
    if (active) {
      // Fix: Explicitly insert just above artboard to avoid hiding behind it
      const objects = c.getObjects();
      const abIndex = objects.indexOf(artboardRef.current);
      c.moveObjectTo(active, Math.max(abIndex + 1, 0));
      c.requestRenderAll();
    }
  };

  const exportJson = () => {
    const c = getCanvas();
    if (!c) return;

    // 0. Stabilize Viewport (Fix V2: Ensure export is independent of pan/zoom)
    const vpt = c.viewportTransform;
    c.setViewportTransform([1, 0, 0, 1, 0, 0]);

    // 1. Fabric Design Intent (Full Rehydration)
    const designIntent = c.toJSON([
      "objectId",
      "excludeFromExport",
      "id",
      "__isPlaceholder",
      "lockMovementX",
      "lockMovementY",
      "lockScalingX",
      "lockScalingY",
      "lockRotation",
      "visible",
    ]);

    // Filter objects
    designIntent.objects = designIntent.objects.filter(
      (obj: any) =>
        obj.visible !== false &&
        !obj.excludeFromExport &&
        obj.id !== "artboard" &&
        !obj.__isPlaceholder
    ); // Filter out placeholder

    // 2. Normalized Contract (Spec V2) - using unified helpers
    const ab = artboardRef.current;
    const artboardTopLeft = ab
      ? getArtboardRect(c, ab)
      : { left: 0, top: 0, width: ARTBOARD.w, height: ARTBOARD.h };

    const toArtboardSpace = (obj: any) => {
      obj.setCoords();
      const r = obj.getBoundingRect(true, true);
      return {
        x: r.left - artboardTopLeft.left,
        y: r.top - artboardTopLeft.top,
        w: r.width,
        h: r.height,
      };
    };

    const normalizedObjects = c
      .getObjects()
      .filter(
        (obj: any) =>
          obj.visible !== false &&
          !obj.excludeFromExport &&
          obj.id !== "artboard" &&
          !obj.__isPlaceholder
      )
      .map((obj: any) => {
        const relative = toArtboardSpace(obj);
        const origin = getOriginInArtboardSpace(c, ab, obj);

        return {
          id: obj.objectId,
          type: obj.type,
          // Bounding box for easy layout/preview (top-left of axis-aligned rect)
          boundingBox: {
            left: relative.x,
            top: relative.y,
            width: relative.w,
            height: relative.h,
          },
          // True transform for accurate reproduction (origin point, artboard-relative)
          transform: {
            originLeft: origin.x,
            originTop: origin.y,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
            angle: obj.angle,
            flipX: obj.flipX,
            flipY: obj.flipY,
            originX: obj.originX,
            originY: obj.originY,
            ...(obj.type === "image"
              ? {
                src: obj.getSrc ? obj.getSrc() : "",
                blendMode: obj.globalCompositeOperation, // Export blend mode
              }
              : {}),
          },
          style: {
            opacity: obj.opacity,
            fill: obj.fill,
            // Text specific
            ...(obj.type === "textbox" || obj.type === "i-text"
              ? {
                text: obj.text,
                fontFamily: obj.fontFamily,
                fontSize: obj.fontSize,
                fontWeight: obj.fontWeight,
                fontStyle: obj.fontStyle,
                textAlign: obj.textAlign,
                lineHeight: obj.lineHeight,
                charSpacing: obj.charSpacing,
                textBackgroundColor: obj.textBackgroundColor,
              }
              : {}),
            // Image specific
            ...(obj.type === "image"
              ? {
                src: obj.getSrc ? obj.getSrc() : "",
              }
              : {}),
          },
        };
      });

    const payload = {
      version: 2,
      artboard: { width: ARTBOARD.w, height: ARTBOARD.h },
      design: designIntent,
      normalized: normalizedObjects,
    };

    // Restore viewport
    c.setViewportTransform(vpt);
    c.requestRenderAll();

    setExportedJson(JSON.stringify(payload, null, 2));
  };

  const fitImageToArtboard = (mode: "contain" | "cover" = "contain") => {
    const c = getCanvas();
    const ab = artboardRef.current;
    const img = c?.getActiveObject();

    if (!c || !ab || !img || img.type !== "image") return;

    const iw = img.width;
    const ih = img.height;
    if (!iw || !ih) return;

    // Wrap entire operation in identity viewport for correct positioning
    withIdentityViewport(c, () => {
      const a = ab.getBoundingRect(true, true);

      const scaleX = a.width / iw;
      const scaleY = a.height / ih;
      const scale =
        mode === "cover" ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);

      img.set({
        scaleX: scale,
        scaleY: scale,
        left: a.left + a.width / 2,
        top: a.top + a.height / 2,
        originX: "center",
        originY: "center",
      });

      img.setCoords();
    });

    c.requestRenderAll();
  };

  // --- Render ---

  const activeObj = selectedObjects[0];
  const isText =
    activeObj?.type === "textbox" ||
    activeObj?.type === "i-text" ||
    activeObj?.type === "text";
  const isImage = activeObj?.type === "image";
  const showColor = activeObj && !isImage;

  return (
    <div className="font-urbanist flex h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-2xl bg-page text-primary shadow-2xl ring-1 ring-white/10 selection:bg-cyan selection:text-black">
      {/* Top Header */}
      <div className="flex h-16 items-center justify-between border-b border-white/5 bg-zinc-950 px-6">
        <div className="flex items-center gap-2">
          <span className="font-black text-xl text-white tracking-widest uppercase">
            Editor
          </span>
          <span className="text-cyan text-xl">.</span>
        </div>

        {/* Contextual Toolbar */}
        <div className="flex flex-1 items-center justify-center gap-2 px-8">
          {selectedObjects.length > 0 ? (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
              {showColor && (
                <div className="flex items-center gap-1 group">
                  <div className="relative">
                    <label className="flex items-center gap-2 cursor-pointer rounded-full bg-zinc-900 border border-white/10 px-3 py-1.5 hover:border-cyan/50 transition-colors">
                      <span
                        className="h-4 w-4 rounded-full border border-white/20"
                        style={{ backgroundColor: fill }}
                      ></span>
                      <input
                        type="color"
                        className="hidden"
                        value={fill}
                        onChange={(e) => adjustProp("fill", e.target.value)}
                      />
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    </label>
                  </div>
                </div>
              )}
              <div className="w-px h-6 bg-white/10 mx-1" />

              {isImage && (
                <div className="flex items-center gap-3">
                  {/* Opacity */}
                  <div className="flex flex-col gap-1 w-24">
                    <div className="flex justify-between text-[9px] uppercase font-bold text-gray-500">
                      <span>Opacity</span>
                      <span>{Math.round(opacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={opacity}
                      onChange={(e) =>
                        adjustProp("opacity", parseFloat(e.target.value))
                      }
                      className="h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan"
                    />
                  </div>



                  <div className="w-px h-6 bg-white/10 mx-1" />

                  {/* Flip */}
                  <button
                    onClick={() => {
                      const c = getCanvas();
                      const obj = c?.getActiveObject();
                      if (obj) {
                        adjustProp("flipX", !obj.flipX);
                      }
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white"
                    title="Flip Horizontal"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </button>

                  {/* Fit to Artboard */}
                  <button
                    onClick={() => fitImageToArtboard("contain")}
                    className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white"
                    title="Fit to Artboard"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              )}
              {isText && (
                <>
                  {/* Backdrop for click-outside - Rendered FIRST for safety */}
                  {isFontOpen && (
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsFontOpen(false)}
                    />
                  )}

                  <div className="relative">
                    <button
                      onClick={() => {
                        setIsFontOpen(!isFontOpen);
                        setTimeout(
                          () => fontSearchInputRef.current?.focus(),
                          100
                        );
                        // Preload all fonts when dropdown opens for preview
                        if (!isFontOpen) {
                          POPULAR_GOOGLE_FONTS.forEach((font) =>
                            loadGoogleFont(font)
                          );
                        }
                      }}
                      className="flex items-center gap-2 bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-full hover:border-cyan/50 transition-colors min-w-[140px] justify-between"
                    >
                      <span className="text-sm font-bold text-white truncate max-w-[100px]">
                        {fontFamily}
                      </span>
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>

                    {isFontOpen && (
                      <div className="absolute top-full left-0 mt-2 w-64 max-h-80 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-2 border-b border-white/5 sticky top-0 bg-zinc-950 z-10">
                          <input
                            ref={fontSearchInputRef}
                            type="text"
                            placeholder="Search fonts..."
                            value={fontSearch}
                            onChange={(e) => setFontSearch(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan/50 placeholder:text-gray-600"
                          />
                        </div>
                        <div className="overflow-y-auto p-1 flex-1 custom-scrollbar">
                          {POPULAR_GOOGLE_FONTS.filter((f) =>
                            f.toLowerCase().includes(fontSearch.toLowerCase())
                          ).map((font) => (
                            <button
                              key={font}
                              onClick={() => {
                                adjustProp("fontFamily", font);
                                setIsFontOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group ${font === fontFamily ? "bg-cyan/10 text-cyan" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                            >
                              <span style={{ fontFamily: font }}>{font}</span>
                              {font === fontFamily && (
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan" />
                              )}
                            </button>
                          ))}
                          {POPULAR_GOOGLE_FONTS.filter((f) =>
                            f.toLowerCase().includes(fontSearch.toLowerCase())
                          ).length === 0 && (
                              <div className="p-4 text-center text-xs text-gray-600 uppercase tracking-wider">
                                No fonts found
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center rounded-full border border-white/10 bg-zinc-900 overflow-hidden">
                    <button
                      onClick={() => adjustProp("fontSize", fontSize - 2)}
                      className="px-3 py-1.5 hover:bg-white/5 text-gray-400 hover:text-white transition"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={fontSize}
                      onChange={(e) =>
                        adjustProp("fontSize", Number(e.target.value))
                      }
                      className="w-10 bg-transparent text-center text-sm font-mono focus:outline-none appearance-none m-0 text-white"
                    />
                    <button
                      onClick={() => adjustProp("fontSize", fontSize + 2)}
                      className="px-3 py-1.5 hover:bg-white/5 text-gray-400 hover:text-white transition"
                    >
                      +
                    </button>
                  </div>

                  <div className="w-px h-6 bg-white/10 mx-1" />

                  <button
                    onClick={() =>
                      adjustProp("fontWeight", bold ? "normal" : "bold")
                    }
                    className={`p-2 rounded-full transition-colors ${bold ? "bg-cyan text-black" : "hover:bg-white/10 text-gray-400 hover:text-white"}`}
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      adjustProp("fontStyle", italic ? "normal" : "italic")
                    }
                    className={`p-2 rounded-full transition-colors ${italic ? "bg-cyan text-black" : "hover:bg-white/10 text-gray-400 hover:text-white"}`}
                  >
                    <Italic className="w-4 h-4" />
                  </button>

                  <div className="w-px h-6 bg-white/10 mx-1" />

                  <div className="flex items-center bg-zinc-900 rounded-full border border-white/10 p-0.5">
                    <button
                      onClick={() => adjustProp("textAlign", "left")}
                      className={`p-1.5 rounded-full transition-all ${textAlign === "left" ? "bg-white/10 text-cyan" : "text-gray-500 hover:text-white"}`}
                    >
                      <AlignLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => adjustProp("textAlign", "center")}
                      className={`p-1.5 rounded-full transition-all ${textAlign === "center" ? "bg-white/10 text-cyan" : "text-gray-500 hover:text-white"}`}
                    >
                      <AlignCenter className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => adjustProp("textAlign", "right")}
                      className={`p-1.5 rounded-full transition-all ${textAlign === "right" ? "bg-white/10 text-cyan" : "text-gray-500 hover:text-white"}`}
                    >
                      <AlignRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="w-px h-6 bg-white/10 mx-1" />

                  {/* Spacing & Leading */}
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center gap-0.5">
                      <label className="text-[9px] text-gray-500 uppercase font-bold">
                        L.H.
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="3"
                        value={lineHeight || 1.2}
                        onChange={(e) =>
                          adjustProp("lineHeight", parseFloat(e.target.value))
                        }
                        className="w-10 bg-transparent text-xs text-center border-b border-white/20 focus:border-cyan outline-none text-white py-0.5"
                      />
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <label className="text-[9px] text-gray-500 uppercase font-bold">
                        Char
                      </label>
                      <input
                        type="number"
                        step="10"
                        value={charSpacing || 0}
                        onChange={(e) =>
                          adjustProp("charSpacing", parseInt(e.target.value))
                        }
                        className="w-10 bg-transparent text-xs text-center border-b border-white/20 focus:border-cyan outline-none text-white py-0.5"
                      />
                    </div>
                  </div>

                  {/* Text Background (Toggle Background Color) */}
                  <div className="relative group">
                    <label className="cursor-pointer block">
                      <div
                        className={`w-6 h-6 rounded border ${textBackgroundColor ? "bg-current border-white/50" : "bg-transparent border-white/20"}`}
                        style={{ color: textBackgroundColor || "transparent" }}
                      >
                        {!textBackgroundColor && (
                          <div className="w-full h-full relative overflow-hidden">
                            <div className="absolute inset-0 border-t border-red-500 rotate-45 top-1/2 "></div>
                          </div>
                        )}
                      </div>
                      <input
                        type="color"
                        className="hidden"
                        value={textBackgroundColor || "#000000"}
                        onChange={(e) =>
                          adjustProp("textBackgroundColor", e.target.value)
                        }
                      />
                    </label>
                    {/* Clear Button */}
                    {textBackgroundColor && (
                      <button
                        onClick={() => adjustProp("textBackgroundColor", "")}
                        className="absolute -top-1 -right-1 bg-zinc-950 text-white rounded-full p-0.5 hover:text-red-400"
                      >
                        <Trash2 className="w-2 h-2" />
                      </button>
                    )}
                  </div>
                </>
              )}

              <div className="w-px h-6 bg-white/10 mx-1" />

              <button
                onClick={bringToFront}
                title="Bring to Front"
                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
              >
                <Layers className="w-4 h-4" />
              </button>
              {/* Send to back logic is subtle with artboard */}
              <button
                onClick={sendToBack}
                title="Send to Back"
                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition opacity-70 hover:opacity-100"
              >
                <Layers className="w-4 h-4 rotate-180" />
              </button>

              <div className="w-px h-6 bg-white/10 mx-1" />

              <button
                onClick={deleteSelected}
                title="Delete (Del/Backspace)"
                className="p-2 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500 font-medium tracking-wide uppercase">
                Artboard
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-400">Color</label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer rounded-full bg-zinc-900 border border-white/10 px-3 py-1.5 hover:border-cyan/50 transition-colors">
                    <span
                      className="h-4 w-4 rounded-full border border-white/20"
                      style={{
                        backgroundColor:
                          artboardColor === "transparent"
                            ? "transparent"
                            : artboardColor,
                      }}
                    >
                      {artboardColor === "transparent" && (
                        <div className="w-full h-full border border-red-500 rotate-45 transform scale-125" />
                      )}
                    </span>
                    <input
                      type="color"
                      className="hidden"
                      value={
                        artboardColor === "transparent"
                          ? "#ffffff"
                          : artboardColor
                      }
                      onChange={(e) => setArtboardColor(e.target.value)}
                    />
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </label>
                  <button
                    onClick={() => setArtboardColor("transparent")}
                    className={`p-1.5 rounded-full border transition-all ${artboardColor === "transparent" ? "bg-white/10 border-red-500/50" : "bg-transparent border-white/10 hover:border-white/30"}`}
                    title="Set Transparent Background"
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-white relative overflow-hidden">
                      <div className="absolute inset-0 border-t border-red-500 top-1/2 -translate-y-1/2 -rotate-45 scale-125" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
            {/* Removed Confined toggle */}
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1 mr-4 border-r border-white/10 pr-4">
            <button
              onClick={() => {
                if (fabricCanvasRef.current?.__undo)
                  fabricCanvasRef.current.__undo();
              }}
              disabled={!canUndo}
              className={`p-2 rounded-full transition ${!canUndo ? "text-gray-700 cursor-not-allowed" : "text-gray-400 hover:text-white hover:bg-white/10"}`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (fabricCanvasRef.current?.__redo)
                  fabricCanvasRef.current.__redo();
              }}
              disabled={!canRedo}
              className={`p-2 rounded-full transition ${!canRedo ? "text-gray-700 cursor-not-allowed" : "text-gray-400 hover:text-white hover:bg-white/10"}`}
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2 mr-4 border-r border-white/10 pr-4">
            <button
              onClick={() => {
                if (
                  fabricCanvasRef.current &&
                  fabricCanvasRef.current.__fitToScreen
                ) {
                  fabricCanvasRef.current.__fitToScreen();
                }
              }}
              className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition"
              title="Fit to Screen"
            >
              <Maximize className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-gray-500 w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <button
            onClick={exportJson}
            className="group flex items-center gap-2 bg-white hover:bg-cyan text-black px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 hover:scale-105"
          >
            <Download className="w-4 h-4" />
            Export Intent
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden bg-page">
        {/* Left Sidebar */}
        <div className="flex w-[90px] flex-col border-r border-white/5 bg-zinc-950 py-4 gap-2 z-10">
          <SidebarTab
            active={activeTool === "select"}
            onClick={() => setActiveTool("select")}
            icon={MousePointer2}
            label="Select"
          />

          <SidebarTab
            active={activeTool === "text"}
            onClick={() => setActiveTool("text")}
            icon={Type}
            label="Text"
          />
          <SidebarTab
            active={activeTool === "uploads"}
            onClick={() => setActiveTool("uploads")}
            icon={Upload}
            label="Uploads"
          />
          <SidebarTab
            active={activeTool === "layers"}
            onClick={() => setActiveTool("layers")}
            icon={Layers}
            label="Layers"
          />
          <SidebarTab
            active={activeTool === "erase"}
            onClick={() => setActiveTool("erase")}
            icon={Eraser}
            label="Erase"
          />
        </div>

        {/* Drawer */}
        {activeTool !== "select" && (
          <div className="w-[320px] flex px-6 py-8 border-r border-white/5 bg-[#050505] flex-col gap-6 overflow-y-auto z-10 animate-in slide-in-from-left-5 duration-300">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              {activeTool}
            </h2>

            {/* ... other tools ... */}

            {activeTool === "layers" && (
              <div className="space-y-2">
                {layers.length === 0 && (
                  <div className="text-gray-500 text-sm">No layers yet.</div>
                )}
                {layers.map((obj, i) => {
                  const isSelected = selectedObjects.includes(obj);
                  const isLocked = obj.lockMovementX; // Simple check

                  // Icon based on type
                  let LayerIcon = Square;
                  if (obj.type === "i-text" || obj.type === "textbox")
                    LayerIcon = Type;
                  if (obj.type === "image") LayerIcon = ImageIcon;

                  return (
                    <div
                      key={(obj as any).objectId || i}
                      className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${isSelected ? "bg-cyan/10 border-cyan/50" : "bg-zinc-900 border-white/5 hover:border-white/20"}`}
                    >
                      <div
                        onClick={() => {
                          const c = getCanvas();
                          if (c) {
                            c.discardActiveObject();
                            c.setActiveObject(obj);
                            c.requestRenderAll();
                          }
                        }}
                        className="flex-1 flex items-center gap-3 cursor-pointer"
                      >
                        <div
                          className={`p-2 rounded-lg ${isSelected ? "bg-cyan/20 text-cyan" : "bg-black text-gray-500"}`}
                        >
                          <LayerIcon className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-sm font-bold truncate max-w-[120px] ${isSelected ? "text-white" : "text-gray-400"}`}
                        >
                          {obj.text
                            ? obj.text.length > 15
                              ? obj.text.slice(0, 15) + "..."
                              : obj.text
                            : obj.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            obj.set("visible", !obj.visible);
                            obj.canvas?.requestRenderAll();
                            // Force update layers to reflect state (or just force render)
                            // Updating layers state isn't strictly needed for visibility unless we show different icon
                            setLayers([...layers]);
                          }}
                          className="p-1 hover:text-white text-gray-500"
                        >
                          {obj.visible ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const locked = !obj.lockMovementX;
                            obj.set({
                              lockMovementX: locked,
                              lockMovementY: locked,
                              lockRotation: locked,
                              lockScalingX: locked,
                              lockScalingY: locked,
                              selectable: true, // Keep selectable so we can unlock it
                            });
                            obj.canvas?.requestRenderAll();
                            // Force update to reflect lock icon state
                            setLayers([...layers]);
                          }}
                          className="p-1 hover:text-white text-gray-500"
                        >
                          {isLocked ? (
                            <Lock className="w-3.5 h-3.5 text-red-400" />
                          ) : (
                            <Unlock className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <div className="flex flex-col ml-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              obj.bringForward();
                              // obj.canvas?.requestRenderAll(); // usually implicit
                              // We need to re-fetch layers because order changed
                              const c = getCanvas();
                              // wait for fabric to sort?
                              // bringForward is sync.
                              if (c) {
                                const objs = c
                                  .getObjects()
                                  .filter(
                                    (o: any) =>
                                      o.id !== "artboard" &&
                                      !o.excludeFromExport
                                  )
                                  .reverse();
                                setLayers([...objs]);
                              }
                            }}
                            className="p-0.5 hover:text-cyan text-gray-600"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              obj.sendBackwards();
                              const c = getCanvas();
                              if (c) {
                                const objs = c
                                  .getObjects()
                                  .filter(
                                    (o: any) =>
                                      o.id !== "artboard" &&
                                      !o.excludeFromExport
                                  )
                                  .reverse();
                                setLayers([...objs]);
                              }
                            }}
                            className="p-0.5 hover:text-cyan text-gray-600"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTool === "erase" && (
              <div className="space-y-6">
                {/* Eraser Controls */}
                <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5 space-y-4">
                  <div className="flex items-center justify-between pointer-events-none">
                    <span className="text-sm font-bold text-gray-400">Brush Size</span>
                    <span className="text-xs font-mono text-cyan">{eraserSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={eraserSize}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setEraserSize(val);
                      const c = getCanvas();
                      if (c && c.freeDrawingBrush) {
                        c.freeDrawingBrush.width = val;
                      }
                    }}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleApplyErase}
                    className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-black uppercase text-sm tracking-widest rounded-xl transition shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Eraser className="w-4 h-4" />
                    Apply Eraser
                  </button>
                  <button
                    onClick={handleCancelErase}
                    className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-gray-300 font-bold uppercase text-xs tracking-widest rounded-xl transition border border-white/5 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <div className="flex gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-full h-fit text-blue-400">
                      <Eraser className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-blue-200">How to use</h4>
                      <p className="text-xs text-blue-300/80 leading-relaxed">
                        Select an image first. Paint over areas you want to remove. Click Apply to finish.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTool === "text" && (
              <div className="space-y-4">
                <button
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase text-xl py-4 rounded-xl transition shadow-lg border border-white/5 active:scale-[0.98]"
                  onClick={() => addTextImmediate("HEADING")}
                >
                  HEADING
                </button>
                <div className="flex gap-2">
                  <button
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase text-sm py-3 rounded-xl transition shadow-lg border border-white/5 active:scale-[0.98]"
                    onClick={() => addTextImmediate("Subheading")}
                  >
                    Subheading
                  </button>
                  <button
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs py-3 rounded-xl transition shadow-lg border border-white/5 active:scale-[0.98]"
                    onClick={() => addTextImmediate("Body Text")}
                  >
                    Body Text
                  </button>
                </div>
              </div>
            )}

            {activeTool === "uploads" && (
              <div className="space-y-6">
                <div
                  className="border border-dashed border-white/10 bg-white/5 rounded-2xl p-8 text-center hover:border-cyan/50 hover:bg-cyan/5 transition-all duration-300 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="mx-auto w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4 text-cyan">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-white uppercase tracking-wide mb-1">
                    Upload Image
                  </p>
                  <p className="text-xs text-gray-500">JPG, PNG, WEBP</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={uploadImage}
                />
              </div>
            )}
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-page overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] pointer-events-none" />
          <div ref={containerRef} className="absolute inset-0">
            <canvas ref={canvasElRef} className="block" />
          </div>

          {exportedJson && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
              <div className="bg-zinc-950 border border-white/10 p-8 rounded-3xl w-full max-w-2xl shadow-[0_0_50px_rgba(34,211,238,0.1)] space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                    Export Ready
                  </h3>
                  <button
                    onClick={() => setExportedJson("")}
                    className="text-gray-500 hover:text-white transition"
                  >
                    Close
                  </button>
                </div>
                <div className="bg-black p-6 rounded-2xl border border-white/5 overflow-auto max-h-[400px]">
                  <pre className="text-xs font-mono text-cyan/90 leading-relaxed whitespace-pre-wrap break-all">
                    {exportedJson}
                  </pre>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setExportedJson("")}
                    className="px-6 py-3 text-gray-400 font-bold text-sm tracking-widest hover:text-white uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(exportedJson);
                      alert("Copied!");
                    }}
                    className="px-8 py-3 bg-cyan hover:bg-cyan-bold text-black font-black text-sm uppercase tracking-widest rounded-full transition hover:scale-105"
                  >
                    Copy to Clipboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SidebarTab({ active, icon: Icon, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full aspect-square flex flex-col items-center justify-center gap-2 transition-all duration-200 relative group
                ${active ? "text-cyan" : "text-gray-500 hover:text-white"}
            `}
    >
      <div
        className={`p-3 rounded-2xl transition-all duration-300 ${active ? "bg-cyan/10 ring-1 ring-cyan/50" : "group-hover:bg-white/5"}`}
      >
        <Icon className="w-6 h-6" strokeWidth={active ? 2 : 1.5} />
      </div>
      <span
        className={`text-[10px] font-bold uppercase tracking-widest ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}
      >
        {label}
      </span>
      {active && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan rounded-l-full" />
      )}
    </button>
  );
}
