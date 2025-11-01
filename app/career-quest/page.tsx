// src/app/career-quest/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CareerQuestRoadmap from '@/components/mobile/CareerQuestRoadmap';
import SuspenseWrapper from '@/components/SuspenseWrapper';

interface RoadmapNode {
  id: string;
  type: 'course' | 'project' | 'reward' | 'final';
  title: string;
  description: string;
  duration?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
  skills?: string[];
  status: 'locked' | 'available' | 'in-progress' | 'completed';
}

interface RoadmapUnit {
  id: string;
  title: string;
  description: string;
  nodes: RoadmapNode[];
}

export default function CareerQuestPage() {
  return (
    <SuspenseWrapper>
      <CareerQuestPageContent />
    </SuspenseWrapper>
  );
}

function CareerQuestPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleId = searchParams?.get('roleId') || '';
  const roleName = searchParams?.get('roleName') || '';
  const domainId = searchParams?.get('domainId') || '';
  const startingLevel = parseInt(searchParams?.get('startingLevel') || '0');
  
  // We'll store assessment data in localStorage so we can retrieve it
  const [assessmentData, setAssessmentData] = useState<{
    questions: any[];
    answers: Record<string, boolean>;
    openResponse: string;
  } | null>(null);
  
  // Retrieve assessment data from localStorage when component mounts
  useEffect(() => {
    // Try to retrieve assessment data from localStorage
    try {
      const storedAssessmentData = localStorage.getItem('careerQuest_assessmentData');
      if (storedAssessmentData) {
        const parsedData = JSON.parse(storedAssessmentData);
        console.log("Retrieved assessment data from localStorage:", parsedData);
        setAssessmentData(parsedData);
      }
    } catch (err) {
      console.error("Error retrieving assessment data from localStorage:", err);
    }
  }, []);
  
  console.log("CareerQuestPage mounted with:", { roleId, roleName, domainId, startingLevel });
  
  const handleBack = () => {
    console.log("\n🔙 ========== NAVIGATION: Back Button Clicked (Career Quest) ==========");
    console.log("📝 Role ID:", roleId);
    console.log("📝 Role Name:", roleName);

    // Navigate back to deep dive page
    console.log("🔄 Navigating back to deep dive page...");
    router.push('/deep-dive');

    console.log("✅ Navigation initiated");
    console.log("🔙 ========== NAVIGATION COMPLETE ==========\n");
  };

  const handleStartNode = (nodeId: string) => {
    // Navigate to the learning module for this node
    console.log("handleStartNode called with:", nodeId);
    
    // We don't need to find the node title here since the CareerQuestRoadmap component
    // will pass the necessary parameters when calling this function
    console.log("Navigation params:", { roleId, roleName, domainId });
    router.push(`/learning-module?nodeId=${nodeId}&roleId=${roleId}&roleName=${encodeURIComponent(roleName)}&domainId=${domainId}`);
  };

  if (!roleId || !roleName) {
    console.log("CareerQuestPage: Missing required parameters");
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Invalid Request</h1>
          <p className="text-gray-600 mb-6">Missing required parameters for Career Quest.</p>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            onClick={() => router.push('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <CareerQuestRoadmap
        roleId={roleId}
        roleName={roleName}
        domainId={domainId}
        startingLevel={startingLevel}
        assessmentData={assessmentData}
        onBack={handleBack}
        onStartNode={handleStartNode}
      />
    </div>
  );
}