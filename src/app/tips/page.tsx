import Link from 'next/link';

export default function TipsPage() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-md mb-xl">
        <Link href="/" className="btn btn-secondary" style={{ padding: 'var(--space-sm)' }}>
          ←
        </Link>
        <div>
          <h1>Study Tips & Exam Strategy</h1>
          <p className="text-secondary">Maximize your preparation and pass with confidence</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Effective Study Techniques */}
        <div className="card">
          <h3 className="mb-lg">📚 How to Study Effectively</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <li className="flex gap-sm">
              <span>✓</span>
              <div>
                <strong>Use Active Recall</strong>
                <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                  Try to answer before flipping the card. This strengthens memory better than passive reading.
                </p>
              </div>
            </li>
            <li className="flex gap-sm">
              <span>✓</span>
              <div>
                <strong>Space Your Practice</strong>
                <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                  Study in multiple short sessions rather than one long cramming session.
                </p>
              </div>
            </li>
            <li className="flex gap-sm">
              <span>✓</span>
              <div>
                <strong>Focus on Weak Areas</strong>
                <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                  Cards marked &ldquo;Needs Review&rdquo; appear more often. Don&apos;t skip them!
                </p>
              </div>
            </li>
            <li className="flex gap-sm">
              <span>✓</span>
              <div>
                <strong>Understand, Don&apos;t Memorize</strong>
                <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                  Learn the &ldquo;why&rdquo; behind codes and formulas for better retention.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Test Day Strategy */}
        <div className="card">
          <h3 className="mb-lg">⏱️ Time Management During the Test</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <li className="flex gap-sm">
              <span>1.</span>
              <div>
                <strong>First Pass: Answer Easy Questions</strong>
                <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                  Go through all questions once, answering only the ones you know immediately.
                </p>
              </div>
            </li>
            <li className="flex gap-sm">
              <span>2.</span>
              <div>
                <strong>Second Pass: Work the Calculations</strong>
                <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                  Return to calculation-heavy questions. Take your time and show your work.
                </p>
              </div>
            </li>
            <li className="flex gap-sm">
              <span>3.</span>
              <div>
                <strong>Third Pass: Tackle Tough Ones</strong>
                <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                  Use remaining time for difficult questions. Eliminate wrong answers first.
                </p>
              </div>
            </li>
            <li className="flex gap-sm">
              <span>4.</span>
              <div>
                <strong>Never Leave Blanks</strong>
                <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                  There&apos;s no penalty for guessing. Always select an answer.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Common Traps */}
        <div className="card">
          <h3 className="mb-lg">⚠️ Common Traps & Mistakes</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <li style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              padding: 'var(--space-md)', 
              borderRadius: 'var(--radius-md)',
              borderLeft: '3px solid var(--color-danger)'
            }}>
              <strong>Watch for &ldquo;NOT&rdquo; and &ldquo;EXCEPT&rdquo;</strong>
              <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                Questions asking what is NOT allowed are designed to trick you. Read carefully!
              </p>
            </li>
            <li style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              padding: 'var(--space-md)', 
              borderRadius: 'var(--radius-md)',
              borderLeft: '3px solid var(--color-danger)'
            }}>
              <strong>Unit Conversion Errors</strong>
              <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                Always check if the question uses inches, feet, or millimeters. Convert before calculating.
              </p>
            </li>
            <li style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              padding: 'var(--space-md)', 
              borderRadius: 'var(--radius-md)',
              borderLeft: '3px solid var(--color-danger)'
            }}>
              <strong>Reading Code Tables Wrong</strong>
              <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                Make sure you&apos;re reading the correct row AND column. Double-check before answering.
              </p>
            </li>
          </ul>
        </div>

        {/* Calculation Tips */}
        <div className="card">
          <h3 className="mb-lg">🔢 Approaching Calculations</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <li className="flex gap-sm">
              <span>📐</span>
              <div>
                <strong>Write Out the Formula First</strong>
                <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                  This helps you identify what values you need and reduces errors.
                </p>
              </div>
            </li>
            <li className="flex gap-sm">
              <span>📐</span>
              <div>
                <strong>Show Your Work</strong>
                <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                  Even if you use a calculator, write each step. This helps catch mistakes.
                </p>
              </div>
            </li>
            <li className="flex gap-sm">
              <span>📐</span>
              <div>
                <strong>Check if Answer Makes Sense</strong>
                <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                  A 100-foot drain with 1/4&rdquo;/ft slope should fall ~25 inches. Sanity check!
                </p>
              </div>
            </li>
            <li className="flex gap-sm">
              <span>📐</span>
              <div>
                <strong>Memorize Key Constants</strong>
                <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                  7.48 gal/ft³, 1 PSI = 2.31 ft head, 1 GPM = 500 lbs/hr for water
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Final Week Checklist */}
      <div className="card mt-xl">
        <h3 className="mb-lg">📋 Final Week Revision Checklist</h3>
        <div className="grid-2">
          <div>
            <h4 className="mb-md text-accent">5-7 Days Before</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <li>☐ Review all &ldquo;Needs Review&rdquo; flashcards</li>
              <li>☐ Complete one full practice session per subject</li>
              <li>☐ Focus on your weakest subject</li>
              <li>☐ Review formula sheet daily</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-md text-accent">2-3 Days Before</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <li>☐ Light review only - no cramming</li>
              <li>☐ Review common mistakes list</li>
              <li>☐ Prepare materials (ID, calculator, pencils)</li>
              <li>☐ Get good sleep</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-md text-accent">Day Before</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <li>☐ Quick flip through key formulas</li>
              <li>☐ Confirm exam location and time</li>
              <li>☐ Relax and rest</li>
              <li>☐ Early bedtime</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-md text-accent">Exam Day</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <li>☐ Light breakfast, stay hydrated</li>
              <li>☐ Arrive 30 minutes early</li>
              <li>☐ Deep breaths, you&apos;ve prepared!</li>
              <li>☐ Trust your preparation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-2xl">
        <Link href="/study/plumbing-code" className="btn btn-primary btn-lg">
          Start Studying Now →
        </Link>
      </div>
    </div>
  );
}
