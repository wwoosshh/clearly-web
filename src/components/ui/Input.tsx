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
            className="text-[13px] font-medium text-gray-800"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            "h-[44px] w-full rounded-lg border px-3.5 text-[14px] transition-colors",
            "placeholder:text-gray-400",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
              : "border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5",
            "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed",
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error && (
          <p className="text-[12px] text-red-500">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-[12px] text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
