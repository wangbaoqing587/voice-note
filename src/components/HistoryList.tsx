import type { HistoryRecord } from '../types/history'
import { formatTimestamp } from '../utils/formatTime'
import './HistoryList.css'

interface HistoryListProps {
  records: HistoryRecord[]
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export function HistoryList({ records, onSelect, onDelete }: HistoryListProps) {
  if (records.length === 0) return null

  return (
    <section className="history-list">
      <h2 className="history-list__title">历史记录</h2>
      <ul className="history-list__items">
        {records.map((record) => (
          <li key={record.id} className="history-list__item">
            <button
              type="button"
              className="history-list__content"
              onClick={() => onSelect(record.id)}
            >
              <p className="history-list__text">{record.text}</p>
              <time className="history-list__time" dateTime={new Date(record.timestamp).toISOString()}>
                {formatTimestamp(record.timestamp)}
              </time>
            </button>
            <button
              type="button"
              className="history-list__delete"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(record.id)
              }}
              aria-label="删除此记录"
            >
              <TrashIcon />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
