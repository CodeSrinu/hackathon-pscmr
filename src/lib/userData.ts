// src/lib/userData.ts
import { supabase } from './supabase';
import { PSYCHOLOGY_QUIZ_VERSION } from './psychologyScoring';
import { RECOMMENDATION_ENGINE_VERSION } from './recommendationEngine';

// Define TypeScript interfaces for our data structures
export interface QuizResponse {
  userId: string;
  answers: Record<string, any>;
  timestamp: Date;
  quizVersion?: string; // Version of the quiz used
  userAgentInfo?: string; // Browser/OS information
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  traits?: string[];
  strengths?: string[];
  matchCriteria?: Record<string, any>;
}

export interface Domain {
  id: string;
  name: string;
  description: string;
  category?: string;
  matchWeights?: Record<string, number>;
  careerPaths?: any[];
  marketInfo?: any;
}

export interface DomainMatch {
  id: string;
  name: string;
  description: string;
  matchScore: number;
  matchPercentage: number;
  confidence: string;
}

export interface Recommendation {
  userId: string;
  persona: Persona & { matchScore?: number; confidence?: string };
  domains: DomainMatch[];
  timestamp: Date;
  engineVersion?: string; // Version of the recommendation engine used
}

export interface UserFeedback {
  userId: string;
  recommendationId: string;
  domainId: string;
  rating: number;
  comments: string;
  timestamp: Date;
  // Granular feedback data
  helpfulness?: number; // How helpful was the recommendation (1-5)
  accuracy?: number; // How accurate was the recommendation (1-5)
  relevance?: number; // How relevant was the recommendation (1-5)
  easeOfUse?: number; // How easy was it to understand the recommendation (1-5)
  wouldRecommend?: boolean; // Would the user recommend this platform to others
  improvementSuggestions?: string; // Specific suggestions for improvement
  quizQuestionFeedback?: Record<string, { 
    relevance: number; // How relevant was this question (1-5)
    clarity: number; // How clear was this question (1-5)
    influence: number; // How much did this question influence the recommendation (1-5)
  }>;
  domainSpecificFeedback?: Record<string, {
    interestLevel: number; // Interest level in this domain (1-5)
    careerFit: number; // How well this domain fits their career goals (1-5)
    skillMatch: number; // How well their skills match this domain (1-5)
  }>;
  userAgentInfo?: string; // Browser/OS information
  sessionDuration?: number; // Time spent on the results page in seconds
}

export interface UserProfile {
  name?: string;
  email?: string;
  createdAt?: Date;
  lastLogin?: Date;
  demographics?: {
    age?: number;
    location?: string;
    education?: string;
  };
  preferences?: {
    hasGoal?: boolean;
    goal?: string;
    language?: string;
  };
  onboardingCompleted?: Date;
}

export async function saveQuizResponse(userId: string, answers: Record<string, any>, userAgentInfo?: string): Promise<string | null> {
  try {
    // Prepare quiz data with proper timestamp formatting for Supabase
    const quizData = {
      user_id: userId,
      answers,
      timestamp: new Date().toISOString(),
      quiz_version: PSYCHOLOGY_QUIZ_VERSION,
      user_agent_info: userAgentInfo || null
    };

    const { data, error } = await supabase
      .from('quiz_responses')
      .insert([quizData])
      .select('id')
      .single();

    if (error) {
      console.error('Error saving quiz response:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error saving quiz response:', error);
    // Don't throw the error, just return null to allow the app to continue
    return null;
  }
}

export async function saveRecommendation(userId: string, persona: Persona, domains: DomainMatch[]): Promise<string> {
  try {
    const recommendationData = {
      user_id: userId,
      persona,
      domains,
      timestamp: new Date().toISOString(),
      engine_version: RECOMMENDATION_ENGINE_VERSION
    };

    const { data, error } = await supabase
      .from('user_recommendations')
      .insert([recommendationData])
      .select('id')
      .single();

    if (error) {
      console.error('Error saving recommendation:', error);
      throw error;
    }

    return data?.id || '';
  } catch (error) {
    console.error('Error saving recommendation:', error);
    throw error;
  }
}

export async function saveUserFeedback(
  userId: string, 
  recommendationId: string, 
  domainId: string, 
  rating: number, 
  comments: string,
  additionalFeedback?: Partial<UserFeedback>
): Promise<string> {
  try {
    const feedbackData = {
      user_id: userId,
      recommendation_id: recommendationId,
      domain_id: domainId,
      rating,
      comments,
      timestamp: new Date().toISOString(),
      helpfulness: additionalFeedback?.helpfulness || null,
      accuracy: additionalFeedback?.accuracy || null,
      relevance: additionalFeedback?.relevance || null,
      ease_of_use: additionalFeedback?.easeOfUse || null,
      would_recommend: additionalFeedback?.wouldRecommend || null,
      improvement_suggestions: additionalFeedback?.improvementSuggestions || null,
      quiz_question_feedback: additionalFeedback?.quizQuestionFeedback || null,
      domain_specific_feedback: additionalFeedback?.domainSpecificFeedback || null,
      user_agent_info: additionalFeedback?.userAgentInfo || null,
      session_duration: additionalFeedback?.sessionDuration || null
    };

    const { data, error } = await supabase
      .from('user_feedback')
      .insert([feedbackData])
      .select('id')
      .single();

    if (error) {
      console.error('Error saving feedback:', error);
      throw error;
    }

    return data?.id || '';
  } catch (error) {
    console.error('Error saving feedback:', error);
    throw error;
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    // Map Supabase field names back to our interface
    return {
      name: data.name,
      email: data.email,
      createdAt: data.created_at ? new Date(data.created_at) : undefined,
      lastLogin: data.last_login ? new Date(data.last_login) : undefined,
      demographics: data.demographics || undefined,
      preferences: data.preferences || undefined,
      onboardingCompleted: data.onboarding_completed ? new Date(data.onboarding_completed) : undefined,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

export async function saveUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<string> {
  try {
    // Prepare profile data with proper field mappings
    const profileUpdateData = {
      name: profileData.name,
      email: profileData.email,
      demographics: profileData.demographics,
      preferences: profileData.preferences,
      onboarding_completed: profileData.onboardingCompleted ? new Date(profileData.onboardingCompleted).toISOString() : undefined,
      updated_at: new Date().toISOString(),
    };

    // If the user doesn't exist, insert a new record, otherwise update
    const { error } = await supabase
      .from('users')
      .upsert([{ id: userId, ...profileUpdateData }], { onConflict: 'id' });

    if (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }

    return userId;
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
}