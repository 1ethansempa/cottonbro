import { SiteHeader } from "@/components/site-header";

export default function CreateProductPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <SiteHeader theme="light" position="static" />
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="border border-gray-200 bg-gray-50 w-full max-w-4xl aspect-video flex flex-col items-center justify-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
            Create Product Canvas
          </p>
          <p className="mt-2 text-sm font-medium text-gray-500">
            Coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
