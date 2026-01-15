/**
 * Text chunking utilities for RAG
 * Splits long documents into overlapping chunks for better embedding quality
 */

export interface TextChunk {
  content: string;
  index: number;
  pageNumber?: number;
}

const DEFAULT_CHUNK_SIZE = 500; // tokens (roughly 4 chars per token)
const DEFAULT_CHUNK_OVERLAP = 50; // tokens overlap between chunks
const CHARS_PER_TOKEN = 4; // approximate

/**
 * Split text into overlapping chunks
 */
export function chunkText(
  text: string,
  options: {
    chunkSize?: number;
    chunkOverlap?: number;
  } = {}
): TextChunk[] {
  const { 
    chunkSize = DEFAULT_CHUNK_SIZE, 
    chunkOverlap = DEFAULT_CHUNK_OVERLAP 
  } = options;

  const chunkChars = chunkSize * CHARS_PER_TOKEN;
  const overlapChars = chunkOverlap * CHARS_PER_TOKEN;
  const stepSize = chunkChars - overlapChars;

  // Clean and normalize text
  const cleanedText = text
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanedText.length <= chunkChars) {
    return [{ content: cleanedText, index: 0 }];
  }

  const chunks: TextChunk[] = [];
  let position = 0;
  let index = 0;

  while (position < cleanedText.length) {
    let endPosition = position + chunkChars;
    
    // Try to break at sentence boundary
    if (endPosition < cleanedText.length) {
      const searchStart = Math.max(position + chunkChars - 200, position);
      const searchEnd = Math.min(endPosition + 100, cleanedText.length);
      const searchText = cleanedText.slice(searchStart, searchEnd);
      
      // Find last sentence-ending punctuation
      const sentenceEnd = searchText.search(/[.!?]\s/);
      if (sentenceEnd !== -1) {
        endPosition = searchStart + sentenceEnd + 2;
      }
    }

    const chunk = cleanedText.slice(position, Math.min(endPosition, cleanedText.length)).trim();
    
    if (chunk.length > 0) {
      chunks.push({
        content: chunk,
        index: index++,
      });
    }

    position += stepSize;
  }

  return chunks;
}

/**
 * Split text with page markers (for PDFs)
 * Expects text with [PAGE X] markers
 */
export function chunkTextWithPages(text: string, options = {}): TextChunk[] {
  // Split by page markers
  const pagePattern = /\[PAGE\s+(\d+)\]/gi;
  const pages: { pageNumber: number; content: string }[] = [];
  
  let lastIndex = 0;
  let match;
  let currentPage = 1;

  while ((match = pagePattern.exec(text)) !== null) {
    if (lastIndex < match.index) {
      pages.push({
        pageNumber: currentPage,
        content: text.slice(lastIndex, match.index),
      });
    }
    currentPage = parseInt(match[1], 10);
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    pages.push({
      pageNumber: currentPage,
      content: text.slice(lastIndex),
    });
  }

  // Chunk each page
  const allChunks: TextChunk[] = [];
  let globalIndex = 0;

  for (const page of pages) {
    const pageChunks = chunkText(page.content, options);
    for (const chunk of pageChunks) {
      allChunks.push({
        content: chunk.content,
        index: globalIndex++,
        pageNumber: page.pageNumber,
      });
    }
  }

  return allChunks;
}

/**
 * Estimate token count for text
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}
