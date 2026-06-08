import { useEffect, useState } from 'react'
import Papa from 'papaparse'
import type { SalesRecord } from '../data/mockSales'

const CSV_PATH = '/datasets/Walmart.csv'

type CsvSalesRow = {
  actual_demand?: unknown
  category?: unknown
  customer_gender?: unknown
  customer_loyalty_level?: unknown
  forecasted_demand?: unknown
  inventory_level?: unknown
  payment_method?: unknown
  product_name?: unknown
  promotion_applied?: unknown
  quantity_sold?: unknown
  stockout_indicator?: unknown
  store_id?: unknown
  store_location?: unknown
  transaction_date?: unknown
  transaction_id?: unknown
  unit_price?: unknown
  weekday?: unknown
}

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

  return String(value).toLowerCase() === 'true'
}

const toText = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim().length > 0 ? value : fallback

const normalizeGender = (value: unknown): SalesRecord['customer_gender'] => {
  const gender = toText(value, 'Other')

  if (gender === 'Female' || gender === 'Male') {
    return gender
  }

  return 'Other'
}

const normalizeLoyalty = (value: unknown): SalesRecord['customer_loyalty_level'] => {
  const loyalty = toText(value, 'Bronze')

  if (loyalty === 'Silver' || loyalty === 'Gold' || loyalty === 'Platinum') {
    return loyalty
  }

  return 'Bronze'
}

const normalizePayment = (value: unknown): SalesRecord['payment_method'] => {
  const payment = toText(value, 'Cash')

  if (payment === 'Credit Card' || payment === 'Digital Wallet') {
    return payment
  }

  return 'Cash'
}

const mapCsvRow = (row: CsvSalesRow): SalesRecord => ({
  transaction_id: toNumber(row.transaction_id),
  product_name: toText(row.product_name, 'Unknown product'),
  category: toText(row.category, 'Uncategorized'),
  quantity_sold: toNumber(row.quantity_sold),
  unit_price: toNumber(row.unit_price),
  transaction_date: toText(row.transaction_date, new Date().toISOString()),
  store_id: toNumber(row.store_id),
  store_location: toText(row.store_location, 'Unknown store'),
  inventory_level: toNumber(row.inventory_level),
  customer_gender: normalizeGender(row.customer_gender),
  customer_loyalty_level: normalizeLoyalty(row.customer_loyalty_level),
  payment_method: normalizePayment(row.payment_method),
  promotion_applied: toBoolean(row.promotion_applied),
  weekday: toText(row.weekday, 'Unknown'),
  stockout_indicator: toBoolean(row.stockout_indicator),
  forecasted_demand: toNumber(row.forecasted_demand),
  actual_demand: toNumber(row.actual_demand),
})

export function useCsvSalesRecords() {
  const [records, setRecords] = useState<SalesRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadCsv() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(CSV_PATH)

        if (!response.ok) {
          throw new Error(`No se pudo leer ${CSV_PATH}. Codigo ${response.status}.`)
        }

        const csvText = await response.text()

        Papa.parse<CsvSalesRow>(csvText, {
          complete: (result) => {
            if (!isMounted) {
              return
            }

            if (result.errors.length > 0) {
              setError(result.errors[0]?.message ?? 'Error al interpretar el CSV.')
            }

            setRecords(result.data.map(mapCsvRow))
          },
          dynamicTyping: true,
          header: true,
          skipEmptyLines: true,
        })
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el CSV.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadCsv()

    return () => {
      isMounted = false
    }
  }, [])

  return {
    error,
    isLoading,
    records,
    sourcePath: CSV_PATH,
  }
}
