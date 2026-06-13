import type { DiagramStyle, IconStyle } from '@/types'
import { ICON_NAMES } from '@/lib/icons/lucide-set'

const STYLE_INSTRUCTION: Record<DiagramStyle, string> = {
  loop: `Draw a FEEDBACK LOOP diagram:
- 4-6 nodes arranged in a circle or oval
- Curved arrows connecting them clockwise showing cause and effect
- Each node is a rounded rectangle with a short label (2-4 words)
- Highlight one "keystone" node with a different fill color`,

  flow: `Draw a LEFT-TO-RIGHT FLOW diagram:
- 4-7 boxes connected by arrows flowing left to right
- Each box has a short label (2-4 words)
- Group related boxes with a subtle background rect
- Use a funnel shape if showing convergence`,

  matrix: `Draw a 2x2 MATRIX diagram:
- Four quadrants with a clear X axis label and Y axis label
- Each quadrant has a title and 1-2 bullet descriptors
- Light fill per quadrant, bold title
- X axis label at bottom, Y axis label on the left (rotated)`,

  stack: `Draw a VERTICAL STACK / PYRAMID diagram:
- 4-5 horizontal layers stacked bottom to top (foundation at bottom)
- Each layer is a trapezoid or rectangle with a label and short description
- Bottom layer is widest (most fundamental); top layer is narrowest
- Use progressively lighter fills from bottom to top`,

  ripple: `Draw a RIPPLE / CONCENTRIC CIRCLES diagram:
- 3-5 concentric circles with a central concept at the core
- Each ring represents a level of impact or scope
- Label each ring with 2-4 words
- Arrows or dotted lines radiating outward from center`,
}

export function diagramPrompt(
  rawContent: string,
  diagramStyle: DiagramStyle,
  iconStyle: IconStyle,
  diagramPreferences?: string
): { systemPrompt: string; userPrompt: string } {
  const iconInstruction =
    iconStyle === 'lucide'
      ? `You may embed Lucide icons by including this exact SVG snippet for any icon (replace NAME and x/y/size as needed):
<g transform="translate(X, Y)"><svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="ICON_PATH_D"/></svg></g>
Available icon names and their path "d" values are listed at the end of this prompt. Use icons sparingly — 1-3 max.`
      : 'Do not use icons.'

  const iconList =
    iconStyle === 'lucide'
      ? `\n\nAvailable icon names: ${ICON_NAMES.join(', ')}.`
      : ''

  const preferencesBlock = diagramPreferences?.trim()
    ? `\nDesigner's preferences (follow these closely):\n${diagramPreferences.trim()}\n`
    : ''

  return {
    systemPrompt: `You are a professional information designer generating SVG diagrams for LinkedIn posts.

Rules:
- Return ONLY the raw SVG code. No markdown fences, no explanation, no comments outside the SVG.
- Use exactly: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
- Background: fill a rect 800x480 with #0f172a
- Primary text color: #f1f5f9
- Accent color (highlights, arrows, key nodes): #818cf8
- Secondary accent: #a78bfa
- Node fills: #1e293b with stroke #334155
- Font: font-family="system-ui, -apple-system, sans-serif"
- Keep labels concise (2-5 words per node)
- The diagram must be clean, minimal, and publication-ready
- No lorem ipsum; extract real labels from the source content
${preferencesBlock}
${STYLE_INSTRUCTION[diagramStyle]}

${iconInstruction}${iconList}`,
    userPrompt: `Create a ${diagramStyle} diagram that visually captures the core concepts from this content:\n\n${rawContent}`,
  }
}
