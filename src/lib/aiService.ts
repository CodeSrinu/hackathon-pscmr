// src/lib/aiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// Function to safely get API key on server side only
const getApiKey = (): string | undefined => {
  // Server-side only
  if (typeof window === 'undefined') {
    return process.env.GEMINI_API_KEY;
  }
  return undefined;
};

// Define TypeScript interfaces for our AI responses
export interface AIRecommendationResponse {
  personaName: string;
  personaSummary: string;
  recommendedRoles: Array<{
    role: string;
    reason: string;
  }>;
}

export interface AIDeepDiveResponse {
  role: string;
  description: string;
  dailyResponsibilities: string[];
  salaryRange: {
    entry: string;
    mid: string;
    senior: string;
  };
  careerPath: string[];
  requiredSkills: string[];
  education: string;
  jobMarket: string;
}

// Master prompt for generating persona and role recommendations
const generateMasterPrompt = (quizAnswers: Record<string, any>): string => {
  return `**ROLE:**
You are an expert career counselor and occupational psychologist. Your specialty is guiding young Indian students (ages 18-24) from diverse backgrounds toward fulfilling and future-proof careers. You have a deep understanding of the current Indian job market, including tech, creative, government, and skilled-trade roles. You are empathetic and excel at finding the hidden signals in a person's life story.

---

**CONTEXT:**
A student has answered a 10-question psychology quiz to discover their intrinsic motivations. Analyze their complete set of answers below to understand their core personality, values, and working style.

**User's Quiz Answers:**
1.  **Childhood Interest:** "${quizAnswers.childhoodInterests || 'Not provided'}"
2.  **Favorite Toy/Game:** "${quizAnswers.favoriteToy || 'Not provided'}"
3.  **Childhood Aspiration:** "${quizAnswers.childhoodAspiration || 'Not provided'}"
4.  **Spending Preference:** "${quizAnswers.spendingPreference || 'Not provided'}"
5.  **Inspirational Statement:** "${quizAnswers.inspirationalStatement || 'Not provided'}"
6.  **Ideal Daily Vibe:** "${quizAnswers.idealDailyVibe || 'Not provided'}"
7.  **Non-Negotiables:** "${quizAnswers.nonNegotiables || 'Not provided'}"
8.  **Public Speaking Rating (1-5):** "${quizAnswers.publicSpeaking || 'Not provided'}"
9.  **Secret Choice:** "${quizAnswers.secretChoice || 'Not provided'}"
10. **Goal Ownership Rating (1-5):** "${quizAnswers.goalOwnership || 'Not provided'}"

---

**TASK:**
Based on your expert analysis of the user's answers, perform the following two tasks:

**Part 1: Generate a Dynamic Career Persona**
Synthesize the user's answers into a single, insightful, and encouraging career persona. This persona should feel unique and personal to the user.
-   **Persona Name:** Create a descriptive and evocative name. Examples of the *style* I'm looking for include: "The Hands-On Community Builder," "The Analytical Storyteller," "The Pragmatic Organizer."
-   **Persona Summary:** Write a 2-3 sentence summary that highlights the user's incredible potential and natural strengths. Emphasize what they're naturally good at and what type of work they would love. Avoid generic descriptions and focus on specific abilities and preferences.

**Part 2: Recommend 5 Specific Career Paths**
Based on the unique persona you just generated, recommend the top 5 most suitable and specific career paths for this user in the current Indian market.
-   **Be Inclusive:** Include traditional jobs, entrepreneurship opportunities, civil services, freelance/consulting work, and other viable career paths.
-   **Be Specific:** Recommend concrete career paths like "AI Developer," "VLSI Engineer," "UI/UX Designer," "Digital Marketing Manager," "IAS Officer," "Tech Startup Founder," "Freelance Consultant," etc.
-   **Focus on Capabilities:** For each recommended career path, provide a concise, one-sentence reason that highlights what capabilities, skills, or natural strengths the user has that make them well-suited for this career path. Avoid directly referencing their specific quiz answers.

---

**OUTPUT FORMAT:**
Your final output MUST be a single, clean, valid JSON object. Do not include any text or explanations outside of the JSON structure.

{
  "personaName": "...",
  "personaSummary": "...",
  "recommendedRoles": [
    {
      "role": "...",
      "reason": "..."
    },
    {
      "role": "...",
      "reason": "..."
    },
    {
      "role": "...",
      "reason": "..."
    },
    {
      "role": "...",
      "reason": "..."
    },
    {
      "role": "...",
      "reason": "..."
    }
  ]
}`;
};

// Prompt for generating recommendations based on a stated goal
const generateGoalBasedRecommendationsPrompt = (userGoal: string, validationAnswers: Record<string, any>): string => {
  return `**ROLE:**
You are an expert career counselor and occupational psychologist. Your specialty is guiding young Indian students (ages 18-24) from diverse backgrounds toward fulfilling and future-proof careers. You have a deep understanding of the current Indian job market, including tech, creative, government, and skilled-trade roles. You are empathetic and excel at finding the hidden signals in a person's life story.

---

**CONTEXT:**
A student has already decided on a specific career goal and has answered a 5-question validation quiz. Your task is to analyze their stated goal in light of their motivations and preferences to provide personalized career recommendations.

* **User's Stated Career Goal:** "${userGoal}"

* **User's Validation Quiz Answers:**
    1.  **Primary Drive:** "${validationAnswers.primaryDrive}"
    2.  **10-Year Vision:** "${validationAnswers.tenYearVision}"
    3.  **Problem-Solving Approach:** "${validationAnswers.problemSolvingApproach}"
    4.  **Preferred Learning Style:** "${validationAnswers.preferredLearningStyle}"
    5.  **Confidence Rating (1-5):** "${validationAnswers.confidenceRating}"

---

**TASK:**
Based on your expert analysis, perform the following two tasks:

**Part 1: Generate a Dynamic Career Persona**
Synthesize the user's stated goal and validation answers into a single, insightful, and encouraging career persona. This persona should feel unique and personal to the user.
-   **Persona Name:** Create a descriptive and evocative name that reflects both their stated goal and personal characteristics.
-   **Persona Summary:** Write a 2-3 sentence summary that highlights the user's incredible potential and natural strengths. Emphasize what they're naturally good at and what type of work they would love. Connect their stated goal with their motivations.

**Part 2: Recommend 5 Specific Career Paths**
Based on the user's stated goal and validation answers, recommend the top 5 most suitable and specific career paths in the current Indian market that align with their interests and motivations.
-   **Be Inclusive:** Include traditional jobs, entrepreneurship opportunities, civil services, freelance/consulting work, and other viable career paths.
-   **Be Specific:** Recommend concrete career paths like "AI Developer," "VLSI Engineer," "UI/UX Designer," "Digital Marketing Manager," "IAS Officer," "Tech Startup Founder," "Freelance Consultant," etc.
-   **Focus on Alignment:** For each recommended career path, provide a concise, one-sentence reason that highlights how this path aligns with their stated goal and personal motivations.

---

**OUTPUT FORMAT:**
Your final output MUST be a single, clean, valid JSON object. Do not include any text or explanations outside of the JSON structure.

{
  "personaName": "...",
  "personaSummary": "...",
  "recommendedRoles": [
    {
      "role": "...",
      "reason": "..."
    },
    {
      "role": "...",
      "reason": "..."
    },
    {
      "role": "...",
      "reason": "..."
    },
    {
      "role": "...",
      "reason": "..."
    },
    {
      "role": "...",
      "reason": "..."
    }
  ]
}`;
};

// Prompt for generating deep dive content for a specific role
const generateDeepDivePrompt = (role: string, personaContext: string): string => {
  return `**ROLE:**
You are an expert career counselor and occupational psychologist. Your specialty is guiding young Indian students (ages 18-24) from diverse backgrounds toward fulfilling and future-proof careers. You have a deep understanding of the current Indian job market, including tech, creative, government, skilled-trade roles, entrepreneurship opportunities, and freelance/consulting work.

---

**CONTEXT:**
Based on a student's psychology quiz answers, we've identified a specific career path that matches their personality and interests. Your task is to provide comprehensive information about this career path to help them understand what it entails.

**CAREER PATH TO ANALYZE:** ${role}

**PERSONA CONTEXT:** ${personaContext}

---

**TASK:**
Provide detailed, accurate, and encouraging information about this career path specifically for the Indian job market. Include information relevant to whether this is a traditional job, civil service, entrepreneurial path, freelance opportunity, etc. Adjust the information structure based on the type of career path:

- For Traditional Jobs: Include corporate hierarchy, typical work hours, office environment
- For Entrepreneurship: Include startup costs, funding options, risk factors, growth potential
- For Civil Services: Include exam process, training, posting patterns, job security
- For Freelance/Consulting: Include client acquisition, pricing models, work-life balance
- For Other Paths: Include relevant specific information

**OUTPUT FORMAT:**
Your final output MUST be a single, clean, valid JSON object. Do not include any text or explanations outside of the JSON structure.

{
  "role": "${role}",
  "description": "A comprehensive 2-3 sentence description of what this career path entails and why someone with the user's persona would love it",
  "dailyResponsibilities": [
    "Key responsibility 1 that aligns with user's interests",
    "Key responsibility 2 that leverages user's strengths",
    "Key responsibility 3 that provides satisfaction",
    "Key responsibility 4 that offers growth",
    "Key responsibility 5 that creates impact"
  ],
  "salaryRange": {
    "entry": "Entry-level compensation (salary for jobs, initial investment for entrepreneurship, starting stipend for civil services, etc.)",
    "mid": "Mid-level compensation (growth potential for entrepreneurship, mid-level salary for jobs)",
    "senior": "Senior-level compensation (success metrics for entrepreneurship, senior salary for jobs)"
  },
  "careerPath": [
    "Year 1: Typical starting position or initial steps",
    "Year 2: Expected progression or milestones",
    "Year 3: Mid-level position or established presence",
    "Year 5: Senior position or significant achievement",
    "Year 7-10: Leadership/Expert role or scalable success"
  ],
  "requiredSkills": [
    "Technical skill 1",
    "Technical skill 2",
    "Soft skill 1",
    "Soft skill 2",
    "Industry-specific skill"
  ],
  "education": "Educational requirements and alternative paths",
  "jobMarket": "Current job market outlook in India for this career path"
};`;
};

// Function to generate persona and role recommendations
export async function generatePersonaAndRoles(quizAnswers: Record<string, any>): Promise<AIRecommendationResponse> {
  // Check if we're running on the server
  if (typeof window === 'undefined') {
    // Server-side: Get API key safely
    const apiKey = getApiKey();
    
    // Server-side check
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment variables");
      console.log("Available env vars:", Object.keys(process.env).filter(key => key.includes('GEMINI') || key.includes('NEXT') || key.includes('GOOGLE')));
      // Return fallback data
      return getFallbackRecommendations();
    }
    
    try {
      console.log("Attempting to call Gemini API with key:", apiKey.substring(0, 5) + "...");
      
      // Initialize the Google Generative AI client on the server
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Get the generative model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Generate the prompt
      const prompt = generateMasterPrompt(quizAnswers);
      
      console.log("Generated prompt length:", prompt.length);
      
      // Call the AI API
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log("Received response from Gemini API, length:", text.length);
      
      // Parse the JSON response
      // Remove any markdown formatting if present
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedResponse = JSON.parse(cleanText);
      
      console.log("Successfully parsed AI response");
      
      return parsedResponse;
    } catch (error: any) {
      console.error("Error generating persona and roles:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      // Don't return fallback, re-throw the error so it's handled upstream
      throw error;
    }
  } else {
    // Client-side - return fallback data
    console.warn("AI service should only be called on the server side");
    return getFallbackRecommendations();
  }
}

// Function to generate deep dive content for a specific role
export async function generateRoleDeepDive(role: string, personaContext: string): Promise<AIDeepDiveResponse> {
  // Check if we're running on the server
  if (typeof window === 'undefined') {
    // Server-side: Get API key safely
    const apiKey = getApiKey();
    
    // Server-side check
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment variables");
      // Return fallback data
      return getFallbackDeepDive(role);
    }
    
    try {
      console.log("Attempting to call Gemini API for deep dive with key:", apiKey.substring(0, 5) + "...");
      
      // Initialize the Google Generative AI client on the server
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Get the generative model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Generate the prompt
      const prompt = generateDeepDivePrompt(role, personaContext);
      
      console.log("Generated deep dive prompt length:", prompt.length);
      
      // Call the AI API
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log("Received deep dive response from Gemini API, length:", text.length);
      
      // Parse the JSON response
      // Remove any markdown formatting if present
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedResponse = JSON.parse(cleanText);
      
      console.log("Successfully parsed deep dive AI response");
      
      return parsedResponse;
    } catch (error: any) {
      console.error("Error generating role deep dive:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      // Don't return fallback, re-throw the error so it's handled upstream
      throw error;
    }
  } else {
    // Client-side - return fallback data
    console.warn("AI service should only be called on the server side");
    return getFallbackDeepDive(role);
  }
}

// Helper function to get fallback recommendations
function getFallbackRecommendations(): AIRecommendationResponse {
  return {
    personaName: "The Adaptive Explorer",
    personaSummary: "You're curious and flexible, with a natural ability to adapt to different environments. You thrive when you can explore various options before committing to a path.",
    recommendedRoles: [
      {
        role: "Full Stack Developer",
        reason: "Your adaptable nature makes you well-suited for a role that combines both technical and creative problem-solving."
      },
      {
        role: "Digital Marketing Entrepreneur",
        reason: "Your curiosity and adaptability are perfect for starting your own digital marketing agency, allowing for remote work and creative freedom."
      },
      {
        role: "Civil Services (IAS/IPS)",
        reason: "Your balanced approach to decision-making and interest in social impact make government service an excellent fit for creating systemic change."
      },
      {
        role: "Freelance UX Consultant",
        reason: "Your exploratory mindset and communication skills are valuable for working independently with various clients on user experience projects."
      },
      {
        role: "EdTech Product Manager",
        reason: "Your flexible nature and interest in education make you effective at managing products that combine technology with learning."
      }
    ]
  };
}

// Helper function to get fallback deep dive data
function getFallbackDeepDive(role: string): AIDeepDiveResponse {
  return {
    role: role,
    description: `A ${role} is a professional who specializes in this field. This role typically involves a combination of technical skills and soft skills to deliver value in their domain.`,
    dailyResponsibilities: [
      "Performing core duties related to the role",
      "Collaborating with team members on projects",
      "Attending meetings and providing updates",
      "Documenting processes and outcomes",
      "Continuously learning and adapting to new challenges"
    ],
    salaryRange: {
      entry: "₹3,00,000 - ₹6,00,000 per year",
      mid: "₹6,00,000 - ₹12,00,000 per year",
      senior: "₹12,00,000 - ₹25,00,000 per year"
    },
    careerPath: [
      "Year 1: Entry-level position",
      "Year 2: Junior specialist",
      "Year 3: Mid-level professional",
      "Year 5: Senior specialist or team lead",
      "Year 7-10: Manager or domain expert"
    ],
    requiredSkills: [
      "Core technical skills for the role",
      "Communication and collaboration",
      "Problem-solving abilities",
      "Time management and organization",
      "Continuous learning mindset"
    ],
    education: "A bachelor's degree in a relevant field is typically required, though alternative education paths and certifications may be available.",
    jobMarket: "This role has steady demand in the Indian job market with opportunities across various industries and company sizes."
  };
}