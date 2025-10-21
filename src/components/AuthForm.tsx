'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signupSchema, loginSchema, SignupInput, LoginInput } from '@/lib/validations';
import { useApiError } from '@/hooks/useApiError';
import { useToast } from '@/contexts/ToastContext';

interface AuthFormProps {
    type: 'login' | 'signup';
    onSubmit: (data: SignupInput | LoginInput) => Promise<void>;
}

export default function AuthForm({ type, onSubmit }: AuthFormProps) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { handleApiError } = useApiError();
    const { showSuccess } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const schema = type === 'signup' ? signupSchema : loginSchema;
        const result = schema.safeParse(formData);

        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                if (issue.path[0]) {
                    fieldErrors[issue.path[0] as string] = issue.message;
                }
            });
            setErrors(fieldErrors);
            return false;
        }

        setErrors({});
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit(formData);
            showSuccess(
                type === 'signup' ? 'Account Created' : 'Login Successful',
                type === 'signup' ? 'Welcome to the issue tracker!' : 'Welcome back!'
            );
        } catch (error) {
            handleApiError(error);
            setErrors({
                submit: error instanceof Error ? error.message : 'An error occurred'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                    📧 Email Address
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`input-field ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter your email address"
                />
                {errors.email && (
                    <p className="mt-2 text-sm font-bold text-red-600 bg-red-50 p-2 rounded-lg">{errors.email}</p>
                )}
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">
                    🔒 Password
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={type === 'signup' ? 'new-password' : 'current-password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`input-field ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter your password"
                />
                {errors.password && (
                    <p className="mt-2 text-sm font-bold text-red-600 bg-red-50 p-2 rounded-lg">{errors.password}</p>
                )}
            </div>

            {errors.submit && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-red-600 text-sm">⚠️</span>
                        </div>
                        <p className="text-sm font-bold text-red-700">{errors.submit}</p>
                    </div>
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-4 px-6 gradient-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed transform-none' : ''
                    }`}
            >
                {isLoading ? '⏳ Loading...' : type === 'signup' ? '🚀 Create Account' : '🔐 Sign In'}
            </button>

            <div className="text-center">
                <p className="text-sm font-medium text-slate-600">
                    {type === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                        type="button"
                        onClick={() => router.push(type === 'signup' ? '/login' : '/signup')}
                        className="font-bold text-blue-600 hover:text-purple-600 underline decoration-2 underline-offset-2 transition-colors duration-200"
                    >
                        {type === 'signup' ? '🔐 Sign in' : '🚀 Sign up'}
                    </button>
                </p>
            </div>
        </form>
    );
}