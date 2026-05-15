"use client";

import React from "react";

export function Marquee() {
  const items = [
    "NO INVENTORY",
    "WEEKLY PAYOUTS",
    "KAMPALA WIDE DELIVERY",
    "MOBILE MONEY SUPPORTED",
    "NO INVENTORY",
    "WEEKLY PAYOUTS",
    "KAMPALA WIDE DELIVERY",
    "MOBILE MONEY SUPPORTED",
  ];

  return (
    <div className="bg-black text-white overflow-hidden py-3 border-y border-black">
      <div className="relative flex w-full">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: flex;
            white-space: nowrap;
            animation: marquee 40s linear infinite;
          }
        ` }} />
        <div className="animate-marquee flex gap-16 md:gap-32 w-max">
          {[...items, ...items].map((item, id) => (
            <div key={id} className="flex items-center gap-16 md:gap-32">
              <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] whitespace-nowrap opacity-90">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
