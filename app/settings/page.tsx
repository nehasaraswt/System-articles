'use client'
import { useState, useEffect } from 'react'
import { Eye, EyeOff, Check, X, Loader2, Plus, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import type { AppSettings, InfraSettings, Venture, Length, Audience, VoiceExample, VoiceRegister } from '@/types'

const VENTURES: { value: Venture; label: string }[] = [
  { value: 'systems', label: 'Systems Foresight' },
  { value: 'ano', label: 'Ano' },
  { value: 'nit', label: 'Nit' },
]
const LENGTHS: { value: Length; label: string }[] = [
  { value: 'short', label: 'Short (~300w)' },
  { value: 'medium', label: 'Medium (~800w)' },
  { value: 'long', label: 'Long (~1500w)' },
]
const AUDIENCES: { value: Audience; label: string }[] = [
  { value: 'executives', label: 'Executives' },
  { value: 'practitioners', label: 'Practitioners' },
  { value: 'general', label: 'General Public' },
]

function Select<T extends string>({
  value, onChange, options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as T)}
      className="rounded-lg px-3 py-2 text-sm outline-none w-full"
      style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full"
      style={{ background: ok ? '#16a34a22' : '#dc262622', color: ok ? '#4ade80' : '#f87171' }}>
      {ok ? <Check size={11} /> : <X size={11} />}
      {label}
    </span>
  )
}

function MaskedInput({
  value, onChange, placeholder, monospace = false
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  monospace?: boolean
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex gap-2">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`flex-1 rounded-lg px-3 py-2 text-sm outline-none ${monospace ? 'font-mono' : ''}`}
        style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
      />
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="px-3 py-2 rounded-lg shrink-0"
        style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  )
}

export default function SettingsPage() {
  // ── Supabase infra ──
  const [infra, setInfra] = useState<InfraSettings>({ supabaseUrl: '', supabaseServiceRoleKey: '', isConfigured: false })
  const [infraUrl, setInfraUrl] = useState('')
  const [infraKey, setInfraKey] = useState('')
  const [infraSaving, setInfraSaving] = useState(false)
  const [infraStatus, setInfraStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [infraError, setInfraError] = useState('')

  // ── App settings ──
  const [appSettings, setAppSettings] = useState<AppSettings>({
    anthropicApiKey: '',
    defaultVenture: 'systems',
    defaultLength: 'medium',
    defaultAudience: 'practitioners',
    writingVoice: '',
    diagramPreferences: '',
    voiceExamples: [],
  })
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [apiKeyDirty, setApiKeyDirty] = useState(false)
  const [appSaving, setAppSaving] = useState(false)
  const [appSaved, setAppSaved] = useState(false)
  const [appError, setAppError] = useState('')
  const [appLoading, setAppLoading] = useState(false)

  // ── Voice Library ──
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newExample, setNewExample] = useState<{ title: string; register: VoiceRegister; content: string }>({
    title: '', register: 'essay', content: '',
  })
  const [librarySaving, setLibrarySaving] = useState(false)

  const saveVoiceExamples = async (examples: VoiceExample[]) => {
    setLibrarySaving(true)
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...appSettings, voiceExamples: examples }),
      })
      setAppSettings(s => ({ ...s, voiceExamples: examples }))
    } finally {
      setLibrarySaving(false)
    }
  }

  const addExample = async () => {
    if (!newExample.title.trim() || !newExample.content.trim()) return
    const example: VoiceExample = {
      id: crypto.randomUUID(),
      title: newExample.title.trim(),
      register: newExample.register,
      content: newExample.content.trim(),
      createdAt: new Date().toISOString(),
    }
    const updated = [...(appSettings.voiceExamples ?? []), example]
    await saveVoiceExamples(updated)
    setNewExample({ title: '', register: 'essay', content: '' })
    setShowAddForm(false)
  }

  const deleteExample = async (id: string) => {
    const updated = (appSettings.voiceExamples ?? []).filter(e => e.id !== id)
    await saveVoiceExamples(updated)
  }

  // Load infra status
  useEffect(() => {
    fetch('/api/settings/supabase')
      .then(r => r.json())
      .then((data: InfraSettings) => {
        setInfra(data)
        if (data.supabaseUrl) setInfraUrl(data.supabaseUrl)
        if (data.supabaseServiceRoleKey) setInfraKey(data.supabaseServiceRoleKey)
        if (data.isConfigured) setInfraStatus('ok')
      })
      .catch(() => {})
  }, [])

  // Load app settings (only if Supabase is configured)
  useEffect(() => {
    if (!infra.isConfigured) return
    setAppLoading(true)
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        setAppSettings(data)
        setApiKeyInput(data.anthropicApiKey ?? '')
      })
      .catch(() => {})
      .finally(() => setAppLoading(false))
  }, [infra.isConfigured])

  const saveSupabase = async () => {
    setInfraSaving(true)
    setInfraError('')
    setInfraStatus('idle')
    try {
      const res = await fetch('/api/settings/supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supabaseUrl: infraUrl.trim(),
          supabaseServiceRoleKey: infraKey.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setInfraStatus('ok')
      setInfra(prev => ({ ...prev, isConfigured: true }))
    } catch (e) {
      setInfraStatus('error')
      setInfraError(e instanceof Error ? e.message : 'Connection failed')
    } finally {
      setInfraSaving(false)
    }
  }

  const saveAppSettings = async () => {
    setAppSaving(true)
    setAppError('')
    try {
      const payload = {
        ...appSettings,
        ...(apiKeyDirty ? { anthropicApiKey: apiKeyInput } : {}),
      }
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Save failed')
      setAppSaved(true)
      setApiKeyDirty(false)
      setTimeout(() => setAppSaved(false), 2500)
    } catch {
      setAppError('Failed to save settings')
    } finally {
      setAppSaving(false)
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Configure your database and API keys.</p>
      </div>

      {/* ── Supabase section ── */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Supabase Database</h2>
          {infraStatus === 'ok' && <StatusBadge ok={true} label="Connected" />}
          {infraStatus === 'error' && <StatusBadge ok={false} label="Failed" />}
        </div>

        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          All generations and settings are stored in your Supabase project.{' '}
          <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
            Create a free project →
          </a>
        </p>

        <div className="rounded-lg p-3 text-xs space-y-1" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Before connecting, run this SQL in your Supabase SQL Editor:</p>
          <p style={{ color: 'var(--text-muted)' }}>Project → SQL Editor → New query → paste <code style={{ color: 'var(--accent)' }}>supabase/schema.sql</code> from the repo → Run</p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Project URL <span style={{ color: 'var(--text-muted)' }}>(Settings → API → Project URL)</span>
            </label>
            <input
              value={infraUrl}
              onChange={e => setInfraUrl(e.target.value)}
              placeholder="https://xxxxxxxxxxxx.supabase.co"
              className="w-full rounded-lg px-3 py-2 text-sm outline-none font-mono"
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Service Role Key <span style={{ color: 'var(--text-muted)' }}>(Settings → API → service_role)</span>
            </label>
            <MaskedInput
              value={infraKey}
              onChange={setInfraKey}
              placeholder="eyJhbGciOi…"
              monospace
            />
          </div>
        </div>

        {infraError && <p className="text-xs text-red-400">{infraError}</p>}

        <button
          onClick={saveSupabase}
          disabled={infraSaving || !infraUrl.trim() || !infraKey.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity"
          style={{
            background: infraStatus === 'ok' ? '#16a34a' : 'var(--accent-solid)',
            color: '#fff',
            opacity: (infraSaving || !infraUrl.trim() || !infraKey.trim()) ? 0.5 : 1,
          }}
        >
          {infraSaving ? <><Loader2 size={14} className="animate-spin" /> Testing connection…</> :
           infraStatus === 'ok' ? <><Check size={14} /> Connected</> :
           'Connect Supabase'}
        </button>
      </div>

      {/* ── App settings (only shown when Supabase is connected) ── */}
      {infra.isConfigured && (
        <>
          <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Anthropic API Key</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Used for all article and diagram generation.{' '}
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
                Get one →
              </a>
            </p>
            {appLoading ? (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading…</p>
            ) : (
              <MaskedInput
                value={apiKeyInput}
                onChange={v => { setApiKeyInput(v); setApiKeyDirty(true) }}
                placeholder="sk-ant-…"
                monospace
              />
            )}
          </div>

          <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Writing Voice</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Describe your voice, style, and tone in plain English. This is injected into every article generation as a standing instruction — the more specific, the better.
            </p>
            <textarea
              value={appSettings.writingVoice ?? ''}
              onChange={e => setAppSettings(s => ({ ...s, writingVoice: e.target.value }))}
              rows={5}
              placeholder={`e.g. I write in first person with a systems thinking lens. My tone is warm but intellectually rigorous — like a conversation between equals. I use short paragraphs (2-3 sentences max), occasional questions to the reader, and concrete metaphors drawn from nature or architecture. I avoid corporate jargon and never use bullet points in narrative writing. I'm the narrator and designer of a 21-day course on Systems Foresight.`}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none leading-relaxed"
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* ── Voice Library ── */}
          <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen size={14} style={{ color: 'var(--accent)' }} />
                <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Voice Library</h2>
                {(appSettings.voiceExamples?.length ?? 0) > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                    {appSettings.voiceExamples!.length} {appSettings.voiceExamples!.length === 1 ? 'example' : 'examples'}
                  </span>
                )}
              </div>
              {librarySaving && <Loader2 size={13} className="animate-spin" style={{ color: 'var(--text-muted)' }} />}
            </div>

            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Paste real pieces you&apos;ve written, tagged by register. Claude uses the matching example as its primary calibration signal — it imitates demonstrated style far more precisely than it follows descriptions alone.
            </p>

            <div className="text-xs rounded-lg p-3 space-y-1" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--text-primary)' }} className="font-medium">Register → Article type mapping</p>
              <p style={{ color: 'var(--text-muted)' }}><span style={{ color: 'var(--accent)' }}>Provocation</span> → Thought Leadership &nbsp;·&nbsp; <span style={{ color: 'var(--accent)' }}>Practical</span> → How-To &nbsp;·&nbsp; <span style={{ color: 'var(--accent)' }}>Essay</span> → Personal Story</p>
            </div>

            {/* Existing examples */}
            {(appSettings.voiceExamples ?? []).length > 0 && (
              <div className="space-y-2">
                {(appSettings.voiceExamples ?? []).map(ex => (
                  <div key={ex.id} className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                    <div
                      className="flex items-center justify-between px-3 py-2.5 cursor-pointer"
                      style={{ background: 'var(--bg-base)' }}
                      onClick={() => setExpandedId(expandedId === ex.id ? null : ex.id)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium"
                          style={{
                            background: ex.register === 'essay' ? '#7c3aed22' : ex.register === 'provocation' ? '#0891b222' : '#15803d22',
                            color: ex.register === 'essay' ? '#a78bfa' : ex.register === 'provocation' ? '#38bdf8' : '#4ade80',
                          }}>
                          {ex.register}
                        </span>
                        <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{ex.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <button
                          onClick={e => { e.stopPropagation(); deleteExample(ex.id) }}
                          className="p-1 rounded hover:opacity-70"
                          style={{ color: 'var(--text-muted)' }}
                          title="Delete"
                        >
                          <X size={13} />
                        </button>
                        {expandedId === ex.id ? <ChevronUp size={13} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />}
                      </div>
                    </div>
                    {expandedId === ex.id && (
                      <div className="px-3 pb-3 pt-2" style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border)' }}>
                        <p className="text-xs whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-muted)' }}>{ex.content}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add form */}
            {showAddForm ? (
              <div className="space-y-3 rounded-lg p-4" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
                <div className="space-y-1">
                  <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Title</label>
                  <input
                    value={newExample.title}
                    onChange={e => setNewExample(s => ({ ...s, title: e.target.value }))}
                    placeholder="e.g. On forgetting how to begin"
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Register</label>
                  <div className="flex gap-2">
                    {(['essay', 'provocation', 'practical'] as VoiceRegister[]).map(r => (
                      <button
                        key={r}
                        onClick={() => setNewExample(s => ({ ...s, register: r }))}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: newExample.register === r ? 'var(--accent-solid)' : 'var(--bg-card)',
                          color: newExample.register === r ? '#fff' : 'var(--text-muted)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Your writing &nbsp;<span style={{ color: 'var(--text-muted)' }}>(300–800 words works best)</span>
                  </label>
                  <textarea
                    value={newExample.content}
                    onChange={e => setNewExample(s => ({ ...s, content: e.target.value }))}
                    rows={10}
                    placeholder="Paste a real piece you've written in this register…"
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none leading-relaxed"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {newExample.content.split(/\s+/).filter(Boolean).length} words
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={addExample}
                    disabled={!newExample.title.trim() || !newExample.content.trim() || librarySaving}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
                    style={{
                      background: 'var(--accent-solid)', color: '#fff',
                      opacity: (!newExample.title.trim() || !newExample.content.trim() || librarySaving) ? 0.5 : 1,
                    }}
                  >
                    {librarySaving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : <><Check size={13} /> Add to library</>}
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setNewExample({ title: '', register: 'essay', content: '' }) }}
                    className="px-4 py-2 rounded-lg text-sm"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm w-full justify-center"
                style={{ background: 'var(--bg-base)', border: '1px dashed var(--border)', color: 'var(--text-muted)' }}
              >
                <Plus size={14} /> Add writing example
              </button>
            )}
          </div>

          <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Diagram Preferences</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Tell the diagram generator how you want visuals to look and feel. Injected into every diagram generation.
            </p>
            <textarea
              value={appSettings.diagramPreferences ?? ''}
              onChange={e => setAppSettings(s => ({ ...s, diagramPreferences: e.target.value }))}
              rows={4}
              placeholder={`e.g. Keep diagrams sparse and meditative — never crowded. Use earth tones (ochre, terracotta, slate) as accent colours instead of the defaults. Labels should be poetic and evocative, not technical. Show emergence and flow rather than hierarchy. Arrows should feel like energy, not commands.`}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none leading-relaxed"
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Generation Defaults</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Pre-fills the Configure screen on every new generation.</p>

            <div className="space-y-1">
              <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Default venture</label>
              <Select<Venture> value={appSettings.defaultVenture} onChange={v => setAppSettings(s => ({ ...s, defaultVenture: v }))} options={VENTURES} />
            </div>
            <div className="space-y-1">
              <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Default article length</label>
              <Select<Length> value={appSettings.defaultLength} onChange={v => setAppSettings(s => ({ ...s, defaultLength: v }))} options={LENGTHS} />
            </div>
            <div className="space-y-1">
              <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Default audience</label>
              <Select<Audience> value={appSettings.defaultAudience} onChange={v => setAppSettings(s => ({ ...s, defaultAudience: v }))} options={AUDIENCES} />
            </div>
          </div>

          {appError && <p className="text-sm text-red-400">{appError}</p>}

          <button
            onClick={saveAppSettings}
            disabled={appSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: 'var(--accent-solid)', color: '#fff', opacity: appSaving ? 0.6 : 1 }}
          >
            {appSaved ? <><Check size={14} /> Saved</> : appSaving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : 'Save settings'}
          </button>
        </>
      )}
    </div>
  )
}
