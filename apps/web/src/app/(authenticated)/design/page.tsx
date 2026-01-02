"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const FabricEditor = dynamic(
  () => import("../../../components/fabric-editor"),
  { ssr: false }
);

const DesignWizard = dynamic(
  () => import("../../../components/design-wizard"),
  { ssr: false }
);

type ViewMode = "wizard" | "editor" | "complete";

export default function DesignPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("wizard");
  const [confirmedDesign, setConfirmedDesign] = useState<string | null>(null);

  if (viewMode === "editor") {
    return <FabricEditor />;
  }

  if (viewMode === "complete") {
    return (
      <div className="min-h-screen bg-page text-white font-urbanist flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">Design Confirmed!</h1>
          <p className="text-zinc-400 mb-8">Your products are ready to publish.</p>
          {/* TODO: Connect to publish flow */}
          <button
            onClick={() => setViewMode("wizard")}
            className="px-8 py-4 bg-cyan text-black font-bold rounded-full"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <DesignWizard
      onComplete={(designUrl, products) => {
        setConfirmedDesign(designUrl);
        setViewMode("complete");
        console.log("Completed with:", { designUrl, products });
      }}
      onSkipToEditor={() => setViewMode("editor")}
    />
  );
}
