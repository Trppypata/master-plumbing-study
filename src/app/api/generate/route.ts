import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
// @ts-ignore
import pdf from 'pdf-parse';

import { supabase } from '@/lib/supabase';

// ... existing imports ...

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const text = formData.get('text') as string;
    const file = formData.get('file') as File;
    const documentId = formData.get('documentId') as string;

    if (!text && !file && !documentId) {
      return NextResponse.json(
        { error: 'No content provided' },
        { status: 400 }
      );
    }

    let contentToProcess = text;

    // Handle RAG Document
    if (documentId) {
      // Fetch document metadata
      const { data: doc, error: docError } = await supabase
        .from('documents')
        .select('file_path, file_type')
        .eq('id', documentId)
        .single();

      if (docError || !doc) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }

      // Download file
      const { data: fileData, error: fileError } = await supabase
        .storage
        .from('documents')
        .download(doc.file_path);

      if (fileError || !fileData) {
        return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
      }

      const arrayBuffer = await fileData.arrayBuffer();
      
      if (doc.file_type === 'pdf') {
        const buffer = Buffer.from(arrayBuffer);
        const data = await pdf(buffer);
        contentToProcess = data.text;
      } else {
        contentToProcess = await fileData.text();
      }
    } 
    // Handle File Upload
    else if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const data = await pdf(buffer);
      contentToProcess = data.text;
    }

    if (!contentToProcess || contentToProcess.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from file' },
        { status: 400 }
      );
    }

    // Initialize OpenAI
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    // Truncate content if too long (rough estimation)
    const MAX_CHARS = 12000;
    const truncatedContent = contentToProcess.slice(0, MAX_CHARS);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful study assistant. Extract key concepts from the provided text and create flashcards.
          Return ONLY a raw JSON array of objects with 'front', 'back', and 'explanation' fields. 
          Do not include markdown formatting (like \`\`\`json).
          Example: [{"front": "Question?", "back": "Answer", "explanation": "Context"}]`
        },
        {
          role: "user",
          content: `Create 5-10 high-quality flashcards from this text:
          
          ${truncatedContent}`
        }
      ],
      temperature: 0.7,
    });

    const responseContent = completion.choices[0].message.content;
    
    if (!responseContent) {
      throw new Error('No response from AI');
    }

    // Clean up response if it contains markdown code blocks
    const cleanJson = responseContent.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let flashcards;
    try {
      flashcards = JSON.parse(cleanJson);
    } catch (e) {
      console.error('Failed to parse JSON:', cleanJson);
      return NextResponse.json(
        { error: 'Failed to generate valid flashcards' },
        { status: 500 }
      );
    }

    return NextResponse.json({ flashcards });

  } catch (error) {
    console.error('Error in generate route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
