import { useCallback, useRef, useState } from 'react'

export type RecorderStatus = 'idle' | 'recording' | 'stopped' | 'error'

interface UseRecorderResult {
  status: RecorderStatus
  audioBlob: Blob | null
  error: string | null
  startRecording: () => Promise<void>
  stopRecording: () => void
  reset: () => void
}

function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ]
  return types.find((type) => MediaRecorder.isTypeSupported(type)) ?? ''
}

export function useRecorder(): UseRecorderResult {
  const [status, setStatus] = useState<RecorderStatus>('idle')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  const startRecording = useCallback(async () => {
    setError(null)
    setAudioBlob(null)
    chunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = getSupportedMimeType()
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)

      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        })
        setAudioBlob(blob)
        setStatus('stopped')
        cleanupStream()
      }

      recorder.onerror = () => {
        setError('录音过程中发生错误')
        setStatus('error')
        cleanupStream()
      }

      recorder.start()
      setStatus('recording')
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? '麦克风权限被拒绝，请在浏览器设置中允许访问'
          : '无法访问麦克风，请检查设备连接'
      setError(message)
      setStatus('error')
      cleanupStream()
    }
  }, [cleanupStream])

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state === 'recording') {
      recorder.stop()
    }
  }, [])

  const reset = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    cleanupStream()
    mediaRecorderRef.current = null
    chunksRef.current = []
    setAudioBlob(null)
    setError(null)
    setStatus('idle')
  }, [cleanupStream])

  return {
    status,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    reset,
  }
}
