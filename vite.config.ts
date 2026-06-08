import type { Connect, PreviewServer, ViteDevServer } from 'vite'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const CHINESE_PROMPT = '请使用中文转录以下音频内容'

function createTranscribeMiddleware(apiKey: string): Connect.NextHandleFunction {
  return async (req, res, next) => {
    if (req.url !== '/api/transcribe' || req.method !== 'POST') {
      next()
      return
    }

    if (!apiKey) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          error: { message: '未配置 API Key，请在 .env 中设置 ZHIPU_API_KEY' },
        }),
      )
      return
    }

    try {
      const chunks: Buffer[] = []
      for await (const chunk of req) {
        chunks.push(chunk as Buffer)
      }
      const body = JSON.parse(Buffer.concat(chunks).toString())
      const fileBase64 = body.file_base64

      if (!fileBase64) {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: { message: '缺少音频数据' } }))
        return
      }

      const audioBuffer = Buffer.from(fileBase64, 'base64')
      if (audioBuffer.length === 0) {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: { message: '音频数据为空，请重新录制' } }))
        return
      }

      const formData = new FormData()
      formData.append('model', 'glm-asr-2512')
      formData.append('stream', 'false')
      formData.append('prompt', CHINESE_PROMPT)
      formData.append(
        'file',
        new Blob([audioBuffer], { type: 'audio/wav' }),
        'recording.wav',
      )

      const response = await fetch(
        'https://open.bigmodel.cn/api/paas/v4/audio/transcriptions',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}` },
          body: formData,
        },
      )

      const data = await response.json()

      res.statusCode = response.status
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(data))
    } catch {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({ error: { message: '服务器处理失败，请稍后重试' } }),
      )
    }
  }
}

function setupApiMiddleware(
  server: ViteDevServer | PreviewServer,
  apiKey: string,
) {
  server.middlewares.use(createTranscribeMiddleware(apiKey))
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.ZHIPU_API_KEY ?? ''

  return {
    plugins: [
      react(),
      {
        name: 'zhipu-api-proxy',
        configureServer(server) {
          setupApiMiddleware(server, apiKey)
        },
        configurePreviewServer(server) {
          setupApiMiddleware(server, apiKey)
        },
      },
    ],
  }
})
