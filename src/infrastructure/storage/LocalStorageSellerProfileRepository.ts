import type { SellerProfile } from "../../domain/quotation/quotation.types";

export const SELLER_PROFILE_STORAGE_KEY = "calculadora3d:seller-profile:v1";

export class LocalStorageSellerProfileRepository {
  readonly #storage: Storage;

  constructor(storage: Storage = window.localStorage) {
    this.#storage = storage;
  }

  load(): SellerProfile | null {
    try {
      const serialized = this.#storage.getItem(SELLER_PROFILE_STORAGE_KEY);
      if (!serialized) return null;
      const profile = JSON.parse(serialized) as Partial<SellerProfile>;
      if (typeof profile.name !== "string") return null;
      return {
        name: profile.name,
        email: typeof profile.email === "string" ? profile.email : "",
        phone: typeof profile.phone === "string" ? profile.phone : "",
        document: typeof profile.document === "string" ? profile.document : "",
      };
    } catch {
      return null;
    }
  }

  save(profile: SellerProfile): void {
    try {
      this.#storage.setItem(
        SELLER_PROFILE_STORAGE_KEY,
        JSON.stringify(profile),
      );
    } catch {
      // O orçamento continua disponível mesmo sem persistência local.
    }
  }
}
