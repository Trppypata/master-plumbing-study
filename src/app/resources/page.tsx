'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DocumentUploader, { DocumentList } from '@/components/DocumentUploader';
import { getDocuments, DocumentInfo } from '@/app/actions/upload-document';

export default function ResourcesPage() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDocuments = async () => {
    const docs = await getDocuments();
    setDocuments(docs);
    setLoading(false);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUploadComplete = () => {
    loadDocuments();
  };

  const handleDelete = (id: string) => {
    setDocuments(docs => docs.filter(d => d.id !== id));
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <Link href="/" className="text-xs flex items-center gap-1 mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Resources & Strategy</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Upload study materials and reference guides to power your AI tutor.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Knowledge Base - Main Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Section */}
          <div className="card">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              📚 Knowledge Base
              <span className="text-xs font-normal px-2 py-0.5 bg-forest/10 text-forest rounded-full">
                RAG-Powered
              </span>
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Upload plumbing code books, exam guides, and regulations. The AI Tutor will use these to answer your questions with accurate citations.
            </p>
            <DocumentUploader onUploadComplete={handleUploadComplete} />
          </div>

          {/* Uploaded Documents */}
          <div className="card">
            <h3 className="text-sm font-semibold mb-4">
              Uploaded Documents
              {documents.length > 0 && (
                <span className="text-xs font-normal text-gray-400 ml-2">
                  ({documents.filter(d => d.status === 'ready').length} ready)
                </span>
              )}
            </h3>
            {loading ? (
              <div className="text-center py-4 text-gray-400 text-sm">Loading...</div>
            ) : (
              <DocumentList documents={documents} onDelete={handleDelete} />
            )}
          </div>

          {/* Key Formulas */}
          <div className="card">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-muted)' }}>
              Key Formulas
            </h3>
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
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            Exam Strategy
          </h3>
          
          <div className="card" style={{ background: '#111827', color: 'white', border: 'none' }}>
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
            <h4 className="text-sm font-semibold mb-3">How RAG Works</h4>
            <ol className="text-xs text-gray-600 space-y-2">
              <li className="flex gap-2">
                <span className="text-forest font-bold">1.</span>
                Upload your study materials (PDFs, text files)
              </li>
              <li className="flex gap-2">
                <span className="text-forest font-bold">2.</span>
                Documents are chunked and converted to embeddings
              </li>
              <li className="flex gap-2">
                <span className="text-forest font-bold">3.</span>
                When you ask the AI Tutor a question, it searches your documents
              </li>
              <li className="flex gap-2">
                <span className="text-forest font-bold">4.</span>
                Relevant passages are included in the AI's context
              </li>
              <li className="flex gap-2">
                <span className="text-forest font-bold">5.</span>
                You get accurate answers with source citations!
              </li>
            </ol>
          </div>

          <div className="card">
            <h4 className="text-sm font-semibold mb-3">Suggested Uploads</h4>
            <ul className="text-xs text-gray-500 space-y-1.5">
              <li>✓ Plumbing Code Book</li>
              <li>✓ Past Exam Papers</li>
              <li>✓ DFU Tables</li>
              <li>✓ Venting Charts</li>
              <li>✓ Case Study Examples</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
