# Supabase Schema for Career Quest

This document outlines the Supabase schema that will replace the Firebase collections in the Career Quest application.

## Tables

### 1. users
- id (text) - Primary key (same as auth.users.id)
- name (text)
- email (text)
- created_at (timestamp)
- last_login (timestamp)
- demographics (jsonb) - { age: number, location: string, education: string }
- preferences (jsonb) - { hasGoal: boolean, goal: string, language: string }
- onboarding_completed (timestamp)
- updated_at (timestamp)

### 2. quiz_responses
- id (uuid) - Primary key, default: gen_random_uuid()
- user_id (text) - Foreign key referencing users.id
- answers (jsonb) - { questionId: answerValue }
- timestamp (timestamp)
- quiz_version (text)
- user_agent_info (text)

### 3. user_recommendations
- id (uuid) - Primary key, default: gen_random_uuid()
- user_id (text) - Foreign key referencing users.id
- persona (jsonb) - The persona object returned by the recommendation engine
- domains (jsonb) - Array of domain match objects
- timestamp (timestamp)
- engine_version (text)

### 4. user_feedback
- id (uuid) - Primary key, default: gen_random_uuid()
- user_id (text) - Foreign key referencing users.id
- recommendation_id (uuid) - Foreign key referencing user_recommendations.id
- domain_id (text) - The domain that was rated
- rating (integer) - 1-5 rating
- comments (text)
- timestamp (timestamp)
- helpfulness (integer) - 1-5
- accuracy (integer) - 1-5
- relevance (integer) - 1-5
- ease_of_use (integer) - 1-5
- would_recommend (boolean)
- improvement_suggestions (text)
- quiz_question_feedback (jsonb)
- domain_specific_feedback (jsonb)
- user_agent_info (text)
- session_duration (integer)