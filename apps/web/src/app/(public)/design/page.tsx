"use client";

import dynamic from "next/dynamic";

const FabricEditor = dynamic(
  () => import("../../../components/fabric-editor"),
  {
    ssr: false,
  }
);

export default function EditorDemoPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">
            Fabric Editor Demo
          </h1>
          <p className="text-sm text-slate-400">
            Minimal editor + export “design intent” JSON
          </p>
        </div>
      </div>

      <FabricEditor />
    </div>
  );
}
