// src/app/api/learning-module/cheat-sheet/content-route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface CheatSheetContentRequest {
  cheatSheetId: string;
  cheatSheetTitle: string;
  courseTitle: string;
  careerField: string;
  userId: string;
}

interface CheatSheetContent {
  id: string;
  title: string;
  content: string;
  duration?: string;
  courseTitle: string;
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body: CheatSheetContentRequest = await request.json();
    
    // Validate input
    if (!body.cheatSheetId || !body.cheatSheetTitle || !body.courseTitle || !body.careerField) {
      return NextResponse.json(
        { error: 'Missing required fields: cheatSheetId, cheatSheetTitle, courseTitle, careerField' },
        { status: 400 }
      );
    }

    console.log("Cheat Sheet Content API called with:", { 
      cheatSheetId: body.cheatSheetId, 
      cheatSheetTitle: body.cheatSheetTitle,
      courseTitle: body.courseTitle,
      careerField: body.careerField
    });
    
    // Get API key from environment variables (server-side only)
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      // Fallback response if API key is not available
      console.log("NO API KEY - Using default cheat sheet content");
      return NextResponse.json({
        content: getDefaultCheatSheetContent(body.cheatSheetTitle, body.courseTitle, body.careerField)
      });
    }

    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(apiKey);
    // FIXED: Using gemini-2.5-flash instead of gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // PROMPT FOR GENERATING CHEAT SHEET CONTENT - AI TUTOR (PHASE 2)
    // This prompt is designed to create detailed content for a single cheat sheet
    const prompt = `ROLE:
You are an expert ${body.careerField} and senior mentor with 15+ years of real-world experience. Your task is to generate a comprehensive, NxtWave-style "Cheat Sheet" titled "${body.cheatSheetTitle}" for the course "${body.courseTitle}".

CONTEXT:
A user has clicked on a cheat sheet titled "${body.cheatSheetTitle}" in their course "${body.courseTitle}". Your job is to act as an expert mentor and generate the detailed content for this specific cheat sheet.

TASK:
Generate a comprehensive, NxtWave-style "Cheat Sheet" that serves as a "super-summary" of the topic. Your goal is to provide the student with a concise, high-value resource that includes not just the basics, but also insider wisdom from the professional community.

Perform Real-Time Research: Before generating the content, actively search for current discussions, tutorials, and expert opinions on this topic from platforms like YouTube, Reddit (e.g., r/cscareerquestions, r/uidesign), Medium, Twitter, and top-tier technical blogs. Your goal is to find the most effective teaching resources and the most common "pain points" beginners face right now.

For the Cheat Sheet Content, you MUST provide:

content: A detailed, NxtWave-style "Cheat Sheet" that is a "super-summary" including:
- Summarizes the core concepts.
- Adds 20-30% more value, including detailed code snippets or examples.
- Critically, it must include "Insider Tips & Common Pitfalls" that you discovered from your research on Reddit, Twitter, and blogs.

OUTPUT FORMAT:
Your final output MUST be a single, clean, valid JSON object.

{
  "title": "${body.cheatSheetTitle}",
  "content": "## ${body.cheatSheetTitle} - Cheat Sheet\n\n### Key Concepts\n- Concept 1\n- Concept 2\n\n### Pro Tips\n- Tip 1 from Reddit:\n- Tip 2 from Twitter:\n\n### Common Pitfalls\n- Pitfall 1\n- Pitfall 2\n\n### Code Examples\n\`\`\`javascript\n// Example code\n\`\`\`\n\n### Best Practices\n- Practice 1\n- Practice 2"
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
    if (!parsedResponse.title || !parsedResponse.content) {
      console.log("ERROR: AI response does not have the expected structure");
      throw new Error("AI response does not have the expected structure");
    }
    
    console.log("Successfully parsed AI response");
    
    return NextResponse.json({ content: parsedResponse });
    
  } catch (error: any) {
    console.error("=== ERROR IN CHEAT SHEET CONTENT API ===");
    console.error("Error:", error);
    console.error("Error Message:", error.message);
    console.error("Stack Trace:", error.stack);
    
    // Return a fallback response in case of error
    console.log("USING FALLBACK CHEAT SHEET CONTENT");
    return NextResponse.json(
      {
        content: getDefaultCheatSheetContent("Introduction to Cheat Sheet", "General Course", "General Field")
      },
      { status: 200 }
    );
  }
}

// Default cheat sheet content for fallback
function getDefaultCheatSheetContent(cheatSheetTitle: string, courseTitle: string, careerField: string): CheatSheetContent {
  return {
    id: 'default',
    title: cheatSheetTitle,
    content: `## ${cheatSheetTitle} - Cheat Sheet

### Key Concepts
- Fundamental principles of ${cheatSheetTitle}
- Core techniques and best practices
- Common patterns and approaches

### Pro Tips
- Start with simple examples to build understanding
- Practice regularly to reinforce concepts
- Seek feedback from peers and mentors
- Document your learning process and insights

### Common Pitfalls
- Don't skip fundamentals in favor of advanced topics
- Avoid copying code without understanding it
- Don't neglect testing and validation
- Avoid trying to learn everything at once

### Code Examples
\`\`\`javascript
// Example implementation of ${cheatSheetTitle}
console.log("This is a placeholder example for ${cheatSheetTitle}");
// In a real implementation, this would contain actual code examples
\`\`\`

### Best Practices
- Follow established conventions and standards
- Write clean, readable, and maintainable code
- Test your code thoroughly
- Continuously refactor and improve your work
- Stay updated with industry trends and best practices`,
    courseTitle: courseTitle
  };
}