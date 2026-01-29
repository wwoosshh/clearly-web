"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SidebarItem {
  /** 메뉴 라벨 */
  label: string;
  /** 링크 경로 */
  href: string;
  /** 아이콘 (ReactNode) */
  icon?: ReactNode;
}

interface SidebarProps {
  /** 메뉴 항목 목록 */
  items: SidebarItem[];
  /** 추가 클래스명 */
  className?: string;
}

function Sidebar({ items, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "w-60 shrink-0 border-r border-gray-200 bg-white",
        className
      )}
    >
      <nav className="flex flex-col gap-1 p-4">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              {item.icon && (
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center",
                    isActive ? "text-blue-600" : "text-gray-400"
                  )}
                >
                  {item.icon}
                </span>
              )}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export { Sidebar };
export type { SidebarProps, SidebarItem };
