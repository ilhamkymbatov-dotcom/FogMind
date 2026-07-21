import mammoth from 'mammoth'
import * as pdfjs from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { DocumentSourceType } from '@fogmind/backend'

// pdfjs runs its parser in a worker; point it at the bundled worker asset.
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

export interface Extracted {
  text: string
  sourceType: DocumentSourceType
}

export class ExtractionError extends Error {}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase()
}

async function extractPdf(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const loadingTask = pdfjs.getDocument({ data: buffer })
  const pdf = await loadingTask.promise
  try {
    const pages: string[] = []
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const line = content.items.map((item) => ('str' in item ? item.str : '')).join(' ')
      pages.push(line)
    }
    return pages.join('\n\n')
  } finally {
    await loadingTask.destroy()
  }
}

async function extractDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}

/** The four supported file kinds, for the file picker and validation. */
export const ACCEPTED_EXTENSIONS = ['pdf', 'docx', 'md', 'txt'] as const

/**
 * Pulls clean plain text out of a picked file. Throws ExtractionError with a
 * human message on an unsupported type or a parse failure, so the caller can
 * surface it and mark the document failed.
 */
export async function extractFromFile(file: File): Promise<Extracted> {
  const ext = extensionOf(file.name)
  try {
    switch (ext) {
      case 'pdf':
        return { text: await extractPdf(file), sourceType: 'pdf' }
      case 'docx':
        return { text: await extractDocx(file), sourceType: 'docx' }
      case 'md':
        return { text: await file.text(), sourceType: 'markdown' }
      case 'txt':
      case 'text':
        return { text: await file.text(), sourceType: 'text' }
      default:
        // Message is a translation key; the display layer runs it through t().
        throw new ExtractionError('err.unsupportedFile')
    }
  } catch (err) {
    if (err instanceof ExtractionError) throw err
    throw new ExtractionError('err.readFile')
  }
}

export function extractedFromPastedText(text: string): Extracted {
  return { text, sourceType: 'text' }
}
