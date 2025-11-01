// src/app/api/learning-module/quiz/content-route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface QuizContentRequest {
  quizId: string;
  quizTitle: string;
  courseTitle: string;
  careerField: string;
  userId: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizContent {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  duration?: string;
  courseTitle: string;
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body: QuizContentRequest = await request.json();
    
    // Validate input
    if (!body.quizId || !body.quizTitle || !body.courseTitle || !body.careerField) {
      return NextResponse.json(
        { error: 'Missing required fields: quizId, quizTitle, courseTitle, careerField' },
        { status: 400 }
      );
    }

    console.log("Quiz Content API called with:", { 
      quizId: body.quizId, 
      quizTitle: body.quizTitle,
      courseTitle: body.courseTitle,
      careerField: body.careerField
    });
    
    // Get API key from environment variables (server-side only)
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      // Fallback response if API key is not available
      console.log("NO API KEY - Using default quiz content");
      return NextResponse.json({
        content: getDefaultQuizContent(body.quizTitle, body.courseTitle, body.careerField)
      });
    }

    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(apiKey);
    // FIXED: Using gemini-2.5-flash instead of gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // PROMPT FOR GENERATING QUIZ CONTENT - AI TUTOR (PHASE 2)
    // This prompt is designed to create detailed content for a single quiz
    const prompt = `ROLE:
You are an expert ${body.careerField} and senior educator with 15+ years of real-world experience. Your task is to generate a comprehensive quiz titled "${body.quizTitle}" for the course "${body.courseTitle}".

CONTEXT:
A user has clicked on a quiz titled "${body.quizTitle}" in their course "${body.courseTitle}". Your job is to act as an expert educator and generate the detailed content for this specific quiz.

TASK:
Generate a comprehensive quiz with multiple-choice questions that test the user's understanding of the material. Your goal is to create questions that not only test factual knowledge but also conceptual understanding and practical application.

Perform Real-Time Research: Before generating the content, actively search for current discussions, tutorials, and expert opinions on the topics covered in this quiz from platforms like YouTube, Reddit (e.g., r/cscareerquestions, r/uidesign), Medium, Twitter, and top-tier technical blogs.

For the Quiz Content, you MUST provide:

questions: A set of 4-6 multiple-choice questions with:
- A clear, well-formulated question
- 3-4 plausible answer options
- The correct answer
- A detailed explanation of why the correct answer is right and why the others are wrong

OUTPUT FORMAT:
Your final output MUST be a single, clean, valid JSON object.

{
  "title": "${body.quizTitle}",
  "description": "Test your knowledge of ${body.quizTitle}",
  "questions": [
    {
      "id": "q1",
      "question": "What is the most important principle of ${body.quizTitle}?",
      "options": [
        "Option 1",
        "Option 2", 
        "Option 3",
        "Option 4"
      ],
      "correctAnswer": "Option 2",
      "explanation": "Option 2 is correct because..."
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
    if (!parsedResponse.title || !parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      console.log("ERROR: AI response does not have the expected structure");
      throw new Error("AI response does not have the expected structure");
    }
    
    console.log("Successfully parsed AI response");
    
    return NextResponse.json({ content: parsedResponse });
    
  } catch (error: any) {
    console.error("=== ERROR IN QUIZ CONTENT API ===");
    console.error("Error:", error);
    console.error("Error Message:", error.message);
    console.error("Stack Trace:", error.stack);
    
    // Return a fallback response in case of error
    console.log("USING FALLBACK QUIZ CONTENT");
    return NextResponse.json(
      {
        content: getDefaultQuizContent("Introduction to Quiz", "General Course", "General Field")
      },
      { status: 200 }
    );
  }
}

// Default quiz content for fallback
function getDefaultQuizContent(quizTitle: string, courseTitle: string, careerField: string): QuizContent {
  return {
    id: 'default',
    title: quizTitle,
    description: `Test your knowledge of ${quizTitle}`,
    questions: [
      {
        id: 'q1',
        question: `What is the most important aspect of ${quizTitle}?`,
        options: [
          "Memorizing syntax",
          "Understanding concepts",
          "Watching videos",
          "Reading documentation"
        ],
        correctAnswer: "Understanding concepts",
        explanation: "Understanding concepts is more important than memorizing syntax. When you understand the underlying principles, you can apply them to new situations and solve problems creatively."
      },
      {
        id: 'q2',
        question: `Which approach is most effective for learning ${quizTitle}?`,
        options: [
          "Copying code without understanding",
          "Practicing regularly with varied examples",
          "Only reading documentation",
          "Watching videos without practice"
        ],
        correctAnswer: "Practicing regularly with varied examples",
        explanation: "Regular practice with varied examples helps reinforce concepts and builds problem-solving skills. This approach leads to deeper understanding and better retention than passive learning methods."
      }
    ],
    courseTitle: courseTitle
  };
}