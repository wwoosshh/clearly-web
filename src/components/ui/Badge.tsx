import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  /** 배지 변형 */
  variant?: BadgeVariant;
  /** 배지 크기 */
  size?: BadgeSize;
  /** 배지 내용 */
  children: ReactNode;
  /** 추가 클래스명 */
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[#f0ede8] text-[#72706a]",
  primary: "bg-[#eef7f3] text-[#2d6a4f]",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-red-700",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

function Badge({
  variant = "default",
  size = "sm",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps };
