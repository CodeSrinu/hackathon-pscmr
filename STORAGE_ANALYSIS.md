# Storage Analysis & Caching Strategy

## Current Storage Status

### ✅ **Data Currently Being Stored**

| Data Type | localStorage Key | Stored Location | Retrieved Location | Status |
|-----------|-----------------|-----------------|-------------------|--------|
| **Career Quest Roadmap** | `careerQuest_roadmap` | `CareerQuestRoadmap.tsx:103` | `learning-module/page.tsx:75` | ✅ Working |
| **Assessment Data** | `careerQuest_assessmentData` | `AISkillAssessment.tsx:244` | `career-quest/page.tsx:55` | ✅ Working |
| **Navigation Context** | `currentRoadmapData` | `learning-module/page.tsx:281` | `video-lecture/page.tsx:158` | ✅ Working |
| **User Language** | `userLanguage` | `page.tsx:97` | - | ✅ Working |
| **User State** | `userState` | `page.tsx:98` | - | ✅ Working |
| **User Goal** | `userGoal` | `page.tsx:101` | `video-lecture/page.tsx:61` | ✅ Working |
| **User Doubts** | `userDoubts` | `video-lecture/page.tsx:250` | - | ✅ Working |
| **Lecture Notes** | `note_{lectureId}` | `video-lecture/page.tsx:212` | - | ✅ Working |
| **Lecture Data** | `currentLectureData` | `video-lecture/page.tsx:192` | `cheat-sheet/page.tsx:48` | ✅ Working |

### ❌ **Data NOT Being Stored (The Problem)**

| Data Type | API Endpoint | Used In | Impact | Priority |
|-----------|-------------|---------|--------|----------|
| **Course Roadmap/Syllabus** | `/api/course-roadmap` | `learning-module/page.tsx:104` | 🔴 **HIGH** - API called every navigation | **P0** |
| **Lecture Content** | `/api/learning-module/lecture` | `video-lecture/page.tsx:68` | 🔴 **HIGH** - API called for every lecture | **P0** |
| **Cheat Sheet Content** | `/api/learning-module/cheat-sheet` | `cheat-sheet/page.tsx` | 🟡 **MEDIUM** - API called for every cheat sheet | **P1** |
| **Quiz Content** | `/api/learning-module/quiz` | `quiz/page.tsx` | 🟡 **MEDIUM** - API called for every quiz | **P1** |
| **Assignment Content** | `/api/learning-module/assignment` | `assignment/page.tsx` | 🟡 **MEDIUM** - API called for every assignment | **P1** |

## Problem Scenario

### Current Flow (Without Caching):
```
User Journey:
1. Career Quest Roadmap → ✅ Cached
2. Click "Introduction to Anatomy" → ❌ API Call to /api/course-roadmap
3. Click "Lecture 1" → ❌ API Call to /api/learning-module/lecture
4. Back to Course → ❌ API Call to /api/course-roadmap (AGAIN!)
5. Click "Lecture 2" → ❌ API Call to /api/learning-module/lecture
6. Back to Course → ❌ API Call to /api/course-roadmap (AGAIN!)
```

**Result**: 
- 6 page navigations = 5 API calls
- Slow navigation
- Wasted AI API credits
- Poor user experience

### Desired Flow (With Caching):
```
User Journey:
1. Career Quest Roadmap → ✅ Cached
2. Click "Introduction to Anatomy" → API Call → ✅ Cache Result
3. Click "Lecture 1" → API Call → ✅ Cache Result
4. Back to Course → ✅ Load from Cache (No API call!)
5. Click "Lecture 2" → API Call → ✅ Cache Result
6. Back to Course → ✅ Load from Cache (No API call!)
```

**Result**:
- 6 page navigations = 3 API calls (50% reduction!)
- Fast navigation
- Lower costs
- Better UX

## Recommended Caching Strategy

### 1. **Course Roadmap Caching** (Priority: P0)

**File**: `app/learning-module/page.tsx`

**Current Code** (Lines 104-114):
```typescript
// Always calls API
const response = await fetch('/api/course-roadmap', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    courseId: nodeId,
    courseTitle: courseTitle,
    careerField: roleName
  }),
});
```

**Proposed Solution**:
```typescript
// Check cache first
const cacheKey = `courseRoadmap_${nodeId}`;
const cachedRoadmap = localStorage.getItem(cacheKey);

if (cachedRoadmap) {
  console.log("✅ Loading course roadmap from cache");
  const data = JSON.parse(cachedRoadmap);
  // Use cached data
  setLearningModule(transformData(data));
  setLoading(false);
  return;
}

// If not cached, call API
const response = await fetch('/api/course-roadmap', { ... });
const data = await response.json();

// Store in cache
localStorage.setItem(cacheKey, JSON.stringify(data));
```

**Benefits**:
- ✅ Instant loading on back navigation
- ✅ 50-70% reduction in API calls
- ✅ Better user experience

### 2. **Lecture Content Caching** (Priority: P0)

**File**: `app/learning-module/video-lecture/page.tsx`

**Current Code** (Lines 68-81):
```typescript
// Always calls API
const response = await fetch('/api/learning-module/lecture', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    lectureId,
    moduleId,
    moduleName: lectureTitle,
    lectureTitle: lectureTitle,
    careerField: careerField,
    userId: 'default-user'
  }),
});
```

**Proposed Solution**:
```typescript
// Check cache first
const cacheKey = `lecture_${lectureId}_${moduleId}`;
const cachedLecture = localStorage.getItem(cacheKey);

if (cachedLecture) {
  console.log("✅ Loading lecture from cache");
  const data = JSON.parse(cachedLecture);
  setLecture(data);
  setLoading(false);
  return;
}

// If not cached, call API
const response = await fetch('/api/learning-module/lecture', { ... });
const data = await response.json();

// Store in cache
localStorage.setItem(cacheKey, JSON.stringify(data));
```

**Benefits**:
- ✅ Instant lecture loading on revisit
- ✅ Reduced AI API costs
- ✅ Offline capability (if cached)

### 3. **Cache Invalidation Strategy**

**When to Clear Cache**:
1. **User logs out** - Clear all user-specific data
2. **New assessment** - Clear roadmap caches
3. **Manual refresh** - Add "Refresh Content" button
4. **Time-based** - Clear cache after 24 hours (optional)

**Implementation**:
```typescript
// Add cache timestamp
const cacheData = {
  data: actualData,
  timestamp: Date.now(),
  version: '1.0'
};
localStorage.setItem(cacheKey, JSON.stringify(cacheData));

// Check cache age
const cached = JSON.parse(localStorage.getItem(cacheKey));
const cacheAge = Date.now() - cached.timestamp;
const maxAge = 24 * 60 * 60 * 1000; // 24 hours

if (cacheAge > maxAge) {
  console.log("⚠️ Cache expired, fetching fresh data");
  // Fetch new data
}
```

## Implementation Plan

### Phase 1: Critical Caching (P0) - Immediate
1. ✅ Add caching to `learning-module/page.tsx` for course roadmap
2. ✅ Add caching to `video-lecture/page.tsx` for lecture content
3. ✅ Add cache key generation utility
4. ✅ Add cache retrieval logic with fallback

### Phase 2: Extended Caching (P1) - Next Sprint
1. Add caching for cheat sheets
2. Add caching for quizzes
3. Add caching for assignments
4. Add cache management UI

### Phase 3: Advanced Features (P2) - Future
1. Implement IndexedDB for larger storage
2. Add service worker for offline support
3. Implement cache versioning
4. Add cache analytics

## Storage Limits & Considerations

### localStorage Limits:
- **Size**: ~5-10MB per domain
- **Synchronous**: Blocks main thread
- **String only**: Must JSON.stringify/parse

### Current Usage Estimate:
- Career Quest Roadmap: ~50KB
- Course Roadmap: ~20KB per course
- Lecture Content: ~10KB per lecture
- Total for 10 courses: ~250KB (well within limits)

### Best Practices:
1. ✅ Compress large data before storing
2. ✅ Use meaningful cache keys
3. ✅ Handle quota exceeded errors
4. ✅ Clean up old/unused caches
5. ✅ Add try-catch for all localStorage operations

## Expected Performance Improvements

### Before Caching:
- Course Roadmap Load: 2-3 seconds (API call)
- Lecture Load: 3-5 seconds (AI generation)
- Back Navigation: 2-3 seconds (re-fetch)
- **Total for 5 navigations**: ~15-20 seconds

### After Caching:
- Course Roadmap Load (first): 2-3 seconds (API call)
- Course Roadmap Load (cached): <100ms
- Lecture Load (first): 3-5 seconds (AI generation)
- Lecture Load (cached): <100ms
- Back Navigation: <100ms
- **Total for 5 navigations**: ~5-8 seconds

**Performance Gain**: 60-70% faster navigation! 🚀

## Next Steps

1. **Review this analysis** with the team
2. **Implement Phase 1** caching for course roadmap and lectures
3. **Test** with real user flows
4. **Monitor** cache hit rates and performance
5. **Iterate** based on metrics

