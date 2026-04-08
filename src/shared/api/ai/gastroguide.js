import { callAI } from './openrouter'
import { TOOLS, executeTool } from './tools'
import { buildSystemPrompt } from './prompts'

/**
 * Send a user message to GastroGuide and return the assistant's reply.
 * Implements the two-pass agentic loop:
 *   1. User message → AI → possible tool call
 *   2. Tool result → AI → final response
 */
export async function sendMessage({ message, history = [], context = {} }) {
  const systemPrompt = buildSystemPrompt(context)

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: message },
  ]

  // Pass 1 — AI may call a tool
  const response = await callAI(messages, { tools: TOOLS, tool_choice: 'auto' })
  const choice = response.choices?.[0]

  if (!choice) throw new Error('Empty AI response')

  // If AI made a tool call — execute and return final response
  if (choice.finish_reason === 'tool_calls') {
    const toolCall = choice.message.tool_calls[0]
    const args     = JSON.parse(toolCall.function.arguments)
    const result   = executeTool(toolCall.function.name, args)

    const messagesWithTool = [
      ...messages,
      choice.message,
      { role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(result) },
    ]

    const final = await callAI(messagesWithTool, { tools: TOOLS })
    return {
      text:      final.choices?.[0]?.message?.content || '',
      locations: Array.isArray(result) ? result : result ? [result] : [],
    }
  }

  return { text: choice.message?.content || '', locations: [] }
}
