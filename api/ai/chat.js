/**
 * Vercel Serverless Function: /api/ai/chat
 * OpenRouter proxy — API key stays server-side only.
 * Handles model cascade on 429 (rate limit).
 */

const MODEL_CASCADE = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'mistralai/mistral-small-3.1:free',
  'nvidia/nemotron-nano-9b-v2:free',
  'google/gemma-3-27b-it:free',
  'qwen/qwen3-coder:free',
]

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { messages, tools, tool_choice, temperature = 0.7, model: preferredModel } = req.body
  if (!messages?.length) return res.status(400).json({ error: 'messages required' })

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return res.status(503).json({ error: 'AI not configured' })

  const cascade = preferredModel ? [preferredModel, ...MODEL_CASCADE] : MODEL_CASCADE

  for (let i = 0; i < cascade.length; i++) {
    const model = cascade[i]
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.VITE_APP_URL || 'https://gastromap.app',
          'X-Title': 'GastroMap',
        },
        body: JSON.stringify({
          model, messages, temperature,
          ...(tools ? { tools, tool_choice: tool_choice || 'auto' } : {}),
        }),
      })

      if (response.status === 429 && i < cascade.length - 1) {
        console.log(`[AI] Model ${model} rate-limited, trying next...`)
        continue
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error?.message || `OpenRouter ${response.status}`)
      }

      const data = await response.json()
      return res.status(200).json({ ...data, _model_used: model })

    } catch (err) {
      if (i === cascade.length - 1) {
        console.error('[AI] All models failed:', err.message)
        return res.status(503).json({ error: 'AI temporarily unavailable', details: err.message })
      }
    }
  }
}
