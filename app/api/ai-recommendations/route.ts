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
    
    // Return a fallback response in case of error
    return NextResponse.json(
      {
        personaName: "The Adaptive Explorer",
        personaSummary: "You're curious and flexible, with a natural ability to adapt to different environments. You thrive when you can explore various options before committing to a path.",
        recommendedRoles: [
          {
            role: "Full Stack Developer",
            reason: "With your unique combination of skills and talents, you are positioned for success in a role that combines both technical and creative problem-solving."
          },
          {
            role: "Digital Marketing Entrepreneur",
            reason: "This field is ideal for individuals with your combination of curiosity and adaptability, offering dynamic opportunities for creative freedom and remote work."
          },
          {
            role: "Civil Services (IAS/IPS)",
            reason: "This career path aligns with your unique talents and offers opportunities to leverage your decision-making skills for creating systemic change."
          },
          {
            role: "Freelance UX Consultant",
            reason: "The skills you possess are highly valuable in working independently on user experience projects with various clients."
          },
          {
            role: "EdTech Product Manager",
            reason: "With your unique combination of skills and talents, you are positioned for success in managing products that combine technology with learning."
          }
        ]
      },
      { status: 200 }
    );
  }
}