import type {
  YalidineSettings,
  OrderWithDetails,
  CheckoutFormData,
} from "@/types";

interface YalidineParcelPayload {
  order_id: string;
  from_wilaya_name: string;
  from_commune_name: string;
  to_wilaya_name: string;
  to_commune_name: string;
  to_address: string;
  firstname: string;
  familyname: string;
  contact_phone: string;
  product_list: string;
  price: number;
  do_insurance: boolean;
  is_exchange: boolean;
  has_exchange: boolean;
}

interface YalidineResponse {
  success: boolean;
  tracking?: string;
  label?: string;
  error?: string;
}

export class YalidineService {
  private apiId: string;
  private apiToken: string;
  private apiUrl: string;

  constructor() {
    this.apiId = process.env.YALIDINE_API_ID || "";
    this.apiToken = process.env.YALIDINE_API_TOKEN || "";
    this.apiUrl = process.env.YALIDINE_API_URL || "https://api.yalidine.app/v1";
  }

  isConfigured(): boolean {
    return Boolean(this.apiId && this.apiToken);
  }

  private getHeaders(): HeadersInit {
    return {
      "X-API-ID": this.apiId,
      "X-API-TOKEN": this.apiToken,
      "Content-Type": "application/json",
    };
  }

  async createParcel(
    order: OrderWithDetails,
    settings: YalidineSettings
  ): Promise<YalidineResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: "Yalidine API non configurée. Ajoutez YALIDINE_API_ID et YALIDINE_API_TOKEN.",
      };
    }

    if (!settings.enabled) {
      return { success: false, error: "Yalidine désactivé dans les paramètres." };
    }

    const nameParts = order.customer.full_name.split(" ");
    const firstname = nameParts[0] || order.customer.full_name;
    const familyname = nameParts.slice(1).join(" ") || firstname;

    const productList = order.items
      .map((item) => `${item.product_name} x${item.quantity}`)
      .join(", ");

    const payload: YalidineParcelPayload = {
      order_id: order.order_number,
      from_wilaya_name: settings.from_wilaya,
      from_commune_name: settings.from_commune,
      to_wilaya_name: order.customer.wilaya,
      to_commune_name: order.customer.commune,
      to_address: order.customer.address,
      firstname,
      familyname,
      contact_phone: order.customer.phone,
      product_list: productList,
      price: order.total,
      do_insurance: false,
      is_exchange: false,
      has_exchange: false,
    };

    try {
      const response = await fetch(`${this.apiUrl}/parcels`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `Erreur API Yalidine: ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        tracking: data.tracking,
        label: data.label,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur réseau Yalidine",
      };
    }
  }

  async getWilayas(): Promise<{ id: number; name: string }[]> {
    if (!this.isConfigured()) return [];

    try {
      const response = await fetch(`${this.apiUrl}/wilayas`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) return [];
      const data = await response.json();
      return data.data || [];
    } catch {
      return [];
    }
  }

  async getCommunes(wilayaId: number): Promise<{ id: number; name: string }[]> {
    if (!this.isConfigured()) return [];

    try {
      const response = await fetch(
        `${this.apiUrl}/communes?wilaya_id=${wilayaId}`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) return [];
      const data = await response.json();
      return data.data || [];
    } catch {
      return [];
    }
  }

  async trackParcel(trackingId: string): Promise<{
    status: string;
    history: { date: string; status: string; location: string }[];
  } | null> {
    if (!this.isConfigured()) return null;

    try {
      const response = await fetch(
        `${this.apiUrl}/parcels/${trackingId}/history`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }
}

export const yalidineService = new YalidineService();

export type { YalidineParcelPayload, YalidineResponse };
