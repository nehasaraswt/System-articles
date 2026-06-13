export type Venture = 'systems' | 'ano' | 'nit'
export type Platform = 'linkedin' | 'x' | 'youtube'
export type Length = 'short' | 'medium' | 'long'
export type Audience = 'executives' | 'practitioners' | 'general'
export type DiagramStyle = 'loop' | 'flow' | 'matrix' | 'stack' | 'ripple'
export type IconStyle = 'lucide' | 'none'

export interface Module {
  name: string
  tags: string[]
  venture: Venture
  platforms: Platform[]
}

export interface GenerationSettings {
  length: Length
  audience: Audience
  diagramStyle: DiagramStyle
  iconStyle: IconStyle
  toneOverride?: string
}

export interface Articles {
  thoughtLeadership: string
  howTo: string
  story: string
}

export interface Diagram {
  svg: string
  style: DiagramStyle
}

export interface Generation {
  id: string
  createdAt: string
  module: Module
  settings: GenerationSettings
  rawContent: string
  articles: Articles
  diagram: Diagram
}

// Lightweight version stored in the index — no article body or SVG
export interface GenerationMeta {
  id: string
  createdAt: string
  module: Module
  settings: GenerationSettings
  wordCounts: {
    thoughtLeadership: number
    howTo: number
    story: number
  }
}

export interface AppSettings {
  anthropicApiKey: string
  defaultVenture: Venture
  defaultLength: Length
  defaultAudience: Audience
  writingVoice?: string
  diagramPreferences?: string
}

export interface GenerateRequest {
  rawContent: string
  module: Module
  settings: GenerationSettings
}

export interface ParseResult {
  rawContent: string
  wordCount: number
}

export interface InfraSettings {
  supabaseUrl: string             // masked in GET responses
  supabaseServiceRoleKey: string  // masked in GET responses
  isConfigured: boolean
}
