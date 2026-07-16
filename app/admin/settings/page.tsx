import {
  getStoreSettings,
  getSeoSettings,
  getCheckoutSettings,
  getYalidineSettings,
} from "@/services/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const [store, seo, checkout, yalidine] = await Promise.all([
    getStoreSettings(),
    getSeoSettings(),
    getCheckoutSettings(),
    getYalidineSettings(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Paramètres</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Configurez votre boutique
      </p>
      <div className="mt-8">
        <SettingsForm
          store={store}
          seo={seo}
          checkout={checkout}
          yalidine={yalidine}
        />
      </div>
    </div>
  );
}
