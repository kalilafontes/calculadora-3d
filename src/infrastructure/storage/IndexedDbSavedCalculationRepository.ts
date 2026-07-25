import type {
  SavedCalculation,
  SavedCalculationRepository,
} from "./SavedCalculationRepository";

const DATABASE_NAME = "calculadora3d";
const DATABASE_VERSION = 1;
const STORE_NAME = "saved-calculations";

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export class IndexedDbSavedCalculationRepository implements SavedCalculationRepository {
  readonly #indexedDb: IDBFactory;

  constructor(indexedDb: IDBFactory = window.indexedDB) {
    this.#indexedDb = indexedDb;
  }

  async #open(): Promise<IDBDatabase> {
    const request = this.#indexedDb.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });
        store.createIndex("updatedAt", "updatedAt");
      }
    };
    return requestToPromise(request);
  }

  async listRecent(limit = 5): Promise<SavedCalculation[]> {
    const database = await this.#open();
    try {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const request = transaction
        .objectStore(STORE_NAME)
        .index("updatedAt")
        .getAll();
      const calculations = await requestToPromise(
        request as IDBRequest<SavedCalculation[]>,
      );
      return calculations
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, limit);
    } finally {
      database.close();
    }
  }

  async save(calculation: SavedCalculation): Promise<void> {
    const database = await this.#open();
    try {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      await requestToPromise(
        transaction.objectStore(STORE_NAME).put(calculation),
      );
    } finally {
      database.close();
    }
  }

  async delete(id: string): Promise<void> {
    const database = await this.#open();
    try {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      await requestToPromise(transaction.objectStore(STORE_NAME).delete(id));
    } finally {
      database.close();
    }
  }
}
