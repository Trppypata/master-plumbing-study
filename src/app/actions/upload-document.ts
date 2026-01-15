'use server';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { generateEmbeddings, isEmbeddingsConfigured } from '@/lib/embeddings';
import { chunkText, estimateTokens } from '@/lib/text-chunking';

export interface UploadResult {
  success: boolean;
  documentId?: string;
  message: string;
  chunksCreated?: number;
}

export interface DocumentInfo {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'ready' | 'error';
  totalChunks: number;
  createdAt: string;
  errorMessage?: string;
}

/**
 * Upload and process a document
 */
export async function uploadDocument(
  formData: FormData
): Promise<UploadResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase is not configured' };
  }

  if (!isEmbeddingsConfigured()) {
    return { success: false, message: 'OpenAI API key is not configured. Add OPENAI_API_KEY to .env.local' };
  }

  const file = formData.get('file') as File;
  if (!file) {
    return { success: false, message: 'No file provided' };
  }

  const fileName = file.name;
  const fileType = file.type;

  // Only accept PDFs and text files for now
  if (!['application/pdf', 'text/plain'].includes(fileType)) {
    return { success: false, message: 'Only PDF and text files are supported' };
  }

  try {
    // 1. Upload file to Supabase Storage
    const filePath = `documents/${Date.now()}-${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return { success: false, message: `Upload failed: ${uploadError.message}` };
    }

    // 2. Create document record
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert({
        name: fileName,
        file_path: filePath,
        file_type: fileType === 'application/pdf' ? 'pdf' : 'text',
        file_size: file.size,
        status: 'processing',
      })
      .select()
      .single();

    if (docError || !docData) {
      return { success: false, message: `Failed to create document record: ${docError?.message}` };
    }

    const documentId = docData.id;

    // 3. Extract text content
    let textContent: string;
    
    if (fileType === 'text/plain') {
      textContent = await file.text();
    } else {
      // For PDF, we need to extract text server-side
      // This is a simplified version - in production, use pdf-parse
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      try {
        // Use require for pdf-parse as it doesn't have proper ESM exports
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(buffer);
        textContent = pdfData.text;
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        await supabase
          .from('documents')
          .update({ status: 'error', error_message: 'Failed to parse PDF' })
          .eq('id', documentId);
        return { success: false, message: 'Failed to parse PDF file' };
      }
    }

    // 4. Chunk the text
    const chunks = chunkText(textContent, { chunkSize: 500, chunkOverlap: 50 });
    
    if (chunks.length === 0) {
      await supabase
        .from('documents')
        .update({ status: 'error', error_message: 'No text content found' })
        .eq('id', documentId);
      return { success: false, message: 'No text content found in document' };
    }

    // 5. Generate embeddings for all chunks (in batches)
    const BATCH_SIZE = 20;
    const allChunkData: { chunk_index: number; content: string; embedding: number[] }[] = [];

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const texts = batch.map(c => c.content);
      
      const embeddings = await generateEmbeddings(texts);
      
      for (let j = 0; j < batch.length; j++) {
        allChunkData.push({
          chunk_index: batch[j].index,
          content: batch[j].content,
          embedding: embeddings[j].embedding,
        });
      }
    }

    // 6. Insert chunks with embeddings
    const chunkInserts = allChunkData.map(c => ({
      document_id: documentId,
      chunk_index: c.chunk_index,
      content: c.content,
      embedding: c.embedding,
    }));

    const { error: chunkError } = await supabase
      .from('document_chunks')
      .insert(chunkInserts);

    if (chunkError) {
      console.error('Chunk insert error:', chunkError);
      await supabase
        .from('documents')
        .update({ status: 'error', error_message: 'Failed to save chunks' })
        .eq('id', documentId);
      return { success: false, message: 'Failed to save document chunks' };
    }

    // 7. Update document status
    await supabase
      .from('documents')
      .update({ 
        status: 'ready', 
        total_chunks: chunks.length,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId);

    return {
      success: true,
      documentId,
      message: `Successfully processed "${fileName}" with ${chunks.length} chunks`,
      chunksCreated: chunks.length,
    };

  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}

/**
 * Get all uploaded documents
 */
export async function getDocuments(): Promise<DocumentInfo[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents:', error);
    return [];
  }

  return data.map(doc => ({
    id: doc.id,
    name: doc.name,
    status: doc.status,
    totalChunks: doc.total_chunks,
    createdAt: doc.created_at,
    errorMessage: doc.error_message,
  }));
}

/**
 * Delete a document and its chunks
 */
export async function deleteDocument(documentId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  // Get file path first
  const { data: doc } = await supabase
    .from('documents')
    .select('file_path')
    .eq('id', documentId)
    .single();

  if (doc?.file_path) {
    // Delete from storage
    await supabase.storage.from('documents').remove([doc.file_path]);
  }

  // Delete document (cascades to chunks)
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId);

  return !error;
}
