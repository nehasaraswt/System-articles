'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, ArrowLeft } from 'lucide-react'
import type { Length, Audience, DiagramStyle, IconStyle, GenerationSettings, Module } from '@/types'

const LENGTHS: { value: Length; label: string; desc: string }[] = [
  { value: 'short', label: 'Short', desc: '~300 words' },
  { value: 'medium', label: 'Medium', desc: '~800 words' },
  { value: 'long', label: 'Long', desc: '~1500 words' },
]

const AUDIENCES: { value: Audience; label: string }[] = [
  { value: 'executives', label: 'Executives' },
  { value: 'practitioners', label: 'Practitioners' },
  { value: 'general', label: 'General Public' },
]

const DIAGRAM_STYLES: { value: DiagramStyle; label: string; desc: string }[] = [
  { value: 'loop', label: 'Loop', desc: 'Feedback cycle' },
  { value: 'flow', label: 'Flow', desc: 'Left-to-right steps' },
  { value: 'matrix', label: 'Matrix', desc: '2×2 quadrants' },
  { value: 'stack', label: 'Stack', desc: 'Layered pyramid' },
  { value: 'ripple', label: 'Ripple', desc: 'Concentric rings' },
]

const LOADING_STEPS = [
  'Reading your content…',
  'Writing thought leadership article…',
  'Writing how-to article…',
  'Writing personal story…',
  'Generating diagram…',
  'Almost there…',
]

function OptionButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-2 rounded-lg text-sm transition-colors"
      style={{
        background: active ? 'var(--accent-bg)' : 'var(--bg-base)',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
      }}
    >
      {children}
    </button>
  )
}

export default function GeneratePage() {
  const router = useRouter()

  const [rawContent, setRawContent] = useState('')
  const [module, setModule] = useState<Module | null>(null)

  const [length, setLength] = useState<Length>('medium')
  const [audience, setAudience] = useState<Audience>('practitioners')
  const [diagramStyle, setDiagramStyle] = useState<DiagramStyle>('flow')
  const [iconStyle, setIconStyle] = useState<IconStyle>('lucide')
  const [toneOverride, setToneOverride] = useState('')

  const [generating, setGenerating] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    const content = sessionStorage.getItem('ce_rawContent') || ''
    const mod = sessionStorage.getItem('ce_module')
    if (!content) { router.push('/upload'); return }
    setRawContent(content)
    if (mod) setModule(JSON.parse(mod))
  }, [router])

  useEffect(() => {
    if (!generating) return
    const interval = setInterval(() => {
      setLoadingStep(s => (s + 1) % LOADING_STEPS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [generating])

  const handleGenerate = async () => {
    if (!module) return
    setGenerating(true)
    setError('')
    setLoadingStep(0)

    const settings: GenerationSettings = {
      length, audience, diagramStyle, iconStyle,
      ...(toneOverride.trim() ? { toneOverride: toneOverride.trim() } : {}),
    }

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawContent, module, settings }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      router.push(`/output/${data.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setGenerating(false)
    }
  }

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-12 h-12 rounded-full border-4 border-t-indigo-400 border-slate-700 animate-spin" />
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          {LOADING_STEPS[loadingStep]}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Running 4 Claude calls in parallel — typically 20–40 seconds
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/upload')} style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Configure</h1>
          {module && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{module.name}</p>}
        </div>
      </div>

      <div className="rounded-xl p-5 space-y-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Length</label>
          <div className="flex gap-2">
            {LENGTHS.map(l => (
              <OptionButton key={l.value} active={length === l.value} onClick={() => setLength(l.value)}>
                <span className="block font-medium">{l.label}</span>
                <span className="text-xs opacity-70">{l.desc}</span>
              </OptionButton>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Audience</label>
          <div className="flex gap-2">
            {AUDIENCES.map(a => (
              <OptionButton key={a.value} active={audience === a.value} onClick={() => setAudience(a.value)}>
                {a.label}
              </OptionButton>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Diagram style</label>
          <div className="flex flex-wrap gap-2">
            {DIAGRAM_STYLES.map(d => (
              <OptionButton key={d.value} active={diagramStyle === d.value} onClick={() => setDiagramStyle(d.value)}>
                <span className="block font-medium">{d.label}</span>
                <span className="text-xs opacity-70">{d.desc}</span>
              </OptionButton>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Icons in diagram</label>
          <div className="flex gap-2">
            {(['lucide', 'none'] as IconStyle[]).map(s => (
              <OptionButton key={s} active={iconStyle === s} onClick={() => setIconStyle(s)}>
                {s === 'lucide' ? 'Lucide icons' : 'No icons'}
              </OptionButton>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Tone override <span className="normal-case font-normal">(optional)</span>
          </label>
          <input
            value={toneOverride}
            onChange={e => setToneOverride(e.target.value)}
            placeholder="e.g. Direct and Socratic, or Warm and conversational"
            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      <div className="rounded-xl p-4 text-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        Will generate: <span style={{ color: 'var(--text-primary)' }}>3 articles</span> (Thought Leadership · How-To · Story) + <span style={{ color: 'var(--text-primary)' }}>1 diagram</span> in parallel.
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        onClick={handleGenerate}
        className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
        style={{ background: 'var(--accent-solid)', color: '#fff' }}
      >
        <Zap size={15} /> Generate
      </button>
    </div>
  )
}
