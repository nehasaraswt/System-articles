import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { callClaudeParallel } from '@/lib/claude'
import { saveGeneration } from '@/lib/kv'
import { thoughtLeadershipPrompt, howToPrompt, storyPrompt } from '@/lib/prompts/articles'
import { diagramPrompt } from '@/lib/prompts/diagram'
import type { Generation, GenerateRequest } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json()
    const { rawContent, module, settings } = body

    if (!rawContent?.trim()) {
      return NextResponse.json({ error: 'rawContent is required' }, { status: 400 })
    }

    const tlPrompt = thoughtLeadershipPrompt(rawContent, settings)
    const htPrompt = howToPrompt(rawContent, settings)
    const stPrompt = storyPrompt(rawContent, settings)
    const dgPrompt = diagramPrompt(rawContent, settings.diagramStyle, settings.iconStyle)

    const [thoughtLeadership, howTo, story, svg] = await callClaudeParallel([
      { ...tlPrompt, maxTokens: 2048 },
      { ...htPrompt, maxTokens: 2048 },
      { ...stPrompt, maxTokens: 2048 },
      { ...dgPrompt, maxTokens: 4096 },
    ])

    const generation: Generation = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      module,
      settings,
      rawContent,
      articles: { thoughtLeadership, howTo, story },
      diagram: { svg, style: settings.diagramStyle },
    }

    await saveGeneration(generation)
    return NextResponse.json(generation, { status: 201 })
  } catch (err) {
    console.error('[generate]', err)
    const message = err instanceof Error ? err.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
