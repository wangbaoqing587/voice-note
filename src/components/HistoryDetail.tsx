import { useCallback, useEffect, useState } from 'react'
import type { HistoryRecord } from '../types/history'
import { formatFullTimestamp } from '../utils/formatTime'
import './HistoryDetail.css'

interface HistoryDetailProps {
  record: HistoryRecord
  onClose: () => void
  onDelete: (id: string) => void
}

export function HistoryDetail({ record, onClose, onDelete }: HistoryDetailProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(record.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [record.text])

  const handleDelete = useCallback(() => {
    onDelete(record.id)
    onClose()
  }, [record.id, onDelete, onClose])

  return (
    <div className="history-detail__backdrop" onClick={onClose}>
      <div
        className="history-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="history-detail__header">
          <h3 id="history-detail-title" className="history-detail__title">
            记录详情
          </h3>
          <button
            type="button"
            className="history-detail__close"
            onClick={onClose}
            aria-label="关闭"
          >
            <CloseIcon />
          </button>
        </div>

        <time className="history-detail__time" dateTime={new Date(record.timestamp).toISOString()}>
          {formatFullTimestamp(record.timestamp)}
        </time>

        <div className="history-detail__body">
          <p className="history-detail__text">{record.text}</p>
        </div>

        <div className="history-detail__actions">
          <button
            type="button"
            className={`history-detail__btn history-detail__btn--copy ${copied ? 'history-detail__btn--done' : ''}`}
            onClick={handleCopy}
          >
            {copied ? '已复制' : '复制'}
          </button>
          <button
            type="button"
            className="history-detail__btn history-detail__btn--delete"
            onClick={handleDelete}
          >
            删除
          </button>
        </div>
      </div>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
