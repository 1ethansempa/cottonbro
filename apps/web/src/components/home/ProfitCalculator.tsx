"use client";

import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";

export function ProfitCalculator() {
  const [productType, setProductType] = useState<string>("heavyweight");
  const [sellingPrice, setSellingPrice] = useState<number>(60000);
  const [salesQuantity, setSalesQuantity] = useState<number>(50);

  // Platform fee (flat)
  const PLATFORM_FEE = 10000;

  // Base blank cost per product type (excluding platform fee)
  const blankCosts: Record<string, number> = {
    heavyweight: 35000,
    classic: 25000,
    polo: 40000,
    hoodie: 45000,
  };
  const blankCost = blankCosts[productType] ?? 35000;
  const totalCost = blankCost + PLATFORM_FEE;

  const profitPerItem = Math.max(0, sellingPrice - totalCost);
  const totalProfit = profitPerItem * salesQuantity;

  return (
    <div className="mx-auto w-full max-w-5xl border border-black shadow-[4px_4px_0_rgba(0,0,0,1)] sm:shadow-[8px_8px_0_rgba(0,0,0,1)] bg-white flex flex-col md:flex-row">
      {/* Left Col - Inputs */}
      <div className="flex-1 p-6 sm:p-8 md:p-16 border-b md:border-b-0 md:border-r border-black space-y-10 sm:space-y-12">
        <div className="mb-12">
          <h3 className="text-3xl md:text-4xl font-black text-black tracking-tighter uppercase mb-2">
            PROFIT CALCULATOR
          </h3>
          <p className="text-[10px] text-black/60 font-bold tracking-[0.2em] uppercase">
            DESIGN. SELL. OWN YOUR BRAND.
          </p>
        </div>

        {/* Select Product Type */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-black/60 tracking-[0.2em] uppercase block">
            SELECT PRODUCT TYPE
          </label>
          <div className="relative">
            <select
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="w-full border border-black px-5 py-4 bg-white font-bold text-sm tracking-wide text-black cursor-pointer appearance-none focus:outline-none rounded-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='black' viewBox='0 0 24 24' stroke-width='2'%3E%3Cpath stroke-linecap='square' stroke-linejoin='miter' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '16px' }}
            >
              <option value="heavyweight">Heavyweight Tee</option>
              <option value="classic">Classic Tee</option>
              <option value="polo">Polo Shirt</option>
              <option value="hoodie">Hoodie</option>
            </select>
          </div>
        </div>

        {/* Selling Price */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-black/60 tracking-[0.2em] uppercase block">
            YOUR SELLING PRICE
          </label>
          <div className="flex items-center border border-black bg-white">
            <div className="px-5 py-4 border-r border-black flex-shrink-0 bg-[#f5f5f5]">
              <span className="text-black font-black text-sm tracking-widest">UGX</span>
            </div>
            <input 
              type="number" 
              value={sellingPrice}
              onChange={(e) => setSellingPrice(Number(e.target.value))}
              className="w-full px-5 py-4 font-black text-lg text-black focus:outline-none bg-transparent rounded-none"
            />
          </div>
        </div>

        {/* Estimated Sales Slider */}
        <div className="space-y-6">
          <div className="flex flex-row justify-between items-center gap-2">
            <label className="text-[10px] font-bold text-black/60 tracking-[0.2em] uppercase">
              ESTIMATED SALES
            </label>
            <span className="font-black text-lg sm:text-xl text-black border border-black px-3 sm:px-4 py-1 bg-[#f5f5f5]">
              {salesQuantity}
            </span>
          </div>
          <div className="relative pt-2">
            <input 
              type="range" 
              min="1" 
              max="1000" 
              value={salesQuantity}
              onChange={(e) => setSalesQuantity(Number(e.target.value))}
              className="w-full h-1 bg-black rounded-none appearance-none cursor-pointer outline-none"
            />
            {/* Brutalist thumb */}
            <style dangerouslySetInnerHTML={{__html: `
              input[type=range]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 16px;
                height: 24px;
                background: #e60000;
                border: 2px solid black;
                cursor: pointer;
              }
              input[type=range]::-moz-range-thumb {
                width: 16px;
                height: 24px;
                background: #e60000;
                border: 2px solid black;
                cursor: pointer;
                border-radius: 0;
              }
            `}} />
          </div>
          <div className="flex justify-between text-[10px] text-black/40 font-bold tracking-widest">
            <span>1</span>
            <span>1,000+</span>
          </div>
        </div>
      </div>

      {/* Right Col - Outputs */}
      <div className="flex-1 flex flex-col relative bg-[#f5f5f5]">
        <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-8 md:p-16">
          <div className="text-center space-y-2 mb-10 w-full">
            <p className="text-[10px] font-bold text-black/60 tracking-[0.2em] uppercase">
              PROFIT PER ITEM
            </p>
            <p className="mx-auto min-w-[13rem] text-xl font-black text-black tracking-widest tabular-nums">
              UGX <span className="text-3xl">{profitPerItem.toLocaleString()}</span>
            </p>
          </div>

          <div className="w-full flex items-center justify-center mb-10 opacity-40">
            <span className="text-sm font-black text-black tracking-[0.3em]">× ESTIMATED SALES</span>
          </div>

          <div className="text-center space-y-3 w-full">
            <p className="text-[10px] font-bold text-black/60 tracking-[0.3em] uppercase">
              TOTAL PROFIT
            </p>
            <div className="mx-auto flex w-full max-w-full flex-col items-center justify-center gap-y-1 px-2 text-center text-[#e60000] font-black tabular-nums">
              <span className="text-xl sm:text-2xl md:text-3xl">UGX</span>
              <span className="block w-full max-w-full break-words text-[clamp(2.25rem,7vw,4.5rem)] leading-none [overflow-wrap:anywhere]">
                {totalProfit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Button attached to bottom of Right Col */}
        <button className="group flex w-full items-center justify-center bg-black hover:opacity-80 transition-all text-white py-6 font-bold text-[10px] tracking-[0.2em] uppercase cursor-pointer border-t border-black">
          START YOUR BRAND
          <ArrowUpRight className="h-3.5 w-0 -translate-x-2 opacity-0 transition-all duration-300 group-hover:w-3.5 group-hover:translate-x-0 group-hover:opacity-100 group-hover:ml-2" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
