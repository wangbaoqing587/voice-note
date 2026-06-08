import { useCallback, useState } from 'react'
import { transcribeAudio, TranscribeError } from '../services/transcribe'
import { blobToWav, getAudioDuration } from '../utils/blobToWav'

const MAX_DURATION_SECONDS = 30
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024

export type TranscriptionStatus = 'idle' | 'loading' | 'success' | 'error'

interface UseTranscriptionResult {
  status: TranscriptionStatus
  text: string
  error: string | null
  transcribe: (audioBlob: Blob) => Promise<void>
  setText: (text: string) => void
  reset: () => void
}

export function useTranscription(): UseTranscriptionResult {
  const [status, setStatus] = useState<TranscriptionStatus>('idle')
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const transcribe = useCallback(async (audioBlob: Blob) => {
    setStatus('loading')
    setError(null)
    setText('')

    try {
      const duration = await getAudioDuration(audioBlob)
      if (duration > MAX_DURATION_SECONDS) {
        throw new TranscribeError(
          `录音时长不能超过 ${MAX_DURATION_SECONDS} 秒，请重新录制`,
        )
      }

      const wavBlob = await blobToWav(audioBlob)
      if (wavBlob.size > MAX_FILE_SIZE_BYTES) {
        throw new TranscribeError('音频文件过大（最大 25MB），请缩短录音时长')
      }

      const result = await transcribeAudio(wavBlob)
      setText(result.text)
      setStatus('success')
    } catch (err) {
      const message =
        err instanceof TranscribeError
          ? err.message
          : err instanceof TypeError
            ? '网络连接失败，请检查网络后重试'
            : '语音识别失败，请稍后重试'
      setError(message)
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setText('')
    setError(null)
  }, [])

  return { status, text, error, transcribe, setText, reset }
}
