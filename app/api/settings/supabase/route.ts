import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { InfraSettings } from '@/types'

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 60 * 60 * 24 * 365, // 1 year
  path: '/',
}

export async function GET() {
  const store = await cookies()
  const url = store.get('ce_supabase_url')?.value ?? ''
  const key = store.get('ce_supabase_key')?.value ?? ''

  // Also check env vars as a source of truth
  const envUrl = process.env.SUPABASE_URL ?? ''
  const envKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

  const activeUrl = url || envUrl
  const activeKey = key || envKey
  const isConfigured = !!(activeUrl && activeKey)

  const result: InfraSettings = {
    supabaseUrl: activeUrl ? activeUrl.replace(/^(https?:\/\/)(.{8}).*/, '$1$2…') : '',
    supabaseServiceRoleKey: activeKey ? '••••••••' + activeKey.slice(-4) : '',
    isConfigured,
  }
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const body: { supabaseUrl?: string; supabaseServiceRoleKey?: string } = await req.json()

  const store = await cookies()

  // Test the connection before saving
  if (body.supabaseUrl && body.supabaseServiceRoleKey) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const client = createClient(body.supabaseUrl, body.supabaseServiceRoleKey, {
        auth: { persistSession: false },
      })
      // Lightweight test — just check the generations table exists
      const { error } = await client.from('generations').select('id').limit(1)
      if (error && error.code !== 'PGRST116') {
        return NextResponse.json(
          { error: `Connection failed: ${error.message}. Did you run the schema SQL?` },
          { status: 400 }
        )
      }
    } catch {
      return NextResponse.json({ error: 'Could not reach Supabase. Check the URL.' }, { status: 400 })
    }
  }

  const response = NextResponse.json({ success: true })

  if (body.supabaseUrl) {
    response.cookies.set('ce_supabase_url', body.supabaseUrl, COOKIE_OPTS)
    store.set('ce_supabase_url', body.supabaseUrl, COOKIE_OPTS)
  }
  if (body.supabaseServiceRoleKey && !body.supabaseServiceRoleKey.startsWith('••••')) {
    response.cookies.set('ce_supabase_key', body.supabaseServiceRoleKey, COOKIE_OPTS)
    store.set('ce_supabase_key', body.supabaseServiceRoleKey, COOKIE_OPTS)
  }

  return response
}
