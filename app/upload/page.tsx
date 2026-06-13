'use client'
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, X, Plus } from 'lucide-react'
import type { Venture, Platform } from '@/types'

const VENTURES: { value: Venture; label: string }[] = [
  { value: 'systems', label: 'Systems Foresight' },
  { value: 'ano', label: 'Ano' },
  { value: 'nit', label: 'Nit' },
]

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'x', label: 'X / Twitter' },
  { value: 'youtube', label: 'YouTube' },
]

export default function UploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<'file' | 'paste'>('file')
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [pasteText, setPasteText] = useState('')
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState('')

  const [moduleName, setModuleName] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [venture, setVenture] = useState<Venture>('systems')
  const [platforms, setPlatforms] = useState<Platform[]>(['linkedin'])

  const [rawContent, setRawContent] = useState('')
  const [wordCount, setWordCount] = useState(0)

  const parseFile = useCallback(async (file: File) => {
    setParsing(true)
    setError('')
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch('/api/parse', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Parse failed')
      setRawContent(data.rawContent)
      setWordCount(data.wordCount)
      setFileName(file.name)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse file')
    } finally {
      setParsing(false)
    }
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) parseFile(file)
  }, [parseFile])

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags(prev => [...prev, t])
    setTagInput('')
  }

  const togglePlatform = (p: Platform) => {
    setPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  const canProceed = (rawContent || pasteText.trim()) && moduleName.trim() && platforms.length > 0

  const handleNext = () => {
    const content = mode === 'paste' ? pasteText.trim() : rawContent
    if (!content) return
    sessionStorage.setItem('ce_rawContent', content)
    sessionStorage.setItem('ce_module', JSON.stringify({
      name: moduleName.trim(),
      tags,
      venture,
      platforms,
    }))
    router.push('/generate')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>New Generation</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Upload your course content to generate articles and a diagram.</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        {(['file', 'paste'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: mode === m ? 'var(--accent-bg)' : 'var(--bg-card)',
              color: mode === m ? 'var(--accent)' : 'var(--text-muted)',
              border: `1px solid ${mode === m ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            {m === 'file' ? 'Upload file' : 'Paste text'}
          </button>
        ))}
      </div>

      {/* File drop zone */}
      {mode === 'file' && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-xl p-8 text-center cursor-pointer transition-colors"
          style={{
            background: dragging ? 'var(--accent-bg)' : 'var(--bg-card)',
            border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) parseFile(f) }}
          />
          {parsing ? (
            <p style={{ color: 'var(--text-muted)' }}>Parsing…</p>
          ) : rawContent ? (
            <div className="space-y-1">
              <FileText size={24} className="mx-auto" style={{ color: 'var(--accent)' }} />
              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{fileName}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{wordCount.toLocaleString()} words extracted</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload size={24} className="mx-auto" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Drop a PDF, DOCX, or TXT file here, or click to browse</p>
            </div>
          )}
        </div>
      )}

      {/* Paste area */}
      {mode === 'paste' && (
        <textarea
          value={pasteText}
          onChange={e => setPasteText(e.target.value)}
          placeholder="Paste your course content here…"
          rows={10}
          className="w-full rounded-xl p-4 text-sm resize-none outline-none"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
        />
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Module details */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Module details</h2>

        <div className="space-y-1">
          <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Module name</label>
          <input
            value={moduleName}
            onChange={e => setModuleName(e.target.value)}
            placeholder="e.g. Day 20 — Personal System Design"
            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Tags</label>
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {tags.map(t => (
              <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                {t}
                <button onClick={() => setTags(tags.filter(x => x !== t))}><X size={10} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }}
              placeholder="Add tag, press Enter"
              className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
            <button onClick={addTag} className="px-3 py-2 rounded-lg" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Venture</label>
          <div className="flex gap-2">
            {VENTURES.map(v => (
              <button
                key={v.value}
                onClick={() => setVenture(v.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: venture === v.value ? 'var(--accent-bg)' : 'var(--bg-base)',
                  color: venture === v.value ? 'var(--accent)' : 'var(--text-muted)',
                  border: `1px solid ${venture === v.value ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Target platforms</label>
          <div className="flex gap-2">
            {PLATFORMS.map(p => (
              <button
                key={p.value}
                onClick={() => togglePlatform(p.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: platforms.includes(p.value) ? 'var(--accent-bg)' : 'var(--bg-base)',
                  color: platforms.includes(p.value) ? 'var(--accent)' : 'var(--text-muted)',
                  border: `1px solid ${platforms.includes(p.value) ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={!canProceed}
        className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity"
        style={{
          background: 'var(--accent-solid)',
          color: '#fff',
          opacity: canProceed ? 1 : 0.4,
          cursor: canProceed ? 'pointer' : 'not-allowed',
        }}
      >
        Next — Configure generation →
      </button>
    </div>
  )
}
