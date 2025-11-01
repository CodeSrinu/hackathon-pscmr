// src/lib/feedbackProcessor.ts
import { supabase } from './supabase';
import { UserFeedback } from './userData';
import { RECOMMENDATION_ENGINE_VERSION } from './recommendationEngine';

// Define TypeScript interfaces for our data structures
export interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  positiveFeedback: number;
  negativeFeedback: number;
}

export interface DomainPerformance {
  totalFeedback: number;
  averageRating: number;
  positiveFeedback: number;
  negativeFeedback: number;
  successRate: number;
}

export interface FeedbackPatterns {
  totalFeedback: number;
  averageRating: number;
  domainPerformance: Record<string, DomainPerformance>;
  recommendationSuccess: number;
  engineVersion?: string; // Version of the recommendation engine this feedback is for
}

// Function to adjust domain weights based on feedback
async function adjustDomainWeights(domainId: string, adjustmentType: 'increase' | 'decrease'): Promise<boolean> {
  try {
    // In a real implementation, this would update the domain weights in Firestore
    // based on the feedback received
    console.log(`Adjusting weights for domain ${domainId}: ${adjustmentType}`);
    
    // This is a placeholder - in a real implementation, you would:
    // 1. Fetch the current domain document
    // 2. Adjust the weights based on the feedback
    // 3. Update the document in Firestore
    
    // For now, we'll just log the adjustment
    return true;
  } catch (error) {
    console.error('Error adjusting domain weights:', error);
    throw error;
  }
}

export async function processFeedback(feedback: UserFeedback): Promise<boolean> {
  try {
    const { userId, domainId, rating, recommendationId } = feedback;

    // Update domain weights based on rating
    if (rating >= 4) {
      // Positive feedback - slightly increase weights for traits that matched
      await adjustDomainWeights(domainId, 'increase');
    } else if (rating <= 2) {
      // Negative feedback - adjust weights
      await adjustDomainWeights(domainId, 'decrease');
    }

    // Process granular feedback if available
    if (feedback.helpfulness) {
      console.log(`Helpfulness rating: ${feedback.helpfulness}`);
      // In a real implementation, this would be used to adjust recommendation algorithms
    }
    
    if (feedback.accuracy) {
      console.log(`Accuracy rating: ${feedback.accuracy}`);
      // In a real implementation, this would be used to adjust recommendation algorithms
    }
    
    if (feedback.relevance) {
      console.log(`Relevance rating: ${feedback.relevance}`);
      // In a real implementation, this would be used to adjust recommendation algorithms
    }
    
    if (feedback.easeOfUse) {
      console.log(`Ease of use rating: ${feedback.easeOfUse}`);
      // In a real implementation, this would be used to adjust UI/UX
    }
    
    if (feedback.wouldRecommend !== undefined) {
      console.log(`Would recommend: ${feedback.wouldRecommend}`);
      // In a real implementation, this would be used for overall platform metrics
    }
    
    if (feedback.quizQuestionFeedback) {
      console.log('Quiz question feedback received');
      // In a real implementation, this would be used to improve the quiz questions
    }
    
    if (feedback.domainSpecificFeedback) {
      console.log('Domain-specific feedback received');
      // In a real implementation, this would be used to improve domain matching
    }

    // Store feedback for future model training
    // Note: This is already handled by the saveUserFeedback function in userData.ts
    console.log('Feedback processed and stored for future model training');
    
    return true;
  } catch (error) {
    console.error('Error processing feedback:', error);
    throw error;
  }
}

export async function getFeedbackStats(domainId: string): Promise<FeedbackStats> {
  try {
    // Get all feedback for a specific domain
    const { data, error } = await supabase
      .from('user_feedback')
      .select('*')
      .eq('domain_id', domainId);

    if (error) {
      console.error('Error getting feedback stats:', error);
      throw error;
    }

    if (!data) {
      return {
        totalFeedback: 0,
        averageRating: 0,
        positiveFeedback: 0,
        negativeFeedback: 0
      };
    }

    // Calculate statistics
    if (data.length === 0) {
      return {
        totalFeedback: 0,
        averageRating: 0,
        positiveFeedback: 0,
        negativeFeedback: 0
      };
    }
    
    const totalRating = data.reduce((sum, fb) => sum + fb.rating, 0);
    const averageRating = totalRating / data.length;
    
    const positiveFeedback = data.filter(fb => fb.rating >= 4).length;
    const negativeFeedback = data.filter(fb => fb.rating <= 2).length;
    
    return {
      totalFeedback: data.length,
      averageRating: parseFloat(averageRating.toFixed(2)),
      positiveFeedback,
      negativeFeedback
    };
  } catch (error) {
    console.error('Error getting feedback stats:', error);
    throw error;
  }
}

export async function analyzeFeedbackPatterns(): Promise<FeedbackPatterns> {
  try {
    // Get all feedback data
    const { data, error } = await supabase
      .from('user_feedback')
      .select('*');

    if (error) {
      console.error('Error analyzing feedback patterns:', error);
      throw error;
    }

    if (!data) {
      return {
        totalFeedback: 0,
        averageRating: 0,
        domainPerformance: {},
        recommendationSuccess: 0
      };
    }

    // Map Supabase field names to our interface
    const feedbackData: (UserFeedback & { id: string })[] = data.map(fb => ({
      id: fb.id,
      userId: fb.user_id,
      recommendationId: fb.recommendation_id,
      domainId: fb.domain_id,
      rating: fb.rating,
      comments: fb.comments,
      timestamp: new Date(fb.timestamp),
      helpfulness: fb.helpfulness,
      accuracy: fb.accuracy,
      relevance: fb.relevance,
      easeOfUse: fb.ease_of_use,
      wouldRecommend: fb.would_recommend,
      improvementSuggestions: fb.improvement_suggestions,
      quizQuestionFeedback: fb.quiz_question_feedback,
      domainSpecificFeedback: fb.domain_specific_feedback,
      userAgentInfo: fb.user_agent_info,
      sessionDuration: fb.session_duration
    }));

    // Analyze patterns in the feedback
    // This is a simplified example - in a real implementation, this would be more complex
    
    const patterns: FeedbackPatterns = {
      totalFeedback: feedbackData.length,
      averageRating: 0,
      domainPerformance: {},
      recommendationSuccess: 0
    };
    
    if (feedbackData.length > 0) {
      // Calculate average rating
      const totalRating = feedbackData.reduce((sum, fb) => sum + fb.rating, 0);
      patterns.averageRating = parseFloat((totalRating / feedbackData.length).toFixed(2));
      
      // Group feedback by domain
      const domainFeedback: Record<string, (UserFeedback & { id: string })[]> = {};
      feedbackData.forEach(fb => {
        if (!domainFeedback[fb.domainId]) {
          domainFeedback[fb.domainId] = [];
        }
        domainFeedback[fb.domainId].push(fb);
      });
      
      // Calculate performance for each domain
      for (const [domainId, feedbackList] of Object.entries(domainFeedback)) {
        const total = feedbackList.reduce((sum, fb) => sum + fb.rating, 0);
        const average = parseFloat((total / feedbackList.length).toFixed(2));
        const positive = feedbackList.filter(fb => fb.rating >= 4).length;
        const negative = feedbackList.filter(fb => fb.rating <= 2).length;
        
        patterns.domainPerformance[domainId] = {
          totalFeedback: feedbackList.length,
          averageRating: average,
          positiveFeedback: positive,
          negativeFeedback: negative,
          successRate: parseFloat(((positive / feedbackList.length) * 100).toFixed(2))
        };
      }
      
      // Calculate overall recommendation success rate
      const positiveFeedback = feedbackData.filter(fb => fb.rating >= 4).length;
      patterns.recommendationSuccess = parseFloat(((positiveFeedback / feedbackData.length) * 100).toFixed(2));
    }
    
    return patterns;
  } catch (error) {
    console.error('Error analyzing feedback patterns:', error);
    throw error;
  }
}