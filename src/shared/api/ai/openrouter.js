/**
 * OpenRouter API client with cascading model fallback.
 * Calls go through /api/ai/chat (Vercel serverless) — API key never exposed to client.
 */

export const MODEL_CASCADE = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'mistralai/mistral-small-3.1:free',
  'nvidia/nemotron-nano-9b-v2:free',
  'google/gemma-3-27b-it:free',
  'qwen/qwen3-coder:free',
]

/**
 * Send messages to AI via server proxy.
 * @param {object[]} messages - Chat history
 * @param {object}   options  - { tools, toolChoice, temperature }
 */
export async function callAI(messages, options = {}) {
  const res = await fetch('/api/ai/chat', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ messages, ...options }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `AI error ${res.status}`)
  }
  return res.json()
}
