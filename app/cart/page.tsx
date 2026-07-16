import Link from "next/link";
import type { Metadata } from "next";
import { CartPageContent } from "@/components/store/CartPageContent";

export const metadata: Metadata = {
  title: "Panier",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
     <Link
  href="/#products"
  className="mb-6 inline-flex items-center gap-2 rounded-full bg-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-pink-600 transition"
>
  ← Continuer mes achats
</Link>
      <h1 className="mb-8 text-3xl font-semibold tracking-tight text-neutral-900">
        Panier
      </h1>
      <CartPageContent />
    </div>
  );
}
