"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Truck, CreditCard } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { WILAYAS } from "@/utils/algeria";
import { formatPrice } from "@/utils/format";
import { isValidPhone, normalizePhone } from "@/utils/helpers";
import { checkoutAction, getShippingCostAction } from "@/app/actions/checkout";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export function CheckoutForm() {
  const { cart, total, clear } = useCart();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [shippingCost, setShippingCost] = useState(0);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    wilayaCode: "",
    commune: "",
    address: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (form.wilayaCode) {
      getShippingCostAction(Number(form.wilayaCode)).then(setShippingCost);
    } else {
      setShippingCost(0);
    }
  }, [form.wilayaCode]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = "Le nom est requis";
    if (!form.phone.trim()) newErrors.phone = "Le téléphone est requis";
    else if (!isValidPhone(form.phone))
      newErrors.phone = "Numéro de téléphone invalide";
    if (!form.wilayaCode) newErrors.wilayaCode = "La wilaya est requise";
    if (!form.commune.trim()) newErrors.commune = "La commune est requise";
    if (!form.address.trim()) newErrors.address = "L'adresse est requise";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const wilaya = WILAYAS.find((w) => w.code === Number(form.wilayaCode));

    startTransition(async () => {
      setError(null);
      const result = await checkoutAction({
        fullName: form.fullName.trim(),
        phone: normalizePhone(form.phone.trim()),
        wilaya: wilaya?.name || "",
        wilayaCode: Number(form.wilayaCode),
        commune: form.commune.trim(),
        address: form.address.trim(),
        notes: form.notes.trim(),
      });

      if (result.success) {
        await clear();
        setSuccess(result.orderNumber || "");
      } else {
        setError(result.error || "Une erreur est survenue.");
      }
    });
  };

  if (success) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <CheckCircle className="h-16 w-16 text-emerald-600" />
        <h2 className="mt-4 text-2xl font-semibold text-neutral-900">
          Commande confirmée
        </h2>
        <p className="mt-2 text-neutral-600">
          Votre numéro de commande est{" "}
          <span className="font-semibold">{success}</span>
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Nous vous contacterons pour confirmer la livraison.
        </p>
        <Button className="mt-8" onClick={() => router.push("/products")}>
          Continuer mes achats
        </Button>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-neutral-600">Votre panier est vide.</p>
        <Button className="mt-4" onClick={() => router.push("/products")}>
          Voir les produits
        </Button>
      </div>
    );
  }

  const grandTotal = total + shippingCost;

  return (
    <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Informations de livraison
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              id="fullName"
              label="Nom complet"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              error={errors.fullName}
              required
            />
            <Input
              id="phone"
              label="Téléphone"
              type="tel"
              placeholder="0XX XX XX XX XX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              error={errors.phone}
              required
            />
            <Select
              id="wilaya"
              label="Wilaya"
              placeholder="Sélectionner une wilaya"
              value={form.wilayaCode}
              onChange={(e) => setForm({ ...form, wilayaCode: e.target.value })}
              error={errors.wilayaCode}
              options={WILAYAS.map((w) => ({ value: w.code, label: w.name }))}
              required
            />
            <Input
              id="commune"
              label="Commune"
              value={form.commune}
              onChange={(e) => setForm({ ...form, commune: e.target.value })}
              error={errors.commune}
              required
            />
            <div className="sm:col-span-2">
              <Input
                id="address"
                label="Adresse"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                error={errors.address}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Textarea
                id="notes"
                label="Note (optionnel)"
                rows={3}
                placeholder="Instructions de livraison, informations complémentaires..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Mode de paiement
          </h2>
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-neutral-900 bg-neutral-50 p-4">
            <CreditCard className="h-5 w-5 text-neutral-900" />
            <div>
              <p className="font-medium text-neutral-900">Paiement à la livraison</p>
              <p className="text-sm text-neutral-500">
                Payez en espèces à la réception de votre commande.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="sticky top-24 rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-neutral-900">Récapitulatif</h2>

          <div className="mt-4 max-h-48 space-y-3 overflow-y-auto">
            {cart.items.map((item) => (
              <div
                key={`${item.productId}-${JSON.stringify(item.variant)}`}
                className="flex justify-between text-sm"
              >
                <span className="text-neutral-600">
                  {item.name} x{item.quantity}
                </span>
                <span className="font-medium">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2 border-t border-neutral-200 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Sous-total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1 text-neutral-600">
                <Truck className="h-3.5 w-3.5" />
                Livraison
              </span>
              <span>
                {form.wilayaCode
                  ? formatPrice(shippingCost)
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-2">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-semibold">
                {formatPrice(grandTotal)}
              </span>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}

          <Button
            type="submit"
            size="lg"
            className="mt-6 w-full"
            loading={isPending}
          >
            Confirmer la commande
          </Button>
        </div>
      </div>
    </form>
  );
}
