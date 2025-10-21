'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/contexts/AuthContext';
import { SignupInput } from '@/lib/validations';

export default function SignupPage() {
    const router = useRouter();
    const { user, checkAuth } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            router.push('/issues');
        }
    }, [user, router]);

    const handleSignup = async (data: SignupInput) => {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Signup failed');
        }

        // Check auth to update user state and redirect
        await checkAuth();
        router.push('/issues');
    };

    // Don't render if already logged in
    if (user) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="w-20 h-20 gradient-success rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                        </svg>
                    </div>
                    <h2 className="text-4xl font-bold text-slate-800 mb-2">
                        🚀 Join Us Today!
                    </h2>
                    <p className="text-lg font-medium text-slate-600">
                        Create your account to start managing projects
                    </p>
                </div>
                <div className="card shadow-2xl border-2 border-slate-200">
                    <AuthForm type="signup" onSubmit={handleSignup} />
                </div>
            </div>
        </div>
    );
}