// src/app/api/learning-module/route.ts
import { NextResponse } from 'next/server';

// Define TypeScript interfaces for our request and response
interface LearningModuleRequest {
  moduleId: string;
  moduleName: string;
  userId: string;
}

interface LearningModuleContent {
  id: string;
  title: string;
  description: string;
  duration?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  modules: LearningContentModule[];
}

interface LearningContentModule {
  id: string;
  type: 'lecture' | 'cheat-sheet' | 'quiz' | 'project' | 'assignment';
  title: string;
  description: string;
  duration?: string;
  status: 'completed' | 'available' | 'locked';
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body: LearningModuleRequest = await request.json();
    
    // Validate input
    if (!body.moduleId || !body.moduleName) {
      return NextResponse.json(
        { error: 'Missing required fields: moduleId, moduleName' },
        { status: 400 }
      );
    }

    console.log("Learning Module API called with:", { moduleId: body.moduleId, moduleName: body.moduleName, userId: body.userId });
    
    // In a real implementation, this would fetch from a database
    // For now, we'll return mock data
    
    const mockModule: LearningModuleContent = {
      id: body.moduleId,
      title: body.moduleName,
      description: `A comprehensive guide to ${body.moduleName}.`,
      duration: '2 weeks',
      difficulty: 'beginner',
      modules: [
        {
          id: 'lec1',
          type: 'lecture',
          title: 'Introduction to Semantic HTML',
          description: 'Learn the fundamentals of semantic HTML elements',
          duration: '15 minutes',
          status: 'available'
        },
        {
          id: 'cs1',
          type: 'cheat-sheet',
          title: 'Semantic HTML Cheat Sheet',
          description: 'Quick reference guide for semantic HTML elements',
          duration: '10 minutes',
          status: 'available'
        },
        {
          id: 'qz1',
          type: 'quiz',
          title: 'Semantic HTML Quiz',
          description: 'Test your knowledge of semantic HTML elements',
          duration: '10 minutes',
          status: 'available'
        },
        {
          id: 'prj1',
          type: 'project',
          title: 'Build a Personal Portfolio',
          description: 'Create a responsive personal portfolio website',
          duration: '2 hours',
          status: 'available'
        }
      ]
    };
    
    return NextResponse.json(mockModule);
    
  } catch (error: any) {
    console.error("=== ERROR IN LEARNING MODULE API ===");
    console.error("Error:", error);
    console.error("Error Message:", error.message);
    console.error("Stack Trace:", error.stack);
    
    return NextResponse.json(
      { error: 'Failed to load learning module' },
      { status: 500 }
    );
  }
}