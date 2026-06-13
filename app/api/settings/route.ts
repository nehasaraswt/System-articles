import { NextRequest, NextResponse } from 'next/server'
import { getSettings, saveSettings } from '@/lib/kv'
import type { AppSettings } from '@/types'

export async function GET() {
  try {
    const settings = await getSettings()
    if (!settings) {
      const defaults: AppSettings = {
        anthropicApiKey: '',
        defaultVenture: 'systems',
        defaultLength: 'medium',
        defaultAudience: 'practitioners',
        writingVoice: '',
        diagramPreferences: '',
      }
      return NextResponse.json(defaults)
    }
    // Mask the API key in the response — return only the last 4 chars
    const masked: AppSettings = {
      ...settings,
      anthropicApiKey: settings.anthropicApiKey
        ? '••••••••' + settings.anthropicApiKey.slice(-4)
        : '',
    }
    return NextResponse.json(masked)
  } catch (err) {
    console.error('[settings GET]', err)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: Partial<AppSettings> = await req.json()

    const current = await getSettings()

    // If the incoming key looks masked (starts with ••), keep the stored one
    const isNewKey =
      body.anthropicApiKey && !body.anthropicApiKey.startsWith('••••')

    const updated: AppSettings = {
      anthropicApiKey: isNewKey
        ? body.anthropicApiKey!
        : current?.anthropicApiKey ?? '',
      defaultVenture: body.defaultVenture ?? current?.defaultVenture ?? 'systems',
      defaultLength: body.defaultLength ?? current?.defaultLength ?? 'medium',
      defaultAudience: body.defaultAudience ?? current?.defaultAudience ?? 'practitioners',
      writingVoice: body.writingVoice ?? current?.writingVoice ?? '',
      diagramPreferences: body.diagramPreferences ?? current?.diagramPreferences ?? '',
    }

    await saveSettings(updated)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[settings POST]', err)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
