/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { TriangleAlert as AlertTriangle } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, icon, rightElement, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-display"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none shrink-0">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`
              w-full bg-slate-50 dark:bg-slate-900 border 
              ${error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : "border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-500/20"} 
              rounded-xl py-2.5 px-3 text-xs text-slate-900 dark:text-white font-medium
              focus:outline-none focus:ring-4 focus:bg-white dark:focus:bg-slate-950 transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon ? "pl-10" : ""}
              ${rightElement ? "pr-10" : ""}
              ${className}
            `}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 shrink-0">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <div className="flex items-center gap-1.5 text-rose-500 dark:text-rose-400 mt-1">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <p className="text-[10px] font-semibold">{error}</p>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";