export async function parsePdf(buffer: Buffer): Promise<string> {
  // Dynamic import keeps pdf-parse out of the edge runtime bundle
  const pdfModule = await import('pdf-parse')
  const pdfParse = (pdfModule as unknown as { default: (b: Buffer) => Promise<{ text: string }> }).default ?? pdfModule
  const data = await (pdfParse as (b: Buffer) => Promise<{ text: string }>)(buffer)
  return data.text.trim()
}
