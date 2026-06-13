import { NextRequest, NextResponse } from 'next/server'
import { parsePdf } from '@/lib/parsers/pdf'
import { parseDocx } from '@/lib/parsers/docx'
import { parseText } from '@/lib/parsers/text'
import type { ParseResult } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const name = file.name.toLowerCase()

    let rawContent: string

    if (name.endsWith('.pdf')) {
      rawContent = await parsePdf(buffer)
    } else if (name.endsWith('.docx')) {
      rawContent = await parseDocx(buffer)
    } else {
      rawContent = await parseText(buffer)
    }

    if (!rawContent.trim()) {
      return NextResponse.json({ error: 'File appears to be empty or could not be parsed' }, { status: 422 })
    }

    const wordCount = rawContent.trim().split(/\s+/).length
    const result: ParseResult = { rawContent, wordCount }
    return NextResponse.json(result)
  } catch (err) {
    console.error('[parse]', err)
    return NextResponse.json({ error: 'Failed to parse file' }, { status: 500 })
  }
}
