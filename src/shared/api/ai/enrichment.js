import { callAI } from './openrouter'
import { ENRICHMENT_PROMPT } from './prompts'

/**
 * AI-powered location enrichment.
 * Given name + address + category, fills all metadata fields.
 * Does NOT fill: must_try, insider_tip (user only).
 */
export async function enrichLocation({ name, address, city, category }) {
  const userMessage = `name="${name}", address="${address}", city="${city}", category="${category}"`

  const response = await callAI([
    { role: 'system', content: ENRICHMENT_PROMPT },
    { role: 'user',   content: userMessage },
  ], { temperature: 0.3 })

  const content = response.choices?.[0]?.message?.content || '{}'
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI returned invalid JSON')

  return JSON.parse(jsonMatch[0])
}
