import { NextResponse } from 'next/server'
import { listGenerations } from '@/lib/kv'

export async function GET() {
  try {
    const metas = await listGenerations()
    return NextResponse.json(metas)
  } catch (err) {
    console.error('[history GET]', err)
    return NextResponse.json({ error: 'Failed to load history' }, { status: 500 })
  }
}
