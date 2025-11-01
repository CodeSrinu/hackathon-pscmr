// src/app/learning-module/video-lecture/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SuspenseWrapper from '@/components/SuspenseWrapper';

interface VideoLecture {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration?: string;
  moduleId: string;
  moduleName: string;
  transcript?: string;
  cheatSheet?: string;
}

export default function VideoLecturePage() {
  return (
    <SuspenseWrapper>
      <VideoLecturePageContent />
    </SuspenseWrapper>
  );
}

function VideoLecturePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lectureId = searchParams?.get('lectureId') || '';
  const moduleId = searchParams?.get('moduleId') || '';
  const moduleName = searchParams?.get('moduleName') || '';
  const lectureTitle = searchParams?.get('title') || '';

  console.log("VideoLecturePage mounted with parameters:", { lectureId, moduleId, moduleName, lectureTitle });

  const [lecture, setLecture] = useState<VideoLecture | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [showDoubtModal, setShowDoubtModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [doubtText, setDoubtText] = useState('');

  useEffect(() => {
    const loadLecture = async () => {
      try {
        console.log("\n🎯 ========== CLIENT: Loading Video Lecture ==========");
        console.log("📝 Lecture ID:", lectureId);
        console.log("📝 Module ID:", moduleId);
        console.log("📝 Module Name:", moduleName);
        console.log("📝 Lecture Title:", lectureTitle);

        console.log("🔄 Setting loading state to true...");
        setLoading(true);
        setError(null);

        // Get career field from localStorage
        const storedGoal = localStorage.getItem('careerGoal');
        const careerField = storedGoal || 'General';
        console.log("📝 Career Field from localStorage:", careerField);

        console.log("📤 Calling /api/learning-module/lecture...");

        // Call our API to get the lecture content
        const response = await fetch('/api/learning-module/lecture', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lectureId,
            moduleId,
            moduleName: lectureTitle, // Use the specific lecture title instead of the course name
            lectureTitle: lectureTitle, // Send the specific lecture title
            careerField: careerField, // Pass career field for AI content generation
            userId: 'default-user' // This would be dynamically determined
          }),
        });

        console.log("📥 Lecture API response status:", response.status);
        console.log("📥 Response OK:", response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ API request failed:", errorText);
          throw new Error(`Failed to load lecture content: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("✅ Received lecture data:");
        console.log("📊 Lecture ID:", data.id);
        console.log("📊 Lecture Title:", data.title);
        console.log("📊 Video URL:", data.videoUrl);
        console.log("📊 Duration:", data.duration);

        const lectureData: VideoLecture = {
          id: data.id || lectureId,
          title: data.title || 'Video Lecture',
          description: data.description || 'Learn the fundamentals of your chosen topic',
          videoUrl: data.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          duration: data.duration || '15 minutes',
          moduleId: data.moduleId || moduleId,
          moduleName: data.moduleName || moduleName,
          transcript: data.transcript || 'Transcript not available',
          cheatSheet: data.cheatSheet || 'Cheat sheet not available'
        };

        console.log("✅ Setting lecture state...");
        console.log("📊 Has Transcript:", !!lectureData.transcript);
        console.log("📊 Has Cheat Sheet:", !!lectureData.cheatSheet);
        setLecture(lectureData);
        console.log("🎯 ========== CLIENT: Video Lecture Loaded Successfully ==========\n");
      } catch (err: any) {
        console.error("\n❌ ========== CLIENT: Error Loading Video Lecture ==========");
        console.error('🚨 Error:', err);
        console.error('📋 Error message:', err.message);

        setError('Failed to load the video lecture. Please try again.');

        // Fallback to mock data
        console.log("⚠️ Using fallback mock lecture data...");
        const mockLecture: VideoLecture = {
          id: lectureId,
          title: 'Video Lecture',
          description: 'Learn the fundamentals of your chosen topic',
          videoUrl: 'https://www.youtube.com/embed/1_lAbJ622-E',
          duration: '15 minutes',
          moduleId,
          moduleName
        };

        console.log("✅ Setting mock lecture...");
        setLecture(mockLecture);
        console.error("🎯 ========== CLIENT: Error Handled with Fallback ==========\n");
      } finally {
        setLoading(false);
      }
    };
    
    if (lectureId) {
      loadLecture();
    } else {
      setError('No lecture specified');
    }
  }, [lectureId, moduleId, moduleName]);

  const handleBack = () => {
    console.log("\n🔙 ========== NAVIGATION: Back Button Clicked ==========");
    console.log("📝 Current Lecture ID:", lectureId);
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
    // Navigate to cheat sheet page
    console.log("➡️ Navigating to cheat sheet...");

    // Store lecture data in localStorage for cheat sheet page to access
    if (lecture) {
      localStorage.setItem('currentLectureData', JSON.stringify({
        lectureId,
        moduleId,
        moduleName,
        lectureTitle,
        cheatSheet: lecture.cheatSheet
      }));
    }

    router.push(`/learning-module/cheat-sheet?cheatSheetId=${lectureId}&moduleId=${moduleId}&moduleName=${moduleName}&title=${lectureTitle}`);
  };

  const handleWriteNote = () => {
    console.log("📝 Opening write note modal...");
    setShowNoteModal(true);
  };

  const handleSaveNote = () => {
    console.log("💾 Saving note:", noteText);
    // In a real implementation, this would save to a database
    localStorage.setItem(`note_${lectureId}`, noteText);
    alert('Note saved successfully!');
    setShowNoteModal(false);
    setNoteText('');
  };

  const handlePostDoubt = () => {
    console.log("\n❓ ========== POST DOUBT: Opening Modal ==========");
    console.log("📝 Lecture ID:", lectureId);
    console.log("📝 Lecture Title:", lectureTitle);
    setShowDoubtModal(true);
    console.log("✅ Doubt modal opened");
    console.log("❓ ========== POST DOUBT COMPLETE ==========\n");
  };

  const handleSubmitDoubt = () => {
    console.log("\n📤 ========== POST DOUBT: Submitting ==========");
    console.log("📝 Doubt Text:", doubtText);
    console.log("📝 Lecture ID:", lectureId);
    console.log("📝 Lecture Title:", lectureTitle);

    if (!doubtText.trim()) {
      console.warn("⚠️ Doubt text is empty");
      alert('Please enter your question before submitting.');
      return;
    }

    // Save doubt to localStorage
    try {
      const doubts = JSON.parse(localStorage.getItem('userDoubts') || '[]');
      const newDoubt = {
        id: Date.now().toString(),
        lectureId,
        lectureTitle,
        question: doubtText,
        timestamp: new Date().toISOString()
      };
      doubts.push(newDoubt);
      localStorage.setItem('userDoubts', JSON.stringify(doubts));

      console.log("✅ Doubt saved successfully");
      console.log("📊 Total doubts:", doubts.length);

      alert('Your question has been submitted successfully!');
      setShowDoubtModal(false);
      setDoubtText('');
    } catch (error) {
      console.error("❌ Error saving doubt:", error);
      alert('Failed to submit your question. Please try again.');
    }

    console.log("📤 ========== POST DOUBT COMPLETE ==========\n");
  };

  const handleViewTranscription = () => {
    console.log("📄 Opening transcription modal...");
    setShowTranscriptModal(true);
  };

  if (loading) {
    return (
      <div className="flex h-screen flex-col bg-white">
        <header className="p-4 flex-shrink-0">
          <div className="flex items-center">
            <button 
              onClick={handleBack}
              className="text-[#333d33]"
            >
              <span className="material-symbols-outlined text-3xl">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold text-center flex-grow -ml-8">Loading Video...</h1>
          </div>
        </header>
        <main className="flex-grow flex flex-col px-4 space-y-4">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-200 animate-pulse"></div>
          <div className="flex space-x-4">
            <div className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#f2fbf2] rounded-lg text-[#333d33] text-base font-semibold animate-pulse">
              <span className="material-symbols-outlined">edit</span>
              <span>Write a Note</span>
            </div>
            <div className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#f2fbf2] rounded-lg text-[#333d33] text-base font-semibold animate-pulse">
              <span className="material-symbols-outlined">help_outline</span>
              <span>Post a Doubt</span>
            </div>
          </div>
          <div className="flex justify-center pt-2">
            <div className="flex items-center gap-2 rounded-full py-2 px-6 bg-[#f2fbf2] text-[#333d33] text-base font-semibold animate-pulse">
              <span className="material-symbols-outlined">description</span>
              <span>View Transcription</span>
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Lecture</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            className="px-4 py-2 bg-[#06f906] text-black rounded-full hover:bg-[#05e005] transition-colors font-bold"
            onClick={handleBack}
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Lecture Not Found</h1>
          <p className="text-gray-600 mb-6">The requested video lecture could not be found.</p>
          <button
            className="px-4 py-2 bg-[#06f906] text-black rounded-full hover:bg-[#05e005] transition-colors font-bold"
            onClick={handleBack}
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#ffffff] font-sans text-[#333d33]">
      <header className="p-4 flex-shrink-0">
        <div className="flex items-center">
          <button 
            onClick={handleBack}
            className="text-[#333d33]"
          >
            <span className="material-symbols-outlined text-3xl">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-center flex-grow -ml-8">Video Lecture</h1>
        </div>
      </header>
      <main className="flex-grow flex flex-col px-4 space-y-4">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            src={lecture.videoUrl}
            title="YouTube video player"
            onError={(e) => {
              console.error("❌ Video failed to load:", lecture.videoUrl);
            }}
          ></iframe>
          {/* Fallback message if video doesn't load */}
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2 text-center">
            If video doesn't load, the AI may have suggested an unavailable video. Try refreshing or check the transcript below.
          </div>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={handleWriteNote}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#f2fbf2] rounded-lg text-[#333d33] text-base font-semibold"
          >
            <span className="material-symbols-outlined">edit</span>
            <span>Write a Note</span>
          </button>
          <button 
            onClick={handlePostDoubt}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#f2fbf2] rounded-lg text-[#333d33] text-base font-semibold"
          >
            <span className="material-symbols-outlined">help_outline</span>
            <span>Post a Doubt</span>
          </button>
        </div>
        <div className="flex justify-center pt-2">
          <button 
            onClick={handleViewTranscription}
            className="flex items-center gap-2 rounded-full py-2 px-6 bg-[#f2fbf2] text-[#333d33] text-base font-semibold"
          >
            <span className="material-symbols-outlined">description</span>
            <span>View Transcription</span>
          </button>
        </div>
      </main>
      <footer className="p-4 sticky bottom-0 bg-[#ffffff]">
        <button
          onClick={handleNext}
          className="w-full rounded-full py-4 px-6 bg-[#06f906] text-black text-lg font-bold"
        >
          Next: View Cheat Sheet →
        </button>
      </footer>

      {/* Write Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#333d33]">Write a Note</h2>
              <button
                onClick={() => setShowNoteModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined text-3xl">close</span>
              </button>
            </div>
            <div className="p-4 flex-grow overflow-y-auto">
              <p className="text-sm text-gray-600 mb-4">
                Write notes about "{lecture?.title}" to help you remember key concepts.
              </p>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Type your notes here..."
                className="w-full h-48 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#06f906] focus:border-transparent"
              />
            </div>
            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowNoteModal(false)}
                className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-full font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="flex-1 py-3 px-4 bg-[#06f906] text-black rounded-full font-semibold"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transcription Modal */}
      {showTranscriptModal && lecture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#333d33]">Video Transcription</h2>
              <button
                onClick={() => setShowTranscriptModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined text-3xl">close</span>
              </button>
            </div>
            <div className="p-6 flex-grow overflow-y-auto">
              <h3 className="text-lg font-semibold text-[#333d33] mb-3">{lecture.title}</h3>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {(lecture as any).transcript || 'Transcript not available for this lecture.'}
              </div>
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowTranscriptModal(false)}
                className="w-full py-3 px-4 bg-[#06f906] text-black rounded-full font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Doubt Modal */}
      {showDoubtModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#333d33]">Post a Question</h2>
              <button
                onClick={() => setShowDoubtModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined text-3xl">close</span>
              </button>
            </div>
            <div className="p-4 flex-grow overflow-y-auto">
              <p className="text-sm text-gray-600 mb-4">
                Have a question about "{lecture?.title}"? Ask your instructor!
              </p>
              <textarea
                value={doubtText}
                onChange={(e) => setDoubtText(e.target.value)}
                placeholder="Type your question here..."
                className="w-full h-48 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#06f906] focus:border-transparent"
              />
            </div>
            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowDoubtModal(false)}
                className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-full font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDoubt}
                className="flex-1 py-3 px-4 bg-[#06f906] text-black rounded-full font-semibold"
              >
                Submit Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}