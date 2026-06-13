'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Upload, Clock, Settings, ArrowRight, Eye, RefreshCw } from 'lucide-react'
import type { GenerationMeta } from '@/types'

const VENTURE_COLORS: Record<string, string> = {
  systems: '#818cf8',
  ano: '#34d399',
  nit: '#f472b6',
}

export default function HomePage() {
  const router = useRouter()
  const [recent, setRecent] = useState<GenerationMeta[]>([])

  useEffect(() => {
    fetch('/api/history')
      .then(r => r.json())
      .then(data => Array.isArray(data) && setRecent(data.slice(0, 5)))
      .catch(() => {})
  }, [])

  const handleRemix = (gen: GenerationMeta) => {
    fetch(`/api/history/${gen.id}`)
      .then(r => r.json())
      .then(data => {
        sessionStorage.setItem('ce_rawContent', data.rawContent)
        sessionStorage.setItem('ce_module', JSON.stringify(data.module))
        router.push('/generate')
      })
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Content Engine</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          Upload course content → generate 3 article variants + a diagram → publish.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/upload" className="rounded-xl p-5 block" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <Upload size={20} style={{ color: 'var(--accent)' }} />
          <h2 className="mt-3 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>New Generation</h2>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Upload a PDF, DOCX, or paste text</p>
          <div className="mt-4 flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}>Start <ArrowRight size={12} /></div>
        </Link>

        <Link href="/history" className="rounded-xl p-5 block" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <Clock size={20} style={{ color: 'var(--accent)' }} />
          <h2 className="mt-3 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>History</h2>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Browse, remix, or delete past generations</p>
          <div className="mt-4 flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}>Browse <ArrowRight size={12} /></div>
        </Link>

        <Link href="/settings" className="rounded-xl p-5 block" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <Settings size={20} style={{ color: 'var(--accent)' }} />
          <h2 className="mt-3 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Settings</h2>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Add your Anthropic API key and set defaults</p>
          <div className="mt-4 flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}>Configure <ArrowRight size={12} /></div>
        </Link>
      </div>

      {/* Recent generations */}
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Recent</h2>
            <Link href="/history" className="text-xs" style={{ color: 'var(--accent)' }}>View all →</Link>
          </div>
          <div className="space-y-2">
            {recent.map(gen => {
              const accent = VENTURE_COLORS[gen.module.venture] ?? 'var(--accent)'
              return (
                <div key={gen.id} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: accent }} />
                    <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{gen.module.name}</span>
                    <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {new Date(gen.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => router.push(`/output/${gen.id}`)} className="p-1.5 rounded-lg" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                      <Eye size={13} />
                    </button>
                    <button onClick={() => handleRemix(gen)} className="p-1.5 rounded-lg" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                      <RefreshCw size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* How it works — only shown when no generations yet */}
      {recent.length === 0 && (
        <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>How it works</h2>
          <ol className="text-sm space-y-2 list-decimal list-inside" style={{ color: 'var(--text-muted)' }}>
            <li>Go to <strong style={{ color: 'var(--text-primary)' }}>Settings</strong> and paste your Anthropic API key.</li>
            <li>Click <strong style={{ color: 'var(--text-primary)' }}>New Generation</strong> and upload your course content.</li>
            <li>Choose length, audience, and diagram style — then hit Generate.</li>
            <li>Review 3 article variants, copy the one you want, download the diagram PNG for LinkedIn.</li>
          </ol>
        </div>
      )}
    </div>
  )
}
