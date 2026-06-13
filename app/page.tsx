import Link from 'next/link'
import { Upload, Clock, Settings, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Content Engine</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          Upload course content → generate 3 article variants + a diagram → publish.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/upload" className="rounded-xl p-5 block" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <Upload size={20} style={{ color: 'var(--accent)' }} />
          <h2 className="mt-3 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>New Generation</h2>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Upload a PDF, DOCX, or paste text</p>
          <div className="mt-4 flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}>
            Start <ArrowRight size={12} />
          </div>
        </Link>

        <Link href="/history" className="rounded-xl p-5 block" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <Clock size={20} style={{ color: 'var(--accent)' }} />
          <h2 className="mt-3 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>History</h2>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Browse, remix, or delete past generations</p>
          <div className="mt-4 flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}>
            Browse <ArrowRight size={12} />
          </div>
        </Link>

        <Link href="/settings" className="rounded-xl p-5 block" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <Settings size={20} style={{ color: 'var(--accent)' }} />
          <h2 className="mt-3 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Settings</h2>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Add your Anthropic API key and set defaults</p>
          <div className="mt-4 flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}>
            Configure <ArrowRight size={12} />
          </div>
        </Link>
      </div>

      <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>How it works</h2>
        <ol className="text-sm space-y-2 list-decimal list-inside" style={{ color: 'var(--text-muted)' }}>
          <li>Go to <strong style={{ color: 'var(--text-primary)' }}>Settings</strong> and paste your Anthropic API key.</li>
          <li>Click <strong style={{ color: 'var(--text-primary)' }}>New Generation</strong> and upload your course content.</li>
          <li>Choose length, audience, and diagram style — then hit Generate.</li>
          <li>Review 3 article variants, copy the one you want, download the diagram PNG for LinkedIn.</li>
        </ol>
      </div>
    </div>
  )
}
