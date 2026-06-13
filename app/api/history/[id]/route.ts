import { NextRequest, NextResponse } from 'next/server'
import { getGeneration, deleteGeneration } from '@/lib/kv'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const generation = await getGeneration(id)
    if (!generation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(generation)
  } catch (err) {
    console.error('[history/:id GET]', err)
    return NextResponse.json({ error: 'Failed to load generation' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteGeneration(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[history/:id DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete generation' }, { status: 500 })
  }
}
