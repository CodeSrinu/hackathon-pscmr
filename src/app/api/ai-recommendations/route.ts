// src/app/api/ai-recommendations/route.ts
import { generatePersonaAndRoles } from '@/lib/aiService';
import { NextResponse } from 'next/server';

// POST /api/ai-recommendations
// Generate AI-powered career recommendations based on quiz answers
export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { quizAnswers } = body;

    // Validate input
    if (!quizAnswers) {
      return NextResponse.json(
        { error: 'Missing quizAnswers in request body' },
        { status: 400 }
      );
    }

    // Generate recommendations using our AI service directly
    const aiResponse = await generatePersonaAndRoles(quizAnswers);

    // Return the AI response directly (this matches what the frontend expects)
    return NextResponse.json(aiResponse);
  } catch (error) {
    console.error('Error in ai-recommendations API route:', error);
    
    // Return error response instead of fallback data
    return NextResponse.json(
      { 
        error: 'AI service unavailable',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}