'use server';

import { searchDocuments, formatResultsAsContext, getCitations } from '@/lib/vector-search';
import { isEmbeddingsConfigured } from '@/lib/embeddings';

// AI Chat Server Action with RAG Integration
// Retrieves relevant context from uploaded documents before answering

export interface AIResponse {
  response: string;
  isDemo: boolean;
  citations?: string[];
  hasRAGContext?: boolean;
}

export async function getAIResponse(message: string): Promise<AIResponse> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const isRAGEnabled = isEmbeddingsConfigured();
  
  // Check if we're in demo mode (no API keys)
  const isDemoMode = !geminiKey && !openaiKey;

  if (isDemoMode) {
    return { 
      response: 'AI features are currently unavailable. Please configure GEMINI_API_KEY or OPENAI_API_KEY in your environment to enable the AI tutor.', 
      isDemo: true 
    };
  }

  // Try RAG retrieval if configured
  let ragContext = '';
  let citations: string[] = [];
  let hasRAGContext = false;

  if (isRAGEnabled) {
    try {
      const searchResults = await searchDocuments(message, {
        matchThreshold: 0.65,
        matchCount: 4,
      });

      if (searchResults.length > 0) {
        ragContext = formatResultsAsContext(searchResults);
        citations = getCitations(searchResults);
        hasRAGContext = true;
      }
    } catch (error) {
      console.error('RAG search error:', error);
      // Continue without RAG context
    }
  }

  // Build the AI prompt with optional RAG context
  const systemPrompt = `You are a helpful Master Plumber exam tutor. Answer questions accurately and concisely.
${ragContext ? `\n${ragContext}\n\nIMPORTANT: Base your answer on the context provided above. If the context contains relevant information, cite it in your response.` : ''}
If you're unsure about something, say so rather than making up information.`;

  const userPrompt = `Question: ${message}`;

  // Try Gemini first, then OpenAI
  try {
    if (geminiKey) {
      const response = await callGemini(geminiKey, systemPrompt, userPrompt);
      return { response, isDemo: false, citations: hasRAGContext ? citations : undefined, hasRAGContext };
    }
    
    if (openaiKey) {
      const response = await callOpenAI(openaiKey, systemPrompt, userPrompt);
      return { response, isDemo: false, citations: hasRAGContext ? citations : undefined, hasRAGContext };
    }
  } catch (error) {
    console.error('AI API error:', error);
  }

  return { 
    response: 'Sorry, I encountered an error. Please try again.', 
    isDemo: true 
  };
}

async function callGemini(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      })
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
}

async function callOpenAI(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
}
