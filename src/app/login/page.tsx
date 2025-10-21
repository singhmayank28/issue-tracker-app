'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/contexts/AuthContext';
import { LoginInput } from '@/lib/validations';

export default function LoginPage() {
    const router = useRouter();
    const { user, login } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            router.push('/issues');
        }
    }, [user, router]);

    const handleLogin = async (data: LoginInput) => {
        await login(data.email, data.password);
        router.push('/issues');
    };

    // Don't render if already logged in
    if (user) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h2 className="text-4xl font-bold text-slate-800 mb-2">
                        🔐 Welcome Back!
                    </h2>
                    <p className="text-lg font-medium text-slate-600">
                        Sign in to access your issue tracker dashboard
                    </p>
                </div>
                <div className="card shadow-2xl border-2 border-slate-200">
                    <AuthForm type="login" onSubmit={handleLogin} />
                </div>
            </div>
        </div>
    );
}