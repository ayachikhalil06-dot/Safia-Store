"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/utils/cn";

export function CartButton() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      className={cn(
  "relative flex h-12 w-12 items-center justify-center rounded-full",
  "bg-pink-100 text-pink-600 shadow-md transition-all duration-200",
  "hover:bg-pink-200 hover:scale-110 active:scale-95"
)}
      aria-label={`Panier (${itemCount} articles)`}
    >
     <ShoppingBag size={26} strokeWidth={2.2} />
      {itemCount > 0 && (
        <span
  className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg ring-2 ring-white"
>
  {itemCount > 9 ? "9+" : itemCount}
</span>
      )}
    </Link>
  );
}
