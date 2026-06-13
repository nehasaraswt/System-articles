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
    ? `Tone note: ${settings.toneOverride}.`
    : ''
  const voiceBlock = writingVoice?.trim()
    ? `AUTHOR'S VOICE (this is the highest-priority instruction — it overrides all other stylistic guidance below):
${writingVoice.trim()}
---`
    : ''
  return `You are ghostwriting for a specific author. Your job is to disappear into their voice — not to produce generic LinkedIn content.

${voiceBlock}
Target audience: ${AUDIENCE_GUIDE[settings.audience]}.
Target length: ${LENGTH_GUIDE[settings.length]}.
${tone}

${extra}

Non-negotiable rules:
- Never open with a generic hook or productivity cliché ("X is not your problem", "Most people think...", "Here's the truth about...")
- Never use bullet points in narrative sections
- Never end with a call-to-action
- Never write in a motivational-speaker or self-help register
- If the author's voice guide is present above, honour every specific instruction in it

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
      `Article register: Provocation — short, precise, declarative.
This piece builds around one counter-intuitive intellectual claim drawn from the source material.
It moves fast. It names things plainly. It ends with a direct challenge or question to the reader — not a conclusion, never a call-to-action.
The argument is made in the author's own voice, not in generic thought-leadership language.
Avoid: motivation-speak, jargon, abstract nouns standing in for real things.`,
      writingVoice
    ),
    userPrompt: `Write a thought leadership provocation based on the following course content:\n\n${rawContent}`,
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
      `Article register: Practical — a framework or practice extracted from the material, explained in the author's voice.
This is not a listicle or productivity article. The author walks the reader through a way of thinking or doing — slowly, with care.
It is grounded in the source content, told from lived experience, and lands on a single insight the reader can carry away.
Structure follows the argument, not a template. No numbered steps unless the content genuinely demands it.`,
      writingVoice
    ),
    userPrompt: `Write a practical, framework-style article based on the following course content:\n\n${rawContent}`,
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
      `Article register: Essay — long-form, winding, personal. This is the author's most intimate register.
Open with a specific, private scene or admission — not an observation about the world, but a door into the author's own experience.
Move slowly. Let ideas accumulate. Apply intellectual frameworks (systems thinking, philosophy, language) to make sense of a felt experience.
End with an open question that hands the reader a mirror. Never resolve neatly. Never conclude.
The concepts from the course material appear as lived discoveries, not as theory being explained.`,
      writingVoice
    ),
    userPrompt: `Write a personal essay based on the following course content:\n\n${rawContent}`,
  }
}
