"use client";

import React, { useState } from "react";

export function ProfitCalculator() {
  const [sellingPrice, setSellingPrice] = useState<number>(60000);
  const [salesQuantity, setSalesQuantity] = useState<number>(50);

  // Base production cost + platform fee
  const BASE_COST = 45000; 

  const profitPerItem = Math.max(0, sellingPrice - BASE_COST);
  const totalProfit = profitPerItem * salesQuantity;

  return (
    <div className="bg-white px-8 py-12 md:p-16 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.08)] mx-auto w-full max-w-[900px]">
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
            <div className="border border-gray-200 px-5 py-4 bg-white flex items-center justify-between cursor-pointer">
              <span className="font-bold text-sm tracking-wide text-black">Heavyweight Tee</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
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
            <div className="text-[#e60000] font-black tracking-tighter flex items-end justify-center gap-2">
              <span className="text-2xl pb-2">UGX</span>
              <span className="text-[64px] leading-none">
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
