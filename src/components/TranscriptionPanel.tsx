import { useCallback, useState } from 'react'
import './TranscriptionPanel.css'

interface TranscriptionPanelProps {
  text: string
  onChange: (text: string) => void
}

export function TranscriptionPanel({ text, onChange }: TranscriptionPanelProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (!text.trim()) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [text])

  return (
    <div className="transcription-panel">
      <div className="transcription-panel__header">
        <span className="transcription-panel__label">识别结果</span>
        <button
          type="button"
          className={`transcription-panel__copy ${copied ? 'transcription-panel__copy--done' : ''}`}
          onClick={handleCopy}
          disabled={!text.trim()}
        >
          {copied ? (
            <>
              <CheckIcon />
              已复制
            </>
          ) : (
            <>
              <CopyIcon />
              复制
            </>
          )}
        </button>
      </div>
      <textarea
        className="transcription-panel__textarea"
        value={text}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        placeholder="识别结果将显示在这里，可直接编辑"
        spellCheck={false}
      />
    </div>
  )
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
