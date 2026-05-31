import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  collection, 
  query, 
  where,
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';

// User's provided Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_GZGMNXb-Zl6psFu5NhT-7u0fU9Mid5M",
  authDomain: "aethervault-b207c.firebaseapp.com",
  databaseURL: "https://aethervault-b207c-default-rtdb.firebaseio.com",
  projectId: "aethervault-b207c",
  storageBucket: "aethervault-b207c.firebasestorage.app",
  messagingSenderId: "687440054840",
  appId: "1:687440054840:web:48d3a61d6f8f6c4eed34cd"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore error logging & reporting as strictly mandated by the skill
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
  }
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
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test helper following guideline
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or network status.");
    }
  }
}

// High-level safe synchronization services
export async function syncUserProfile(email: string, name: string, avatar: string, wishlistIds: string[]) {
  const userId = email.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { email, name, avatar, wishlistIds }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserProfile(email: string) {
  const userId = email.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function recordPurchase(email: string, purchase: any) {
  const userId = email.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const path = `users/${userId}/purchases/${purchase.id}`;
  try {
    const purchaseRef = doc(db, 'users', userId, 'purchases', purchase.id);
    await setDoc(purchaseRef, purchase);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserPurchases(email: string) {
  const userId = email.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const path = `users/${userId}/purchases`;
  try {
    const collRef = collection(db, 'users', userId, 'purchases');
    const snap = await getDocs(collRef);
    const purchases: any[] = [];
    snap.forEach((doc) => {
      purchases.push(doc.data());
    });
    return purchases;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// Bootstrap initial connectivity check
testConnection();
