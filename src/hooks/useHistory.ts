import { useCallback, useState } from 'react'
import {
  addHistoryRecord,
  deleteHistoryRecord,
  loadHistory,
} from '../services/historyStorage'
import type { HistoryRecord } from '../types/history'

export function useHistory() {
  const [records, setRecords] = useState<HistoryRecord[]>(loadHistory)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const addRecord = useCallback((text: string) => {
    const record = addHistoryRecord(text)
    setRecords((prev) => [record, ...prev])
    return record
  }, [])

  const deleteRecord = useCallback((id: string) => {
    const updated = deleteHistoryRecord(id)
    setRecords(updated)
    setSelectedId((current) => (current === id ? null : current))
  }, [])

  const selectedRecord = records.find((r) => r.id === selectedId) ?? null

  return {
    records,
    selectedRecord,
    selectedId,
    setSelectedId,
    addRecord,
    deleteRecord,
  }
}
