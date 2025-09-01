"use client";

import React from "react";
import { DEFI_TOKENS } from "../lib/constants";

export type TokenSelectProps = {
  token: string;
  onSelect: (token: string) => void;
  label: string;
  amount: string;
  onAmountChange: (value: string, isToken0?: boolean) => void;
  showMax?: boolean;
  disabled?: boolean;
  balances: Record<string, string>;
};

export default function TokenSelect({
  token,
  onSelect,
  label,
  amount,
  onAmountChange,
  showMax = true,
  disabled = false,
  balances,
}: TokenSelectProps) {
  const hasSufficientBalance = (token: string, amount: string) => {
    if (!amount || !token) return false;
    const balance = parseFloat(balances[token] || "0");
    const requiredAmount = parseFloat(amount);
    return balance >= requiredAmount;
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-400">{label}</span>
        {showMax && (
          <button
            onClick={() =>
              onAmountChange(
                balances[token] || "0",
                label.includes("A") || label.includes("From")
              )
            }
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            MAX
          </button>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <input
            type="text"
            value={amount}
            onChange={(e) =>
              onAmountChange(e.target.value, label.includes("A") || label.includes("From"))
            }
            placeholder="0.0"
            disabled={disabled}
            className="w-full bg-transparent text-2xl font-bold text-white placeholder-slate-500 outline-none disabled:opacity-50"
          />
          <div className="text-sm text-slate-500 mt-1">
            Balance: {parseFloat(balances[token] || "0").toFixed(4)} {token}
          </div>
        </div>

        <select
          value={token}
          onChange={(e) => onSelect(e.target.value)}
          disabled={disabled}
          className="bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-xl transition-all duration-200 border border-slate-600/50 text-white font-semibold disabled:opacity-50"
        >
          {Object.entries(DEFI_TOKENS).map(([symbol, tokenData]) => (
            <option key={symbol} value={symbol}>
              {tokenData.logo} {symbol}
            </option>
          ))}
        </select>
      </div>

      {!hasSufficientBalance(token, amount) && amount && parseFloat(amount) > 0 && (
        <div className="text-xs text-red-400 mt-2">Insufficient balance</div>
      )}
    </div>
  );
}
