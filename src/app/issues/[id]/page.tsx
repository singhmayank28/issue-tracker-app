'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import CommentList from '@/components/CommentList';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';

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
    comments: Array<{
        id: string;
        content: string;
        createdAt: string;
        updatedAt: string;
        author: {
            id: string;
            email: string;
            role: 'USER' | 'ADMIN';
        };
    }>;
}

interface IssueDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function IssueDetailPage({ params }: IssueDetailPageProps) {
    const [issue, setIssue] = useState<Issue | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const { user } = useAuth();
    const { canEditIssue, canDeleteIssue, canCloseIssue } = usePermissions();
    const router = useRouter();
    const [issueId, setIssueId] = useState<string>('');

    // Real-time notifications for this issue
    const { isConnected, connectionError } = useRealTimeNotifications({
        issueId,
        onNotification: (notification) => {
            if (notification.type === 'comment_added' && notification.data?.issueId === issueId) {
                // Refresh the issue to get the new comment
                fetchIssue();
            }
        }
    });

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

    const handleDelete = async () => {
        if (!issue) return;

        try {
            setIsDeleting(true);
            const response = await fetch(`/api/issues/${issue.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete issue');
            }

            router.push('/issues');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete issue');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleClose = async () => {
        if (!issue) return;

        try {
            setIsClosing(true);
            const response = await fetch(`/api/issues/${issue.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'CLOSED',
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to close issue');
            }

            const updatedIssue = await response.json();
            // Ensure comments array exists to prevent undefined errors
            if (updatedIssue && !updatedIssue.comments) {
                updatedIssue.comments = issue?.comments || [];
            }
            setIssue(updatedIssue);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to close issue');
        } finally {
            setIsClosing(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const canEdit = user && issue && canEditIssue(issue.author.id);
    const canDelete = user && issue && canDeleteIssue(issue.author.id);
    const canClose = user && issue && canCloseIssue() && issue.status === 'OPEN';

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

    if (error) {
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

    if (!issue) {
        return null;
    }

    return (
        <ProtectedRoute>
            <Navigation />
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <Link
                            href="/issues"
                            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
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
                            Back to Issues
                        </Link>

                        {/* Real-time connection status - only show in development */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-xs font-medium text-slate-600">
                                    {isConnected ? '🔴 Live' : connectionError ? '⚠️ Disconnected' : '🔄 Connecting...'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Issue Details */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${issue.status === 'OPEN'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                    }`}
                            >
                                {issue.status}
                            </span>
                            {issue.author.role === 'ADMIN' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Admin
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            {canEdit && (
                                <Link
                                    href={`/issues/${issue.id}/edit`}
                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                    </svg>
                                    Edit
                                </Link>
                            )}
                            {canClose && (
                                <button
                                    onClick={handleClose}
                                    disabled={isClosing}
                                    className="inline-flex items-center px-3 py-1.5 border border-orange-300 text-sm font-medium rounded-md text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                                >
                                    {isClosing ? (
                                        <LoadingSpinner size="sm" className="mr-1" />
                                    ) : (
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
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    )}
                                    Close Issue
                                </button>
                            )}
                            {canDelete && (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                    </svg>
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-4">{issue.title}</h1>

                    <div className="prose max-w-none mb-6">
                        <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                        <span>Created by {issue.author.email}</span>
                        <div className="flex items-center space-x-4">
                            <span>Created: {formatDate(issue.createdAt)}</span>
                            {issue.updatedAt !== issue.createdAt && (
                                <span>Updated: {formatDate(issue.updatedAt)}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Comments Section */}
                <CommentList issueId={issue.id} comments={issue.comments || []} onCommentUpdate={fetchIssue} />

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3 text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                    <svg
                                        className="h-6 w-6 text-red-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mt-2">Delete Issue</h3>
                                <div className="mt-2 px-7 py-3">
                                    <p className="text-sm text-gray-500">
                                        Are you sure you want to delete this issue? This action cannot be undone.
                                        All comments will also be deleted.
                                    </p>
                                </div>
                                <div className="items-center px-4 py-3">
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 mb-2"
                                    >
                                        {isDeleting ? (
                                            <div className="flex items-center justify-center">
                                                <LoadingSpinner size="sm" className="mr-2" />
                                                Deleting...
                                            </div>
                                        ) : (
                                            'Delete Issue'
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        disabled={isDeleting}
                                        className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}