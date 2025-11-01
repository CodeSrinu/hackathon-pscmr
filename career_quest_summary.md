# Career Quest Application Summary

## Core Idea
The Career Quest application is an "AI Mentor" system - a language-smart, zero-cost Learning Management System (LMS) that lives entirely in-app and turns any learner into a job-ready professional. It uses psychology-based quizzes and AI (Google Gemini) to help users discover career paths that match their interests and personality, then provides personalized learning paths to become job-ready.

## Tech Stack
- Next.js 14 (frontend framework)
- Firebase (authentication and backend, though currently experiencing issues)
- Google Cloud Functions
- Google Generative AI (Gemini API for AI-powered recommendations)
- Tailwind CSS (styling)
- TypeScript (type safety)
- NextAuth.js (Google OAuth authentication)

## Current Progress
- [x] User authentication flow with Google OAuth (simplified for demo)
- [x] Language selection interface (Telugu, Hindi, Tamil, Marathi)
- [x] Goal setting workflow (users can either set a goal or discover one through psychology questions)
- [x] Psychology-based goal discovery with a 10-question quiz
- [x] AI-powered career recommendations using Google Gemini
- [x] Domain explorer with 8 career domains and sub-roles
- [x] Role deep-dive pages with detailed career information
- [x] Goal validation for users with existing goals
- [x] Skill assessment component
- [x] Learning path system
- [x] Gamification and progress tracking elements
- [x] Responsive UI with mobile-first design
- [x] Animated progress indicators and UI/UX enhancements

## Current Task
Based on the files and documentation, the project appears to be fully implemented as an MVP for the hackathon. The main focus seems to be on:
- Refining the AI integration for better career recommendations
- Potentially addressing Firebase connectivity issues
- Further enhancing the gamification elements
- Implementing the full learning path and course content delivery system

## Key Decisions
- Pivoted from Banyan Tree to Duolingo UI for the roadmap (as mentioned in the roadmap document)
- Implemented a psychology-based quiz system for career discovery with 10 questions
- Chose Google Generative AI (Gemini) for AI-powered career recommendations
- Designed a mobile-first responsive UI with Tailwind CSS
- Created 8 major career domains with multiple sub-roles in each:
  1. Digital & Core Tech
  2. Data, AI & Research
  3. Healthcare & Life Sciences
  4. Education & Academia
  5. Business, Management & Support
  6. Creative, Media & Performing Arts
  7. Skilled Trades, Services & Physical
  8. Entrepreneurship & Self-Employment
- Implemented a gamified learning path system with courses, projects, and rewards
- Designed the system to work with native-language subtitled videos for Indian users

The application is designed to be a complete career guidance and learning platform that takes users from career discovery to job readiness through personalized, AI-driven learning paths.