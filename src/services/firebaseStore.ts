import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  type Unsubscribe
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { type SavedOutfit, getSavedOutfits } from '../utils/storage';
import { getSavedLookbooks } from '../utils/lookbookStore';
import { type SavedLookbook } from '../types';

export interface CloudSharedOutfit {
  id: string;
  creatorId?: string;
  creatorName?: string;
  title?: string;
  notes?: string;
  gender: 'male' | 'female';
  contextId?: string | null;
  garmentId: string;
  innerId?: string | null;
  bottomId?: string | null;
  shoesId?: string | null;
  headwearId?: string | null;
  jewelryIds: string[];
  itemColors?: Record<string, { hex: string | null; intensity: number }>;
  createdAt: number;
}

/**
 * 1. CLOUD SAVED OUTFITS (Bộ sưu tập phối đồ cá nhân)
 */
export async function saveCloudOutfit(userId: string, outfit: SavedOutfit): Promise<boolean> {
  if (!db || !isFirebaseConfigured) return false;
  try {
    const outfitRef = doc(db, 'users', userId, 'saved_outfits', outfit.id);
    await setDoc(
      outfitRef,
      {
        ...outfit,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error('Lỗi khi lưu bộ phối lên Cloud Firestore:', err);
    return false;
  }
}

export async function getCloudOutfits(userId: string): Promise<SavedOutfit[]> {
  if (!db || !isFirebaseConfigured) return [];
  try {
    const colRef = collection(db, 'users', userId, 'saved_outfits');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const results: SavedOutfit[] = [];
    snapshot.forEach((d) => {
      results.push(d.data() as SavedOutfit);
    });
    return results;
  } catch (err) {
    console.error('Lỗi khi tải bộ phối từ Cloud Firestore:', err);
    return [];
  }
}

export async function deleteCloudOutfit(userId: string, outfitId: string): Promise<boolean> {
  if (!db || !isFirebaseConfigured) return false;
  try {
    const outfitRef = doc(db, 'users', userId, 'saved_outfits', outfitId);
    await deleteDoc(outfitRef);
    return true;
  } catch (err) {
    console.error('Lỗi khi xóa bộ phối trên Cloud Firestore:', err);
    return false;
  }
}

export function subscribeCloudOutfits(
  userId: string,
  onUpdate: (outfits: SavedOutfit[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!db || !isFirebaseConfigured) {
    onUpdate([]);
    return () => {};
  }
  const colRef = collection(db, 'users', userId, 'saved_outfits');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const results: SavedOutfit[] = [];
      snapshot.forEach((d) => {
        results.push(d.data() as SavedOutfit);
      });
      onUpdate(results);
    },
    (error) => {
      console.error('Lỗi lắng nghe Firestore Outfits realtime:', error);
      onError?.(error);
    }
  );
}

/**
 * 2. CLOUD LOOKBOOKS (Lookbook cá nhân)
 */
export async function saveCloudLookbook(userId: string, lookbook: SavedLookbook): Promise<boolean> {
  if (!db || !isFirebaseConfigured) return false;
  try {
    const lbRef = doc(db, 'users', userId, 'lookbooks', lookbook.id);
    await setDoc(
      lbRef,
      {
        ...lookbook,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error('Lỗi khi lưu Lookbook lên Cloud Firestore:', err);
    return false;
  }
}

export async function getCloudLookbooks(userId: string): Promise<SavedLookbook[]> {
  if (!db || !isFirebaseConfigured) return [];
  try {
    const colRef = collection(db, 'users', userId, 'lookbooks');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const results: SavedLookbook[] = [];
    snapshot.forEach((d) => {
      results.push(d.data() as SavedLookbook);
    });
    return results;
  } catch (err) {
    console.error('Lỗi khi tải Lookbook từ Cloud Firestore:', err);
    return [];
  }
}

export async function deleteCloudLookbook(userId: string, lookbookId: string): Promise<boolean> {
  if (!db || !isFirebaseConfigured) return false;
  try {
    const lbRef = doc(db, 'users', userId, 'lookbooks', lookbookId);
    await deleteDoc(lbRef);
    return true;
  } catch (err) {
    console.error('Lỗi khi xóa Lookbook trên Cloud Firestore:', err);
    return false;
  }
}

export function subscribeCloudLookbooks(
  userId: string,
  onUpdate: (lookbooks: SavedLookbook[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!db || !isFirebaseConfigured) {
    onUpdate([]);
    return () => {};
  }
  const colRef = collection(db, 'users', userId, 'lookbooks');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const results: SavedLookbook[] = [];
      snapshot.forEach((d) => {
        results.push(d.data() as SavedLookbook);
      });
      onUpdate(results);
    },
    (error) => {
      console.error('Lỗi lắng nghe Firestore Lookbooks realtime:', error);
      onError?.(error);
    }
  );
}

/**
 * 3. ĐỒNG BỘ TỰ ĐỘNG TỪ LOCAL SANG CLOUD (Sync upon Login)
 */
export async function syncLocalDataToCloud(userId: string): Promise<{
  syncedOutfitsCount: number;
  syncedLookbooksCount: number;
}> {
  if (!db || !isFirebaseConfigured) {
    return { syncedOutfitsCount: 0, syncedLookbooksCount: 0 };
  }

  let syncedOutfitsCount = 0;
  let syncedLookbooksCount = 0;

  try {
    // 1. Đồng bộ SavedOutfits
    const localOutfitsResult = getSavedOutfits();
    if (!localOutfitsResult.isCorrupted && localOutfitsResult.outfits.length > 0) {
      for (const outfit of localOutfitsResult.outfits) {
        const ok = await saveCloudOutfit(userId, outfit);
        if (ok) syncedOutfitsCount++;
      }
    }

    // 2. Đồng bộ Lookbooks
    const localLookbooks = getSavedLookbooks();
    if (localLookbooks.length > 0) {
      for (const lb of localLookbooks) {
        const ok = await saveCloudLookbook(userId, lb);
        if (ok) syncedLookbooksCount++;
      }
    }
  } catch (err) {
    console.error('Lỗi khi đồng bộ dữ liệu cục bộ lên đám mây:', err);
  }

  return { syncedOutfitsCount, syncedLookbooksCount };
}

/**
 * 4. PUBLIC SHARING (Chia sẻ công khai qua Firestore)
 */
export async function createCloudShare(payload: Omit<CloudSharedOutfit, 'id' | 'createdAt'>): Promise<string | null> {
  if (!db || !isFirebaseConfigured) return null;
  try {
    // Sinh mã ngẫu nhiên 7 ký tự (VD: vp9a8f2)
    const shareId = `vp${Math.random().toString(36).substring(2, 8)}`;
    const shareRef = doc(db, 'shared_outfits', shareId);
    const sharedItem: CloudSharedOutfit = {
      ...payload,
      id: shareId,
      createdAt: Date.now()
    };
    await setDoc(shareRef, sharedItem);
    return shareId;
  } catch (err) {
    console.error('Lỗi khi tạo liên kết chia sẻ đám mây:', err);
    return null;
  }
}

export async function getCloudSharedOutfit(shareId: string): Promise<CloudSharedOutfit | null> {
  if (!db || !isFirebaseConfigured) return null;
  try {
    const shareRef = doc(db, 'shared_outfits', shareId);
    const docSnap = await getDoc(shareRef);
    if (docSnap.exists()) {
      return docSnap.data() as CloudSharedOutfit;
    }
    return null;
  } catch (err) {
    console.error('Lỗi khi tải bản phối chia sẻ từ đám mây:', err);
    return null;
  }
}
