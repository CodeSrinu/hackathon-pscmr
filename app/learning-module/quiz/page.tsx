// src/app/learning-module/quiz/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SuspenseWrapper from '@/components/SuspenseWrapper';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  duration?: string;
  moduleId: string;
  moduleName: string;
}

export default function QuizPage() {
  return (
    <SuspenseWrapper>
      <QuizPageContent />
    </SuspenseWrapper>
  );
}

function QuizPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizId = searchParams?.get('quizId') || '';
  const moduleId = searchParams?.get('moduleId') || '';
  const moduleName = searchParams?.get('moduleName') || '';
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        console.log("\n🎯 ========== CLIENT: Loading Quiz ==========");
        setLoading(true);
        setError(null);

        console.log("📝 Quiz ID:", quizId);
        console.log("📝 Module ID:", moduleId);
        console.log("📝 Module Name:", moduleName);

        console.log("📤 Calling /api/learning-module/quiz...");

        // Call our API to get the quiz content
        const response = await fetch('/api/learning-module/quiz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quizId,
            moduleId,
            moduleName,
            userId: 'default-user'
          }),
        });

        console.log("📥 Quiz API response status:", response.status);

        if (!response.ok) {
          console.error("❌ Quiz API returned error status:", response.status);
          throw new Error('Failed to load quiz content');
        }

        const data = await response.json();
        console.log("✅ Received quiz data");
        console.log("📊 Quiz Title:", data.title);
        console.log("📊 Number of Questions:", data.questions?.length || 0);
        
        const quizData: Quiz = {
          id: data.id || quizId,
          title: data.title || 'Quiz',
          description: data.description || 'Test your knowledge',
          questions: data.questions || [],
          duration: data.duration || '10 minutes',
          moduleId: data.moduleId || moduleId,
          moduleName: data.moduleName || moduleName
        };

        console.log("✅ Setting quiz state...");
        setQuiz(quizData);
        console.log("🎯 ========== CLIENT: Quiz Loaded Successfully ==========\n");
      } catch (err: any) {
        console.error("\n❌ ========== CLIENT: Error Loading Quiz ==========");
        console.error('🚨 Error:', err);
        console.error('📋 Error message:', err.message);
        setError('Failed to load the quiz. Please try again.');
        console.error("❌ ========== ERROR END ==========\n");
        
        // Fallback to mock data
        const mockQuiz: Quiz = {
          id: quizId,
          title: 'Semantic HTML Quiz',
          description: 'Test your knowledge of semantic HTML elements',
          moduleId,
          moduleName,
          duration: '10 minutes',
          questions: [
            {
              id: 'q1',
              question: 'Which semantic HTML element should be used for the main content of a document?',
              options: ['<div>', '<main>', '<section>', '<article>'],
              correctAnswer: '<main>',
              explanation: 'The <main> element represents the primary content of the document. There should only be one <main> element per page.'
            },
            {
              id: 'q2',
              question: 'What is the purpose of the <nav> element?',
              options: [
                'To display images',
                'To contain navigation links',
                'To show advertisements',
                'To format text'
              ],
              correctAnswer: 'To contain navigation links',
              explanation: 'The <nav> element is specifically designed to contain navigation links, making the site structure clearer for both users and assistive technologies.'
            },
            {
              id: 'q3',
              question: 'Which element represents a self-contained composition that could be distributed independently?',
              options: ['<section>', '<div>', '<article>', '<aside>'],
              correctAnswer: '<article>',
              explanation: 'The <article> element represents a self-contained composition that could theoretically be distributed independently, such as a news article or blog post.'
            },
            {
              id: 'q4',
              question: 'What is a key benefit of using semantic HTML?',
              options: [
                'Smaller file sizes',
                'Better search engine optimization',
                'Faster loading times',
                'More colorful backgrounds'
              ],
              correctAnswer: 'Better search engine optimization',
              explanation: 'Semantic HTML improves SEO because search engines can better understand the structure and content of your page, leading to better rankings.'
            }
          ]
        };
        
        setQuiz(mockQuiz);
      } finally {
        setLoading(false);
      }
    };
    
    if (quizId) {
      loadQuiz();
    } else {
      setError('No quiz specified');
    }
  }, [quizId, moduleId, moduleName]);

  const handleBack = () => {
    console.log("\n🔙 ========== NAVIGATION: Back Button Clicked (Quiz) ==========");
    console.log("📝 Current Quiz ID:", quizId);
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

  const handleOptionSelect = (option: string) => {
    if (!submitted) {
      setSelectedOption(option);
    }
  };

  const handleSubmit = () => {
    if (selectedOption && quiz) {
      setSubmitted(true);
      
      // Save the answer
      const newAnswers = { ...answers, [quiz.questions[currentQuestionIndex].id]: selectedOption };
      setAnswers(newAnswers);
      
      // Check if the answer is correct and update score
      const isCorrect = selectedOption === quiz.questions[currentQuestionIndex].correctAnswer;
      if (isCorrect) {
        setScore(score + 1);
      }
    }
  };

  const handleNext = () => {
    if (quiz) {
      if (currentQuestionIndex < quiz.questions.length - 1) {
        // Move to next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
        setSubmitted(false);
      } else {
        // Quiz completed - navigate to tasks/projects
        console.log("✅ Quiz completed! Score:", score, "/", quiz.questions.length);
        console.log("➡️ Navigating to tasks/projects...");
        router.push(`/learning-module/tasks-projects?projectId=${quizId}&moduleId=${moduleId}&moduleName=${moduleName}`);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedOption(null);
      setSubmitted(false);
    }
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
            <h1 className="text-xl font-bold text-center flex-grow -ml-8">Loading Quiz...</h1>
          </div>
        </header>
        <main className="flex-grow overflow-y-auto px-4 pb-24 pt-8">
          <div className="p-6 space-y-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            </div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Quiz</h1>
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

  if (!quiz) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Quiz Not Found</h1>
          <p className="text-gray-600 mb-6">The requested quiz could not be found.</p>
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

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isCorrect = submitted && selectedOption === currentQuestion.correctAnswer;
  const showExplanation = submitted;

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
          <h1 className="text-xl font-bold text-center flex-grow -ml-8">{quiz.title}</h1>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
          <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
          <span>{Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <main className="flex-grow overflow-y-auto px-4 pb-24 pt-8">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{currentQuestion.question}</h2>
            <p className="text-gray-600">{quiz.description}</p>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              let optionStyle = "w-full text-left p-4 rounded-lg border border-gray-200 ";
              
              if (submitted) {
                if (option === currentQuestion.correctAnswer) {
                  optionStyle += "bg-green-100 border-green-500 text-green-800";
                } else if (option === selectedOption && option !== currentQuestion.correctAnswer) {
                  optionStyle += "bg-red-100 border-red-500 text-red-800";
                } else {
                  optionStyle += "bg-gray-100 text-gray-500";
                }
              } else {
                if (option === selectedOption) {
                  optionStyle += "bg-green-50 border-green-500 text-green-800";
                } else {
                  optionStyle += "bg-white hover:bg-gray-50 text-gray-800";
                }
              }

              return (
                <button
                  key={index}
                  className={optionStyle}
                  onClick={() => handleOptionSelect(option)}
                  disabled={submitted}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center mr-3">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className={`mt-6 p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start">
                <span className="material-symbols-outlined text-2xl mr-2">
                  {isCorrect ? 'check_circle' : 'cancel'}
                </span>
                <div>
                  <h3 className={`font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </h3>
                  <p className="text-gray-700 mt-1">{currentQuestion.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="p-4 sticky bottom-0 bg-white border-t border-gray-200">
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`px-4 py-2 rounded-lg ${currentQuestionIndex === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-800 hover:bg-gray-100'}`}
          >
            Previous
          </button>
          
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedOption}
              className={`px-6 py-2 rounded-lg font-medium ${
                selectedOption 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Submit
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
            >
              {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}