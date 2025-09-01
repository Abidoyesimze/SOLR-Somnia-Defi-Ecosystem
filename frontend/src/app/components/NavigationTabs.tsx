"use client";

import { motion } from "framer-motion";
import { ArrowDown, TrendingUp } from "lucide-react";
import React from "react";

export type NavigationTabsProps = {
  currentView: "swap" | "liquidity";
  onChange: (view: "swap" | "liquidity") => void;
};

export default function NavigationTabs({ currentView, onChange }: NavigationTabsProps) {
  return (
    <div className="flex items-center space-x-1 bg-slate-800/50 p-1 rounded-2xl mb-6">
      <motion.button
        onClick={() => onChange("swap")}
        className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
          currentView === "swap"
            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
            : "text-slate-400 hover:text-white hover:bg-slate-700/50"
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <ArrowDown className="w-4 h-4" />
        <span>Swap</span>
      </motion.button>

      <motion.button
        onClick={() => onChange("liquidity")}
        className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
          currentView === "liquidity"
            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
            : "text-slate-400 hover:text-white hover:bg-slate-700/50"
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <TrendingUp className="w-4 h-4" />
        <span>Liquidity</span>
      </motion.button>
    </div>
  );
}
