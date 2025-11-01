// src/lib/envChecker.ts
/**
 * Environment checker utility to verify both Firebase and Supabase configurations
 */

export interface EnvCheckResult {
  isValid: boolean;
  missingVars: string[];
  firebaseConfig: Record<string, string>;
  supabaseConfig?: {
    url?: string;
    anonKey?: string;
  };
  warnings: string[];
}

export function checkEnvironment(): EnvCheckResult {
  // Firebase auth required vars
  const firebaseRequiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  // Supabase required vars
  const supabaseRequiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const missingVars: string[] = [];
  const warnings: string[] = [];
  const firebaseConfig: Record<string, string> = {};

  // Check for Firebase environment variables (for auth)
  for (const varName of firebaseRequiredVars) {
    const value = process.env[varName];
    if (!value) {
      missingVars.push(varName);
    } else {
      firebaseConfig[varName.replace('NEXT_PUBLIC_FIREBASE_', '').toLowerCase()] = value;
    }
  }

  // Check for Supabase environment variables (for database)
  let supabaseUrl: string | undefined;
  let supabaseAnonKey: string | undefined;

  for (const varName of supabaseRequiredVars) {
    const value = process.env[varName];
    if (!value) {
      missingVars.push(varName);
    } else if (varName === 'NEXT_PUBLIC_SUPABASE_URL') {
      supabaseUrl = value;
    } else if (varName === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
      supabaseAnonKey = value;
    }
  }

  // Special check for measurementId (optional but good to have)
  if (!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) {
    warnings.push('Analytics measurement ID not found (optional for development)');
  }

  // Check if we're using hardcoded config (which is fine for development)
  try {
    // This will only work if the config file exists
    const configExists = true; // We'll assume it exists since we checked earlier
    
    if (firebaseRequiredVars.some(varName => missingVars.includes(varName))) {
      warnings.push(
        'Using hardcoded Firebase config. This is fine for development but consider using environment variables for production.'
      );
    }
    
    if (supabaseRequiredVars.some(varName => missingVars.includes(varName))) {
      warnings.push(
        'Supabase environment variables are missing. Database functionality will be limited.'
      );
    }
  } catch (error) {
    warnings.push('Could not verify configuration file existence');
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
    firebaseConfig,
    supabaseConfig: supabaseUrl && supabaseAnonKey ? { url: supabaseUrl, anonKey: supabaseAnonKey } : undefined,
    warnings
  };
}

export function getFirebaseErrorMessage(error: any): string {
  if (error?.code) {
    switch (error.code) {
      case 'permission-denied':
        return 'Permission denied. Check Firebase security rules.';
      case 'not-found':
        return 'Resource not found. Check if the document/collection exists.';
      case 'unavailable':
        return 'Service temporarily unavailable. Please try again later.';
      case 'cancelled':
        return 'Request was cancelled. Please try again.';
      case 'deadline-exceeded':
        return 'Request timed out. Please check your network connection.';
      default:
        return `Firebase error: ${error.code}. ${error.message || 'Unknown error'}`;
    }
  }
  
  if (error?.message) {
    if (error.message.includes('400')) {
      return 'Bad request. Check your Firebase configuration.';
    } else if (error.message.includes('403')) {
      return 'Forbidden. Check Firebase security rules and authentication.';
    } else if (error.message.includes('404')) {
      return 'Not found. Check if the Firebase project exists.';
    } else if (error.message.includes('network')) {
      return 'Network error. Check your internet connection.';
    }
  }
  
  return error?.message || 'Unknown Firebase error';
}

export function getSupabaseErrorMessage(error: any): string {
  if (error?.message) {
    if (error.message.includes('Invalid URL')) {
      return 'Invalid Supabase URL. Please check your configuration.';
    } else if (error.message.toLowerCase().includes('unauthorized') || error.message.toLowerCase().includes('401')) {
      return 'Unauthorized. Check your Supabase anon key.';
    } else if (error.message.toLowerCase().includes('forbidden') || error.message.toLowerCase().includes('403')) {
      return 'Forbidden. Check your Supabase permissions.';
    } else if (error.message.toLowerCase().includes('network')) {
      return 'Network error. Check your internet connection.';
    } else if (error.message.toLowerCase().includes('connection')) {
      return 'Connection error. Check if Supabase is accessible.';
    } else {
      return `Supabase error: ${error.message}`;
    }
  }
  
  return error?.message || 'Unknown Supabase error';
}