import { useEffect, useState } from 'react'
import { firebaseConfigStatus, isFirebaseConfigured } from '../firebase'
import { fetchSalesRecords } from '../services/salesService'
import type { SalesRecord } from '../types/sales'

export function useSalesRecords() {
  const [records, setRecords] = useState<SalesRecord[]>([])
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadRecords() {
      if (!isFirebaseConfigured) {
        setError(firebaseConfigStatus)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const nextRecords = await fetchSalesRecords()

        if (isMounted) {
          setRecords(nextRecords)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los datos.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadRecords()

    return () => {
      isMounted = false
    }
  }, [])

  return {
    error,
    isLoading,
    records,
    status: firebaseConfigStatus,
  }
}
