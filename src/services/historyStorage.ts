import type { HistoryRecord } from '../types/history'

const STORAGE_KEY = 'voice-note-history'

export function loadHistory(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as HistoryRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistHistory(records: HistoryRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function addHistoryRecord(text: string): HistoryRecord {
  const record: HistoryRecord = {
    id: crypto.randomUUID(),
    text,
    timestamp: Date.now(),
  }
  const records = [record, ...loadHistory()]
  persistHistory(records)
  return record
}

export function deleteHistoryRecord(id: string): HistoryRecord[] {
  const records = loadHistory().filter((r) => r.id !== id)
  persistHistory(records)
  return records
}
