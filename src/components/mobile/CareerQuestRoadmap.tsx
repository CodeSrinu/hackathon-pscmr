// src/components/mobile/CareerQuestRoadmap.tsx
'use client';

import { useState, useEffect } from 'react';

// Define TypeScript interfaces for our roadmap structure
interface RoadmapNode {
  id: string;
  type: 'course' | 'project' | 'reward' | 'final';
  title: string;
  description: string;
  duration?: string; // e.g., "2 weeks", "1 month"
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[]; // IDs of prerequisite nodes
  skills?: string[]; // Skills covered by this node
  status: 'locked' | 'available' | 'in-progress' | 'completed';
}

interface RoadmapUnit {
  id: string;
  title: string;
  description: string;
  nodes: RoadmapNode[];
}

interface CareerQuestRoadmapProps {
  roleId: string;
  roleName: string;
  domainId: string;
  startingLevel: number;
  assessmentData: {
    questions: any[];
    answers: Record<string, boolean>;
    openResponse: string;
  } | null;
  onBack: () => void;
  onStartNode: (nodeId: string) => void;
}

export default function CareerQuestRoadmap({ 
  roleId, 
  roleName, 
  domainId, 
  startingLevel,
  assessmentData,
  onBack, 
  onStartNode 
}: CareerQuestRoadmapProps) {
  const [units, setUnits] = useState<RoadmapUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("CareerQuestRoadmap mounted with:", { roleId, roleName, domainId });

  // Load roadmap from AI Architect API
  useEffect(() => {
    const loadRoadmap = async () => {
      try {
        console.log("\n🎯 ========== CLIENT: Loading Career Quest Roadmap ==========");
        console.log("📝 Role ID:", roleId);
        console.log("📝 Role Name:", roleName);
        console.log("📝 Domain ID:", domainId);
        console.log("📊 Starting Level:", startingLevel);
        console.log("📊 Has Assessment Data:", !!assessmentData);

        console.log("🔄 Setting loading state to true...");
        setIsLoading(true);
        setError(null);

        console.log("📤 Calling /api/career-quest/generate-roadmap...");

        // Call our API to generate career-specific roadmap
        const response = await fetch('/api/career-quest/generate-roadmap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roleId,
            roleName,
            domainId,
            startingLevel,
            assessmentData
          }),
        });

        console.log("📥 Roadmap API response status:", response.status);
        console.log("📥 Response OK:", response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ API request failed:", errorText);
          throw new Error(`Failed to load roadmap: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Received roadmap data:");
        console.log("📊 Units count:", data.units?.length || 0);

        // Store the roadmap data in localStorage for use by other components
        try {
          console.log("💾 Storing roadmap in localStorage...");
          localStorage.setItem('careerQuest_roadmap', JSON.stringify(data));
          console.log("✅ Stored roadmap in localStorage");
        } catch (err) {
          console.warn('⚠️ Could not store roadmap in localStorage:', err);
        }

        console.log("✅ Setting units state...");
        setUnits(data.units);
        console.log("🎯 ========== CLIENT: Roadmap Loaded Successfully ==========\n");
      } catch (err: any) {
        console.error("\n❌ ========== CLIENT: Error Loading Roadmap ==========");
        console.error('🚨 Error:', err);
        console.error('📋 Error message:', err.message);

        setError('Failed to load your personalized learning roadmap. Using default roadmap.');

        // Fallback to default roadmap
        console.log("⚠️ Using fallback default roadmap...");
        const defaultRoadmap = getDefaultRoadmap(roleId, roleName, startingLevel);
        console.log("📊 Default roadmap units:", defaultRoadmap.length);

        // Store the default roadmap data in localStorage for use by other components
        try {
          console.log("💾 Storing default roadmap in localStorage...");
          localStorage.setItem('careerQuest_roadmap', JSON.stringify({ units: defaultRoadmap }));
          console.log("✅ Stored default roadmap in localStorage");
        } catch (err) {
          console.warn('⚠️ Could not store default roadmap in localStorage:', err);
        }

        console.log("✅ Setting units to default roadmap...");
        setUnits(defaultRoadmap);
        console.error("🎯 ========== CLIENT: Error Handled with Fallback ==========\n");
      } finally {
        console.log("🔄 Setting loading state to false...");
        setIsLoading(false);
      }
    };

    if (roleId && roleName) {
      console.log("✅ Role ID and Role Name present, loading roadmap...");
      loadRoadmap();
    } else {
      console.warn("⚠️ Missing roleId or roleName, not loading roadmap");
    }
  }, [roleId, roleName, domainId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Space Grotesk', 'Noto Sans', sans-serif" }}>
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <h1 className="flex-1 text-center text-xl font-bold text-gray-800">Loading Roadmap...</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-yellow-500 !text-3xl">local_fire_department</span>
              <span className="font-bold text-gray-800">0</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-green-500 !text-3xl">bolt</span>
              <span className="font-bold text-gray-800">0</span>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-6 pb-24 pt-8">
          <div className="relative">
            <div className="absolute left-1/2 top-0 h-full w-2 -translate-x-1/2 bg-gray-200"></div>
            <div className="relative z-10 flex flex-col items-center gap-12">
              {/* Skeleton loading for units */}
              {[...Array(2)].map((_, unitIndex) => (
                <div key={unitIndex} className="w-full max-w-sm">
                  <div className="mb-8 flex items-center gap-4 rounded-xl bg-gray-200 p-4 text-white shadow-md animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                    <div>
                      <div className="h-6 bg-gray-300 rounded w-40 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="relative space-y-16">
                    {[...Array(3)].map((_, nodeIndex) => (
                      <div key={nodeIndex} className="flex items-center justify-center">
                        <div className="flex flex-col items-center">
                          <div className="relative flex size-20 items-center justify-center rounded-full bg-gray-200 shadow-md animate-pulse"></div>
                          <div className="mt-2 h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    ))}
                  </div>
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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4" style={{ fontFamily: "'Space Grotesk', 'Noto Sans', sans-serif" }}>
        <div className="text-center max-w-md">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Roadmap</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            onClick={onBack}
          >
            Back to Assessment
          </button>
        </div>
      </div>
    );
  }

  // Count lessons and projects for each unit
  const getUnitStats = (unit: RoadmapUnit) => {
    const lessons = unit.nodes.filter(node => node.type === 'course').length;
    const projects = unit.nodes.filter(node => node.type === 'project').length;
    const rewards = unit.nodes.filter(node => node.type === 'reward').length;
    
    let stats = '';
    if (lessons > 0) {
      stats += `${lessons} lesson${lessons > 1 ? 's' : ''}`;
    }
    if (projects > 0) {
      stats += stats ? ` • ${projects} project${projects > 1 ? 's' : ''}` : `${projects} project${projects > 1 ? 's' : ''}`;
    }
    if (rewards > 0) {
      stats += stats ? ` • ${rewards} reward${rewards > 1 ? 's' : ''}` : `${rewards} reward${rewards > 1 ? 's' : ''}`;
    }
    
    return stats;
  };

  // Get icon for unit
  const getUnitIcon = (unitIndex: number) => {
    const icons = ['psychology', 'compost', 'rocket', 'diamond', 'star'];
    return icons[unitIndex % icons.length] || 'psychology';
  };

  // Get background color for unit
  const getUnitColor = (unitIndex: number) => {
    const colors = ['bg-green-400', 'bg-blue-400', 'bg-purple-400', 'bg-yellow-400', 'bg-pink-400'];
    return colors[unitIndex % colors.length] || 'bg-green-400';
  };

  // Get node icon based on type and status
  const getNodeIcon = (node: RoadmapNode) => {
    if (node.status === 'completed') {
      return 'done';
    }
    
    if (node.status === 'in-progress') {
      return 'play_arrow';
    }
    
    if (node.status === 'locked') {
      return 'lock';
    }
    
    switch (node.type) {
      case 'course':
        return 'school';
      case 'project':
        return 'fort';
      case 'reward':
        return 'redeem';
      case 'final':
        return 'flag';
      default:
        return 'circle';
    }
  };

  // Get node size based on type
  const getNodeSize = (node: RoadmapNode) => {
    return node.type === 'project' || node.type === 'reward' || node.type === 'final' 
      ? 'size-24' 
      : 'size-20';
  };

  // Get node icon size based on type
  const getNodeIconSize = (node: RoadmapNode) => {
    return node.type === 'project' || node.type === 'reward' || node.type === 'final' 
      ? '!text-5xl' 
      : '!text-4xl';
  };

  // Get background color for node based on type and status
  const getNodeColor = (node: RoadmapNode) => {
    // Status colors take precedence
    if (node.status === 'completed') {
      return 'bg-green-400';
    }
    
    if (node.status === 'in-progress') {
      return 'bg-orange-400';
    }
    
    if (node.status === 'locked') {
      return 'bg-gray-200';
    }
    
    // Type-based colors for available nodes
    switch (node.type) {
      case 'project':
        return 'bg-green-700';
      case 'reward':
        return 'bg-orange-400';
      case 'final':
        return 'bg-purple-500';
      default:
        return 'bg-white';
    }
  };

  // Get text color for node based on status
  const getNodeTextColor = (node: RoadmapNode) => {
    if (node.status === 'locked') {
      return 'text-gray-500';
    }
    
    if (node.status === 'in-progress') {
      return 'text-gray-700';
    }
    
    return 'text-white';
  };

  return (
    <div className="relative flex h-screen w-full flex-col bg-white" style={{ fontFamily: "'Space Grotesk', 'Noto Sans', sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <button 
          onClick={onBack}
          className="text-gray-800 flex size-10 shrink-0 items-center justify-center rounded-full"
          aria-label="Back"
        >
          <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
            <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
          </svg>
        </button>
        <h1 className="flex-1 text-center text-xl font-bold text-gray-800">{roleName} Path</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-yellow-500 !text-3xl">local_fire_department</span>
            <span className="font-bold text-gray-800">12</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-green-500 !text-3xl">bolt</span>
            <span className="font-bold text-gray-800">1200</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 pb-24 pt-8">
        <div className="relative">
          {/* Vertical timeline */}
          <div className="absolute left-1/2 top-0 h-full w-2 -translate-x-1/2 bg-gray-200"></div>
          
          {/* Roadmap units */}
          <div className="relative z-10 flex flex-col items-center gap-12">
            {units.map((unit, unitIndex) => (
              <div key={unit.id} className="w-full max-w-sm">
                {/* Unit header */}
                <div className={`mb-8 flex items-center gap-4 rounded-xl ${getUnitColor(unitIndex)} p-4 text-white shadow-md`}>
                  <span className="material-symbols-outlined !text-4xl">{getUnitIcon(unitIndex)}</span>
                  <div>
                    <h2 className="text-lg font-bold">Unit {unitIndex + 1}: {unit.title}</h2>
                    <p className="text-sm">{getUnitStats(unit)}</p>
                  </div>
                </div>
                
                {/* Unit nodes */}
                <div className="relative space-y-16">
                  {unit.nodes.map((node, nodeIndex) => (
                    <div key={node.id} className="flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <button 
                          className={`relative flex ${getNodeSize(node)} items-center justify-center rounded-full ${getNodeColor(node)} shadow-lg ${
                            node.status === 'in-progress' ? 'glowing' : ''
                          } ${node.status === 'locked' ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-xl'}`}
                          onClick={() => {
                            console.log("Node clicked:", node);
                            if (node.status !== 'locked') {
                              console.log("Calling onStartNode with:", node.id);
                              onStartNode(node.id);
                            } else {
                              console.log("Node is locked, not calling onStartNode");
                            }
                          }}
                          disabled={node.status === 'locked'}
                        >
                          <span className={`material-symbols-outlined ${getNodeTextColor(node)} ${getNodeIconSize(node)}`}>
                            {getNodeIcon(node)}
                          </span>
                        </button>
                        <p className={`mt-2 text-sm ${node.status === 'locked' ? 'text-gray-500' : 'font-bold text-gray-700'}`}>
                          {node.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// Default roadmap for fallback
function getDefaultRoadmap(roleId: string, roleName: string, startingLevel: number = 0): RoadmapUnit[] {
  console.log("getDefaultRoadmap called with:", { roleId, roleName, startingLevel });
  
  const defaultRoadmaps: Record<string, RoadmapUnit[]> = {
    'software-engineer': [
      {
        id: 'unit1',
        title: 'The Foundations',
        description: 'Building your core programming and computer science knowledge',
        nodes: [
          {
            id: 'course1',
            type: 'course',
            title: 'Introduction to Programming',
            description: 'Learn the fundamentals of programming with Python',
            duration: '2 weeks',
            difficulty: 'beginner',
            skills: ['Variables', 'Loops', 'Functions'],
            status: startingLevel >= 1 ? 'completed' : 'available'
          },
          {
            id: 'project1',
            type: 'project',
            title: 'First Program',
            description: 'Build your first simple calculator program',
            duration: '3 days',
            difficulty: 'beginner',
            skills: ['Problem-solving', 'Logic'],
            status: startingLevel >= 1 ? 'completed' : 'available'
          },
          {
            id: 'reward1',
            type: 'reward',
            title: 'First Milestone',
            description: 'Congratulations on completing your first program!',
            status: startingLevel >= 1 ? 'completed' : 'available'
          }
        ]
      },
      {
        id: 'unit2',
        title: 'Core Skills',
        description: 'Developing essential software development skills',
        nodes: [
          {
            id: 'course2',
            type: 'course',
            title: 'Data Structures & Algorithms',
            description: 'Master arrays, lists, trees, and basic algorithms',
            duration: '3 weeks',
            difficulty: 'intermediate',
            skills: ['Arrays', 'Lists', 'Sorting'],
            status: startingLevel >= 2 ? 'completed' : (startingLevel >= 1 ? 'available' : 'locked')
          },
          {
            id: 'project2',
            type: 'project',
            title: 'Data Structure Library',
            description: 'Implement a library of common data structures',
            duration: '1 week',
            difficulty: 'intermediate',
            skills: ['Implementation', 'Testing'],
            status: startingLevel >= 2 ? 'completed' : (startingLevel >= 1 ? 'available' : 'locked')
          },
          {
            id: 'reward2',
            type: 'reward',
            title: 'Algorithm Master',
            description: "You've mastered the basics of algorithms!",
            status: startingLevel >= 2 ? 'completed' : (startingLevel >= 1 ? 'available' : 'locked')
          }
        ]
      },
      {
        id: 'unit3',
        title: 'Professional Development',
        description: 'Preparing for real-world software engineering',
        nodes: [
          {
            id: 'course3',
            type: 'course',
            title: 'Web Development',
            description: 'Build full-stack web applications',
            duration: '4 weeks',
            difficulty: 'intermediate',
            skills: ['HTML/CSS', 'JavaScript', 'Databases'],
            status: startingLevel >= 3 ? 'completed' : (startingLevel >= 2 ? 'available' : 'locked')
          },
          {
            id: 'project3',
            type: 'project',
            title: 'Personal Portfolio Website',
            description: 'Create a professional portfolio showcasing your skills',
            duration: '2 weeks',
            difficulty: 'intermediate',
            skills: ['Frontend', 'Backend', 'Deployment'],
            status: startingLevel >= 3 ? 'completed' : (startingLevel >= 2 ? 'available' : 'locked')
          },
          {
            id: 'final1',
            type: 'final',
            title: 'Interview Prep',
            description: 'Prepare for technical interviews and job applications',
            duration: '2 weeks',
            difficulty: 'advanced',
            skills: ['Problem-solving', 'System design'],
            status: startingLevel >= 3 ? 'completed' : (startingLevel >= 2 ? 'available' : 'locked')
          }
        ]
      }
    ],
    'data-scientist': [
      {
        id: 'unit1',
        title: 'The Foundations',
        description: 'Building your core data science and statistics knowledge',
        nodes: [
          {
            id: 'course1',
            type: 'course',
            title: 'Introduction to Data Science',
            description: 'Learn the fundamentals of data science with Python',
            duration: '2 weeks',
            difficulty: 'beginner',
            skills: ['Python', 'Pandas', 'NumPy'],
            status: startingLevel >= 1 ? 'completed' : 'available'
          },
          {
            id: 'project1',
            type: 'project',
            title: 'First Data Analysis',
            description: 'Analyze a simple dataset and create visualizations',
            duration: '3 days',
            difficulty: 'beginner',
            skills: ['Data cleaning', 'Visualization'],
            status: startingLevel >= 1 ? 'completed' : 'available'
          },
          {
            id: 'reward1',
            type: 'reward',
            title: 'First Milestone',
            description: 'Congratulations on completing your first analysis!',
            status: startingLevel >= 1 ? 'completed' : 'available'
          }
        ]
      },
      {
        id: 'unit2',
        title: 'Core Skills',
        description: 'Developing essential machine learning and analytics skills',
        nodes: [
          {
            id: 'course2',
            type: 'course',
            title: 'Machine Learning Basics',
            description: 'Master supervised and unsupervised learning',
            duration: '3 weeks',
            difficulty: 'intermediate',
            skills: ['Regression', 'Classification', 'Clustering'],
            status: startingLevel >= 2 ? 'completed' : (startingLevel >= 1 ? 'available' : 'locked')
          },
          {
            id: 'project2',
            type: 'project',
            title: 'Predictive Model',
            description: 'Build a model to predict housing prices',
            duration: '1 week',
            difficulty: 'intermediate',
            skills: ['Modeling', 'Evaluation'],
            status: startingLevel >= 2 ? 'completed' : (startingLevel >= 1 ? 'available' : 'locked')
          },
          {
            id: 'reward2',
            type: 'reward',
            title: 'ML Pioneer',
            description: "You've built your first machine learning model!",
            status: startingLevel >= 2 ? 'completed' : (startingLevel >= 1 ? 'available' : 'locked')
          }
        ]
      },
      {
        id: 'unit3',
        title: 'Professional Development',
        description: 'Preparing for real-world data science roles',
        nodes: [
          {
            id: 'course3',
            type: 'course',
            title: 'Deep Learning',
            description: 'Explore neural networks and deep learning frameworks',
            duration: '4 weeks',
            difficulty: 'advanced',
            skills: ['Neural networks', 'TensorFlow', 'PyTorch'],
            status: startingLevel >= 3 ? 'completed' : (startingLevel >= 2 ? 'available' : 'locked')
          },
          {
            id: 'project3',
            type: 'project',
            title: 'Image Classification System',
            description: 'Create a system to classify images using deep learning',
            duration: '2 weeks',
            difficulty: 'advanced',
            skills: ['CNN', 'Deployment', 'Optimization'],
            status: startingLevel >= 3 ? 'completed' : (startingLevel >= 2 ? 'available' : 'locked')
          },
          {
            id: 'final1',
            type: 'final',
            title: 'Interview Prep',
            description: 'Prepare for data science interviews and job applications',
            duration: '2 weeks',
            difficulty: 'advanced',
            skills: ['Statistics', 'Case studies'],
            status: startingLevel >= 3 ? 'completed' : (startingLevel >= 2 ? 'available' : 'locked')
          }
        ]
      }
    ],
    'default': [
      {
        id: 'unit1',
        title: 'Getting Started',
        description: 'Building your foundational knowledge',
        nodes: [
          {
            id: 'course1',
            type: 'course',
            title: 'Introduction to Your Field',
            description: 'Learn the basics of your chosen career path',
            duration: '1 week',
            difficulty: 'beginner',
            skills: ['Fundamentals', 'Terminology'],
            status: startingLevel >= 1 ? 'completed' : 'available'
          },
          {
            id: 'project1',
            type: 'project',
            title: 'First Exploration',
            description: 'Complete your first hands-on activity',
            duration: '2 days',
            difficulty: 'beginner',
            skills: ['Basics', 'Application'],
            status: startingLevel >= 1 ? 'completed' : 'available'
          },
          {
            id: 'reward1',
            type: 'reward',
            title: 'First Step',
            description: 'Congratulations on taking your first step!',
            status: startingLevel >= 1 ? 'completed' : 'available'
          }
        ]
      },
      {
        id: 'unit2',
        title: 'Building Skills',
        description: 'Developing core competencies',
        nodes: [
          {
            id: 'course2',
            type: 'course',
            title: 'Core Concepts',
            description: 'Master the essential concepts in your field',
            duration: '2 weeks',
            difficulty: 'beginner',
            skills: ['Core skills', 'Principles'],
            status: startingLevel >= 2 ? 'completed' : (startingLevel >= 1 ? 'available' : 'locked')
          },
          {
            id: 'project2',
            type: 'project',
            title: 'Skill Application',
            description: 'Apply your knowledge in a practical project',
            duration: '1 week',
            difficulty: 'beginner',
            skills: ['Application', 'Problem-solving'],
            status: startingLevel >= 2 ? 'completed' : (startingLevel >= 1 ? 'available' : 'locked')
          },
          {
            id: 'reward2',
            type: 'reward',
            title: 'Skill Builder',
            description: "You're building solid skills!",
            status: startingLevel >= 2 ? 'completed' : (startingLevel >= 1 ? 'available' : 'locked')
          }
        ]
      },
      {
        id: 'unit3',
        title: 'Professional Growth',
        description: 'Preparing for professional success',
        nodes: [
          {
            id: 'course3',
            type: 'course',
            title: 'Advanced Topics',
            description: 'Explore advanced concepts in your field',
            duration: '3 weeks',
            difficulty: 'intermediate',
            skills: ['Advanced skills', 'Specialization'],
            status: startingLevel >= 3 ? 'completed' : (startingLevel >= 2 ? 'available' : 'locked')
          },
          {
            id: 'project3',
            type: 'project',
            title: 'Capstone Project',
            description: 'Demonstrate your expertise with a major project',
            duration: '2 weeks',
            difficulty: 'intermediate',
            skills: ['Integration', 'Presentation'],
            status: startingLevel >= 3 ? 'completed' : (startingLevel >= 2 ? 'available' : 'locked')
          },
          {
            id: 'final1',
            type: 'final',
            title: 'Career Preparation',
            description: 'Prepare for your career journey',
            duration: '2 weeks',
            difficulty: 'advanced',
            skills: ['Preparation', 'Networking'],
            status: startingLevel >= 3 ? 'completed' : (startingLevel >= 2 ? 'available' : 'locked')
          }
        ]
      }
    ]
  };
  
  if (defaultRoadmaps[roleId]) {
    return defaultRoadmaps[roleId];
  } else if (defaultRoadmaps['default']) {
    return defaultRoadmaps['default'];
  } else {
    return [
      {
        id: 'unit1',
        title: 'Your Journey Begins',
        description: 'Start your path to mastery',
        nodes: [
          {
            id: 'course1',
            type: 'course',
            title: 'Getting Started',
            description: 'Learn the fundamentals of your chosen path',
            duration: '1 week',
            difficulty: 'beginner',
            skills: ['Basics'],
            status: startingLevel >= 1 ? 'completed' : 'available'
          },
          {
            id: 'project1',
            type: 'project',
            title: 'First Steps',
            description: "Apply what you've learned",
            duration: '3 days',
            difficulty: 'beginner',
            skills: ['Application'],
            status: startingLevel >= 1 ? 'completed' : 'available'
          }
        ]
      }
    ];
  }
}