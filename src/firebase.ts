import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  getDocFromServer,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { AppState, DEFAULT_DATA } from './data/defaultData';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Initial connection test conforming to SKILL.md
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore is offline or initial connection pending:', error.message);
    }
  }
}
testConnection();

const STATE_DOC_PATH = 'cafe_data';
const STATE_DOC_ID = 'state';

/**
 * Subscribes to real-time changes to the master cafe state.
 * Any admin edits or customer orders will fire this callback on ALL connected clients/devices.
 */
export function subscribeToCafeState(
  onUpdate: (state: AppState) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const docRef = doc(db, STATE_DOC_PATH, STATE_DOC_ID);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as AppState;
        onUpdate(data);
      } else {
        // If state document doesn't exist yet in Firestore, seed it with DEFAULT_DATA
        saveCafeStateToFirestore(DEFAULT_DATA).catch((err) => {
          console.warn('Could not auto-seed default state:', err);
        });
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${STATE_DOC_PATH}/${STATE_DOC_ID}`);
      if (onError) onError(error);
    }
  );
}

/**
 * Persists the entire updated cafe state to Cloud Firestore.
 * Broadcasts in real-time to all other devices/clients.
 */
export async function saveCafeStateToFirestore(state: AppState): Promise<void> {
  const docRef = doc(db, STATE_DOC_PATH, STATE_DOC_ID);
  const stateWithTimestamp: AppState = {
    ...state,
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(docRef, stateWithTimestamp, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${STATE_DOC_PATH}/${STATE_DOC_ID}`);
    throw error;
  }
}
