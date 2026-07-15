/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = "inline-flex items-center justify-center font-bold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none rounded-xl";
    
    const variants = {
      primary: "bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-350 text-slate-950 shadow-md hover:shadow-emerald-500/20 focus:ring-emerald-500",
      secondary: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 focus:ring-slate-500",
      outline: "border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 dark:hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 focus:ring-emerald-500 bg-transparent",
      ghost: "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 focus:ring-slate-500",
      danger: "bg-rose-500 hover:bg-rose-400 text-white shadow-md hover:shadow-rose-500/20 focus:ring-rose-500",
      success: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-md hover:shadow-emerald-500/20 focus:ring-emerald-500"
    };

    const sizes = {
      sm: "h-8 px-3 text-[10px] uppercase",
      md: "h-10 px-4 text-xs uppercase",
      lg: "h-12 px-6 text-sm uppercase",
      icon: "h-10 w-10 p-2"
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="mr-2 shrink-0">{leftIcon}</span>}
        <span className="truncate">{children as React.ReactNode}</span>
        {!isLoading && rightIcon && <span className="ml-2 shrink-0">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = "Button";