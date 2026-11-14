// 方案浏览器本地存储：IndexedDB（失败回退 localStorage）
import type { ProjectData } from '../types';

const DB_NAME = 'neon-studio';
const STORE = 'projects';
const LS_KEY = 'neon-studio-projects';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(project: ProjectData): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(project);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function idbGetAll(): Promise<ProjectData[]> {
  const db = await openDB();
  const all = await new Promise<ProjectData[]>((resolve, reject) => {
    const req = db.transaction(STORE).objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as ProjectData[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return all;
}

async function idbDelete(id: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

function lsRead(): Record<string, ProjectData> {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function lsWrite(map: Record<string, ProjectData>): void {
  localStorage.setItem(LS_KEY, JSON.stringify(map));
}

export const storage = {
  async save(project: ProjectData): Promise<void> {
    project.updatedAt = new Date().toISOString();
    try {
      await idbPut(project);
    } catch {
      const map = lsRead();
      map[project.id] = project;
      lsWrite(map);
    }
  },
  async list(): Promise<ProjectData[]> {
    try {
      const all = await idbGetAll();
      return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } catch {
      return Object.values(lsRead()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
  },
  async remove(id: string): Promise<void> {
    try {
      await idbDelete(id);
    } catch {
      const map = lsRead();
      delete map[id];
      lsWrite(map);
    }
  },
};
