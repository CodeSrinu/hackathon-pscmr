// src/app/learning-module/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SuspenseWrapper from '@/components/SuspenseWrapper';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  progress: number; // 0-100
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

export default function LearningModulePage() {
  return (
    <SuspenseWrapper>
      <LearningModulePageContent />
    </SuspenseWrapper>
  );
}

function LearningModulePageContent() {
  console.log("LearningModulePage component mounting");
  const router = useRouter();
  const searchParams = useSearchParams();
  const nodeId = searchParams?.get('nodeId') || '';
  const roleId = searchParams?.get('roleId') || '';
  const roleName = searchParams?.get('roleName') || '';
  const domainId = searchParams?.get('domainId') || '';
  const nodeTitle = searchParams?.get('nodeTitle') || '';
  
  const [learningModule, setLearningModule] = useState<LearningModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  console.log("Component rendered with learningModule:", learningModule);

  useEffect(() => {
    console.log("useEffect called with:", { nodeId, roleId, roleName, domainId });
    console.log("Looking for nodeId:", nodeId);
    const loadLearningModule = async () => {
      try {
        console.log("\n🎯 ========== CLIENT: Loading Learning Module ==========");
        console.log("📝 Node ID:", nodeId);
        console.log("📝 Role ID:", roleId);
        console.log("📝 Role Name:", roleName);
        console.log("📝 Domain ID:", domainId);
        console.log("📝 Node Title (from URL):", nodeTitle);

        console.log("🔄 Setting loading state to true...");
        setLoading(true);
        setError(null);

        // First, we need to get the node title from the roadmap
        // In a real implementation, this would be stored in context or passed as a parameter
        // For now, we'll try to get it from localStorage or use a fallback
        let courseTitle = nodeTitle || 'Course Title'; // Use nodeTitle from URL or default fallback

        // Try to get the roadmap data from localStorage
        try {
          console.log("💾 Attempting to retrieve roadmap from localStorage...");
          const storedRoadmap = localStorage.getItem('careerQuest_roadmap');

          if (storedRoadmap) {
            console.log("✅ Found stored roadmap");
            const roadmapData = JSON.parse(storedRoadmap);
            console.log("📊 Roadmap units count:", roadmapData.units?.length || 0);

            // Search for the node with matching nodeId in all units
            console.log("🔍 Searching for node with ID:", nodeId);
            for (const unit of roadmapData.units) {
              const node = unit.nodes.find((n: any) => n.id === nodeId);
              if (node) {
                courseTitle = node.title;
                console.log("✅ Found matching node!");
                console.log("📝 Course Title:", courseTitle);
                break;
              }
            }
          } else {
            console.warn("⚠️ No stored roadmap found in localStorage");
          }
        } catch (err) {
          console.warn('⚠️ Could not retrieve roadmap from localStorage:', err);
        }

        console.log("📝 Final course title:", courseTitle);

        // Check localStorage cache for course roadmap
        const cacheKey = `courseRoadmap_${nodeId}_${roleName}`;
        const cachedRoadmap = localStorage.getItem(cacheKey);

        let data;

        if (cachedRoadmap) {
          console.log("💾 Found cached course roadmap in localStorage");
          try {
            const parsedCache = JSON.parse(cachedRoadmap);
            const cacheAge = Date.now() - (parsedCache.timestamp || 0);
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours

            if (cacheAge < maxAge) {
              console.log("✅ Cache is fresh (age:", Math.round(cacheAge / 1000 / 60), "minutes)");
              console.log("📦 Using cached roadmap data");
              data = parsedCache.data;
            } else {
              console.log("⚠️ Cache expired (age:", Math.round(cacheAge / 1000 / 60 / 60), "hours)");
              localStorage.removeItem(cacheKey);
              data = null;
            }
          } catch (parseError) {
            console.error("❌ Error parsing cached roadmap:", parseError);
            localStorage.removeItem(cacheKey);
            data = null;
          }
        }

        // If no valid cache, fetch from API
        if (!data) {
          console.log("📤 Calling /api/course-roadmap...");

          // Call our API to generate the course roadmap (Phase 1 - AI Architect)
          const response = await fetch('/api/course-roadmap', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              courseId: nodeId,
              courseTitle: courseTitle,
              careerField: roleName
            }),
          });

          console.log("📥 Course Roadmap API response status:", response.status);
          console.log("📥 Response OK:", response.ok);

          if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ API request failed:", errorText);
            throw new Error(`Failed to load course roadmap: ${response.status}`);
          }

          data = await response.json();

          // Save to localStorage cache
          try {
            const cacheData = {
              data: data,
              timestamp: Date.now(),
              version: '1.0'
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
            console.log("💾 Saved course roadmap to localStorage cache");
          } catch (storageError) {
            console.warn("⚠️ Failed to save to localStorage:", storageError);
            // Continue anyway - caching is optional
          }
        }

        console.log("✅ Received course roadmap data:");
        console.log("📊 Course Title:", data.roadmap?.courseTitle);
        console.log("📊 Syllabus items count:", data.roadmap?.syllabus?.length || 0);

        // Transform the course roadmap data to our internal format
        console.log("🔧 Transforming syllabus to internal format...");
        const transformedModules = data.roadmap.syllabus.map((unit: any, index: number) => {
          // Map the unit type to our internal module type
          let moduleType: 'lecture' | 'cheat-sheet' | 'quiz' | 'assignment' = 'assignment';

          switch (unit.type) {
            case 'lecture':
              moduleType = 'lecture';
              break;
            case 'cheat-sheet':
              moduleType = 'cheat-sheet';
              break;
            case 'quiz':
              moduleType = 'quiz';
              break;
            case 'task':
              moduleType = 'assignment';
              break;
            default:
              moduleType = 'assignment';
          }

          console.log(`📦 Transforming item ${index + 1}: ${unit.type} -> ${moduleType} (${unit.title})`);

          return {
            id: unit.id || `unit_${index}`,
            type: moduleType,
            title: unit.title,
            description: unit.problemStatement || unit.description || `Learn ${unit.title}`,
            duration: unit.duration || '20 min', // This would be dynamically determined
            status: index === 0 ? 'available' : 'locked' // Only first item is available initially
          };
        });

        console.log("✅ Successfully transformed", transformedModules.length, "modules");

        const transformedModule: LearningModule = {
          id: nodeId,
          title: data.roadmap.courseTitle,
          description: `A comprehensive guide to ${data.roadmap.courseTitle}.`,
          duration: '2 weeks', // This would be dynamically determined
          difficulty: 'beginner', // This would be dynamically determined
          progress: 0, // Start at 0% since this is a new course
          modules: transformedModules
        };

        console.log("✅ Setting learning module state...");
        setLearningModule(transformedModule);
        console.log("🎯 ========== CLIENT: Learning Module Loaded Successfully ==========\n");
        setLoading(false);
      } catch (err: any) {
        console.error("\n❌ ========== CLIENT: Error Loading Learning Module ==========");
        console.error('🚨 Error:', err);
        console.error('📋 Error message:', err.message);

        setError('Failed to load the learning module. Please try again.');

        // Fallback to mock data
        console.log("⚠️ Using fallback mock data...");
        const mockModule: LearningModule = {
          id: nodeId,
          title: 'HTML & CSS Deep Dive',
          description: 'A comprehensive guide to modern web development.',
          duration: '2 weeks',
          difficulty: 'beginner',
          progress: 0,
          modules: [
            {
              id: 'lec_1',
              type: 'lecture',
              title: 'Semantic HTML & The DOM',
              description: 'Learn the fundamentals of semantic HTML tags and the Document Object Model.',
              duration: '20 min',
              status: 'available'
            },
            {
              id: 'task_1',
              type: 'assignment',
              title: 'Task: Build a Sign-Up Form',
              description: 'Create a responsive sign-up form using semantic HTML elements.',
              duration: '30 min',
              status: 'locked'
            },
            {
              id: 'lec_2',
              type: 'lecture',
              title: 'HTML Forms & Input Tags',
              description: 'Master HTML forms and various input types for user interaction.',
              duration: '25 min',
              status: 'locked'
            },
            {
              id: 'task_2',
              type: 'assignment',
              title: 'Task: Create a Contact Page',
              description: 'Build a complete contact page with form validation.',
              duration: '35 min',
              status: 'locked'
            }
          ]
        };

        console.log("📊 Mock module has", mockModule.modules.length, "items");
        console.log("✅ Setting mock learning module...");
        setLearningModule(mockModule);
        console.error("🎯 ========== CLIENT: Error Handled with Fallback ==========\n");
        setLoading(false);
      }
    };
    
    if (nodeId) {
      loadLearningModule();
    } else {
      setError('No module specified');
    }
    
    // Cleanup function
    return () => {
      console.log("useEffect cleanup called");
    };
  }, [nodeId, roleId, roleName, domainId]);

  const handleBack = () => {
    console.log("\n🔙 ========== NAVIGATION: Back Button Clicked (Learning Module) ==========");
    console.log("📝 Current Node ID:", nodeId);
    console.log("📝 Current Role ID:", roleId);

    // Navigate back to career quest roadmap
    console.log("🔄 Navigating back to career quest roadmap...");
    router.push('/career-quest-roadmap');

    console.log("✅ Navigation initiated");
    console.log("🔙 ========== NAVIGATION COMPLETE ==========\n");
  };

  const handleStartModule = (moduleId: string, moduleType: string) => {
    console.log("\n🚀 ========== NAVIGATION: Starting Module ==========");
    console.log("📝 Module ID:", moduleId);
    console.log("📝 Module Type:", moduleType);

    // Save navigation context to localStorage for back button
    try {
      const navigationData = {
        nodeId,
        roleId,
        roleName,
        domainId,
        nodeTitle,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('currentRoadmapData', JSON.stringify(navigationData));
      console.log("💾 Saved navigation data to localStorage");
      console.log("📊 Navigation data:", navigationData);
    } catch (e) {
      console.warn("⚠️ Could not save navigation data:", e);
    }

    // Navigate to the specific module type page with proper parameters
    // Map our internal types to the actual directory names
    const pathMap: Record<string, string> = {
      'lecture': 'video-lecture',
      'cheat-sheet': 'cheat-sheet',
      'quiz': 'quiz',
      'project': 'tasks-projects',
      'assignment': 'tasks-projects'
    };

    const actualPath = pathMap[moduleType] || 'video-lecture';
    const basePath = `/learning-module/${actualPath}`;

    // Find the module in our data to get its title and other details
    const module = learningModule?.modules.find(m => m.id === moduleId);

    if (module) {
      const params = new URLSearchParams({
        moduleId: moduleId,
        moduleName: learningModule?.title || '',
        [`${module.type}Id`]: moduleId, // Specific ID for the module type
        title: module.title,
        description: module.description || ''
      }).toString();

      console.log("🔄 Navigating to:", `${basePath}?${params}`);
      router.push(`${basePath}?${params}`);
    } else {
      // Fallback if we can't find the module
      console.log("⚠️ Module not found, using fallback navigation");
      router.push(`${basePath}?moduleId=${moduleId}`);
    }

    console.log("🚀 ========== NAVIGATION COMPLETE ==========\n");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center p-4">
            <div className="text-gray-800 flex size-10 shrink-0 items-center justify-center rounded-full">
              <div className="w-6 h-6 border-t-2 border-b-2 border-green-500 rounded-full animate-spin"></div>
            </div>
            <h1 className="text-gray-800 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">
              Loading Module
            </h1>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="p-4 flex-grow">
          <div className="pt-4 pb-6 text-center">
            <h2 className="text-gray-800 tracking-tight text-2xl font-bold leading-tight pb-2">
              Preparing Your Learning Content
            </h2>
            <p className="text-gray-600 text-base font-normal leading-normal">
              Getting your personalized learning module ready...
            </p>
          </div>
          
          {/* Module Skeleton */}
          <div className="space-y-4 mt-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse"></div>
                </div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
                <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div>
              </div>
            ))}
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Module</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            onClick={handleBack}
          >
            Back to Roadmap
          </button>
        </div>
      </div>
    );
  }

  if (!learningModule) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Module Not Found</h1>
          <p className="text-gray-600 mb-6">The requested learning module could not be found.</p>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            onClick={handleBack}
          >
            Back to Roadmap
          </button>
        </div>
      </div>
    );
  }

  // Get icon for module type
  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'lecture':
        return 'play_circle';
      case 'cheat-sheet':
        return 'description';
      case 'quiz':
        return 'help_outline';
      case 'project':
      case 'assignment':
        return 'assignment';
      default:
        return 'school';
    }
  };

  // Get icon color based on status
  const getIconColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500 bg-green-50';
      case 'available':
        return 'text-green-500 bg-green-50';
      case 'locked':
        return 'text-gray-400 bg-gray-100';
      default:
        return 'text-gray-400 bg-gray-100';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'check_circle';
      case 'available':
        return 'play_circle';
      case 'locked':
        return 'lock';
      default:
        return 'lock';
    }
  };

  // Get status icon color
  const getStatusIconColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'available':
        return 'text-green-500';
      case 'locked':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  // Map our module types to directory names for navigation
  const getModuleTypePath = (type: string) => {
    switch (type) {
      case 'lecture':
        return 'video-lecture';
      case 'cheat-sheet':
        return 'cheat-sheet';
      case 'quiz':
        return 'quiz';
      case 'project':
        return 'tasks-projects';
      case 'assignment':
        return 'tasks-projects';
      default:
        return 'video-lecture';
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col justify-between group/design-root overflow-x-hidden" style={{ fontFamily: "'Space Grotesk', 'Noto Sans', sans-serif" }}>
      <div className="flex-grow">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center p-4">
            <button 
              onClick={handleBack}
              className="text-gray-800 flex size-10 shrink-0 items-center justify-center rounded-full"
              aria-label="Back"
            >
              <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
              </svg>
            </button>
            <h1 className="text-gray-800 text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">
              {learningModule.title}
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 @container">
          {/* Progress Card */}
          <div className="mb-6 rounded-xl bg-green-50 p-5 shadow-sm">
            <div className="flex items-center gap-5">
              {/* Progress Circle */}
              <div className="relative size-24">
                <svg className="size-full" height="36" viewBox="0 0 36 36" width="36" xmlns="http://www.w3.org/2000/svg">
                  <circle className="stroke-gray-200" cx="18" cy="18" fill="none" r="16" strokeWidth="3"></circle>
                  <circle 
                    className="stroke-green-500" 
                    cx="18" 
                    cy="18" 
                    fill="none" 
                    r="16" 
                    strokeDasharray="100" 
                    strokeDashoffset={100 - learningModule.progress} 
                    strokeLinecap="round" 
                    strokeWidth="3" 
                    transform="rotate(-90 18 18)"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold text-gray-800">{learningModule.progress}%</span>
                  <span className="text-xs text-gray-600">Complete</span>
                </div>
              </div>
              
              {/* Module Info */}
              <div className="flex-1">
                <h2 className="text-gray-800 text-xl font-bold leading-tight tracking-[-0.015em]">
                  Course Dashboard
                </h2>
                <p className="text-gray-600 text-sm font-normal leading-normal mt-1">
                  {learningModule.description}
                </p>
              </div>
            </div>
          </div>

          {/* Learning Modules List - Phase 2 items */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800">Learning Path</h3>
            {learningModule.modules.map((module) => (
              <div 
                key={module.id}
                className={`flex cursor-pointer items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md ${
                  module.status === 'locked' ? 'opacity-70' : ''
                }`}
                onClick={() => module.status !== 'locked' && handleStartModule(module.id, getModuleTypePath(module.type))}
              >
                {/* Module Icon */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${getIconColor(module.status)}`}>
                  <span className="material-symbols-outlined">
                    {getModuleIcon(module.type)}
                  </span>
                </div>
                
                {/* Module Info */}
                <div className="flex-1">
                  <p className={`text-base font-medium leading-normal ${
                    module.status === 'locked' ? 'text-gray-500' : 'text-gray-800'
                  }`}>
                    {module.title}
                  </p>
                  {module.description && (
                    <p className={`text-sm mt-1 ${
                      module.status === 'locked' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {module.description}
                    </p>
                  )}
                  {module.duration && (
                    <div className="flex items-center mt-1">
                      <span className="material-symbols-outlined text-gray-400 text-sm mr-1">schedule</span>
                      <span className="text-xs text-gray-500">{module.duration}</span>
                    </div>
                  )}
                </div>
                
                {/* Status Icon */}
                <span className={`material-symbols-outlined text-2xl ${getStatusIconColor(module.status)}`}>
                  {getStatusIcon(module.status)}
                </span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}