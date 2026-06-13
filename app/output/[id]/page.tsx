'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Copy, Check, Download, ArrowLeft, RefreshCw } from 'lucide-react'
import type { Generation } from '@/types'

const ARTICLE_LABELS = {
  thoughtLeadership: 'Thought Leadership',
  howTo: 'Practical How-To',
  story: 'Personal Story',
} as const

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
      style={{ background: 'var(--bg-hover)', color: copied ? '#4ade80' : 'var(--text-muted)' }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function ArticleCard({ label, body }: { label: string; body: string }) {
  return (
    <div className="flex flex-col rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', minHeight: 400 }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--accent)' }}>{label}</span>
        <CopyButton text={body} />
      </div>
      <div className="flex-1 overflow-y-auto p-4 text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
        {body}
      </div>
    </div>
  )
}

function DiagramPanel({ svg, style }: { svg: string; style: string }) {
  const svgRef = useRef<HTMLDivElement>(null)

  const downloadSVG = () => {
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diagram-${style}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPNG = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 480
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      const a = document.createElement('a')
      a.download = `diagram-${style}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
    img.src = url
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--accent)' }}>Diagram</span>
          <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>{style}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadSVG}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
          >
            <Download size={12} /> SVG
          </button>
          <button
            onClick={downloadPNG}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: 'var(--accent-solid)', color: '#fff' }}
          >
            <Download size={12} /> PNG
          </button>
        </div>
      </div>
      <div
        ref={svgRef}
        className="overflow-auto p-2"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  )
}

export default function OutputPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [gen, setGen] = useState<Generation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<keyof typeof ARTICLE_LABELS>('thoughtLeadership')

  useEffect(() => {
    if (!id) return
    fetch(`/api/history/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setGen(data)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleReconfigure = () => {
    if (!gen) return
    sessionStorage.setItem('ce_rawContent', gen.rawContent)
    sessionStorage.setItem('ce_module', JSON.stringify(gen.module))
    router.push('/generate')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-4 border-t-indigo-400 border-slate-700 animate-spin" />
      </div>
    )
  }

  if (error || !gen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-400">{error || 'Generation not found'}</p>
        <button onClick={() => router.push('/history')} style={{ color: 'var(--accent)' }}>← Back to History</button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/history')} style={{ color: 'var(--text-muted)' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{gen.module.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(gen.createdAt).toLocaleDateString()}</span>
              <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>{gen.settings.length}</span>
              <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{gen.settings.audience}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleReconfigure}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          <RefreshCw size={14} /> Reconfigure
        </button>
      </div>

      {/* Article tabs */}
      <div>
        <div className="flex gap-1 mb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          {(Object.keys(ARTICLE_LABELS) as (keyof typeof ARTICLE_LABELS)[]).map(key => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="px-4 py-2 text-sm font-medium transition-colors"
              style={{
                color: activeTab === key ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeTab === key ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {ARTICLE_LABELS[key]}
            </button>
          ))}
        </div>
        <ArticleCard label={ARTICLE_LABELS[activeTab]} body={gen.articles[activeTab]} />
      </div>

      {/* Diagram */}
      <DiagramPanel svg={gen.diagram.svg} style={gen.diagram.style} />
    </div>
  )
}
