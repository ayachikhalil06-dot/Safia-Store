"use client";

import { useState, useTransition } from "react";
import type { StoreSettings, SeoSettings, CheckoutSettings, YalidineSettings } from "@/types";
import {
  updateStoreSettingsAction,
  updateSeoSettingsAction,
  updateCheckoutSettingsAction,
  updateYalidineSettingsAction,
} from "@/app/actions/admin";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";

interface SettingsFormProps {
  store: StoreSettings;
  seo: SeoSettings;
  checkout: CheckoutSettings;
  yalidine: YalidineSettings;
}

export function SettingsForm({
  store: initialStore,
  seo: initialSeo,
  checkout: initialCheckout,
  yalidine: initialYalidine,
}: SettingsFormProps) {
  const [store, setStore] = useState(initialStore);
  const [seo, setSeo] = useState(initialSeo);
  const [checkout, setCheckout] = useState(initialCheckout);
  const [yalidine, setYalidine] = useState(initialYalidine);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const save = (action: () => Promise<{ success: boolean }>) => {
    startTransition(async () => {
      const result = await action();
      setMessage(result.success ? "Enregistré avec succès" : "Erreur");
      setTimeout(() => setMessage(null), 3000);
    });
  };

  return (
    <div className="space-y-8">
      {message && (
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      )}

      <section className="rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
        <h2 className="font-semibold text-neutral-900">Informations du magasin</h2>
        <Input
          label="Nom de la boutique"
          value={store.name}
          onChange={(e) => setStore({ ...store, name: e.target.value })}
        />
        <Input
          label="Slogan"
          value={store.tagline}
          onChange={(e) => setStore({ ...store, tagline: e.target.value })}
        />
        <Textarea
          label="Description"
          rows={3}
          value={store.description}
          onChange={(e) => setStore({ ...store, description: e.target.value })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            value={store.email}
            onChange={(e) => setStore({ ...store, email: e.target.value })}
          />
          <Input
            label="Téléphone"
            value={store.phone}
            onChange={(e) => setStore({ ...store, phone: e.target.value })}
          />
        </div>
        <Input
          label="Adresse"
          value={store.address}
          onChange={(e) => setStore({ ...store, address: e.target.value })}
        />
        <Button
          onClick={() => save(() => updateStoreSettingsAction(store as unknown as Record<string, unknown>))}
          loading={isPending}
        >
          Enregistrer
        </Button>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
        <h2 className="font-semibold text-neutral-900">SEO</h2>
        <Input
          label="Titre SEO"
          value={seo.title}
          onChange={(e) => setSeo({ ...seo, title: e.target.value })}
        />
        <Textarea
          label="Description SEO"
          rows={2}
          value={seo.description}
          onChange={(e) => setSeo({ ...seo, description: e.target.value })}
        />
        <Input
          label="Mots-clés"
          value={seo.keywords}
          onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
        />
        <Button
          onClick={() => save(() => updateSeoSettingsAction(seo as unknown as Record<string, unknown>))}
          loading={isPending}
        >
          Enregistrer SEO
        </Button>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
        <h2 className="font-semibold text-neutral-900">Commande</h2>
        <Input
          label="Montant minimum de commande (DZD)"
          type="number"
          min="0"
          value={checkout.min_order_amount.toString()}
          onChange={(e) =>
            setCheckout({
              ...checkout,
              min_order_amount: parseFloat(e.target.value) || 0,
            })
          }
        />
        <Switch
          checked={checkout.cod_enabled}
          onChange={(v) => setCheckout({ ...checkout, cod_enabled: v })}
          label="Paiement à la livraison activé"
        />
        <Switch
          checked={checkout.allow_notes}
          onChange={(v) => setCheckout({ ...checkout, allow_notes: v })}
          label="Autoriser les notes"
        />
        <Button
          onClick={() =>
            save(() =>
              updateCheckoutSettingsAction(checkout as unknown as Record<string, unknown>)
            )
          }
          loading={isPending}
        >
          Enregistrer
        </Button>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
        <h2 className="font-semibold text-neutral-900">Yalidine</h2>
        <p className="text-sm text-neutral-500">
          Configurez l&apos;intégration Yalidine pour l&apos;expédition automatique.
          Ajoutez YALIDINE_API_ID et YALIDINE_API_TOKEN dans vos variables d&apos;environnement.
        </p>
        <Switch
          checked={yalidine.enabled}
          onChange={(v) => setYalidine({ ...yalidine, enabled: v })}
          label="Activer Yalidine"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Wilaya d'expédition"
            value={yalidine.from_wilaya}
            onChange={(e) =>
              setYalidine({ ...yalidine, from_wilaya: e.target.value })
            }
          />
          <Input
            label="Commune d'expédition"
            value={yalidine.from_commune}
            onChange={(e) =>
              setYalidine({ ...yalidine, from_commune: e.target.value })
            }
          />
        </div>
        <Button
          onClick={() =>
            save(() =>
              updateYalidineSettingsAction(yalidine as unknown as Record<string, unknown>)
            )
          }
          loading={isPending}
        >
          Enregistrer Yalidine
        </Button>
      </section>
    </div>
  );
}
