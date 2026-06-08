export interface TranscribeResult {
  text: string
}

export class TranscribeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TranscribeError'
  }
}

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export async function transcribeAudio(audioBlob: Blob): Promise<TranscribeResult> {
  const fileBase64 = await blobToBase64(audioBlob)

  const response = await fetch('/api/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_base64: fileBase64 }),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      data?.error?.message ??
      data?.message ??
      '语音识别失败，请稍后重试'
    throw new TranscribeError(message)
  }

  if (!data?.text?.trim()) {
    throw new TranscribeError('未能识别到语音内容，请重新录制')
  }

  return { text: data.text.trim() }
}
