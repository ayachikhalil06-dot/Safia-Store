"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import type { Category } from "@/types";
import { cn } from "@/utils/cn";

interface MobileNavProps {
  categories: Category[];
  storeName: string;
}

export function MobileNav({ categories, storeName }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <nav
            className={cn(
              "absolute left-0 top-0 h-full w-72 bg-white shadow-2xl",
              "animate-in slide-in-from-left duration-300"
            )}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4">
              <span className="font-semibold text-neutral-900">
                {storeName || "Menu"}
              </span>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-neutral-600 hover:bg-neutral-100"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              <Link
                href="/products"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-100"
              >
                Tous les produits
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
