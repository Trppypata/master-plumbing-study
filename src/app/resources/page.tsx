import Link from 'next/link';

export default function ResourcesPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <Link href="/" className="text-xs flex items-center gap-1 mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Resources & Strategy</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Reference materials and exam day preparation guides.
        </p>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Reference Library */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Reference Library
          </h3>
          
          <div className="flex flex-col gap-3">
            <a href="#" className="card card-interactive flex items-center gap-4">
              <div className="p-2.5 rounded-lg" style={{ background: 'var(--color-cream)', border: '1px solid var(--color-sand)' }}>
                📄
              </div>
              <div className="flex-grow">
                <h4 className="text-sm font-semibold">Standard Plumbing Code Formulas</h4>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Essential math formulas for pipe sizing and offsets.
                </p>
              </div>
              <span style={{ color: 'var(--color-text-muted)' }}>↓</span>
            </a>

            <a href="#" className="card card-interactive flex items-center gap-4">
              <div className="p-2.5 rounded-lg" style={{ background: 'var(--color-cream)', border: '1px solid var(--color-sand)' }}>
                ⚠️
              </div>
              <div className="flex-grow">
                <h4 className="text-sm font-semibold">Common Exam Traps</h4>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  List of tricky wording often found in Master exams.
                </p>
              </div>
              <span style={{ color: 'var(--color-text-muted)' }}>→</span>
            </a>

            <a href="#" className="card card-interactive flex items-center gap-4">
              <div className="p-2.5 rounded-lg" style={{ background: 'var(--color-cream)', border: '1px solid var(--color-sand)' }}>
                📐
              </div>
              <div className="flex-grow">
                <h4 className="text-sm font-semibold">DFU Calculation Sheet</h4>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Worksheet for Drainage Fixture Unit values.
                </p>
              </div>
              <span style={{ color: 'var(--color-text-muted)' }}>↓</span>
            </a>
          </div>
          
          {/* Formulas Table */}
          <h3 className="text-xs font-semibold uppercase tracking-wider mt-8 mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Key Formulas
          </h3>
          
          <div className="card">
            <div className="flex flex-col gap-4">
              {[
                { name: 'Pipe Fall', formula: 'Fall = Length × Slope', example: '50ft × 1/4" = 12.5"' },
                { name: 'Pressure Head', formula: 'Head (ft) = PSI × 2.31', example: '40 PSI = 92.4 ft' },
                { name: 'DFU to GPM', formula: 'Refer to sizing table', example: '180 DFU → 4" drain' },
              ].map((f, i) => (
                <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--color-cream)', borderLeft: '3px solid var(--color-forest)' }}>
                  <div className="text-xs font-medium" style={{ color: 'var(--color-forest)' }}>{f.name}</div>
                  <div className="font-mono text-sm mt-1">{f.formula}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Ex: {f.example}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Strategy Sidebar */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Exam Strategy
          </h3>
          
          <div className="card mb-4" style={{ background: '#111827', color: 'white', border: 'none' }}>
            <div className="flex items-center gap-2 mb-3">
              <span style={{ color: 'var(--color-sand)' }}>⏱</span>
              <h4 className="text-sm font-semibold">Time Management</h4>
            </div>
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#9CA3AF' }}>
              You have approx 2-3 minutes per calculation question. Skip complex math initially and return after securing easy points.
            </p>
            <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: '#374151' }}>
              <div className="h-full w-2/3" style={{ background: 'var(--color-sand)' }}></div>
            </div>
          </div>

          <div className="card">
            <h4 className="text-sm font-semibold mb-3">Final Week Checklist</h4>
            <ul className="flex flex-col gap-2">
              {[
                { done: true, text: 'Review Gas Pipe Sizing' },
                { done: true, text: 'Memorize Vent Distance Table' },
                { done: false, text: 'Isometrics Practice' },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  <span style={{ color: item.done ? 'var(--color-forest)' : 'var(--color-sand)' }}>
                    {item.done ? '☑' : '☐'}
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
