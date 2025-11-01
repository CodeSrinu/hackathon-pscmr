// src/app/api/career-quest/generate-roadmap/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Define TypeScript interface for our request
interface GenerateRoadmapRequest {
  roleId: string;
  roleName: string;
  domainId: string;
  startingLevel: number; // 0: Beginner, 1: Novice, 2: Apprentice, 3: Advanced, 4: Expert
  assessmentData: {
    questions: any[];
    answers: Record<string, boolean>;
    openResponse: string;
  } | null;
}

// Define TypeScript interface for our response
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

interface GenerateRoadmapResponse {
  units: RoadmapUnit[];
}

export async function POST(request: Request) {
  try {
    console.log("\n🌐 ========== API: /api/career-quest/generate-roadmap ==========");

    // Parse the request body
    const body: GenerateRoadmapRequest = await request.json();

    console.log("📥 Request body received");
    console.log("📝 Role ID:", body.roleId);
    console.log("📝 Role Name:", body.roleName);
    console.log("📝 Domain ID:", body.domainId);
    console.log("📊 Starting Level:", body.startingLevel);
    console.log("📊 Has Assessment Data:", !!body.assessmentData);
    if (body.assessmentData) {
      console.log("📊 Assessment Questions:", body.assessmentData.questions?.length || 0);
      console.log("📊 Assessment Answers:", Object.keys(body.assessmentData.answers || {}).length);
      console.log("📊 Open Response Length:", body.assessmentData.openResponse?.length || 0);
    }
    console.log("⏰ Timestamp:", new Date().toISOString());

    // Validate input
    if (!body.roleId || !body.roleName) {
      console.error("❌ Validation failed: Missing required fields");
      console.error("📋 Missing:", {
        roleId: !body.roleId,
        roleName: !body.roleName
      });
      return NextResponse.json(
        { error: 'Missing required fields: roleId, roleName' },
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
      console.error("❌ API Key is NULL or UNDEFINED");
    }

    if (!apiKey) {
      // Fallback response if API key is not available
      console.warn("⚠️ NO API KEY - Using default roadmap");
      const fallbackRoadmap = getDefaultRoadmap(body.roleId, body.roleName);
      console.log("📊 Returning default roadmap with", fallbackRoadmap.length, "units");
      console.log("🌐 ========== API COMPLETE (FALLBACK) ==========\n");
      return NextResponse.json({
        units: fallbackRoadmap
      });
    }

    console.log("🤖 Initializing Google Generative AI client...");

    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(apiKey);

    // FIXED: Using gemini-2.5-flash instead of gemini-1.5-flash
    console.log("🔧 Getting generative model: gemini-2.5-flash");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    console.log("✅ Model initialized successfully");
    
    // PROMPT FOR GENERATING ROADMAP - CAREER QUEST (AI ARCHITECT)
    // This prompt is designed to create a comprehensive learning roadmap based on the AI Architect model
    
    // Build the assessment data section if available
    let assessmentDataSection = 'No assessment data available.';
    if (body.assessmentData) {
      let questionsAndAnswers = '';
      body.assessmentData.questions.forEach((q, i) => {
        const answer = body.assessmentData?.answers[q.id] ? 'Yes' : 'No';
        questionsAndAnswers += `${i+1}. ${q.text}: ${answer}
`;
      });
      
      const openResponse = body.assessmentData.openResponse || 'No open response provided.';
      
      assessmentDataSection = 
`The user has completed a skill assessment with the following responses:
Questions and Answers:
${questionsAndAnswers}
Open Response:
${openResponse}`;
    }
    
    const prompt = `ROLE:
You are a panel of 3 senior industry veterans with 15+ years of experience in ${body.roleName}. You are master mentors, tasked with designing the ultimate, practical, and motivating learning sequence for a beginner in India to become a top-tier professional in your field. You understand that different careers require vastly different learning timelines and levels of depth.

CONTEXT:
A new, ambitious student has chosen "${body.roleName}" as their career. Your task is to lay out their complete learning journey, structured as a gamified, Duolingo-style path with distinct units and nodes.

USER ASSESSMENT DATA:
${assessmentDataSection}

TASK:
Generate the complete structure for the learning path. Do NOT generate the content inside the courses yet. Only define the roadmap's structural blueprint.

Analyze the Career's Complexity: First, mentally assess the complexity and typical learning duration for the chosen career. A long and complex path like "Full-Stack Developer" or "VLSI Engineer" should have more units and nodes than a shorter path like "Social Media Manager." The depth of your generated roadmap must reflect this.

Structure as Logical Units: Break down the entire career path into a logical sequence of "Units" (e.g., "Unit 1: The Foundations," "Unit 2: Core Skills"). A more complex career should have more units.

Populate Units with Granular Nodes: Within each Unit, define the sequence of different types of nodes. Be specific and granular in your naming.

course nodes: These are the primary, individual lessons. Name them specifically (e.g., "Advanced JavaScript (ES6+) instead of just "JavaScript").

project nodes: These are major capstone projects that should be placed at the end of a Unit to test all the skills learned within it. The project should be realistic for that career.

reward nodes: These are motivational rewards (like badges or quotes) that should be placed after major achievements, like completing a project.

Include Final Stages: The roadmap must conclude with dedicated Units for "Interview Prep" (covering technical and soft skills relevant to the role) and advanced "Upskilling" topics for continuous growth.

Personalize Based on Assessment: This is critical. Based on the user's assessment responses, create a personalized roadmap:
- If the user answered "Yes" to many technical questions, start with more advanced topics
- If the user answered "No" to fundamental questions, start with beginner topics
- Use the open response to understand the user's background and tailor the roadmap accordingly

OUTPUT FORMAT:
Your final output MUST be a single, clean, valid JSON object that represents the entire roadmap sequence. The level of detail in this example for "Full-Stack Developer" is the standard you should aim for with complex careers.

{
  "careerTitle": "${body.roleName}",
  "roadmap": [
    {
      "unitNumber": 1,
      "unitTitle": "Unit 1: ${body.assessmentData ? 'Personalized Foundations' : 'The Foundations'}",
      "status": "active",
      "nodes": [
        { "id": "node_1", "type": "course", "title": "Mastering the Command Line & Git" },
        { "id": "node_2", "type": "course", "title": "HTML & CSS Deep Dive" },
        { "id": "node_3", "type": "course", "title": "JavaScript Fundamentals" },
        { "id": "node_4", "type": "project", "title": "Project: Build a Personal Portfolio Website" },
        { "id": "node_5", "type": "reward", "title": "Foundation Badge Unlocked!" }
      ]
    },
    {
      "unitNumber": 2,
      "unitTitle": "Unit 2: Core Skills",
      "status": "locked",
      "nodes": [
        { "id": "node_6", "type": "course", "title": "Advanced JavaScript (ES6+, Async)" },
        { "id": "node_7", "type": "course", "title": "React & State Management" },
        { "id": "node_8", "type": "course", "title": "API Consumption with React" },
        { "id": "node_9", "type": "project", "title": "Project: Build a Movie Search App with an API" }
      ]
    },
    {
      "unitNumber": 3,
      "unitTitle": "Unit 3: Backend & Databases",
      "status": "locked",
      "nodes": [
        { "id": "node_10", "type": "course", "title": "Backend with Node.js & Express" },
        { "id": "node_11", "type": "course", "title": "Introduction to NoSQL with MongoDB" },
        { "id": "node_12", "type": "course", "title": "Building REST APIs" },
        { "id": "node_13", "type": "project", "title": "Project: Build a Full-Stack MERN Blog" },
        { "id": "node_14", "type": "reward", "title": "Full-Stack Badge Unlocked!" }
      ]
    },
    {
        "unitNumber": 4,
        "unitTitle": "Unit 4: Interview Prep",
        "status": "locked",
        "nodes": [
            { "id": "node_15", "type": "course", "title": "Data Structures & Algorithms in JS" },
            { "id": "node_16", "type": "course", "title": "System Design Basics" },
            { "id": "node_17", "type": "course", "title": "Resume & LinkedIn Optimization" }
        ]
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
    console.log("📊 Roadmap units count:", parsedResponse.roadmap?.length || 0);

    // Validate that the response has the expected structure
    if (!parsedResponse.roadmap || !Array.isArray(parsedResponse.roadmap)) {
      console.error("❌ AI response does not have the expected structure");
      console.error("📋 Missing fields:", {
        roadmap: !parsedResponse.roadmap,
        isArray: !Array.isArray(parsedResponse.roadmap)
      });
      throw new Error("AI response does not have the expected structure");
    }

    console.log("🔧 Transforming AI response to internal format...");

    // Transform the AI response to match our internal format
    const units: RoadmapUnit[] = parsedResponse.roadmap.map((unit: any, index: number) => {
      console.log(`📦 Processing unit ${index + 1}:`, unit.unitTitle);
      console.log(`   Nodes count:`, unit.nodes?.length || 0);

      return {
        id: `unit${unit.unitNumber}`,
        title: unit.unitTitle,
        description: `Unit ${unit.unitNumber}: ${unit.unitTitle}`,
        nodes: unit.nodes.map((node: any) => ({
          id: node.id,
          type: node.type,
          title: node.title,
          description: `Learn ${node.title}`,
          duration: "1 week", // Default duration, will be updated by AI Tutor
          difficulty: "beginner", // Default difficulty, will be updated by AI Tutor
          skills: [], // Default skills, will be updated by AI Tutor
          status: unit.status === 'completed' ? 'completed' :
                  unit.status === 'active' ? 'available' :
                  unit.status === 'locked' ? 'locked' : 'locked'
        }))
      };
    });

    console.log("✅ Successfully transformed AI response");
    console.log("📊 Final units count:", units.length);
    console.log("📊 Total nodes across all units:", units.reduce((sum, unit) => sum + unit.nodes.length, 0));
    console.log("🌐 ========== API COMPLETE (SUCCESS) ==========\n");

    return NextResponse.json({ units });
    
  } catch (error: any) {
    console.error("\n❌ ========== API ERROR ==========");
    console.error("🚨 Error in career quest roadmap generation:", error);
    console.error("📋 Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    console.error("🌐 ========== API ERROR END ==========\n");

    // Return a fallback response in case of error
    console.log("⚠️ USING FALLBACK ROADMAP");
    const fallbackRoadmap = getDefaultRoadmap("default", "General Role");
    console.log("📊 Fallback roadmap units:", fallbackRoadmap.length);

    return NextResponse.json(
      {
        units: fallbackRoadmap
      },
      { status: 200 }
    );
  }
}

// Default roadmap for fallback
function getDefaultRoadmap(roleId: string, roleName: string): RoadmapUnit[] {
  console.log("getDefaultRoadmap called with:", { roleId, roleName });
  
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
            duration: '1 week',
            difficulty: 'beginner',
            skills: ['Variables', 'Loops', 'Functions'],
            status: 'available'
          },
          {
            id: 'project1',
            type: 'project',
            title: 'First Program',
            description: 'Build your first simple calculator program',
            duration: '3 days',
            difficulty: 'beginner',
            skills: ['Problem-solving', 'Logic'],
            status: 'locked'
          },
          {
            id: 'reward1',
            type: 'reward',
            title: 'First Milestone',
            description: 'Congratulations on completing your first program!',
            status: 'locked'
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
            duration: '2 weeks',
            difficulty: 'intermediate',
            skills: ['Arrays', 'Lists', 'Sorting'],
            status: 'locked'
          },
          {
            id: 'project2',
            type: 'project',
            title: 'Data Structure Library',
            description: 'Implement a library of common data structures',
            duration: '1 week',
            difficulty: 'intermediate',
            skills: ['Implementation', 'Testing'],
            status: 'locked'
          },
          {
            id: 'reward2',
            type: 'reward',
            title: 'Algorithm Master',
            description: "You've mastered the basics of algorithms!",
            status: 'locked'
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
            duration: '3 weeks',
            difficulty: 'intermediate',
            skills: ['HTML/CSS', 'JavaScript', 'Databases'],
            status: 'locked'
          },
          {
            id: 'project3',
            type: 'project',
            title: 'Personal Portfolio Website',
            description: 'Create a professional portfolio showcasing your skills',
            duration: '2 weeks',
            difficulty: 'intermediate',
            skills: ['Frontend', 'Backend', 'Deployment'],
            status: 'locked'
          },
          {
            id: 'final1',
            type: 'final',
            title: 'Interview Prep',
            description: 'Prepare for technical interviews and job applications',
            duration: '2 weeks',
            difficulty: 'advanced',
            skills: ['Problem-solving', 'System design'],
            status: 'locked'
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
            duration: '1 week',
            difficulty: 'beginner',
            skills: ['Python', 'Pandas', 'NumPy'],
            status: 'available'
          },
          {
            id: 'project1',
            type: 'project',
            title: 'First Data Analysis',
            description: 'Analyze a simple dataset and create visualizations',
            duration: '3 days',
            difficulty: 'beginner',
            skills: ['Data cleaning', 'Visualization'],
            status: 'locked'
          },
          {
            id: 'reward1',
            type: 'reward',
            title: 'First Milestone',
            description: 'Congratulations on completing your first analysis!',
            status: 'locked'
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
            duration: '2 weeks',
            difficulty: 'intermediate',
            skills: ['Regression', 'Classification', 'Clustering'],
            status: 'locked'
          },
          {
            id: 'project2',
            type: 'project',
            title: 'Predictive Model',
            description: 'Build a model to predict housing prices',
            duration: '1 week',
            difficulty: 'intermediate',
            skills: ['Modeling', 'Evaluation'],
            status: 'locked'
          },
          {
            id: 'reward2',
            type: 'reward',
            title: 'ML Pioneer',
            description: "You've built your first machine learning model!",
            status: 'locked'
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
            duration: '3 weeks',
            difficulty: 'advanced',
            skills: ['Neural networks', 'TensorFlow', 'PyTorch'],
            status: 'locked'
          },
          {
            id: 'project3',
            type: 'project',
            title: 'Image Classification System',
            description: 'Create a system to classify images using deep learning',
            duration: '2 weeks',
            difficulty: 'advanced',
            skills: ['CNN', 'Deployment', 'Optimization'],
            status: 'locked'
          },
          {
            id: 'final1',
            type: 'final',
            title: 'Interview Prep',
            description: 'Prepare for data science interviews and job applications',
            duration: '2 weeks',
            difficulty: 'advanced',
            skills: ['Statistics', 'Case studies'],
            status: 'locked'
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
            status: 'available'
          },
          {
            id: 'project1',
            type: 'project',
            title: 'First Exploration',
            description: 'Complete your first hands-on activity',
            duration: '2 days',
            difficulty: 'beginner',
            skills: ['Basics', 'Application'],
            status: 'locked'
          },
          {
            id: 'reward1',
            type: 'reward',
            title: 'First Step',
            description: 'Congratulations on taking your first step!',
            status: 'locked'
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
            status: 'locked'
          },
          {
            id: 'project2',
            type: 'project',
            title: 'Skill Application',
            description: 'Apply your knowledge in a practical project',
            duration: '1 week',
            difficulty: 'beginner',
            skills: ['Application', 'Problem-solving'],
            status: 'locked'
          },
          {
            id: 'reward2',
            type: 'reward',
            title: 'Skill Builder',
            description: "You're building solid skills!",
            status: 'locked'
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
            status: 'locked'
          },
          {
            id: 'project3',
            type: 'project',
            title: 'Capstone Project',
            description: 'Demonstrate your expertise with a major project',
            duration: '2 weeks',
            difficulty: 'intermediate',
            skills: ['Integration', 'Presentation'],
            status: 'locked'
          },
          {
            id: 'final1',
            type: 'final',
            title: 'Career Preparation',
            description: 'Prepare for interviews and job applications',
            duration: '2 weeks',
            difficulty: 'advanced',
            skills: ['Preparation', 'Networking'],
            status: 'locked'
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
            status: 'available'
          },
          {
            id: 'project1',
            type: 'project',
            title: 'First Steps',
            description: "Apply what you've learned",
            duration: '3 days',
            difficulty: 'beginner',
            skills: ['Application'],
            status: 'locked'
          }
        ]
      }
    ];
  }
}