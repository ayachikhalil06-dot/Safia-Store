import Link from "next/link";
import { getStoreSettings } from "@/services/settings";
import { getCategories } from "@/services/categories";

export async function Footer() {
  const [settings, categories] = await Promise.all([
    getStoreSettings(),
    getCategories(),
  ]);

  return (
    <footer className="mt-auto border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">
              {settings.name || "Boutique"}
            </h3>
            {settings.tagline && (
              <p className="mt-2 text-sm text-neutral-600">{settings.tagline}</p>
            )}
            {settings.description && (
              <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                {settings.description}
              </p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Navigation</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/products" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  Tous les produits
                </Link>
              </li>
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Contact</h3>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              {settings.phone && <li>{settings.phone}</li>}
              {settings.email && (
                <li>
                  <a href={`mailto:${settings.email}`} className="hover:text-neutral-900 transition-colors">
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.address && <li>{settings.address}</li>}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Livraison</h3>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
              Livraison dans toute l&apos;Algérie. Paiement à la livraison uniquement.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-neutral-200 pt-6 text-center text-xs text-neutral-500">
          &copy; {new Date().getFullYear()} {settings.name || "Boutique"}. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
