import { supabase, isSupabaseConfigured } from './supabase';
import { generateEmbedding } from './embeddings';

export interface SearchResult {
  id: string;
  document_id: string;
  content: string;
  page_number: number | null;
  similarity: number;
  document_name: string;
}

/**
 * Search for similar document chunks based on a query
 */
export async function searchDocuments(
  query: string,
  options: {
    matchThreshold?: number;
    matchCount?: number;
  } = {}
): Promise<SearchResult[]> {
  const { matchThreshold = 0.7, matchCount = 5 } = options;

  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning empty results');
    return [];
  }

  try {
    // Generate embedding for the query
    const { embedding } = await generateEmbedding(query);

    // Call the similarity search function
    const { data, error } = await supabase.rpc('match_document_chunks', {
      query_embedding: embedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (error) {
      console.error('Vector search error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

/**
 * Format search results into context for AI
 */
export function formatResultsAsContext(results: SearchResult[]): string {
  if (results.length === 0) {
    return '';
  }

  const contextParts = results.map((result, index) => {
    const pageInfo = result.page_number ? ` (Page ${result.page_number})` : '';
    return `[Source ${index + 1}: ${result.document_name}${pageInfo}]\n${result.content}`;
  });

  return `Relevant context from uploaded documents:\n\n${contextParts.join('\n\n---\n\n')}`;
}

/**
 * Get citation info for sources
 */
export function getCitations(results: SearchResult[]): string[] {
  return results.map((result) => {
    const pageInfo = result.page_number ? `, Page ${result.page_number}` : '';
    return `${result.document_name}${pageInfo}`;
  });
}
