// src/app/learning-module/cheat-sheet/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SuspenseWrapper from '@/components/SuspenseWrapper';

interface CheatSheet {
  id: string;
  title: string;
  content: string;
  duration?: string;
  moduleId: string;
  moduleName: string;
}

export default function CheatSheetPage() {
  return (
    <SuspenseWrapper>
      <CheatSheetPageContent />
    </SuspenseWrapper>
  );
}

function CheatSheetPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cheatSheetId = searchParams?.get('cheatSheetId') || '';
  const moduleId = searchParams?.get('moduleId') || '';
  const moduleName = searchParams?.get('moduleName') || '';
  
  const [cheatSheet, setCheatSheet] = useState<CheatSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCheatSheet = async () => {
      try {
        console.log("\n🎯 ========== CLIENT: Loading Cheat Sheet ==========");
        setLoading(true);
        setError(null);

        console.log("📝 Cheat Sheet ID:", cheatSheetId);
        console.log("📝 Module ID:", moduleId);
        console.log("📝 Module Name:", moduleName);

        // First, try to get cheat sheet from localStorage (passed from video lecture page)
        const storedLectureData = localStorage.getItem('currentLectureData');
        if (storedLectureData) {
          try {
            const lectureData = JSON.parse(storedLectureData);
            console.log("✅ Found lecture data in localStorage");
            console.log("📊 Has cheat sheet:", !!lectureData.cheatSheet);

            if (lectureData.cheatSheet && lectureData.cheatSheet !== 'Cheat sheet not available') {
              // Use the cheat sheet from the lecture data
              const cheatSheetData: CheatSheet = {
                id: cheatSheetId || lectureData.lectureId,
                title: `${lectureData.lectureTitle || moduleName} - Cheat Sheet`,
                content: lectureData.cheatSheet,
                duration: '10 minutes',
                moduleId: moduleId || lectureData.moduleId,
                moduleName: moduleName || lectureData.moduleName
              };

              console.log("✅ Using cheat sheet from lecture data");
              setCheatSheet(cheatSheetData);
              setLoading(false);
              console.log("🎯 ========== CLIENT: Cheat Sheet Loaded from Cache ==========\n");
              return;
            }
          } catch (e) {
            console.warn("⚠️ Failed to parse stored lecture data:", e);
          }
        }

        console.log("📤 Calling /api/learning-module/cheat-sheet...");

        // Call our API to get the cheat sheet content
        const response = await fetch('/api/learning-module/cheat-sheet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cheatSheetId,
            moduleId,
            moduleName,
            userId: 'default-user' // This would be dynamically determined
          }),
        });

        console.log("📥 Cheat Sheet API response status:", response.status);

        if (!response.ok) {
          throw new Error('Failed to load cheat sheet content');
        }

        const data = await response.json();
        console.log("✅ Received cheat sheet data");

        const cheatSheetData: CheatSheet = {
          id: data.id || cheatSheetId,
          title: data.title || 'Cheat Sheet',
          content: data.content || 'Content not available',
          duration: data.duration || '10 minutes',
          moduleId: data.moduleId || moduleId,
          moduleName: data.moduleName || moduleName
        };

        console.log("✅ Setting cheat sheet state...");
        setCheatSheet(cheatSheetData);
        console.log("🎯 ========== CLIENT: Cheat Sheet Loaded Successfully ==========\n");
      } catch (err: any) {
        console.error('Error loading cheat sheet:', err);
        setError('Failed to load the cheat sheet. Please try again.');
        
        // Fallback to mock data
        const mockCheatSheet: CheatSheet = {
          id: cheatSheetId,
          title: 'Semantic HTML Elements - Cheat Sheet',
          content: `## Semantic HTML Elements - Cheat Sheet

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
❌ Ignoring accessibility attributes

### Pro Tips from Industry Experts:
• Use <main> for your primary content and only once per page
• <article> is for standalone content that could be republished elsewhere
• <section> groups related content with a heading
• <aside> is perfect for sidebars, pull quotes, or related links
• Always validate your HTML with W3C Markup Validator`,
          duration: '10 minutes',
          moduleId,
          moduleName
        };
        
        setCheatSheet(mockCheatSheet);
      } finally {
        setLoading(false);
      }
    };
    
    if (cheatSheetId) {
      loadCheatSheet();
    } else {
      setError('No cheat sheet specified');
    }
  }, [cheatSheetId, moduleId, moduleName]);

  const handleBack = () => {
    console.log("\n🔙 ========== NAVIGATION: Back Button Clicked (Cheat Sheet) ==========");
    console.log("📝 Current Cheat Sheet ID:", cheatSheetId);
    console.log("📝 Current Module ID:", moduleId);
    console.log("📝 Current Module Name:", moduleName);

    // Try to get navigation context from localStorage
    try {
      const storedRoadmapData = localStorage.getItem('currentRoadmapData');
      if (storedRoadmapData) {
        const roadmapData = JSON.parse(storedRoadmapData);
        console.log("✅ Found roadmap navigation data in localStorage");
        console.log("📊 Navigation data:", roadmapData);

        // Navigate back to learning module with proper parameters
        const { nodeId, roleId, roleName, domainId, nodeTitle } = roadmapData;
        if (nodeId) {
          console.log("🔄 Navigating back to learning module with stored parameters...");
          router.push(`/learning-module?nodeId=${nodeId}&roleId=${roleId || ''}&roleName=${roleName || ''}&domainId=${domainId || ''}&nodeTitle=${encodeURIComponent(nodeTitle || '')}`);
          console.log("✅ Navigation initiated with explicit route");
          console.log("🔙 ========== NAVIGATION COMPLETE ==========\n");
          return;
        }
      }
    } catch (e) {
      console.warn("⚠️ Could not parse roadmap navigation data:", e);
    }

    // Fallback: Use router.back()
    console.log("🔄 Using router.back() as fallback...");
    router.back();
    console.log("✅ Navigation initiated");
    console.log("🔙 ========== NAVIGATION COMPLETE ==========\n");
  };

  const handleNext = () => {
    console.log("\n➡️ ========== NAVIGATION: Next Button Clicked (Cheat Sheet) ==========");
    console.log("📝 Current Cheat Sheet ID:", cheatSheetId);
    console.log("📝 Module ID:", moduleId);
    console.log("📝 Module Name:", moduleName);
    console.log("🔄 Navigating to quiz page...");
    router.push(`/learning-module/quiz?quizId=${cheatSheetId}&moduleId=${moduleId}&moduleName=${moduleName}`);
    console.log("✅ Navigation initiated");
    console.log("➡️ ========== NAVIGATION COMPLETE ==========\n");
  };

  if (loading) {
    return (
      <div className="flex h-screen flex-col bg-white">
        <header className="p-4 flex-shrink-0">
          <div className="flex items-center">
            <button 
              onClick={handleBack}
              className="text-gray-800"
            >
              <span className="material-symbols-outlined text-3xl">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold text-center flex-grow -ml-8">Loading Cheat Sheet...</h1>
          </div>
        </header>
        <main className="flex-grow flex flex-col px-4 space-y-4">
          <div className="p-6">
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            </div>
          </div>
        </main>
        <footer className="p-4 sticky bottom-0 bg-white">
          <div className="w-full rounded-full py-4 px-6 bg-gray-200 text-black text-lg font-bold animate-pulse">
            Loading...
          </div>
        </footer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Cheat Sheet</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            onClick={handleBack}
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  if (!cheatSheet) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Cheat Sheet Not Found</h1>
          <p className="text-gray-600 mb-6">The requested cheat sheet could not be found.</p>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            onClick={handleBack}
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-white" style={{ fontFamily: "'Space Grotesk', 'Noto Sans', sans-serif" }}>
      <header className="p-4 flex-shrink-0">
        <div className="flex items-center">
          <button 
            onClick={handleBack}
            className="text-gray-800"
          >
            <span className="material-symbols-outlined text-3xl">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-center flex-grow -ml-8">{cheatSheet.title}</h1>
        </div>
      </header>
      <main className="flex-grow overflow-y-auto px-4 pb-24">
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
              <span className="material-symbols-outlined mr-1 text-lg">schedule</span>
              {cheatSheet.duration}
            </span>
            <span className="text-sm text-gray-500">{moduleName}</span>
          </div>
          
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-base leading-relaxed font-sans bg-gray-50 p-4 rounded-lg text-gray-900 font-medium">
              {cheatSheet.content}
            </pre>
          </div>
        </div>
      </main>
      <footer className="p-4 sticky bottom-0 bg-white border-t border-gray-200">
        <button 
          onClick={handleNext}
          className="w-full rounded-full py-4 px-6 bg-green-500 text-black text-lg font-bold hover:bg-green-600 transition-colors"
        >
          Next: Take Quiz →
        </button>
      </footer>
    </div>
  );
}