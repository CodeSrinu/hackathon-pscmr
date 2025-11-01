// src/app/api/learning-module/lecture/route.ts
import { NextResponse } from 'next/server';
import { POST as generateLectureContent } from './content-route';

interface LectureRequest {
  lectureId: string;
  moduleId: string;
  moduleName: string;
  lectureTitle?: string;
  userId: string;
}

interface LectureContent {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  transcript: string;
  cheatSheet: string;
  duration?: string;
  moduleId: string;
  moduleName: string;
}

export async function POST(request: Request) {
  try {
    console.log("\n🌐 ========== API: /api/learning-module/lecture ==========");

    // Parse the request body
    const body: LectureRequest = await request.json();

    console.log("📥 Request body received");
    console.log("📝 Lecture ID:", body.lectureId);
    console.log("📝 Module ID:", body.moduleId);
    console.log("📝 Module Name:", body.moduleName);
    console.log("📝 Lecture Title:", body.lectureTitle);

    // Validate input
    if (!body.lectureId || !body.moduleId || !body.moduleName) {
      console.error("❌ Validation failed: Missing required fields");
      console.error("🌐 ========== API COMPLETE (VALIDATION ERROR) ==========\n");
      return NextResponse.json(
        { error: 'Missing required fields: lectureId, moduleId, moduleName' },
        { status: 400 }
      );
    }

    // Get career field from localStorage (passed from client)
    const careerField = (body as any).careerField || 'General';
    console.log("📝 Career Field:", careerField);

    console.log("🔄 Delegating to content generation route...");

    // Call the content generation API instead of using mock data
    // We need to transform the request to match the content-route interface
    const contentRequest = new Request(request, {
      body: JSON.stringify({
        lectureId: body.lectureId,
        lectureTitle: body.lectureTitle || body.moduleName, // Use specific lecture title if available, fallback to module name
        courseTitle: body.moduleName,
        careerField: careerField, // Pass the career field from client
        userId: body.userId || 'default-user'
      })
    });
    
    const contentResponse = await generateLectureContent(contentRequest);
    console.log("📥 Content generation response status:", contentResponse.status);

    const contentData = await contentResponse.json();
    console.log("✅ Content data received");
    console.log("📊 Has content:", !!contentData.content);

    // Transform the content data to match our expected format
    const lectureContent: LectureContent = {
      id: contentData.content?.id || body.lectureId,
      title: contentData.content?.title || body.lectureTitle || 'Lecture',
      description: contentData.content?.description || `Learn about ${body.moduleName}`,
      videoUrl: contentData.content?.videoUrl || '',
      transcript: contentData.content?.transcript || 'Transcript not available',
      cheatSheet: contentData.content?.cheatSheet || 'Cheat sheet not available',
      duration: contentData.content?.duration || '15 minutes',
      moduleId: body.moduleId,
      moduleName: body.moduleName
    };

    console.log("📊 Lecture content prepared:");
    console.log("  - Title:", lectureContent.title);
    console.log("  - Video URL:", lectureContent.videoUrl);
    console.log("  - Has Transcript:", lectureContent.transcript !== 'Transcript not available');
    console.log("  - Has Cheat Sheet:", lectureContent.cheatSheet !== 'Cheat sheet not available');
    console.log("✅ Returning lecture content");
    console.log("🌐 ========== API COMPLETE (SUCCESS) ==========\n");

    return NextResponse.json(lectureContent);

  } catch (error: any) {
    console.error("\n❌ ========== API ERROR ==========");
    console.error("🚨 Error in lecture API:", error);
    console.error("📋 Error details:", {
      message: error.message,
      stack: error.stack
    });
    
    // Fallback to mock data if content generation fails
    console.log("USING FALLBACK MOCK DATA");
    const mockLecture: LectureContent = {
      id: 'default',
      title: 'Semantic HTML Elements',
      description: 'Learn the fundamentals of semantic HTML for better accessibility and SEO',
      videoUrl: 'https://www.youtube.com/embed/O_9u1P5Yj4Q',
      transcript: `Semantic HTML elements are those that clearly describe their meaning in a human- and machine-readable way. They make web pages more accessible, SEO-friendly, and easier to maintain.
          
Key Structural Elements:
• <header>: Represents introductory content for a section or the entire page.
• <nav>: Contains navigation links.
• <main>: Specifies the main, dominant content of the document.
• <article>: Represents a self-contained composition (e.g., blog post, news article).
• <section>: A thematic grouping of content.
• <aside>: Content that is tangentially related to the content around it (e.g., a sidebar).
• <footer>: Represents a footer for a section or the entire page.

Example Usage:
<body>
  <header>...</header>
  <nav>...</nav>
  <main>
    <article>
      <h1>Article Title</h1>
      <p>Article content...</p>
    </article>
  </main>
  <footer>...</footer>
</body>`,
      cheatSheet: `## Semantic HTML Elements - Cheat Sheet

### What are Semantic Elements?
Semantic HTML elements clearly describe their meaning to both browsers and developers.

### Benefits:
• Improved Accessibility: Screen readers can better interpret content
• Better SEO: Search engines understand the page structure
• Easier Maintenance: Code is more readable and organized

### Essential Semantic Elements:

#### Document Structure
<header> - Introductory content
<nav> - Navigation links
<main> - Primary content (only one per page)
<article> - Self-contained content
<section> - Thematic grouping
<aside> - Related but separate content
<footer> - Footer information

#### Content Sectioning
<h1>-<h6> - Headings (proper hierarchy important)
<figure> - Self-contained content like images
<figcaption> - Caption for figure element

#### Text Content
<p> - Paragraph
<blockquote> - Quotation
<pre> - Preformatted text
<code> - Inline code snippet

### Best Practices:
1. Always use proper heading hierarchy
2. Don't use divs when semantic elements are available
3. Use landmark elements for accessibility
4. Validate your HTML markup

### Common Mistakes to Avoid:
❌ Using <div> for everything
❌ Skipping heading levels (e.g., h1 to h3)
❌ Misusing <section> instead of <div>
❌ Ignoring accessibility attributes`,
      duration: '15 minutes',
      moduleId: 'default',
      moduleName: 'HTML Fundamentals'
    };
    
    return NextResponse.json(mockLecture);
  }
}