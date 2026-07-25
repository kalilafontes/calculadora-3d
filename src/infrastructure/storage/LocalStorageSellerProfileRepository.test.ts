import { describe, expect, it } from "vitest";
import {
  LocalStorageSellerProfileRepository,
  SELLER_PROFILE_STORAGE_KEY,
} from "./LocalStorageSellerProfileRepository";

describe("LocalStorageSellerProfileRepository", () => {
  it("salva e restaura o perfil do vendedor", () => {
    const repository = new LocalStorageSellerProfileRepository();
    const profile = {
      name: "Ateliê 3D",
      email: "contato@example.com",
      phone: "(71) 99999-9999",
      document: "00.000.000/0001-00",
    };

    repository.save(profile);

    expect(repository.load()).toEqual(profile);
  });

  it("ignora conteúdo inválido", () => {
    window.localStorage.setItem(SELLER_PROFILE_STORAGE_KEY, '{"name":42}');

    expect(new LocalStorageSellerProfileRepository().load()).toBeNull();
  });
});
