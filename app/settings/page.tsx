'use client'
import { useState, useEffect } from 'react'
import { Eye, EyeOff, Check, X, Loader2 } from 'lucide-react'
import type { AppSettings, InfraSettings, Venture, Length, Audience } from '@/types'

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
  })
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [apiKeyDirty, setApiKeyDirty] = useState(false)
  const [appSaving, setAppSaving] = useState(false)
  const [appSaved, setAppSaved] = useState(false)
  const [appError, setAppError] = useState('')
  const [appLoading, setAppLoading] = useState(false)

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
