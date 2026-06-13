'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, RefreshCw, Trash2, FileText } from 'lucide-react'
import type { GenerationMeta } from '@/types'

const VENTURE_COLORS: Record<string, string> = {
  systems: '#818cf8',
  ano: '#34d399',
  nit: '#f472b6',
}

function Pill({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize"
      style={{
        background: color ? `${color}22` : 'var(--bg-hover)',
        color: color ?? 'var(--text-muted)',
      }}
    >
      {children}
    </span>
  )
}

export default function HistoryPage() {
  const router = useRouter()
  const [generations, setGenerations] = useState<GenerationMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/history')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setGenerations(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this generation? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' })
      setGenerations(prev => prev.filter(g => g.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  const handleRemix = (gen: GenerationMeta) => {
    // Fetch the full generation to get rawContent, then navigate to configure
    fetch(`/api/history/${gen.id}`)
      .then(r => r.json())
      .then(data => {
        sessionStorage.setItem('ce_rawContent', data.rawContent)
        sessionStorage.setItem('ce_module', JSON.stringify(data.module))
        router.push('/generate')
      })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-4 border-t-indigo-400 border-slate-700 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>History</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {generations.length} generation{generations.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => router.push('/upload')}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--accent-solid)', color: '#fff' }}
        >
          + New
        </button>
      </div>

      {error && (
        <div className="rounded-xl p-4 text-sm text-red-400" style={{ background: 'var(--bg-card)', border: '1px solid #ef444433' }}>
          {error}
        </div>
      )}

      {!error && generations.length === 0 && (
        <div className="rounded-xl p-12 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <FileText size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No generations yet</p>
          <p className="text-sm mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>Upload your first piece of content to get started.</p>
          <button
            onClick={() => router.push('/upload')}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--accent-solid)', color: '#fff' }}
          >
            New Generation
          </button>
        </div>
      )}

      <div className="space-y-3">
        {generations.map(gen => {
          const accentColor = VENTURE_COLORS[gen.module.venture] ?? 'var(--accent)'
          return (
            <div
              key={gen.id}
              className="rounded-xl p-4"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {gen.module.name}
                    </h2>
                    <Pill color={accentColor}>{gen.module.venture}</Pill>
                  </div>

                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Pill>{gen.settings.length}</Pill>
                    <Pill>{gen.settings.audience}</Pill>
                    <Pill>{gen.settings.diagramStyle}</Pill>
                    {gen.module.tags.map(t => (
                      <Pill key={t}>{t}</Pill>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>{new Date(gen.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span>TL {gen.wordCounts.thoughtLeadership}w</span>
                    <span>How-To {gen.wordCounts.howTo}w</span>
                    <span>Story {gen.wordCounts.story}w</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => router.push(`/output/${gen.id}`)}
                    title="View"
                    className="p-2 rounded-lg transition-colors"
                    style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => handleRemix(gen)}
                    title="Remix"
                    className="p-2 rounded-lg transition-colors"
                    style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
                  >
                    <RefreshCw size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(gen.id)}
                    title="Delete"
                    disabled={deletingId === gen.id}
                    className="p-2 rounded-lg transition-colors"
                    style={{ background: 'var(--bg-hover)', color: deletingId === gen.id ? 'var(--text-muted)' : '#f87171' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
