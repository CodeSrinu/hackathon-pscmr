'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function EmailAuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { status } = useSession();

  // If user is already authenticated, redirect to main app
  if (status === 'authenticated') {
    router.push('/');
  }

  const validateInputs = () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Handle login
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false, // Don't redirect automatically
        });

        if (result?.error) {
          setError(result.error);
        } else {
          // Successful login
          router.push('/');
        }
      } else {
        // Handle signup - create user in Supabase Auth
        const { createClient } = await import('@supabase/supabase-js');

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          setError('Application configuration error. Please contact support.');
          return;
        }

        // Create a new Supabase client for signup
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Sign up the user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: email.split('@')[0] // Use part of email as name
            }
          }
        });

        if (error) {
          throw error;
        }

        // If signup is successful, sign in automatically
        const signInResult = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (signInResult?.error) {
          setError(signInResult.error);
        } else {
          // Successful signup and login
          router.push('/');
        }
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-grow flex flex-col px-6 pt-8">
        {/* Hero Graphic */}
        <div className="w-full h-64 rounded-xl overflow-hidden">
          <svg className="w-full h-full" fill="none" viewBox="0 0 375 256" xmlns="http://www.w3.org/2000/svg">
            <path d="M-154.5 137.957C-79.6667 87.7905 51 31.9571 133.5 137.957C216 243.957 325.5 289.457 419.5 208.457" stroke="#3fe44a" strokeLinecap="round" strokeWidth="80"></path>
            <path d="M-134 266.957C-59.1667 216.791 71.5 160.957 154 266.957C236.5 372.957 346 418.457 440 337.457" stroke="#e8f3e9" strokeLinecap="round" strokeWidth="60"></path>
          </svg>
        </div>

        {/* Logo and Title */}
        <div className="text-center mt-8">
          <h2 className="text-2xl font-bold text-[#333333]">Career Quest</h2>
        </div>

        <div className="text-center mt-8">
          <h1 className="text-4xl font-extrabold text-[#333333] tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <h3 className="text-lg text-[#666666] mt-4">
            {isLogin
              ? 'Sign in to continue your career journey'
              : 'Start your career journey with us'}
          </h3>

          {/* Demo credentials hint */}
          {isLogin && (
            <div className="mt-4 p-3 bg-[#e8f3e9] rounded-lg text-sm">
              <span className="font-medium text-[#333333]">Demo: </span>
              <span className="text-[#666666]">demo@careerquest.com / demo123</span>
            </div>
          )}
        </div>

        {/* Email Authentication Form */}
        <div className="mt-8 w-full">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#333333] mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#e0e0e0] rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#3fe44a] focus:border-transparent"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#333333] mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#e0e0e0] rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#3fe44a] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#333333] mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-[#e0e0e0] rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#3fe44a] focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            )}

            {error && (
              <div className="text-red-500 text-sm py-2 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#3fe44a] text-white font-bold py-3 px-4 rounded-lg shadow-sm ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#34c741]'
                }`}
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          {/* Toggle between Login/Signup */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-[#3fe44a] font-medium text-sm underline"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 text-center">
        <p className="text-xs text-[#666666]">
          By continuing, you agree to our
          <a className="underline" href="#"> Terms of Service</a> and
          <a className="underline" href="#"> Privacy Policy</a>.
        </p>
      </footer>
    </div>
  );
}