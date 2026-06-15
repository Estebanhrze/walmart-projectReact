import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const missingKeys = Object.entries(firebaseConfig)
  .filter(([key, value]) => key !== 'databaseURL' && !value)
  .map(([key]) => key)

export const isFirebaseConfigured = missingKeys.length === 0

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null

export const db = app ? getFirestore(app) : null
export const realtimeDb = app && firebaseConfig.databaseURL ? getDatabase(app) : null

export const firebaseSource = (import.meta.env.VITE_FIREBASE_SOURCE ?? 'realtime') as
  | 'firestore'
  | 'realtime'

export const firestoreCollection = import.meta.env.VITE_FIREBASE_COLLECTION ?? 'sales_transactions'
export const realtimeDatabasePath = import.meta.env.VITE_FIREBASE_DATABASE_PATH ?? 'sales_transactions'

export const firebaseConfigStatus = isFirebaseConfigured
  ? `Conectado a ${firebaseSource === 'realtime' ? 'la base de datos en tiempo real de Firebase' : 'Firestore'}`
  : `Faltan variables Firebase: ${missingKeys.join(', ')}`
