import { useCallback, useEffect, useMemo, useRef } from 'react'
import { HistoryDetail } from './components/HistoryDetail'
import { HistoryList } from './components/HistoryList'
import { LoadingOverlay } from './components/LoadingOverlay'
import { RecordButton } from './components/RecordButton'
import { TranscriptionPanel } from './components/TranscriptionPanel'
import { useHistory } from './hooks/useHistory'
import { useRecorder } from './hooks/useRecorder'
import { useTranscription } from './hooks/useTranscription'
import './App.css'

function formatBlobSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function App() {
  const { status, audioBlob, error, startRecording, stopRecording } = useRecorder()
  const {
    status: transcribeStatus,
    text,
    error: transcribeError,
    transcribe,
    setText,
    reset: resetTranscription,
  } = useTranscription()
  const {
    records,
    selectedRecord,
    setSelectedId,
    addRecord,
    deleteRecord,
  } = useHistory()

  const savedSessionRef = useRef(false)

  const isRecording = status === 'recording'
  const isTranscribing = transcribeStatus === 'loading'

  const audioUrl = useMemo(
    () => (audioBlob ? URL.createObjectURL(audioBlob) : null),
    [audioBlob],
  )

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  useEffect(() => {
    if (transcribeStatus === 'loading') {
      savedSessionRef.current = false
    }
  }, [transcribeStatus])

  useEffect(() => {
    if (
      transcribeStatus === 'success' &&
      text.trim() &&
      !savedSessionRef.current
    ) {
      addRecord(text.trim())
      savedSessionRef.current = true
    }
  }, [transcribeStatus, text, addRecord])

  const handleRecordClick = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      resetTranscription()
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording, resetTranscription])

  const handleTranscribe = useCallback(() => {
    if (audioBlob) {
      transcribe(audioBlob)
    }
  }, [audioBlob, transcribe])

  const statusText = {
    idle: '点击按钮开始录音',
    recording: '录音中，再次点击停止',
    stopped: '录音完成，可以开始识别',
    error: '录音失败',
  }[status]

  const displayError = error ?? (transcribeStatus === 'error' ? transcribeError : null)

  return (
    <div className="app">
      <div className="app__container">
        <header className="app__header">
          <h1 className="app__title">语音笔记</h1>
          <p className="app__subtitle">录音 · 识别 · 编辑</p>
        </header>

        <main className="app__main">
          <section className="app__record-section">
            <RecordButton
              isRecording={isRecording}
              disabled={isTranscribing}
              onClick={handleRecordClick}
            />
            <p
              className={`app__status ${
                status === 'error' || transcribeStatus === 'error'
                  ? 'app__status--error'
                  : isRecording
                    ? 'app__status--recording'
                    : ''
              }`}
            >
              {displayError ?? statusText}
            </p>
          </section>

          {isTranscribing && (
            <LoadingOverlay
              title="正在识别语音，请稍候…"
              hint="AI 正在将您的录音转换为文字"
            />
          )}

          {audioBlob && status === 'stopped' && !isTranscribing && transcribeStatus !== 'success' && (
            <section className="app__audio-panel">
              <div className="app__audio-meta">
                <span>{audioBlob.type?.split('/')[1] || 'webm'}</span>
                <span className="app__audio-meta-divider">·</span>
                <span>{formatBlobSize(audioBlob.size)}</span>
              </div>
              {audioUrl && (
                <audio className="app__player" controls src={audioUrl} />
              )}
              <button
                type="button"
                className="app__transcribe-btn"
                onClick={handleTranscribe}
              >
                开始识别
              </button>
            </section>
          )}

          {transcribeStatus === 'success' && text && (
            <TranscriptionPanel text={text} onChange={setText} />
          )}
        </main>

        <HistoryList
          records={records}
          onSelect={setSelectedId}
          onDelete={deleteRecord}
        />
      </div>

      {selectedRecord && (
        <HistoryDetail
          record={selectedRecord}
          onClose={() => setSelectedId(null)}
          onDelete={deleteRecord}
        />
      )}
    </div>
  )
}
