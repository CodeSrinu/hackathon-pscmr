# Career Quest Project Summary

## Core Idea
AI-powered career guidance platform that helps users discover suitable career paths through psychological assessments and personalized recommendations.

## Tech Stack
Next.js, Supabase, Google Cloud Functions, OpenAI/Gemini API.

## Current Progress
- Onboarding and Psychology Quiz UI are complete.
- Supabase database migration successfully implemented, replacing Firebase Firestore.
- Backend API integration with AI services for recommendations and career guidance.
- Email authentication system implemented (sign in and sign up without verification) to replace problematic Google sign-in flow.

## Current Task
Implementing email authentication system to allow sharing the app for feedback while avoiding Google sign-in issues on Vercel deployment.

## Key Decisions
- Pivoted from Firebase to Supabase for database operations to improve scalability and real-time capabilities.
- Maintained Firebase authentication while migrating only database functionality to Supabase.
- Pivoted from Banyan Tree to Duolingo UI for the roadmap.
- Implemented email/password authentication as an alternative to Google sign-in to avoid deployment issues.