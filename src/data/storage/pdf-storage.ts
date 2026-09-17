export interface PdfStorageAdapter {
  put(key: string, file: Blob): Promise<void>;
  get(key: string): Promise<Blob | undefined>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

const databaseName = "personal-learning-os-pdf-v1";
const objectStore = "documents";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") { reject(new Error("IndexedDB unavailable")); return; }
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(objectStore);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function transaction<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore, resolve: (value: T) => void, reject: (reason?: unknown) => void) => void): Promise<T> {
  const db = await openDatabase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(objectStore, mode);
      tx.onabort = () => reject(tx.error);
      action(tx.objectStore(objectStore), resolve, reject);
    });
  } finally { db.close(); }
}

export const browserPdfStorage: PdfStorageAdapter = {
  put: (key, file) => transaction<void>("readwrite", (store, resolve, reject) => {
    const request = store.put(file, key); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error);
  }),
  get: (key) => transaction<Blob | undefined>("readonly", (store, resolve, reject) => {
    const request = store.get(key); request.onsuccess = () => resolve(request.result as Blob | undefined); request.onerror = () => reject(request.error);
  }),
  remove: (key) => transaction<void>("readwrite", (store, resolve, reject) => {
    const request = store.delete(key); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error);
  }),
  clear: () => transaction<void>("readwrite", (store, resolve, reject) => {
    const request = store.clear(); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error);
  }),
};

// A future R2 adapter can implement this contract behind an authenticated API.
