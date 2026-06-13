import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Generation, GenerationMeta, AppSettings } from '@/types'

async function getCredentials(): Promise<{ url: string; key: string }> {
  // Read from HttpOnly cookies first (set via Settings → Supabase section)
  try {
    const { cookies } = await import('next/headers')
    const store = await cookies()
    const url = store.get('ce_supabase_url')?.value
    const key = store.get('ce_supabase_key')?.value
    if (url && key) return { url, key }
  } catch {
    // cookies() unavailable outside request context (e.g. build time)
  }

  // Fall back to environment variables
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'Supabase not configured. Go to Settings → Supabase and enter your project URL and service role key.'
    )
  }
  return { url, key }
}

async function getClient(): Promise<SupabaseClient> {
  const { url, key } = await getCredentials()
  return createClient(url, key, { auth: { persistSession: false } })
}

function toRow(gen: Generation) {
  return {
    id: gen.id,
    created_at: gen.createdAt,
    module: gen.module,
    settings: gen.settings,
    raw_content: gen.rawContent,
    articles: gen.articles,
    diagram: gen.diagram,
  }
}

function fromRow(row: Record<string, unknown>): Generation {
  return {
    id: row.id as string,
    createdAt: row.created_at as string,
    module: row.module as Generation['module'],
    settings: row.settings as Generation['settings'],
    rawContent: row.raw_content as string,
    articles: row.articles as Generation['articles'],
    diagram: row.diagram as Generation['diagram'],
  }
}

export async function saveGeneration(gen: Generation): Promise<void> {
  const db = await getClient()
  const { error } = await db.from('generations').upsert(toRow(gen))
  if (error) throw new Error(error.message)
}

export async function getGeneration(id: string): Promise<Generation | null> {
  const db = await getClient()
  const { data, error } = await db.from('generations').select('*').eq('id', id).single()
  if (error || !data) return null
  return fromRow(data)
}

export async function listGenerations(): Promise<GenerationMeta[]> {
  const db = await getClient()
  const { data, error } = await db
    .from('generations')
    .select('id, created_at, module, settings, articles')
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data.map(row => ({
    id: row.id as string,
    createdAt: row.created_at as string,
    module: row.module as Generation['module'],
    settings: row.settings as Generation['settings'],
    wordCounts: {
      thoughtLeadership: ((row.articles as Generation['articles'])?.thoughtLeadership ?? '').split(/\s+/).filter(Boolean).length,
      howTo: ((row.articles as Generation['articles'])?.howTo ?? '').split(/\s+/).filter(Boolean).length,
      story: ((row.articles as Generation['articles'])?.story ?? '').split(/\s+/).filter(Boolean).length,
    },
  }))
}

export async function deleteGeneration(id: string): Promise<void> {
  const db = await getClient()
  const { error } = await db.from('generations').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function getSettings(): Promise<AppSettings | null> {
  const db = await getClient()
  const { data } = await db.from('app_settings').select('data').single()
  if (!data?.data) return null
  return data.data as AppSettings
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getClient()
  const { error } = await db.from('app_settings').upsert({ id: true, data: settings })
  if (error) throw new Error(error.message)
}
