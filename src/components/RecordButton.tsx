import './RecordButton.css'

interface RecordButtonProps {
  isRecording: boolean
  disabled?: boolean
  onClick: () => void
}

export function RecordButton({ isRecording, disabled, onClick }: RecordButtonProps) {
  return (
    <button
      type="button"
      className={`record-button ${isRecording ? 'record-button--recording' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={isRecording ? '停止录音' : '开始录音'}
      aria-pressed={isRecording}
    >
      <span className="record-button__pulse" aria-hidden="true" />
      <span className="record-button__inner">
        {isRecording ? (
          <span className="record-button__stop-icon" />
        ) : (
          <span className="record-button__mic-icon" />
        )}
      </span>
    </button>
  )
}
