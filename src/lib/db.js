// IndexedDB 极简封装:informants / batches / versions / reports / kv
const DB_NAME = 'dialect-survey';
const DB_VERSION = 1;

let dbPromise = null;

function open() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('informants'))
        db.createObjectStore('informants', { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('batches'))
        db.createObjectStore('batches', { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('versions'))
        db.createObjectStore('versions', { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('reports'))
        db.createObjectStore('reports', { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('kv'))
        db.createObjectStore('kv', { keyPath: 'key' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(db, store, mode, fn) {
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const s = t.objectStore(store);
    const out = fn(s);
    t.oncomplete = () => resolve(out && out.result !== undefined ? out.result : out);
    t.onerror = () => reject(t.error);
  });
}

function reqToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function list(store) {
  const db = await open();
  const t = db.transaction(store, 'readonly');
  return reqToPromise(t.objectStore(store).getAll());
}

export async function get(store, id) {
  const db = await open();
  const t = db.transaction(store, 'readonly');
  return reqToPromise(t.objectStore(store).get(id));
}

export async function put(store, value) {
  const db = await open();
  const t = db.transaction(store, 'readwrite');
  const r = t.objectStore(store).put(value);
  await reqToPromise(r);
  return r.result ?? value.id;
}

export async function add(store, value) {
  const db = await open();
  const t = db.transaction(store, 'readwrite');
  const r = t.objectStore(store).add(value);
  return reqToPromise(r);
}

export async function remove(store, id) {
  const db = await open();
  const t = db.transaction(store, 'readwrite');
  return reqToPromise(t.objectStore(store).delete(id));
}

export async function kvGet(key) {
  const row = (await list('kv')).find((r) => r.key === key);
  return row ? row.value : null;
}

export async function kvSet(key, value) {
  return put('kv', { key, value });
}
