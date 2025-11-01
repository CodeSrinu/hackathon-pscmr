// src/components/mobile/ResultsPage.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { saveQuizResponse } from '@/lib/userData';
import ErrorScreen from '@/components/ErrorScreen';

interface Persona {
  id: string;
  name: string;
  description: string;
  strengths: string[];
  matchScore?: number;
  confidence?: string;
}

interface RoleMatch {
  id: string;
  name: string;
  reason: string;
  matchPercentage?: number;
}

interface ResultsPageProps {
  answers: Record<number, string | string[]>;
  onBack: () => void;
  onSelectRole: (roleId: string, roleName: string, personaSummary: string, roleRank?: number) => void;
}

export default function ResultsPage({ answers, onBack, onSelectRole }: ResultsPageProps) {
  const { data: session } = useSession();
  const [roles, setRoles] = useState<RoleMatch[]>([]);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert frontend answers to backend format
  const convertAnswersForBackend = (frontendAnswers: Record<number, string | string[]>): Record<string, any> => {
    const backendAnswers: Record<string, any> = {};
    
    // Map frontend question IDs to backend keys
    const questionIdMap: Record<number, string> = {
      1: 'childhoodInterests',
      2: 'favoriteToy',
      3: 'childhoodAspiration',
      4: 'spendingPreference',
      5: 'inspirationalStatement',
      6: 'idealDailyVibe',
      7: 'nonNegotiables',
      8: 'publicSpeaking',
      9: 'secretChoice',
      10: 'goalOwnership'
    };
    
    Object.entries(frontendAnswers).forEach(([questionId, answer]) => {
      const backendKey = questionIdMap[parseInt(questionId)];
      if (backendKey) {
        backendAnswers[backendKey] = answer;
      }
    });
    
    return backendAnswers;
  };

  // Fetch real recommendations from our API
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        console.log("Fetching recommendations with answers:", answers);
        setLoading(true);
        setError(null);
        
        // Convert answers to backend format
        const backendAnswers = convertAnswersForBackend(answers);
        console.log("Converted backend answers:", backendAnswers);
        
        // Save quiz response to Firestore (non-blocking)
        if (session?.user?.id) {
          saveQuizResponse(session.user.id, backendAnswers)
            .catch(err => console.warn('Failed to save quiz response:', err));
        }
        
        // Call our API to generate AI recommendations
        console.log("Calling /api/ai-recommendations...");
        const response = await fetch('/api/ai-recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quizAnswers: backendAnswers }),
        });

        console.log("API response status:", response.status);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const aiResponse = await response.json();
        console.log("Received AI response:", aiResponse);
        
        // Directly use the AI response (no fallback check)
        // Transform AI response to our component state
        const transformedPersona: Persona = {
          id: 'ai-generated',
          name: aiResponse.personaName,
          description: aiResponse.personaSummary,
          strengths: ['Adaptability', 'Problem Solving', 'Communication'],
          matchScore: 100,
          confidence: 'high'
        };
        
        // Transform role reasons to focus on capabilities, skills, and powers
        const transformRoleReason = (reason: string): string => {
          // Remove direct references to quiz answers and rephrase to focus on capabilities
          let transformedReason = reason;
          
          // Handle various patterns of direct references to user's answers
          if (transformedReason.includes("Your")) {
            // More general transformation that removes personal references
            transformedReason = transformedReason.replace(
              /Your.*?(makes you well-suited|is perfect for|are valuable for|make you effective|make you a great fit|would love|enable you|position you)/,
              "With your unique combination of skills and talents, you're positioned for success in"
            );
          }
          
          // Replace specific terms to focus on capabilities
          transformedReason = transformedReason
            .replace(/natural strengths/g, "inherent capabilities")
            .replace(/skills that make them well-suited/g, "abilities that align with")
            .replace(/directly referencing their specific quiz answers/g, "focusing on core competencies")
            .replace(/capabilities, skills, or natural strengths/g, "unique talents and abilities");
          
          // If we still have direct personal references, rephrase more generally
          if (transformedReason.includes("Your") && transformedReason.includes("well-suited")) {
            transformedReason = "This career path aligns with your unique talents and offers opportunities to leverage your abilities.";
          } else if (transformedReason.includes("Your") && transformedReason.includes("perfect for")) {
            transformedReason = "This field is ideal for individuals with your combination of skills and interests.";
          } else if (transformedReason.includes("Your") && transformedReason.includes("valuable for")) {
            transformedReason = "The skills you possess are highly valuable in this career domain.";
          }
          
          return transformedReason;
        };
        
        const transformedRoles: RoleMatch[] = aiResponse.recommendedRoles.map((role: any, index: number) => ({
          id: `role-${index}`,
          name: role.role,
          reason: transformRoleReason(role.reason),
          matchPercentage: 100 - (index * 10) // Decreasing percentages for lower ranked roles
        }));
        
        console.log("Transformed persona:", transformedPersona);
        console.log("Transformed roles:", transformedRoles);
        
        setPersona(transformedPersona);
        setRoles(transformedRoles);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        console.error('Error details:', err instanceof Error ? {
          name: err.name,
          message: err.message,
          stack: err.stack
        } : err);
        setError('Failed to generate AI-powered recommendations. This may be due to API connectivity issues or invalid API key configuration. Please contact the system administrator.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [answers, session?.user?.id]);

  // Get strength icon
  const getStrengthIcon = (strength: string) => {
    if (strength.includes('Leadership') || strength.includes('Communication')) {
      return (
        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    } else if (strength.includes('Creativity') || strength.includes('Design')) {
      return (
        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      );
    } else if (strength.includes('Analytical') || strength.includes('Research')) {
      return (
        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
        <header className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex items-center p-4">
            <div className="flex size-10 shrink-0 items-center justify-center">
              <div className="bg-gray-200 rounded-full w-6 h-6 animate-pulse"></div>
            </div>
            <div className="flex-1 text-center">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3 mx-auto"></div>
            </div>
            <div className="w-10"></div>
          </div>
        </header>
        <main className="flex-1 p-4">
          <div className="space-y-6">
            {/* Progress indicator */}
            <div className="mb-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full w-3/4 animate-pulse"></div>
              </div>
            </div>
            
            {/* Persona Card Skeleton */}
            <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-lg">
              <div className="flex flex-col items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-full bg-white shadow-md">
                  <div className="bg-gray-200 rounded-full w-8 h-8 animate-pulse"></div>
                </div>
                <div className="flex flex-col gap-3 w-full">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Roles Section Skeleton */}
            <div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2 mb-4"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                    </div>
                    <div className="bg-gray-200 rounded-full w-5 h-5 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Info Card Skeleton */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="bg-gray-200 rounded-full w-5 h-5 animate-pulse"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorScreen
        title="AI Service Unavailable"
        message={error}
        onRetry={() => window.location.reload()}
        showRetry={true}
      />
    );
  }

  // Use the real persona or fallback to a sample one
  const userPersona = persona || {
    id: 'adaptive-explorer',
    name: 'The Adaptive Explorer',
    description: 'You\'re curious and flexible, with a natural ability to adapt to different environments. You thrive when you can explore various options before committing to a path.',
    strengths: ['Adaptability', 'Curiosity', 'Problem Solving']
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      {/* Header with progress */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center p-4">
          <button 
            className="flex size-10 shrink-0 items-center justify-center text-slate-600 hover:bg-gray-100 rounded-full transition-colors"
            onClick={onBack}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-slate-800">Your Career Match</h1>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="space-y-6">
          
          {/* Persona Card with enhanced design */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-sm border border-blue-100">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {/* Persona Icon */}
                <div className="flex size-20 items-center justify-center rounded-full bg-white shadow-md border-2 border-blue-200">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-center">
                <h2 className="text-xl font-bold text-slate-900">{userPersona.name}</h2>
                <p className="text-sm text-slate-600">
                  You have incredible potential in areas that align with your natural strengths: <span className="font-semibold text-blue-600">{userPersona.strengths.join(', ')}</span>. 
                  Based on your unique personality and values, these career paths would allow you to thrive and make a meaningful impact.
                </p>
                
                {/* Strengths badges */}
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {userPersona.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center gap-1 bg-white bg-opacity-80 px-3 py-1 rounded-full text-xs font-medium text-blue-700 border border-blue-200">
                      {getStrengthIcon(strength)}
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Roles */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Your Career Recommendations</h3>
            
            <div className="space-y-3">
              {roles.map((role, index) => {
                // Use your green shades for borders with decreasing intensity
                const borderClasses = [
                  'border-2 border-[#008000] border-opacity-40',   // #008000 (darkest green) for #1
                  'border-2 border-[#33a033] border-opacity-30',   // #33a033 (dark green) for #2
                  'border-2 border-[#66c066] border-opacity-20',   // #66c066 (medium green) for #3
                  'border-2 border-[#99d999] border-opacity-15',   // #99d999 (light green) for #4
                  'border-2 border-[#ccf0cc] border-opacity-10'    // #ccf0cc (lightest green) for #5
                ];
                
                // Same background as persona card
                const bgClass = 'bg-gradient-to-r from-blue-50 to-indigo-50';
                
                return (
                  <div 
                    key={role.id}
                    className={`flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 hover:shadow-sm cursor-pointer ${
                      bgClass
                    } ${borderClasses[index]}`}
                    onClick={() => onSelectRole(role.id, role.name, userPersona.description, index + 1)}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h4 className="font-bold text-slate-800">{role.name}</h4>
                      <p className="text-sm text-slate-700 mt-1">{role.reason}</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Card */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-blue-800 mb-1">Explore Your Options</h3>
                <p className="text-sm text-blue-700">
                  All {roles.length} recommendations above align with your personality. Tap on any to see detailed career information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <button 
          className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold shadow-md hover:from-green-600 hover:to-green-700 transition-all duration-300"
          onClick={() => roles.length > 0 && onSelectRole(roles[0].id, roles[0].name, userPersona.description, 1)}
        >
          {roles.length > 0 ? `Explore Top Match: ${roles[0].name}` : 'Explore Careers'}
        </button>
      </div>
    </div>
  );
}