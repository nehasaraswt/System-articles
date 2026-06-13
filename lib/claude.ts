import Anthropic from '@anthropic-ai/sdk'
import { getSettings } from '@/lib/kv'

async function getClient(): Promise<Anthropic> {
  // API key from KV settings takes precedence over env var
  const settings = await getSettings().catch(() => null)
  const apiKey = settings?.anthropicApiKey || process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('No Anthropic API key configured. Add one in Settings.')
  return new Anthropic({ apiKey })
}

export async function callClaude(
  userPrompt: string,
  systemPrompt: string,
  maxTokens = 2048
): Promise<string> {
  const client = await getClient()
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })
  const block = message.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from Claude')
  return block.text
}

export async function callClaudeParallel(
  calls: { userPrompt: string; systemPrompt: string; maxTokens?: number }[]
): Promise<string[]> {
  return Promise.all(
    calls.map((c) => callClaude(c.userPrompt, c.systemPrompt, c.maxTokens))
  )
}
