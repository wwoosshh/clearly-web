"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      id,
      type = "text",
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.replace(/\s+/g, "-").toLowerCase();

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-medium text-[#1a1918]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            "h-[44px] w-full rounded-lg border bg-white px-3.5 text-[14px] text-[#1a1918] outline-none transition-all duration-150",
            "placeholder:text-[#a8a49c]",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
              : "border-[#e2ddd6] focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10",
            "disabled:bg-[#f0ede8] disabled:text-[#a8a49c] disabled:cursor-not-allowed",
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error && (
          <p className="text-[12px] text-red-500">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-[12px] text-[#72706a]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
