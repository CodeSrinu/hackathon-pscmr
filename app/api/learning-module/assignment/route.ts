// src/app/api/learning-module/assignment/route.ts
import { NextResponse } from 'next/server';
import { POST as generateAssignmentContent } from './content-route';

interface AssignmentRequest {
  assignmentId: string;
  moduleId: string;
  moduleName: string;
  userId: string;
}

interface AssignmentContent {
  id: string;
  title: string;
  description: string;
  type: 'assignment' | 'homework';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  requirements: string[];
  instructions: string[];
  resources: { title: string; url: string }[];
  moduleId: string;
  moduleName: string;
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body: AssignmentRequest = await request.json();
    
    // Validate input
    if (!body.assignmentId || !body.moduleId || !body.moduleName) {
      return NextResponse.json(
        { error: 'Missing required fields: assignmentId, moduleId, moduleName' },
        { status: 400 }
      );
    }

    console.log("Assignment API called with:", { assignmentId: body.assignmentId, moduleId: body.moduleId, moduleName: body.moduleName });
    
    // Call the content generation API instead of using mock data
    // We need to transform the request to match the content-route interface
    const contentRequest = new Request(request, {
      body: JSON.stringify({
        assignmentId: body.assignmentId,
        assignmentTitle: body.moduleName, // Using moduleName as the assignment title for now
        courseTitle: body.moduleName,
        careerField: 'General', // This would be dynamically determined
        userId: body.userId || 'default-user'
      })
    });
    
    const contentResponse = await generateAssignmentContent(contentRequest);
    const contentData = await contentResponse.json();
    
    // Transform the content data to match our expected format
    const assignmentContent: AssignmentContent = {
      id: contentData.content?.id || body.assignmentId,
      title: contentData.content?.title || 'Assignment',
      description: contentData.content?.description || `Complete this assignment to demonstrate your knowledge of ${body.moduleName}`,
      type: contentData.content?.type || 'assignment',
      difficulty: contentData.content?.difficulty || 'beginner',
      estimatedTime: contentData.content?.estimatedTime || '30 minutes',
      requirements: contentData.content?.requirements || [],
      instructions: contentData.content?.instructions || [],
      resources: contentData.content?.resources || [],
      moduleId: body.moduleId,
      moduleName: body.moduleName
    };
    
    return NextResponse.json(assignmentContent);
    
  } catch (error: any) {
    console.error("=== ERROR IN ASSIGNMENT API ===");
    console.error("Error:", error);
    console.error("Error Message:", error.message);
    console.error("Stack Trace:", error.stack);
    
    // Fallback to mock data if content generation fails
    console.log("USING FALLBACK MOCK DATA");
    const mockAssignment: AssignmentContent = {
      id: 'default',
      title: 'Create a Semantic HTML Portfolio',
      description: 'Build a portfolio website using semantic HTML elements to demonstrate your understanding of proper document structure',
      type: 'assignment',
      difficulty: 'beginner',
      estimatedTime: '1 hour',
      moduleId: 'default',
      moduleName: 'HTML Fundamentals',
      requirements: [
        'Use semantic HTML5 elements (<header>, <nav>, <main>, <article>, <section>, <aside>, <footer>)',
        'Implement a responsive design with CSS',
        'Include at least 3 sections (About, Projects, Contact)',
        'Use proper heading hierarchy (h1, h2, h3, etc.)',
        'Validate your HTML markup'
      ],
      instructions: [
        'Create a new HTML file with proper DOCTYPE declaration',
        'Set up the basic structure with semantic elements',
        'Add content for each section of your portfolio',
        'Style your portfolio with CSS, focusing on responsiveness',
        'Test your portfolio on different devices and browsers',
        'Validate your HTML with W3C Markup Validator'
      ],
      resources: [
        { title: 'MDN HTML Element Reference', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element' },
        { title: 'W3C Markup Validator', url: 'https://validator.w3.org/' },
        { title: 'Responsive Design Principles', url: 'https://developers.google.com/web/fundamentals/design-and-ux/responsive/' }
      ]
    };
    
    return NextResponse.json(mockAssignment);
  }
}