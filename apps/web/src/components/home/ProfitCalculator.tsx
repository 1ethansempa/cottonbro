"use client";

import React, { useState } from "react";

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
    <div className="bg-white px-6 py-12 sm:px-8 md:p-16 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.08)] mx-auto w-full max-w-[900px]">
      <div className="text-center mb-16">
        <h3 className="text-3xl md:text-4xl font-black text-black tracking-tighter uppercase mb-4">
          PROFIT CALCULATOR
        </h3>
        <p className="text-[10px] text-gray-400 font-bold tracking-[0.4em] uppercase">
          DESIGN. SELL. MAKE MONEY. OWN YOUR BRAND.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-16 md:gap-24 mb-14">
        {/* Left Col - Inputs */}
        <div className="flex-1 space-y-10">
          {/* Select Product Type */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase block">
              SELECT PRODUCT TYPE
            </label>
            <select
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="w-full border border-gray-200 px-5 py-4 bg-white font-bold text-sm tracking-wide text-black cursor-pointer appearance-none focus:outline-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='1.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '20px' }}
            >
              <option value="heavyweight">Heavyweight Tee</option>
              <option value="classic">Classic Tee</option>
              <option value="polo">Polo Shirt</option>
              <option value="hoodie">Hoodie</option>
            </select>
          </div>

          {/* Selling Price */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase block">
              YOUR SELLING PRICE
            </label>
            <div className="relative flex items-center border border-gray-200 bg-white">
              <div className="px-5 py-4 border-r border-gray-200 flex-shrink-0">
                <span className="text-gray-400 font-bold text-sm tracking-widest">UGX</span>
              </div>
              <input 
                type="number" 
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full px-5 py-4 font-black text-lg text-black focus:outline-none placeholder-gray-300"
              />
            </div>
          </div>

          {/* Estimated Sales Slider */}
          <div className="space-y-5">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">
                ESTIMATED SALES
              </label>
            </div>
            <div className="relative">
              <div className="absolute right-0 top-[-45px] border border-gray-200 px-6 py-2 font-black text-xl text-black bg-white">
                {salesQuantity}
              </div>
              <input 
                type="range" 
                min="1" 
                max="1000" 
                value={salesQuantity}
                onChange={(e) => setSalesQuantity(Number(e.target.value))}
                className="w-full h-[2px] bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#cc0000] outline-none"
              />
              {/* Fake thumb if accent fails */}
              <style dangerouslySetInnerHTML={{__html: `
                input[type=range]::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 16px;
                  height: 16px;
                  background: #e60000;
                  border-radius: 50%;
                  cursor: pointer;
                }
              `}} />
            </div>
            <div className="flex justify-between text-[10px] text-gray-300 font-bold tracking-widest">
              <span>1</span>
              <span>1,000+</span>
            </div>
          </div>
        </div>

        {/* Right Col - Outputs */}
        <div className="flex-1 flex flex-col justify-center items-center relative py-4">
          {/* Pale pink circle decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#fff0f0] rounded-bl-full rounded-tr-xl opacity-80 -mr-8 -mt-8 pointer-events-none" />

          <div className="text-center space-y-2 mb-10 w-full z-10">
            <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">
              YOUR PROFIT PER ITEM
            </p>
            <p className="text-lg font-bold text-black tracking-widest">
              UGX <span className="text-2xl">{profitPerItem.toLocaleString()}</span>
            </p>
          </div>

          <div className="w-full flex items-center justify-center mb-10 z-10 opacity-30">
            <span className="text-sm font-black text-gray-400 tracking-[0.3em]">X ESTIMATED SALES</span>
          </div>

          <div className="text-center space-y-3 w-full z-10">
            <p className="text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase">
              TOTAL PROFIT
            </p>
            <div className="text-[#e60000] font-black tracking-tighter flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1">
              <span className="text-xl sm:text-2xl">UGX</span>
              <span className="text-[clamp(2.75rem,15vw,4rem)] leading-none">
                {totalProfit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <button className="w-full bg-black hover:opacity-80 transition-all text-white py-6 font-bold text-xs tracking-[0.2em] uppercase cursor-pointer">
        START YOUR BRAND TODAY
      </button>
    </div>
  );
}
