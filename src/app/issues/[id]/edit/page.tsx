'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { updateIssueSchema } from '@/lib/validations';
import { useApiError } from '@/hooks/useApiError';
import { useToast } from '@/contexts/ToastContext';

interface Issue {
    id: string;
    title: string;
    description: string;
    status: 'OPEN' | 'CLOSED';
    createdAt: string;
    updatedAt: string;
    author: {
        id: string;
        email: string;
        role: 'USER' | 'ADMIN';
    };
}

interface IssueEditPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function IssueEditPage({ params }: IssueEditPageProps) {
    const [issue, setIssue] = useState<Issue | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const { user } = useAuth();
    const router = useRouter();
    const [issueId, setIssueId] = useState<string>('');
    const { handleApiError, handleFetchError } = useApiError();
    const { showSuccess } = useToast();

    const fetchIssue = useCallback(async () => {
        if (!issueId) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/issues/${issueId}`);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Issue not found');
                }
                throw new Error('Failed to fetch issue');
            }

            const data = await response.json();
            setIssue(data);
            setFormData({
                title: data.title,
                description: data.description,
            });
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [issueId]);

    useEffect(() => {
        const getParams = async () => {
            const resolvedParams = await params;
            setIssueId(resolvedParams.id);
        };
        getParams();
    }, [params]);

    useEffect(() => {
        if (issueId) {
            fetchIssue();
        }
    }, [issueId, fetchIssue]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!issue) return;

        // Validate form data
        const validationResult = updateIssueSchema.safeParse(formData);
        if (!validationResult.success) {
            const errors: Record<string, string> = {};
            validationResult.error.issues.forEach((issue) => {
                if (issue.path[0]) {
                    errors[issue.path[0] as string] = issue.message;
                }
            });
            setValidationErrors(errors);
            return;
        }

        try {
            setSaving(true);
            setError(null);

            const response = await fetch(`/api/issues/${issue.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            await handleFetchError(response);

            showSuccess('Issue Updated', 'Your changes have been saved successfully');
            router.push(`/issues/${issue.id}`);
        } catch (err) {
            handleApiError(err);
            setError(err instanceof Error ? err.message : 'Failed to update issue');
        } finally {
            setSaving(false);
        }
    };

    // Check permissions
    const canEdit = user && issue && (user.id === issue.author.id || user.role === 'ADMIN');

    if (loading) {
        return (
            <ProtectedRoute>
                <Navigation />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-64">
                        <LoadingSpinner size="lg" text="Loading issue..." />
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error && !issue) {
        return (
            <ProtectedRoute>
                <Navigation />
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-red-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <p className="text-sm text-red-700 mt-1">{error}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link
                                href="/issues"
                                className="text-sm text-red-600 hover:text-red-500 underline"
                            >
                                ← Back to Issues
                            </Link>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!issue || !canEdit) {
        return (
            <ProtectedRoute>
                <Navigation />
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-yellow-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">Access Denied</h3>
                                <p className="text-sm text-yellow-700 mt-1">
                                    You don&apos;t have permission to edit this issue.
                                </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link
                                href={`/issues/${issueId}`}
                                className="text-sm text-yellow-600 hover:text-yellow-500 underline"
                            >
                                ← Back to Issue
                            </Link>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <Navigation />
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href={`/issues/${issue.id}`}
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Back to Issue
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Issue</h1>
                </div>

                {/* Edit Form */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg
                                        className="h-5 w-5 text-red-400"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.title
                                    ? 'border-red-300 focus:border-red-500'
                                    : 'border-gray-300 focus:border-blue-500'
                                    }`}
                                placeholder="Enter issue title"
                            />
                            {validationErrors.title && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={8}
                                value={formData.description}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.description
                                    ? 'border-red-300 focus:border-red-500'
                                    : 'border-gray-300 focus:border-blue-500'
                                    }`}
                                placeholder="Describe the issue in detail"
                            />
                            {validationErrors.description && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                            <Link
                                href={`/issues/${issue.id}`}
                                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {saving ? (
                                    <div className="flex items-center">
                                        <LoadingSpinner size="sm" className="mr-2" />
                                        Saving...
                                    </div>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </ProtectedRoute>
    );
}