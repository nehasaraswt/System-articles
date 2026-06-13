import type { GenerationSettings } from '@/types'

const LENGTH_GUIDE: Record<string, string> = {
  short: 'approximately 300 words',
  medium: 'approximately 800 words',
  long: 'approximately 1500 words',
}

const AUDIENCE_GUIDE: Record<string, string> = {
  executives: 'senior leaders and decision-makers who care about strategic implications, ROI, and organizational impact',
  practitioners: 'hands-on professionals who want to apply ideas immediately in their own work',
  general: 'curious, intelligent readers who are new to the topic and want accessible, engaging insights',
}

function baseSystem(settings: GenerationSettings, extra: string, writingVoice?: string): string {
  const tone = settings.toneOverride
    ? `Tone: ${settings.toneOverride}.`
    : ''
  const voiceBlock = writingVoice?.trim()
    ? `\nAuthor's voice and style (follow this closely):\n${writingVoice.trim()}\n`
    : ''
  return `You are a world-class writer producing content for publication on LinkedIn and other professional platforms.
Target audience: ${AUDIENCE_GUIDE[settings.audience]}.
Target length: ${LENGTH_GUIDE[settings.length]}.
${tone}${voiceBlock}
${extra}
Return only the article text. No preamble, no title tag, no markdown fences.`
}

export function thoughtLeadershipPrompt(
  rawContent: string,
  settings: GenerationSettings,
  writingVoice?: string
): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: baseSystem(
      settings,
      `Style: Thought Leadership.
- Open with a bold, counterintuitive claim that challenges conventional wisdom
- Build a single, sharp argument — one big idea, defended well
- Use the source material as evidence, not as a summary
- Have a strong POV; avoid hedging
- End with a provocative question or call to rethink
- Paragraph breaks every 2-3 sentences for LinkedIn readability`,
      writingVoice
    ),
    userPrompt: `Write a thought leadership article based on the following course content:\n\n${rawContent}`,
  }
}

export function howToPrompt(
  rawContent: string,
  settings: GenerationSettings,
  writingVoice?: string
): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: baseSystem(
      settings,
      `Style: Practical How-To.
- Open with the problem this solves or the outcome the reader will achieve
- Present a clear framework or numbered steps extracted from the source material
- Each step is concrete and immediately actionable
- Use specific examples or scenarios
- End with a single most-important takeaway
- Keep sentences crisp; bullet points where clarity demands it`,
      writingVoice
    ),
    userPrompt: `Write a practical how-to article based on the following course content:\n\n${rawContent}`,
  }
}

export function storyPrompt(
  rawContent: string,
  settings: GenerationSettings,
  writingVoice?: string
): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: baseSystem(
      settings,
      `Style: Personal Story.
- Write in first person as the narrator and designer of this course
- Open with a specific, vivid scene or moment — not a generic observation
- Build an emotional arc: tension → insight → transformation
- Weave in the concepts from the source material as lived discoveries, not theory
- Be vulnerable and specific; avoid clichés
- End with a personal reflection that invites the reader into their own version of this journey`,
      writingVoice
    ),
    userPrompt: `Write a personal story article based on the following course content:\n\n${rawContent}`,
  }
}
