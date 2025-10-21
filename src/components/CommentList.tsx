'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/contexts/ToastContext';
import LoadingSpinner from './LoadingSpinner';

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    author: {
        id: string;
        email: string;
        role: 'USER' | 'ADMIN';
    };
}

interface CommentListProps {
    issueId: string;
    comments: Comment[];
    onCommentUpdate?: () => void;
}

export default function CommentList({ issueId, comments, onCommentUpdate }: CommentListProps) {
    const { user } = useAuth();
    const { hasPermission, canDeleteComment } = usePermissions();
    const { showSuccess } = useToast();
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`/api/issues/${issueId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: newComment }),
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create comment');
            }

            setNewComment('');
            showSuccess('Comment Added', 'Your comment has been posted successfully');
            onCommentUpdate?.();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to create comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete comment');
            }

            showSuccess('Comment Deleted', 'The comment has been removed');
            onCommentUpdate?.();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to delete comment');
        }
    };

    const canDeleteCommentLocal = (comment: Comment) => {
        return canDeleteComment(comment.author.id);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Comments ({comments.length})
            </h2>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Comment Creation Form */}
            {user && hasPermission("create_comment") && (
                <form onSubmit={handleSubmitComment} className="mb-6">
                    <div className="mb-3">
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                            Add a comment
                        </label>
                        <textarea
                            id="comment"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Write your comment here..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting || !newComment.trim()}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center">
                                <LoadingSpinner size="sm" className="mr-2" />
                                Posting...
                            </div>
                        ) : (
                            'Post Comment'
                        )}
                    </button>
                </form>
            )}

            {/* Comments List */}
            {comments.length === 0 ? (
                <div className="text-center py-8">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No comments yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Be the first to comment on this issue.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-900">
                                        {comment.author.email}
                                    </span>
                                    {comment.author.role === 'ADMIN' && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            Admin
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500">
                                        {formatDate(comment.createdAt)}
                                    </span>
                                    {canDeleteCommentLocal(comment) && (
                                        <button
                                            onClick={() => handleDeleteComment(comment.id)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                            title="Delete comment"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="prose max-w-none">
                                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}