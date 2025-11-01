// src/lib/recommendationEngine.ts
import { DomainMatch, Persona } from './userData';
import { generatePersonaAndRoles } from './aiService';
import { AIRecommendationResponse } from '@/types/ai.types';

// Version information
export const RECOMMENDATION_ENGINE_VERSION = "2.0.0";

// Map AI persona to our existing persona structure
function mapAIPersonaToPersona(aiResponse: AIRecommendationResponse): Persona & { matchScore?: number; confidence?: string } {
  // Extract key traits from the persona summary
  const strengths = extractStrengthsFromSummary(aiResponse.personaSummary);
  
  return {
    id: generatePersonaId(aiResponse.personaName),
    name: aiResponse.personaName,
    description: aiResponse.personaSummary,
    traits: strengths,
    strengths: strengths,
    matchScore: 100, // AI-generated personas have high confidence
    confidence: 'high'
  };
}

// Simple function to extract strengths from persona summary
function extractStrengthsFromSummary(summary: string): string[] {
  const lowerSummary = summary.toLowerCase();
  const strengths: string[] = [];
  
  if (lowerSummary.includes('leadership') || lowerSummary.includes('leader')) strengths.push('Leadership');
  if (lowerSummary.includes('creative') || lowerSummary.includes('innovat')) strengths.push('Creativity');
  if (lowerSummary.includes('analytical') || lowerSummary.includes('problem')) strengths.push('Analytical Thinking');
  if (lowerSummary.includes('communicat') || lowerSummary.includes('collaborat')) strengths.push('Communication');
  if (lowerSummary.includes('strategic') || lowerSummary.includes('organiz')) strengths.push('Strategic Thinking');
  if (lowerSummary.includes('attention') || lowerSummary.includes('detail')) strengths.push('Attention to Detail');
  if (lowerSummary.includes('research') || lowerSummary.includes('investigat')) strengths.push('Research');
  if (lowerSummary.includes('adapt') || lowerSummary.includes('flexib')) strengths.push('Adaptability');
  
  // If no specific strengths found, provide generic ones
  if (strengths.length === 0) {
    strengths.push('Problem Solving', 'Communication', 'Adaptability');
  }
  
  return strengths;
}

// Generate a persona ID from the persona name
function generatePersonaId(personaName: string): string {
  return personaName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

// Map AI roles to our existing domain match structure
function mapAIRolesToDomainMatches(aiResponse: AIRecommendationResponse): DomainMatch[] {
  // For now, we'll treat each role as a separate "domain match"
  // In the future, we might want to group roles by broader domains
  return aiResponse.recommendedRoles.map((role, index) => {
    // Calculate a match percentage based on position (first role gets highest match)
    const matchPercentage = Math.max(70, 100 - (index * 8));
    
    return {
      id: generateRoleId(role.role),
      name: role.role,
      description: role.reason,
      matchScore: matchPercentage,
      matchPercentage: matchPercentage,
      confidence: index < 2 ? 'high' : index < 4 ? 'medium' : 'low'
    };
  });
}

// Generate a role ID from the role name
function generateRoleId(roleName: string): string {
  return roleName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

// Function to generate AI-powered recommendations using our aiService
export async function generateRecommendations(quizAnswers: Record<string, any>): Promise<{ 
  persona: (Persona & { matchScore?: number; confidence?: string }) | null; 
  domains: DomainMatch[] 
}> {
  try {
    // Generate persona and roles using AI
    const aiResponse = await generatePersonaAndRoles(quizAnswers);
    
    // Map AI response to our structures
    const persona = mapAIPersonaToPersona(aiResponse);
    const domains = mapAIRolesToDomainMatches(aiResponse);
    
    return { persona, domains };
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    // Return fallback data if any step fails
    return {
      persona: {
        id: 'adaptive-explorer',
        name: 'The Adaptive Explorer',
        description: 'You\'re curious and flexible, with a natural ability to adapt to different environments. You thrive when you can explore various options before committing to a path.',
        traits: ['Adaptability', 'Curiosity', 'Problem Solving'],
        strengths: ['Adaptability', 'Curiosity', 'Problem Solving'],
        matchScore: 85,
        confidence: 'medium'
      },
      domains: [
        {
          id: 'full-stack-developer',
          name: 'Full Stack Developer',
          description: 'A developer who works on both frontend and backend systems',
          matchScore: 92,
          matchPercentage: 92,
          confidence: 'high'
        },
        {
          id: 'business-analyst',
          name: 'Business Analyst',
          description: 'A professional who analyzes business processes and recommends improvements',
          matchScore: 85,
          matchPercentage: 85,
          confidence: 'high'
        },
        {
          id: 'digital-marketing-specialist',
          name: 'Digital Marketing Specialist',
          description: 'A specialist in online marketing channels and strategies',
          matchScore: 78,
          matchPercentage: 78,
          confidence: 'medium'
        }
      ]
    };
  }
}

// Function to predict persona (wrapper for generateRecommendations)
export async function predictPersona(quizAnswers: Record<string, any>): Promise<Persona & { matchScore?: number; confidence?: string }> {
  const recommendations = await generateRecommendations(quizAnswers);
  
  // Return the persona from recommendations or a fallback
  return recommendations.persona || {
    id: 'adaptive-explorer',
    name: 'The Adaptive Explorer',
    description: 'You\'re curious and flexible, with a natural ability to adapt to different environments.',
    traits: ['Adaptability', 'Curiosity', 'Problem Solving'],
    strengths: ['Adaptability', 'Curiosity', 'Problem Solving'],
    matchScore: 85,
    confidence: 'medium'
  };
}

// Function to calculate domain matches (wrapper for generateRecommendations)
export async function calculateDomainMatches(quizAnswers: Record<string, any>): Promise<DomainMatch[]> {
  const recommendations = await generateRecommendations(quizAnswers);
  return recommendations.domains;
}

// Function to determine persona (wrapper for generateRecommendations)
export async function determinePersona(quizAnswers: Record<string, any>, domainMatches: DomainMatch[]): Promise<(Persona & { matchScore?: number; confidence?: string }) | null> {
  const recommendations = await generateRecommendations(quizAnswers);
  return recommendations.persona;
}