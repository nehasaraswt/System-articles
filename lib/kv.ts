import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Generation, GenerationMeta, AppSettings } from '@/types'

function getClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'Supabase not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local'
    )
  }
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
  const { error } = await getClient().from('generations').upsert(toRow(gen))
  if (error) throw new Error(error.message)
}

export async function getGeneration(id: string): Promise<Generation | null> {
  const { data, error } = await getClient()
    .from('generations')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return fromRow(data)
}

export async function listGenerations(): Promise<GenerationMeta[]> {
  const { data, error } = await getClient()
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
  const { error } = await getClient().from('generations').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function getSettings(): Promise<AppSettings | null> {
  const { data } = await getClient().from('app_settings').select('data').single()
  if (!data?.data) return null
  return data.data as AppSettings
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const { error } = await getClient()
    .from('app_settings')
    .upsert({ id: true, data: settings })
  if (error) throw new Error(error.message)
}
