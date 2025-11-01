// src/app/learning-module/assignment/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SuspenseWrapper from '@/components/SuspenseWrapper';

interface Assignment {
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

export default function AssignmentPage() {
  return (
    <SuspenseWrapper>
      <AssignmentPageContent />
    </SuspenseWrapper>
  );
}

function AssignmentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = searchParams?.get('assignmentId') || '';
  const moduleId = searchParams?.get('moduleId') || '';
  const moduleName = searchParams?.get('moduleName') || '';
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    const loadAssignment = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Loading assignment:", { assignmentId, moduleId, moduleName });
        
        // Call our API to get the assignment content
        const response = await fetch('/api/learning-module/assignment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            assignmentId,
            moduleId,
            moduleName,
            userId: 'default-user' // This would be dynamically determined
          }),
        });
        
        console.log("Assignment API response status:", response.status);
        
        if (!response.ok) {
          throw new Error('Failed to load assignment content');
        }
        
        const data = await response.json();
        console.log("Received assignment data:", data);
        
        const assignmentData: Assignment = {
          id: data.id || assignmentId,
          title: data.title || 'Assignment',
          description: data.description || 'Complete this assignment',
          type: data.type || 'assignment',
          difficulty: data.difficulty || 'beginner',
          estimatedTime: data.estimatedTime || '1 hour',
          requirements: data.requirements || [],
          instructions: data.instructions || [],
          resources: data.resources || [],
          moduleId: data.moduleId || moduleId,
          moduleName: data.moduleName || moduleName
        };
        
        setAssignment(assignmentData);
      } catch (err: any) {
        console.error('Error loading assignment:', err);
        setError('Failed to load the assignment. Please try again.');
        
        // Fallback to mock data
        const mockAssignment: Assignment = {
          id: assignmentId,
          title: 'Create a Semantic HTML Portfolio',
          description: 'Build a portfolio website using semantic HTML elements to demonstrate your understanding of proper document structure',
          type: 'assignment',
          difficulty: 'beginner',
          estimatedTime: '1 hour',
          moduleId,
          moduleName,
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
        
        setAssignment(mockAssignment);
      } finally {
        setLoading(false);
      }
    };
    
    if (assignmentId) {
      loadAssignment();
    } else {
      setError('No assignment specified');
    }
  }, [assignmentId, moduleId, moduleName]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerActive) {
      interval = setInterval(() => {
        setTimeElapsed(time => time + 1);
      }, 60000); // Update every minute
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  const handleBack = () => {
    console.log("\n🔙 ========== NAVIGATION: Back Button Clicked (Assignment) ==========");
    console.log("📝 Current Assignment ID:", assignmentId);
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

  const handleStartTimer = () => {
    setTimerActive(true);
  };

  const handleStopTimer = () => {
    setTimerActive(false);
  };

  const handleResetTimer = () => {
    setTimeElapsed(0);
    setTimerActive(false);
  };

  const handleSubmit = () => {
    // In a real implementation, this would submit the completed assignment
    alert('Assignment submitted successfully!');
    // Navigate to the next activity
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <button 
            onClick={handleBack}
            className="flex items-center justify-center p-2 text-gray-800"
            aria-label="Back"
          >
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-gray-800">Loading Assignment...</h1>
          <div className="w-8"></div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-28">
          <div className="p-6 space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                  <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Assignment</h1>
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

  if (!assignment) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Assignment Not Found</h1>
          <p className="text-gray-600 mb-6">The requested assignment could not be found.</p>
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
    <div className="flex h-screen flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <button 
          onClick={handleBack}
          className="flex items-center justify-center p-2 text-gray-800"
          aria-label="Back"
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-800 truncate px-2">
          {assignment.type === 'assignment' ? 'Assignment' : 'Homework'}: {assignment.title}
        </h1>
        <div className="w-8"></div>
      </header>

      {/* Timer Bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-green-500 mr-2">schedule</span>
            <span className="text-sm font-medium text-gray-700">
              {formatTime(timeElapsed)} / {assignment.estimatedTime}
            </span>
          </div>
          <div className="flex space-x-2">
            {!timerActive ? (
              <button
                onClick={handleStartTimer}
                className="flex items-center text-sm font-medium text-green-600 hover:text-green-800"
              >
                <span className="material-symbols-outlined mr-1">play_arrow</span>
                Start
              </button>
            ) : (
              <button
                onClick={handleStopTimer}
                className="flex items-center text-sm font-medium text-red-600 hover:text-red-800"
              >
                <span className="material-symbols-outlined mr-1">pause</span>
                Pause
              </button>
            )}
            <button
              onClick={handleResetTimer}
              className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-800"
            >
              <span className="material-symbols-outlined mr-1">replay</span>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-28">
        <div className="p-6">
          {/* Difficulty Badge */}
          <div className="mb-4">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              assignment.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
              assignment.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              <span className="material-symbols-outlined mr-1">
                {assignment.difficulty === 'beginner' ? 'spa' :
                 assignment.difficulty === 'intermediate' ? 'fitness_center' :
                 'bolt'}
              </span>
              {assignment.difficulty.charAt(0).toUpperCase() + assignment.difficulty.slice(1)}
            </span>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Description</h2>
            <p className="text-gray-700">{assignment.description}</p>
          </div>

          {/* Requirements */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Requirements</h2>
            <ul className="space-y-2">
              {assignment.requirements.map((req, index) => (
                <li key={index} className="flex items-start">
                  <span className="material-symbols-outlined text-green-500 mr-2 mt-0.5">check_circle</span>
                  <span className="text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Instructions</h2>
            <ol className="space-y-3">
              {assignment.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center mr-2 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Resources */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Resources</h2>
            <ul className="space-y-2">
              {assignment.resources.map((resource, index) => (
                <li key={index}>
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-green-600 hover:text-green-800 hover:underline"
                  >
                    <span className="material-symbols-outlined mr-2">link</span>
                    <span>{resource.title}</span>
                    <span className="material-symbols-outlined ml-1 text-xs">open_in_new</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Submission Area */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Submit Your Work</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex">
                <span className="material-symbols-outlined text-blue-500 mr-2">info</span>
                <p className="text-blue-800">
                  When you've completed this {assignment.type}, upload your files or provide a link to your work.
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="submission" className="block text-sm font-medium text-gray-700 mb-1">
                Link to your work or files
              </label>
              <input
                type="text"
                id="submission"
                placeholder="https://github.com/yourusername/your-assignment"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Any challenges you faced, what you learned, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              ></textarea>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed inset-x-0 bottom-0 z-10 bg-white/80 p-4 backdrop-blur-sm border-t border-gray-200">
        <button 
          onClick={handleSubmit}
          className="w-full rounded-full bg-green-500 py-4 px-5 text-center text-base font-bold text-white shadow-lg transition-transform duration-200 ease-in-out hover:scale-105 active:scale-100"
        >
          Submit {assignment.type === 'assignment' ? 'Assignment' : 'Homework'} →
        </button>
      </footer>
    </div>
  );
}