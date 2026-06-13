'use client'
import { useState, useEffect } from 'react'
import { Eye, EyeOff, Check } from 'lucide-react'
import type { AppSettings, Venture, Length, Audience } from '@/types'

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
      className="rounded-lg px-3 py-2 text-sm outline-none"
      style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    anthropicApiKey: '',
    defaultVenture: 'systems',
    defaultLength: 'medium',
    defaultAudience: 'practitioners',
  })
  const [showKey, setShowKey] = useState(false)
  const [keyDirty, setKeyDirty] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => setSettings(data))
      .catch(() => setError('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const payload = { ...settings }
      // Only send key if user actually typed a new one
      if (!keyDirty) delete (payload as Partial<AppSettings>).anthropicApiKey
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaved(true)
      setKeyDirty(false)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</div>

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Your API key and generation defaults.</p>
      </div>

      <div className="rounded-xl p-5 space-y-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>API Key</h2>

        <div className="space-y-1">
          <label className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Anthropic API Key — stored securely, used for all generations.
            {' '}<a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>Get one →</a>
          </label>
          <div className="flex gap-2">
            <input
              type={showKey ? 'text' : 'password'}
              value={settings.anthropicApiKey}
              onChange={e => { setSettings(s => ({ ...s, anthropicApiKey: e.target.value })); setKeyDirty(true) }}
              placeholder="sk-ant-…"
              className="flex-1 rounded-lg px-3 py-2 text-sm outline-none font-mono"
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
            <button
              onClick={() => setShowKey(v => !v)}
              className="px-3 py-2 rounded-lg"
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Generation Defaults</h2>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>These pre-fill the Configure screen so you don't re-select every time.</p>

        <div className="space-y-1">
          <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Default venture</label>
          <Select<Venture>
            value={settings.defaultVenture}
            onChange={v => setSettings(s => ({ ...s, defaultVenture: v }))}
            options={VENTURES}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Default article length</label>
          <Select<Length>
            value={settings.defaultLength}
            onChange={v => setSettings(s => ({ ...s, defaultLength: v }))}
            options={LENGTHS}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Default audience</label>
          <Select<Audience>
            value={settings.defaultAudience}
            onChange={v => setSettings(s => ({ ...s, defaultAudience: v }))}
            options={AUDIENCES}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-opacity"
        style={{ background: 'var(--accent-solid)', color: '#fff', opacity: saving ? 0.6 : 1 }}
      >
        {saved ? <><Check size={14} /> Saved</> : saving ? 'Saving…' : 'Save settings'}
      </button>
    </div>
  )
}
