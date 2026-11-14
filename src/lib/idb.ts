// 轻量 IndexedDB 封装：结构化数据 + 图片 Blob 分库存
import type { Course, Submission, User } from '../types';

const DB_NAME = 'embroidery-courseware';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('users')) db.createObjectStore('users', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('courses')) db.createObjectStore('courses', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('submissions')) db.createObjectStore('submissions', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('blobs')) db.createObjectStore('blobs', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('drafts')) db.createObjectStore('drafts', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const req = fn(t.objectStore(store));
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error);
      }),
  );
}

export const idb = {
  getAll<T>(store: string): Promise<T[]> {
    return tx<T[]>(store, 'readonly', (s) => s.getAll());
  },
  get<T>(store: string, key: string): Promise<T | undefined> {
    return tx<T | undefined>(store, 'readonly', (s) => s.get(key));
  },
  put<T>(store: string, value: T): Promise<IDBValidKey> {
    return tx<IDBValidKey>(store, 'readwrite', (s) => s.put(value));
  },
  bulkPut<T>(store: string, values: T[]): Promise<void> {
    return openDB().then(
      (db) =>
        new Promise<void>((resolve, reject) => {
          const t = db.transaction(store, 'readwrite');
          const s = t.objectStore(store);
          for (const v of values) s.put(v);
          t.oncomplete = () => resolve();
          t.onerror = () => reject(t.error);
        }),
    );
  },
  remove(store: string, key: string): Promise<void> {
    return openDB().then(
      (db) =>
        new Promise<void>((resolve, reject) => {
          const t = db.transaction(store, 'readwrite');
          t.objectStore(store).delete(key);
          t.oncomplete = () => resolve();
          t.onerror = () => reject(t.error);
        }),
    );
  },
  clear(store: string): Promise<void> {
    return openDB().then(
      (db) =>
        new Promise<void>((resolve, reject) => {
          const t = db.transaction(store, 'readwrite');
          t.objectStore(store).clear();
          t.oncomplete = () => resolve();
          t.onerror = () => reject(t.error);
        }),
    );
  },
};

export interface BlobRecord {
  id: string;
  blob: Blob;
}

export async function saveBlob(id: string, blob: Blob): Promise<void> {
  await idb.put('blobs', { id, blob } satisfies BlobRecord);
}

export async function loadBlob(id: string): Promise<Blob | undefined> {
  const rec = await idb.get<BlobRecord>('blobs', id);
  return rec?.blob;
}

export async function loadImage(blobId: string): Promise<HTMLImageElement> {
  const blob = await loadBlob(blobId);
  if (!blob) throw new Error('图片数据缺失: ' + blobId);
  const url = URL.createObjectURL(blob);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('图片解码失败'));
      img.src = url;
    });
  } finally {
    // 浏览器仍保留解码后的位图，可尽快释放对象 URL
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

export async function seedIfEmpty(users: User[], courses: Course[], submissions: Submission[], blobs: BlobRecord[]): Promise<boolean> {
  const existing = await idb.getAll<User>('users');
  if (existing.length > 0) return false;
  await idb.bulkPut('users', users);
  await idb.bulkPut('courses', courses);
  await idb.bulkPut('submissions', submissions);
  await idb.bulkPut('blobs', blobs);
  return true;
}
