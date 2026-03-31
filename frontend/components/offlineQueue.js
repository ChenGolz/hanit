import { apiUrl } from './Api';

const DB_NAME = 'petconnect-offline';
const STORE_NAME = 'reports';

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB error'));
  });
}

async function readAll() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || new Error('Unable to read queue'));
  });
}

async function removeOne(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error || new Error('Unable to delete queued item'));
  });
}

export async function enqueuePendingReport(type, formData) {
  const payload = { type, fields: {}, blobs: {}, queuedAt: new Date().toISOString() };
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      if (value.size > 0) payload.blobs[key] = value;
    } else {
      payload.fields[key] = value;
    }
  }

  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const request = tx.objectStore(STORE_NAME).add(payload);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Unable to queue report'));
  });
}

async function submitItem(item) {
  const form = new FormData();
  Object.entries(item.fields || {}).forEach(([key, value]) => form.append(key, value));
  Object.entries(item.blobs || {}).forEach(([key, value]) => form.append(key, value));
  const path = item.type === 'lost' ? '/api/lost-pets' : '/api/found-reports';
  const res = await fetch(apiUrl(path), { method: 'POST', body: form });
  if (!res.ok) {
    let message = 'Queued upload failed';
    try {
      const data = await res.json();
      message = data.detail || message;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

export async function flushPendingReports() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return { flushed: 0, remaining: null };
  const items = await readAll();
  let flushed = 0;
  for (const item of items) {
    try {
      await submitItem(item);
      await removeOne(item.id);
      flushed += 1;
    } catch {
      break;
    }
  }
  const remaining = (await readAll()).length;
  return { flushed, remaining };
}

export async function getPendingCount() {
  const items = await readAll();
  return items.length;
}
