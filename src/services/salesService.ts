import { get, ref } from 'firebase/database'
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore'
import {
  db,
  firebaseSource,
  firestoreCollection,
  realtimeDatabasePath,
  realtimeDb,
} from '../firebase'
import type { SalesRecord } from '../types/sales'

type FirestoreValue = string | number | boolean | Timestamp | null | undefined
type FirestoreSalesRecord = Record<string, FirestoreValue>
type UnknownSalesRecord = Record<string, unknown>

const toNumber = (value: unknown) => {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

const toBoolean = (value: unknown) => {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true'
  }

  return false
}

const toStringValue = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback

const normalizeLookupKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const normalizeCategory = (value: unknown) => {
  const category = toStringValue(value, 'Sin categoría')
  const key = normalizeLookupKey(category)
  const categoryMap: Record<string, string> = {
    apparel: 'Apparel',
    appliances: 'Appliances',
    electronic: 'Electronics',
    electronica: 'Electronics',
    electronics: 'Electronics',
    electrodomesticos: 'Appliances',
    furniture: 'Furniture',
    groceries: 'Groceries',
    home: 'Home',
    'home appliances': 'Appliances',
    outdoor: 'Outdoor',
    sports: 'Sports',
    toys: 'Toys',
  }

  return categoryMap[key] ?? category
}

const toDateString = (value: unknown) => {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }

  return toStringValue(value, new Date().toISOString())
}

const normalizeGender = (value: unknown): SalesRecord['customer_gender'] => {
  const gender = toStringValue(value, 'Other')

  if (gender === 'Female' || gender === 'Male') {
    return gender
  }

  return 'Other'
}

const normalizeLoyalty = (value: unknown): SalesRecord['customer_loyalty_level'] => {
  const loyalty = toStringValue(value, 'Bronze')

  if (loyalty === 'Silver' || loyalty === 'Gold' || loyalty === 'Platinum') {
    return loyalty
  }

  return 'Bronze'
}

const normalizePayment = (value: unknown): SalesRecord['payment_method'] => {
  const payment = toStringValue(value, 'Cash')

  if (payment === 'Credit Card' || payment === 'Digital Wallet') {
    return payment
  }

  return 'Cash'
}

const mapFirebaseRecord = (data: FirestoreSalesRecord | UnknownSalesRecord): SalesRecord => ({
  actual_demand: toNumber(data.actual_demand),
  category: normalizeCategory(data.category),
  customer_gender: normalizeGender(data.customer_gender),
  customer_loyalty_level: normalizeLoyalty(data.customer_loyalty_level),
  forecasted_demand: toNumber(data.forecasted_demand),
  inventory_level: toNumber(data.inventory_level),
  payment_method: normalizePayment(data.payment_method),
  product_name: toStringValue(data.product_name, 'Producto desconocido'),
  promotion_applied: toBoolean(data.promotion_applied),
  quantity_sold: toNumber(data.quantity_sold),
  stockout_indicator: toBoolean(data.stockout_indicator),
  store_id: toNumber(data.store_id),
  store_location: toStringValue(data.store_location, 'Tienda desconocida'),
  transaction_date: toDateString(data.transaction_date),
  transaction_id: toNumber(data.transaction_id),
  unit_price: toNumber(data.unit_price),
  weekday: toStringValue(data.weekday, 'Desconocido'),
})

const looksLikeSalesRecord = (value: unknown): value is UnknownSalesRecord => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }

  const record = value as UnknownSalesRecord

  return (
    'transaction_id' in record ||
    'product_name' in record ||
    'category' in record ||
    'quantity_sold' in record ||
    'unit_price' in record
  )
}

const collectSalesRecords = (value: unknown): UnknownSalesRecord[] => {
  if (!value) {
    return []
  }

  if (looksLikeSalesRecord(value)) {
    return [value]
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectSalesRecords)
  }

  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).flatMap(collectSalesRecords)
  }

  return []
}

export async function fetchSalesRecords() {
  if (firebaseSource === 'realtime') {
    return fetchRealtimeSalesRecords()
  }

  return fetchFirestoreSalesRecords()
}

async function fetchFirestoreSalesRecords() {
  if (!db) {
    return []
  }

  const salesQuery = query(collection(db, firestoreCollection), orderBy('transaction_id', 'asc'))
  const snapshot = await getDocs(salesQuery)

  return snapshot.docs.map((document) => mapFirebaseRecord(document.data()))
}

async function fetchRealtimeSalesRecords() {
  if (!realtimeDb) {
    throw new Error('Falta VITE_FIREBASE_DATABASE_URL para leer la base de datos en tiempo real.')
  }

  const snapshot = await get(ref(realtimeDb, realtimeDatabasePath))
  const value = snapshot.exists() ? snapshot.val() : null
  const records = collectSalesRecords(value)

  if (records.length > 0) {
    return records.map(mapFirebaseRecord).sort((a, b) => a.transaction_id - b.transaction_id)
  }

  if (realtimeDatabasePath !== '/') {
    const rootSnapshot = await get(ref(realtimeDb, '/'))
    const rootRecords = collectSalesRecords(rootSnapshot.exists() ? rootSnapshot.val() : null)

    return rootRecords
      .map(mapFirebaseRecord)
      .sort((a, b) => a.transaction_id - b.transaction_id)
  }

  return []
}
