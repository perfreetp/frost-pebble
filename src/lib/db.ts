import { openDB, type IDBPDatabase } from 'idb';
import type {
  BackgroundRecord,
  EditDoc,
  ImageRecord,
  Item,
  Project,
} from './types';

const DB_NAME = 'rehab-cutout-studio';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

/**
 * Solid's stores hand back Proxy objects; IndexedDB's structured clone throws
 * on those, so every row is reduced to plain data on the way out.
 */
function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function db() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(d) {
        if (!d.objectStoreNames.contains('projects')) d.createObjectStore('projects', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('items')) d.createObjectStore('items', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('images')) d.createObjectStore('images', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('backgrounds')) d.createObjectStore('backgrounds', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta');
      },
    });
  }
  return dbPromise;
}

export async function putProjects(list: Project[]) {
  const d = await db();
  const tx = d.transaction('projects', 'readwrite');
  await Promise.all(list.map((p) => tx.store.put(plain(p))));
  await tx.done;
}

export async function loadProjects(): Promise<Project[]> {
  return (await (await db()).getAll('projects')) as Project[];
}

export async function putItems(list: Item[]) {
  const d = await db();
  const tx = d.transaction('items', 'readwrite');
  await Promise.all(list.map((i) => tx.store.put(plain(i))));
  await tx.done;
}

export async function loadItems(): Promise<Item[]> {
  return (await (await db()).getAll('items')) as Item[];
}

export async function deleteItemRow(id: string) {
  await (await db()).delete('items', id);
}

export async function putImage(rec: ImageRecord) {
  await (await db()).put('images', { ...rec });
}

export async function loadImages(): Promise<ImageRecord[]> {
  return (await (await db()).getAll('images')) as ImageRecord[];
}

export async function putBackground(rec: BackgroundRecord) {
  await (await db()).put('backgrounds', { ...rec });
}

export async function loadBackgrounds(): Promise<BackgroundRecord[]> {
  return (await (await db()).getAll('backgrounds')) as BackgroundRecord[];
}

export async function deleteBackgroundRow(id: string) {
  await (await db()).delete('backgrounds', id);
}

export async function getMeta<T>(key: string): Promise<T | undefined> {
  return (await db()).get('meta', key) as Promise<T | undefined>;
}

export async function setMeta(key: string, value: unknown) {
  await (await db()).put('meta', value, key);
}

export type { EditDoc };
