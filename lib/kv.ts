import { Redis } from '@upstash/redis'
import type { Generation, GenerationMeta, AppSettings } from '@/types'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

function metaFromGeneration(gen: Generation): GenerationMeta {
  return {
    id: gen.id,
    createdAt: gen.createdAt,
    module: gen.module,
    settings: gen.settings,
    wordCounts: {
      thoughtLeadership: gen.articles.thoughtLeadership.split(/\s+/).length,
      howTo: gen.articles.howTo.split(/\s+/).length,
      story: gen.articles.story.split(/\s+/).length,
    },
  }
}

export async function saveGeneration(gen: Generation): Promise<void> {
  const score = new Date(gen.createdAt).getTime()
  await Promise.all([
    redis.set(`gen:${gen.id}`, gen),
    redis.set(`gen:meta:${gen.id}`, metaFromGeneration(gen)),
    redis.zadd('gen:index', { score, member: gen.id }),
  ])
}

export async function getGeneration(id: string): Promise<Generation | null> {
  return redis.get<Generation>(`gen:${id}`)
}

export async function listGenerations(): Promise<GenerationMeta[]> {
  const ids = await redis.zrange('gen:index', 0, -1, { rev: true })
  if (!ids.length) return []
  const metas = await Promise.all(
    ids.map((id) => redis.get<GenerationMeta>(`gen:meta:${id}`))
  )
  return metas.filter((m): m is GenerationMeta => m !== null)
}

export async function deleteGeneration(id: string): Promise<void> {
  await Promise.all([
    redis.del(`gen:${id}`),
    redis.del(`gen:meta:${id}`),
    redis.zrem('gen:index', id),
  ])
}

export async function getSettings(): Promise<AppSettings | null> {
  return redis.get<AppSettings>('app:settings')
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await redis.set('app:settings', settings)
}
