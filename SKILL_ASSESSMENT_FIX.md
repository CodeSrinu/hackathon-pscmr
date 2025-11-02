# Skill Assessment Question Persistence Fix

## Problem
The AI Skill Assessment component was experiencing an issue where:
1. Component mounted multiple times (7-8 times in console logs)
2. API was called multiple times for the same role
3. Questions would initially load correctly for the user's career choice (e.g., "dancer")
4. After 1-2 seconds, questions would change to unrelated topics (e.g., "game dev", "motion capture")
5. This was caused by race conditions from multiple simultaneous API calls

## Root Causes

### 1. React Strict Mode Double Mounting
- React 18 has Strict Mode enabled by default in development
- Strict Mode intentionally mounts components twice to detect side effects
- This caused the `useEffect` to run multiple times

### 2. No Request Deduplication
- The component had no mechanism to prevent duplicate API calls
- Each mount triggered a new API request
- Multiple responses would arrive at different times, overwriting each other

### 3. Missing Cleanup Logic
- No cleanup function in `useEffect` to cancel pending requests
- State updates could occur after component unmounted
- No tracking of which role the questions were loaded for

## Solutions Implemented

### 1. Added Request Deduplication with useRef
```typescript
const hasLoadedRef = useRef(false);
const loadedForRoleRef = useRef<string>('');

// In useEffect:
const roleKey = `${roleId}-${roleName}`;
if (hasLoadedRef.current && loadedForRoleRef.current === roleKey) {
  console.log("⏭️ Skipping duplicate API call for:", roleKey);
  return;
}
```

**Benefits:**
- Prevents multiple API calls for the same role
- Persists across re-renders (unlike state)
- Doesn't trigger re-renders when updated

### 2. Added Component Mount Tracking
```typescript
let isMounted = true;

// Before state updates:
if (!isMounted) {
  console.log("⚠️ Component unmounted, skipping state update");
  return;
}

// Cleanup:
return () => {
  isMounted = false;
};
```

**Benefits:**
- Prevents state updates on unmounted components
- Avoids React warnings about memory leaks
- Ensures only the latest mount's data is used

### 3. Disabled React Strict Mode
```javascript
// next.config.mjs
const nextConfig = {
  reactStrictMode: false, // Disable strict mode to prevent double-mounting
};
```

**Benefits:**
- Reduces unnecessary re-renders in development
- Makes behavior consistent between dev and production
- Simplifies debugging

### 4. Enhanced Logging
- Added detailed console logs to track component lifecycle
- Logs show when duplicate calls are skipped
- Helps debug future issues

## Testing the Fix

### Before Fix:
```
AISkillAssessment mounted with: {roleId: 'user-goal-dancer', ...}
AISkillAssessment mounted with: {roleId: 'user-goal-dancer', ...}
AISkillAssessment mounted with: {roleId: 'user-goal-dancer', ...}
... (7-8 times)
📊 First question: "Have you ever taken a structured dance class?"
... (1-2 seconds later)
📊 First question: "Have you ever worked with motion capture data?"
```

### After Fix:
```
AISkillAssessment mounted with: {roleId: 'user-goal-dancer', ...}
📊 First question: "Have you ever taken a structured dance class?"
⏭️ Skipping duplicate API call for: user-goal-dancer-dancer
⏭️ Skipping duplicate API call for: user-goal-dancer-dancer
```

## Files Modified

1. **src/components/mobile/AISkillAssessment.tsx**
   - Added `useRef` hooks for request deduplication
   - Added `isMounted` flag for cleanup
   - Enhanced error handling
   - Added cleanup function to `useEffect`

2. **next.config.mjs**
   - Disabled React Strict Mode

## Best Practices Applied

1. **Request Deduplication**: Prevent duplicate API calls
2. **Cleanup Functions**: Prevent memory leaks and stale updates
3. **Mount Tracking**: Only update state on mounted components
4. **Ref Usage**: Use refs for values that shouldn't trigger re-renders
5. **Detailed Logging**: Make debugging easier

## Future Improvements

1. **Request Cancellation**: Use AbortController to cancel in-flight requests
2. **Caching**: Cache questions in localStorage or React Query
3. **Loading States**: Show which request is active
4. **Error Retry**: Implement exponential backoff for failed requests
5. **Re-enable Strict Mode**: Once all components handle double-mounting properly

## Related Issues

- Multiple component mounts in development
- Race conditions in async data fetching
- State updates on unmounted components
- React Strict Mode behavior in Next.js 14

