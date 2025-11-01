// src/app/learning-module/tasks-projects/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SuspenseWrapper from '@/components/SuspenseWrapper';

interface TaskProject {
  id: string;
  title: string;
  description: string;
  type: 'task' | 'project';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  requirements: string[];
  instructions: string[];
  resources: { title: string; url: string }[];
  moduleId: string;
  moduleName: string;
}

export default function TasksProjectsPage() {
  return (
    <SuspenseWrapper>
      <TasksProjectsPageContent />
    </SuspenseWrapper>
  );
}

function TasksProjectsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams?.get('taskId') || '';
  const projectId = searchParams?.get('projectId') || '';
  const moduleId = searchParams?.get('moduleId') || '';
  const moduleName = searchParams?.get('moduleName') || '';
  
  const [taskProject, setTaskProject] = useState<TaskProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    const loadTaskProject = async () => {
      try {
        console.log("\n🎯 ========== CLIENT: Loading Task/Project ==========");
        setLoading(true);
        setError(null);

        console.log("📝 Task ID:", taskId);
        console.log("📝 Project ID:", projectId);
        console.log("📝 Module ID:", moduleId);
        console.log("📝 Module Name:", moduleName);

        // Determine which ID to use (taskId or projectId)
        const itemId = taskId || projectId;
        if (!itemId) {
          console.error("❌ No task or project ID specified");
          throw new Error('No task or project ID specified');
        }

        console.log("📝 Using Item ID:", itemId);
        console.log("📤 Calling /api/learning-module/project...");

        // Call our API to get the task/project content
        const response = await fetch('/api/learning-module/project', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId: itemId,
            moduleId,
            moduleName,
            userId: 'default-user'
          }),
        });

        console.log("📥 Task/Project API response status:", response.status);

        if (!response.ok) {
          console.error("❌ Task/Project API returned error status:", response.status);
          throw new Error('Failed to load task/project content');
        }

        const data = await response.json();
        console.log("✅ Received task/project data");
        console.log("📊 Title:", data.title);
        console.log("📊 Type:", data.type);
        
        const taskProjectData: TaskProject = {
          id: data.id || itemId,
          title: data.title || 'Task/Project',
          description: data.description || 'Complete this task/project',
          type: data.type || (taskId ? 'task' : 'project'),
          difficulty: data.difficulty || 'beginner',
          estimatedTime: data.estimatedTime || '2 hours',
          requirements: data.requirements || [],
          instructions: data.instructions || [],
          resources: data.resources || [],
          moduleId: data.moduleId || moduleId,
          moduleName: data.moduleName || moduleName
        };

        console.log("✅ Setting task/project state...");
        setTaskProject(taskProjectData);
        console.log("🎯 ========== CLIENT: Task/Project Loaded Successfully ==========\n");
      } catch (err: any) {
        console.error("\n❌ ========== CLIENT: Error Loading Task/Project ==========");
        console.error('🚨 Error:', err);
        console.error('📋 Error message:', err.message);
        setError('Failed to load the task/project. Please try again.');
        console.error("❌ ========== ERROR END ==========\n");
        
        // Fallback to mock data
        const mockTaskProject: TaskProject = {
          id: taskId || projectId,
          title: taskId ? 'Build a Personal Portfolio Website' : 'Create a Responsive Landing Page',
          description: taskId 
            ? 'Create a responsive personal portfolio website showcasing your skills and projects' 
            : 'Design and build a responsive landing page for a fictional product or service',
          type: taskId ? 'task' : 'project',
          difficulty: 'beginner',
          estimatedTime: '2 hours',
          moduleId,
          moduleName,
          requirements: taskId 
            ? [
                'Use semantic HTML elements',
                'Implement responsive design with CSS media queries',
                'Include a navigation menu',
                'Add a hero section with call-to-action',
                'Create an about section',
                'Showcase at least 3 projects or skills',
                'Include a contact form',
                'Make it mobile-friendly'
              ]
            : [
                'Use modern CSS (Flexbox/Grid)',
                'Implement a cohesive color scheme',
                'Add interactive elements with JavaScript',
                'Ensure cross-browser compatibility',
                'Optimize for performance',
                'Include accessibility features'
              ],
          instructions: taskId 
            ? [
                'Plan your portfolio structure and content',
                'Set up the basic HTML structure with semantic elements',
                'Style your portfolio with CSS, focusing on responsiveness',
                'Add interactive elements with JavaScript if desired',
                'Test your portfolio on different devices and browsers',
                'Deploy your portfolio to a hosting service'
              ]
            : [
                'Research similar landing pages for inspiration',
                'Create wireframes and design mockups',
                'Set up the HTML structure with semantic elements',
                'Implement the design with modern CSS techniques',
                'Add interactivity with JavaScript',
                'Test across different devices and browsers',
                'Optimize for performance and accessibility'
              ],
          resources: [
            { title: 'HTML5 Semantic Elements Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element' },
            { title: 'CSS Flexbox Tutorial', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/' },
            { title: 'Responsive Design Best Practices', url: 'https://developers.google.com/web/fundamentals/design-and-ux/responsive/' },
            { title: 'Web Accessibility Guidelines', url: 'https://www.w3.org/WAI/standards-guidelines/wcag/' }
          ]
        };
        
        setTaskProject(mockTaskProject);
      } finally {
        setLoading(false);
      }
    };
    
    if (taskId || projectId) {
      loadTaskProject();
    } else {
      setError('No task or project specified');
    }
  }, [taskId, projectId, moduleId, moduleName]);

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
    console.log("\n🔙 ========== NAVIGATION: Back Button Clicked (Tasks/Projects) ==========");
    console.log("📝 Current Project ID:", projectId);
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
    // In a real implementation, this would submit the completed task/project
    alert('Task/Project submitted successfully!');
    // Navigate to the next activity
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins}m`;
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
            <h1 className="text-xl font-bold text-center flex-grow -ml-8">Loading Task...</h1>
          </div>
        </header>
        <main className="flex-grow overflow-y-auto px-4 pb-24 pt-8">
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Task/Project</h1>
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

  if (!taskProject) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Task/Project Not Found</h1>
          <p className="text-gray-600 mb-6">The requested task or project could not be found.</p>
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
          <h1 className="text-xl font-bold text-center flex-grow -ml-8">
            {taskProject.type === 'task' ? 'Task' : 'Project'}: {taskProject.title}
          </h1>
        </div>
      </header>

      <div className="px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-green-500 mr-2">schedule</span>
            <span className="text-sm font-medium text-gray-700">
              {formatTime(timeElapsed)} / {taskProject.estimatedTime}
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

      <main className="flex-grow overflow-y-auto px-4 pb-24 pt-8">
        <div className="p-6">
          <div className="mb-4">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              taskProject.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
              taskProject.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              <span className="material-symbols-outlined mr-1">
                {taskProject.difficulty === 'beginner' ? 'spa' :
                 taskProject.difficulty === 'intermediate' ? 'fitness_center' :
                 'bolt'}
              </span>
              {taskProject.difficulty.charAt(0).toUpperCase() + taskProject.difficulty.slice(1)}
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Description</h2>
            <p className="text-gray-700">{taskProject.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Requirements</h2>
            <ul className="space-y-2">
              {taskProject.requirements.map((req, index) => (
                <li key={index} className="flex items-start">
                  <span className="material-symbols-outlined text-green-500 mr-2 mt-0.5">check_circle</span>
                  <span className="text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Instructions</h2>
            <ol className="space-y-3">
              {taskProject.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center mr-2 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Resources</h2>
            <ul className="space-y-2">
              {taskProject.resources.map((resource, index) => (
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

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Submit Your Work</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex">
                <span className="material-symbols-outlined text-blue-500 mr-2">info</span>
                <p className="text-blue-800">
                  When you've completed this {taskProject.type}, upload your files or provide a link to your work.
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
                placeholder="https://github.com/yourusername/your-project"
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

      <footer className="p-4 sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-gray-200">
        <button 
          onClick={handleSubmit}
          className="w-full rounded-full bg-green-500 py-4 px-5 text-center text-base font-bold text-white shadow-lg transition-transform duration-200 ease-in-out hover:scale-105 active:scale-100"
        >
          Submit {taskProject.type === 'task' ? 'Task' : 'Project'} →
        </button>
      </footer>
    </div>
  );
}