// src/app/api/learning-module/task/content-route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface TaskContentRequest {
  taskId: string;
  taskTitle: string;
  courseTitle: string;
  careerField: string;
  userId: string;
}

interface TaskContent {
  id: string;
  title: string;
  description: string;
  type: 'task' | 'project';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  requirements: string[];
  instructions: string[];
  resources: { title: string; url: string }[];
  courseTitle: string;
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body: TaskContentRequest = await request.json();
    
    // Validate input
    if (!body.taskId || !body.taskTitle || !body.courseTitle || !body.careerField) {
      return NextResponse.json(
        { error: 'Missing required fields: taskId, taskTitle, courseTitle, careerField' },
        { status: 400 }
      );
    }

    console.log("Task Content API called with:", { 
      taskId: body.taskId, 
      taskTitle: body.taskTitle,
      courseTitle: body.courseTitle,
      careerField: body.careerField
    });
    
    // Get API key from environment variables (server-side only)
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      // Fallback response if API key is not available
      console.log("NO API KEY - Using default task content");
      return NextResponse.json({
        content: getDefaultTaskContent(body.taskTitle, body.courseTitle, body.careerField)
      });
    }

    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // PROMPT FOR GENERATING TASK CONTENT - AI TUTOR (PHASE 2)
    // This prompt is designed to create detailed content for a single task/project
    const prompt = `ROLE:
You are an expert ${body.careerField} and senior mentor with 15+ years of real-world experience. Your task is to generate detailed, high-quality content for a practical task titled "${body.taskTitle}" in the course "${body.courseTitle}".

CONTEXT:
A user has clicked on a task titled "${body.taskTitle}" in their course "${body.courseTitle}". Your job is to act as an expert mentor and generate the detailed content for this specific task.

TASK:
Generate comprehensive content for this task. Your goal is to provide the student with everything they need to successfully complete this practical exercise.

Perform Real-Time Research: Before generating the content, actively search for current discussions, tutorials, and expert opinions on this specific task from platforms like YouTube, Reddit (e.g., r/cscareerquestions, r/uidesign), Medium, Twitter, and top-tier technical blogs.

For the Task Content, you MUST provide:

description: A clear, detailed description of what the task involves.

type: Whether this is a 'task' (smaller exercise) or 'project' (larger undertaking).

difficulty: The difficulty level ('beginner', 'intermediate', or 'advanced').

estimatedTime: How long the task should take to complete.

requirements: A detailed list of requirements that must be met.

instructions: Step-by-step instructions for completing the task.

resources: Relevant learning resources (links to documentation, tutorials, etc.).

OUTPUT FORMAT:
Your final output MUST be a single, clean, valid JSON object.

{
  "title": "${body.taskTitle}",
  "description": "Clear description of what the task involves",
  "type": "task",
  "difficulty": "beginner",
  "estimatedTime": "30 minutes",
  "requirements": [
    "Requirement 1",
    "Requirement 2",
    "Requirement 3"
  ],
  "instructions": [
    "Instruction 1",
    "Instruction 2",
    "Instruction 3"
  ],
  "resources": [
    {
      "title": "Resource Title",
      "url": "https://example.com"
    }
  ]
}`;

    console.log("Sending prompt to AI:");
    console.log("--- PROMPT START ---");
    console.log(prompt);
    console.log("--- PROMPT END ---");
    
    // Generate content using the AI model
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("AI Response received:");
    console.log("--- RESPONSE START ---");
    console.log(text);
    console.log("--- RESPONSE END ---");
    
    // Parse the JSON response
    // Note: The AI might include markdown formatting, so we need to extract the JSON
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.substring(jsonStart, jsonEnd);
    
    // Validate that we have a valid JSON string
    if (jsonString.length === 0) {
      console.log("ERROR: AI response did not contain valid JSON");
      throw new Error("AI response did not contain valid JSON");
    }
    
    console.log("Extracted JSON:");
    console.log(jsonString);
    
    const parsedResponse = JSON.parse(jsonString);
    
    // Validate that the response has the expected structure
    if (!parsedResponse.title || !parsedResponse.description || !parsedResponse.type || !parsedResponse.difficulty) {
      console.log("ERROR: AI response does not have the expected structure");
      throw new Error("AI response does not have the expected structure");
    }
    
    console.log("Successfully parsed AI response");
    
    return NextResponse.json({ content: parsedResponse });
    
  } catch (error: any) {
    console.error("=== ERROR IN TASK CONTENT API ===");
    console.error("Error:", error);
    console.error("Error Message:", error.message);
    console.error("Stack Trace:", error.stack);
    
    // Return a fallback response in case of error
    console.log("USING FALLBACK TASK CONTENT");
    return NextResponse.json(
      {
        content: getDefaultTaskContent("Introduction to Task", "General Course", "General Field")
      },
      { status: 200 }
    );
  }
}

// Default task content for fallback
function getDefaultTaskContent(taskTitle: string, courseTitle: string, careerField: string): TaskContent {
  return {
    id: 'default',
    title: taskTitle,
    description: `Complete a practical exercise to apply what you've learned about ${taskTitle}`,
    type: 'task',
    difficulty: 'beginner',
    estimatedTime: '30 minutes',
    requirements: [
      `Apply the concepts learned in ${courseTitle}`,
      'Follow best practices for your field',
      'Document your approach and any challenges faced'
    ],
    instructions: [
      'Review the lecture materials on this topic',
      'Identify a practical application of these concepts',
      'Implement a solution to the task',
      'Test your implementation thoroughly',
      'Document your approach and any lessons learned'
    ],
    resources: [
      {
        title: `${careerField} Best Practices Guide`,
        url: 'https://example.com/best-practices'
      },
      {
        title: `${courseTitle} Documentation`,
        url: 'https://example.com/documentation'
      }
    ],
    courseTitle: courseTitle
  };
}