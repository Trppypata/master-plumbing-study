'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { uploadDocument, getDocuments, deleteDocument, DocumentInfo } from '@/app/actions/upload-document';

interface DocumentUploaderProps {
  onUploadComplete?: () => void;
}

export default function DocumentUploader({ onUploadComplete }: DocumentUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setIsUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await uploadDocument(formData);
      
      if (result.success) {
        setUploadStatus({ type: 'success', message: result.message });
        onUploadComplete?.();
      } else {
        setUploadStatus({ type: 'error', message: result.message });
      }
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Upload failed. Please try again.' });
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${dragActive 
            ? 'border-forest bg-forest/5' 
            : 'border-gray-200 hover:border-forest/50 hover:bg-gray-50'
          }
          ${isUploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt"
          onChange={handleChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-forest animate-spin" />
            <p className="text-sm text-gray-600">Processing document...</p>
            <p className="text-xs text-gray-400">This may take a moment for large files</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-forest/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-forest" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Drop your document here or <span className="text-forest">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supports PDF and TXT files
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Status Message */}
      {uploadStatus && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          uploadStatus.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {uploadStatus.type === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          {uploadStatus.message}
        </div>
      )}
    </div>
  );
}

// Document List Component
export function DocumentList({ 
  documents, 
  onDelete 
}: { 
  documents: DocumentInfo[]; 
  onDelete?: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const success = await deleteDocument(id);
    if (success) {
      onDelete?.(id);
    }
    setDeleting(null);
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No documents uploaded yet. Upload a PDF or text file to get started.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg"
        >
          <div className="w-10 h-10 rounded-lg bg-forest/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-forest" />
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
            <p className="text-xs text-gray-400">
              {doc.status === 'ready' && `${doc.totalChunks} chunks indexed`}
              {doc.status === 'processing' && 'Processing...'}
              {doc.status === 'error' && (doc.errorMessage || 'Error')}
              {doc.status === 'pending' && 'Pending...'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {doc.status === 'ready' && (
              <span className="w-2 h-2 rounded-full bg-green-500" />
            )}
            {doc.status === 'processing' && (
              <Loader2 className="w-4 h-4 text-forest animate-spin" />
            )}
            {doc.status === 'error' && (
              <span className="w-2 h-2 rounded-full bg-red-500" />
            )}
            <button
              onClick={() => handleDelete(doc.id)}
              disabled={deleting === doc.id}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              {deleting === doc.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
