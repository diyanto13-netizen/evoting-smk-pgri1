import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  Unsubscribe,
  WithFieldValue,
  DocumentData,
  UpdateData,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errors';
import {
  Period,
  Candidate,
  Voter,
  Vote,
  AuditLog,
  TimelineStep,
  AdminUser,
} from '../types/voting';

export const COLLECTIONS = {
  PERIODS: 'periods',
  CANDIDATES: 'candidates',
  VOTERS: 'voters',
  VOTES: 'votes',
  AUDIT_LOGS: 'audit_logs',
  TIMELINE_STEPS: 'timeline_steps',
  ADMINS: 'admins',
} as const;

/**
 * Real-time subscription helper with standardized error handling
 */
export function subscribeCollection<T extends { id: string }>(
  collectionName: string,
  onData: (data: T[]) => void
): Unsubscribe {
  const colRef = collection(db, collectionName);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as object) } as T);
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, collectionName);
    }
  );
}

/**
 * Seed initial data if Firestore collections are empty on first run.
 * Checks EACH collection independently so candidates, voters, or settings are NEVER
 * overwritten if their respective collections already contain documents!
 */
export async function seedInitialFirestoreData(
  defaultPeriods: Period[],
  defaultCandidates: Candidate[],
  defaultVoters: Voter[],
  defaultTimeline: TimelineStep[],
  defaultAdmins: AdminUser[] = []
) {
  try {
    // 1. Periods (only if empty)
    const periodsSnap = await getDocs(collection(db, COLLECTIONS.PERIODS));
    if (periodsSnap.empty && defaultPeriods.length > 0) {
      console.log('⚡ Seeding initial periods collection...');
      const batch = writeBatch(db);
      defaultPeriods.forEach((p) => {
        const ref = doc(db, COLLECTIONS.PERIODS, p.id);
        batch.set(ref, p);
      });
      await batch.commit();
    }

    // 2. Candidates (CHECK INDEPENDENTLY! NEVER OVERWRITE IF CANDIDATES ALREADY EXIST)
    const candidatesSnap = await getDocs(collection(db, COLLECTIONS.CANDIDATES));
    if (candidatesSnap.empty && defaultCandidates.length > 0) {
      console.log('⚡ Seeding initial candidates collection (collection was empty)...');
      const batch = writeBatch(db);
      defaultCandidates.forEach((c) => {
        const ref = doc(db, COLLECTIONS.CANDIDATES, c.id);
        batch.set(ref, c);
      });
      await batch.commit();
      console.log('✅ Initial candidates seeded to Firestore.');
    }

    // 3. Voters (only if empty)
    const votersSnap = await getDocs(collection(db, COLLECTIONS.VOTERS));
    if (votersSnap.empty && defaultVoters.length > 0) {
      console.log('⚡ Seeding initial DPT voters to Firestore...');
      await batchSetFirestoreDocs(COLLECTIONS.VOTERS, defaultVoters);
    }

    // 4. Timeline Steps (only if empty)
    const timelineSnap = await getDocs(collection(db, COLLECTIONS.TIMELINE_STEPS));
    if (timelineSnap.empty && defaultTimeline.length > 0) {
      const batch = writeBatch(db);
      defaultTimeline.forEach((t) => {
        const ref = doc(db, COLLECTIONS.TIMELINE_STEPS, t.id);
        batch.set(ref, t);
      });
      await batch.commit();
    }

    // 5. Initial Audit Log (only if audit collection is empty)
    const auditSnap = await getDocs(collection(db, COLLECTIONS.AUDIT_LOGS));
    if (auditSnap.empty) {
      const initLog: AuditLog = {
        id: `log-init-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'FIREBASE_INITIALIZED',
        details: 'Database Cloud Firestore berhasil diinisialisasi untuk e-Voting Pemilos.',
        userType: 'SYSTEM',
      };
      await setDoc(doc(db, COLLECTIONS.AUDIT_LOGS, initLog.id), initLog);
    }

    // 6. Ensure admin accounts exist in Firestore for multi-device sync
    if (defaultAdmins.length > 0) {
      const adminsSnap = await getDocs(collection(db, COLLECTIONS.ADMINS));
      if (adminsSnap.empty) {
        console.log('⚡ Seeding initial administrator accounts to Firestore...');
        const adminBatch = writeBatch(db);
        defaultAdmins.forEach((a) => {
          const ref = doc(db, COLLECTIONS.ADMINS, a.id);
          adminBatch.set(ref, a);
        });
        await adminBatch.commit();
        console.log('✅ Initial admin accounts seeded to Firestore.');
      }
    }
  } catch (error) {
    console.error('Error during Firestore initial seeding:', error);
  }
}

/**
 * Synchronize full list of candidates to Firestore,
 * ensuring any deleted candidates are removed from Firestore.
 */
export async function syncCandidatesCollectionToFirestore(candidates: Candidate[]): Promise<void> {
  try {
    const existingSnap = await getDocs(collection(db, COLLECTIONS.CANDIDATES));
    const activeIds = new Set(candidates.map((c) => c.id));
    const batch = writeBatch(db);

    // Remove deleted documents from Firestore
    existingSnap.forEach((d) => {
      if (!activeIds.has(d.id)) {
        batch.delete(doc(db, COLLECTIONS.CANDIDATES, d.id));
      }
    });

    // Upsert current candidates
    candidates.forEach((c) => {
      batch.set(doc(db, COLLECTIONS.CANDIDATES, c.id), c);
    });

    await batch.commit();
    console.log(`✅ Synced ${candidates.length} candidates permanently to Firestore.`);
  } catch (error) {
    console.error('Error syncing candidates collection to Firestore:', error);
    throw error;
  }
}

/**
 * Single document operations
 */
export async function setFirestoreDoc<T extends object>(
  collectionName: string,
  docId: string,
  data: WithFieldValue<T>
): Promise<void> {
  const path = `${collectionName}/${docId}`;
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data as WithFieldValue<DocumentData>);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateFirestoreDoc(
  collectionName: string,
  docId: string,
  fields: UpdateData<DocumentData>
): Promise<void> {
  const path = `${collectionName}/${docId}`;
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, fields as WithFieldValue<DocumentData>, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteFirestoreDoc(
  collectionName: string,
  docId: string
): Promise<void> {
  const path = `${collectionName}/${docId}`;
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Batch operations (chunked in max 400 items to respect Firestore limits)
 */
export async function batchSetFirestoreDocs<T extends { id: string }>(
  collectionName: string,
  items: T[]
): Promise<void> {
  const chunkSize = 400;
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    chunk.forEach((item) => {
      const ref = doc(db, collectionName, item.id);
      batch.set(ref, item);
    });
    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, collectionName);
    }
  }
}

export async function batchDeleteFirestoreDocs(
  collectionName: string,
  docIds: string[]
): Promise<void> {
  const chunkSize = 400;
  for (let i = 0; i < docIds.length; i += chunkSize) {
    const chunk = docIds.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    chunk.forEach((id) => {
      const ref = doc(db, collectionName, id);
      batch.delete(ref);
    });
    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, collectionName);
    }
  }
}

/**
 * Fetch all documents in a collection once
 */
export async function fetchAllFirestoreDocs<T extends { id: string }>(
  collectionName: string
): Promise<T[]> {
  try {
    const snap = await getDocs(collection(db, collectionName));
    const list: T[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...(d.data() as object) } as T);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionName);
    return [];
  }
}

/**
 * Specialized helpers for atomic Cloud Firestore vote reset
 */
export async function deleteAllFirestoreVotes(periodId?: string): Promise<number> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.VOTES));
    const idsToDelete: string[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (!periodId || data.periodId === periodId) {
        idsToDelete.push(d.id);
      }
    });
    if (idsToDelete.length > 0) {
      await batchDeleteFirestoreDocs(COLLECTIONS.VOTES, idsToDelete);
    }
    return idsToDelete.length;
  } catch (error) {
    console.error('Error deleting votes from Firestore:', error);
    return 0;
  }
}

export async function deleteFirestoreVotesByCandidate(candidateId: string, periodId?: string): Promise<number> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.VOTES));
    const idsToDelete: string[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data.candidateId === candidateId && (!periodId || data.periodId === periodId)) {
        idsToDelete.push(d.id);
      }
    });
    if (idsToDelete.length > 0) {
      await batchDeleteFirestoreDocs(COLLECTIONS.VOTES, idsToDelete);
    }
    return idsToDelete.length;
  } catch (error) {
    console.error('Error deleting candidate votes from Firestore:', error);
    return 0;
  }
}

export async function deleteFirestoreVotesByCategory(category: string, periodId?: string): Promise<number> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.VOTES));
    const idsToDelete: string[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data.category === category && (!periodId || data.periodId === periodId)) {
        idsToDelete.push(d.id);
      }
    });
    if (idsToDelete.length > 0) {
      await batchDeleteFirestoreDocs(COLLECTIONS.VOTES, idsToDelete);
    }
    return idsToDelete.length;
  } catch (error) {
    console.error('Error deleting category votes from Firestore:', error);
    return 0;
  }
}

export async function resetAllFirestoreVoters(periodId: string): Promise<void> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.VOTERS));
    const toUpdate: string[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data.periodId === periodId && data.hasVoted) {
        toUpdate.push(d.id);
      }
    });
    if (toUpdate.length > 0) {
      const chunkSize = 400;
      for (let i = 0; i < toUpdate.length; i += chunkSize) {
        const chunk = toUpdate.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        chunk.forEach((voterId) => {
          const ref = doc(db, COLLECTIONS.VOTERS, voterId);
          batch.update(ref, { hasVoted: false, votedAt: null });
        });
        await batch.commit();
      }
    }
  } catch (error) {
    console.error('Error resetting voters in Firestore:', error);
  }
}


