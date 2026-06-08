function interleave(audioBuffer: AudioBuffer): Float32Array {
  const channels = audioBuffer.numberOfChannels
  const length = audioBuffer.length
  const result = new Float32Array(length * channels)

  for (let ch = 0; ch < channels; ch++) {
    const channelData = audioBuffer.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      result[i * channels + ch] = channelData[i]
    }
  }

  return result
}

function floatTo16BitPCM(float32: Float32Array): Int16Array {
  const output = new Int16Array(float32.length)
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]))
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return output
}

function encodeWAV(audioBuffer: AudioBuffer): Blob {
  const numChannels = audioBuffer.numberOfChannels
  const sampleRate = audioBuffer.sampleRate
  const bitsPerSample = 16
  const bytesPerSample = bitsPerSample / 8
  const blockAlign = numChannels * bytesPerSample

  const interleaved = interleave(audioBuffer)
  const pcm = floatTo16BitPCM(interleaved)
  const dataLength = pcm.length * bytesPerSample
  const buffer = new ArrayBuffer(44 + dataLength)
  const view = new DataView(buffer)

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + dataLength, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitsPerSample, true)
  writeString(36, 'data')
  view.setUint32(40, dataLength, true)

  let offset = 44
  for (let i = 0; i < pcm.length; i++) {
    view.setInt16(offset, pcm[i], true)
    offset += 2
  }

  return new Blob([buffer], { type: 'audio/wav' })
}

export async function blobToWav(blob: Blob): Promise<Blob> {
  const audioContext = new AudioContext()
  try {
    const arrayBuffer = await blob.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    return encodeWAV(audioBuffer)
  } finally {
    await audioContext.close()
  }
}

export async function getAudioDuration(blob: Blob): Promise<number> {
  const audioContext = new AudioContext()
  try {
    const arrayBuffer = await blob.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    return audioBuffer.duration
  } finally {
    await audioContext.close()
  }
}
