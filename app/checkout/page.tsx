import type { Metadata } from "next";
import { CheckoutForm } from "@/components/store/CheckoutForm";

export const metadata: Metadata = {
  title: "Commande",
  description: "Finalisez votre commande avec paiement à la livraison.",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight text-neutral-900">
        Finaliser la commande
      </h1>
      <CheckoutForm />
    </div>
  );
}
