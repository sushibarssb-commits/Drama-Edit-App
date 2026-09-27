/**
 * IndexedDB storage utility for persisting merged drama videos on device
 */

export interface SavedVideoRecord {
  id: string;
  seriesName: string;
  partNumber: number;
  title: string;
  caption: string; // e.g. "1-5", "6-10", "11-15"
  fileName: string;
  blob: Blob;
  size: number;
  duration: number;
  createdAt: number;
  episodesCount: number;
  startEp: number;
  endEp: number;
  aspectRatio?: string;
  resolution?: string;
}

const DB_NAME = 'DramaMergeDB';
const DB_VERSION = 1;
const STORE_NAME = 'merged_videos';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save a merged video into IndexedDB
 */
export async function saveVideoToStorage(record: SavedVideoRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get all saved videos ordered by creation date descending
 */
export async function getAllSavedVideos(): Promise<SavedVideoRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    req.onsuccess = () => {
      const records = req.result as SavedVideoRecord[];
      records.sort((a, b) => b.createdAt - a.createdAt);
      resolve(records);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Delete a specific saved video by ID
 */
export async function deleteSavedVideo(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Delete all saved videos
 */
export async function deleteAllSavedVideos(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
