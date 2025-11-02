// src/app/api/learning-module/lecture/content-route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface LectureContentRequest {
  lectureId: string;
  lectureTitle: string;
  courseTitle: string;
  careerField: string;
  userId: string;
}

interface LectureContent {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  transcript: string;
  cheatSheet: string;
  quiz: QuizQuestion[];
  duration?: string;
  courseTitle: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export async function POST(request: Request) {
  try {
    console.log("\n🌐 ========== API: /api/learning-module/lecture/content-route ==========");

    // Parse the request body
    const body: LectureContentRequest = await request.json();

    console.log("📥 Request body received");
    console.log("📝 Lecture ID:", body.lectureId);
    console.log("📝 Lecture Title:", body.lectureTitle);
    console.log("📝 Course Title:", body.courseTitle);
    console.log("📝 Career Field:", body.careerField);
    console.log("⏰ Timestamp:", new Date().toISOString());

    // Validate input
    if (!body.lectureId || !body.lectureTitle || !body.courseTitle || !body.careerField) {
      console.error("❌ Validation failed: Missing required fields");
      console.error("📋 Missing fields:", {
        lectureId: !body.lectureId,
        lectureTitle: !body.lectureTitle,
        courseTitle: !body.courseTitle,
        careerField: !body.careerField
      });
      console.error("🌐 ========== API COMPLETE (VALIDATION ERROR) ==========\n");
      return NextResponse.json(
        { error: 'Missing required fields: lectureId, lectureTitle, courseTitle, careerField' },
        { status: 400 }
      );
    }

    // Get API key from environment variables (server-side only)
    const apiKey = process.env.GEMINI_API_KEY;

    console.log("🔑 API Key available:", !!apiKey);
    if (apiKey) {
      console.log("🔑 API Key length:", apiKey.length);
      console.log("🔑 API Key starts with:", apiKey.substring(0, 10) + "...");
    } else {
      console.warn("⚠️ API Key is NULL or UNDEFINED");
    }

    if (!apiKey) {
      // Fallback response if API key is not available
      console.warn("⚠️ NO API KEY - Using default lecture content");
      const fallbackContent = getDefaultLectureContent(body.lectureTitle, body.courseTitle, body.careerField);
      console.log("📊 Returning default lecture content");
      console.log("🌐 ========== API COMPLETE (FALLBACK) ==========\n");
      return NextResponse.json({
        content: fallbackContent
      });
    }

    console.log("🤖 Initializing Google Generative AI client...");

    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(apiKey);

    // Using gemini-1.5-flash (correct model name)
    console.log("🔧 Getting generative model: gemini-1.5-flash");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    console.log("✅ Model initialized successfully");
    
    // PROMPT FOR GENERATING LECTURE CONTENT - AI TUTOR (PHASE 2)
    // This prompt is designed to create detailed content for a single lecture
    const prompt = `ROLE:
You are an expert ${body.careerField} and senior tutor with 15+ years of real-world experience. Your task is to generate detailed, high-quality content for a lecture titled "${body.lectureTitle}" in the course "${body.courseTitle}".

CONTEXT:
A user has clicked on a lecture titled "${body.lectureTitle}" in their course "${body.courseTitle}". Your job is to act as an expert tutor and generate the detailed content for this specific lecture.

TASK:
Generate comprehensive content for this lecture. Your goal is to provide the student with everything they need to master this specific topic.

Perform Real-Time Research: Before generating the content, actively search for current discussions, tutorials, and expert opinions on this specific topic from platforms like YouTube, Reddit (e.g., r/cscareerquestions, r/uidesign), Medium, Twitter, and top-tier technical blogs.

For the Lecture Content, you MUST provide:

videoUrl: Based on your research, recommend one specific, high-quality YouTube video that is highly praised by the community for teaching this concept. Provide a direct embed URL.

transcript: A detailed, accurate transcript of the video content. This should be a comprehensive summary that captures the key points, examples, and explanations from the video.

cheatSheet: This is the most critical component. Create a detailed, NxtWave-style "Cheat Sheet." It must be a "super-summary" that:
- Summarizes the core concepts.
- Adds 20-30% more value, including detailed code snippets or examples.
- Critically, it must include "Insider Tips & Common Pitfalls" that you discovered from your research on Reddit, Twitter, and blogs.

quiz: A multiple-choice quiz (3-5 questions) to test understanding.

OUTPUT FORMAT:
Your final output MUST be a single, clean, valid JSON object.

{
  "title": "${body.lectureTitle}",
  "description": "Learn the fundamentals of ${body.lectureTitle}",
  "videoUrl": "https://www.youtube.com/embed/VIDEO_ID",
  "transcript": "Detailed transcript of the video content...",
  "cheatSheet": "### Key Concepts
- Concept 1
- Concept 2

### Pro Tips
- Tip 1
- Tip 2

### Common Pitfalls
- Pitfall 1
- Pitfall 2",
  "quiz": [
    {
      "question": "What is the most important aspect of ${body.lectureTitle}?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "Option 2",
      "explanation": "Explanation of why Option 2 is correct."
    }
  ]
}`;

    console.log("📝 Generated prompt length:", prompt.length);
    console.log("📤 Sending request to Gemini API...");

    // Generate content using the AI model
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("✅ Received response from Gemini API");
    console.log("📏 Response length:", text.length);
    console.log("📄 First 200 chars:", text.substring(0, 200));

    // Parse the JSON response
    // Note: The AI might include markdown formatting, so we need to extract the JSON
    console.log("🔧 Extracting JSON from response...");
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.substring(jsonStart, jsonEnd);

    // Validate that we have a valid JSON string
    if (jsonString.length === 0) {
      console.error("❌ AI response did not contain valid JSON");
      console.error("📄 Full response:", text);
      throw new Error("AI response did not contain valid JSON");
    }

    console.log("📋 Extracted JSON length:", jsonString.length);
    console.log("🔧 Parsing JSON...");

    const parsedResponse = JSON.parse(jsonString);

    console.log("✅ JSON parsed successfully");
    console.log("📊 Lecture Title:", parsedResponse.title);
    console.log("📊 Video URL:", parsedResponse.videoUrl);
    console.log("📊 Has Transcript:", !!parsedResponse.transcript);
    console.log("📊 Has Cheat Sheet:", !!parsedResponse.cheatSheet);
    console.log("📊 Quiz Questions:", parsedResponse.quiz?.length || 0);

    // Validate that the response has the expected structure
    if (!parsedResponse.title || !parsedResponse.videoUrl || !parsedResponse.transcript || !parsedResponse.cheatSheet) {
      console.error("❌ AI response does not have the expected structure");
      console.error("📋 Missing fields:", {
        title: !parsedResponse.title,
        videoUrl: !parsedResponse.videoUrl,
        transcript: !parsedResponse.transcript,
        cheatSheet: !parsedResponse.cheatSheet
      });
      throw new Error("AI response does not have the expected structure");
    }

    console.log("✅ Successfully validated AI response");
    console.log("🌐 ========== API COMPLETE (SUCCESS) ==========\n");

    return NextResponse.json({ content: parsedResponse });

  } catch (error: any) {
    console.error("\n❌ ========== API ERROR ==========");
    console.error("🚨 Error in lecture content generation:", error);
    console.error("📋 Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    console.error("🌐 ========== API ERROR END ==========\n");

    // Return a fallback response in case of error
    console.log("⚠️ USING FALLBACK LECTURE CONTENT");
    const fallbackContent = getDefaultLectureContent("Lecture", "Course", "General");
    console.log("📊 Fallback content created");

    return NextResponse.json(
      {
        content: getDefaultLectureContent("Introduction to Lecture", "General Course", "General Field")
      },
      { status: 200 }
    );
  }
}

// Default lecture content for fallback
function getDefaultLectureContent(lectureTitle: string, courseTitle: string, careerField: string): LectureContent {
  // Use a generic educational video as fallback instead of a meme
  const fallbackVideoUrl = 'https://www.youtube.com/embed/O_9u1P5Yj4Q'; // Generic educational content

  return {
    id: 'default',
    title: lectureTitle,
    description: `Learn the fundamentals of ${lectureTitle}`,
    videoUrl: fallbackVideoUrl,
    transcript: `This is a placeholder transcript for the lecture on ${lectureTitle}.

The AI content generation is currently unavailable. This lecture would normally contain:

1. Introduction to ${lectureTitle}
2. Core concepts and principles
3. Practical examples and demonstrations
4. Best practices and common patterns
5. Real-world applications

Please check back later or contact support if this issue persists.`,
    cheatSheet: `## ${lectureTitle} - Cheat Sheet

### Overview
This cheat sheet covers the fundamentals of ${lectureTitle} in the context of ${courseTitle}.

### Key Concepts
- Fundamental principles of ${lectureTitle}
- Core techniques and best practices
- Common patterns and approaches
- Industry-standard methodologies

### Pro Tips
- Start with simple examples to build understanding
- Practice regularly to reinforce concepts
- Seek feedback from peers and mentors
- Build projects to apply what you learn
- Join communities to learn from others

### Common Pitfalls
- Don't skip fundamentals in favor of advanced topics
- Avoid copying code without understanding it
- Don't neglect testing and validation
- Remember to document your learning journey

### Next Steps
1. Watch the video lecture carefully
2. Take notes on key concepts
3. Complete the practice exercises
4. Review the cheat sheet regularly
5. Apply concepts in real projects`,
    quiz: [
      {
        question: `What is the most important aspect of learning ${lectureTitle}?`,
        options: [
          "Memorizing syntax and commands",
          "Understanding core concepts and principles",
          "Watching videos without practice",
          "Reading documentation only"
        ],
        correctAnswer: "Understanding core concepts and principles",
        explanation: "Understanding concepts is more important than memorizing syntax. It allows you to apply knowledge in different contexts and solve new problems."
      },
      {
        question: `What is the best way to master ${lectureTitle}?`,
        options: [
          "Watch videos only",
          "Read theory only",
          "Combine theory with hands-on practice",
          "Copy code from others"
        ],
        correctAnswer: "Combine theory with hands-on practice",
        explanation: "The most effective learning combines theoretical understanding with practical application through projects and exercises."
      }
    ],
    courseTitle: courseTitle
  };
}