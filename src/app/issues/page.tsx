'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import IssueCard from '@/components/IssueCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import Pagination from '@/components/Pagination';
import { usePermissions } from '@/hooks/usePermissions';

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
    _count: {
        comments: number;
    };
}

interface PaginationData {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

interface IssuesResponse {
    issues: Issue[];
    pagination: PaginationData;
    filters: {
        status: string;
        search: string;
    };
}

function IssuesPageContent() {
    const { hasPermission } = usePermissions();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [issues, setIssues] = useState<Issue[]>([]);
    const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get current filters from URL
    const currentPage = parseInt(searchParams.get('page') || '1');
    const statusFilter = (searchParams.get('status') || 'all') as 'all' | 'open' | 'closed';
    const searchTerm = searchParams.get('search') || '';
    const pageSize = parseInt(searchParams.get('page_size') || '10');

    const fetchIssues = useCallback(async () => {
        try {
            setLoading(true);

            // Build query parameters
            const params = new URLSearchParams();
            params.set('page', currentPage.toString());
            params.set('page_size', pageSize.toString());

            if (statusFilter !== 'all') {
                params.set('status', statusFilter);
            }

            // Note: Search is handled on frontend, not sent to server

            const response = await fetch(`/api/issues?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch issues');
            }

            const data: IssuesResponse = await response.json();
            setIssues(data.issues);
            setPagination(data.pagination);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, statusFilter]);

    // Frontend search filtering
    const filterIssues = useCallback(() => {
        let filtered = issues;

        // Apply search filter on frontend
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(issue =>
                issue.title.toLowerCase().includes(searchLower) ||
                issue.description.toLowerCase().includes(searchLower) ||
                issue.author.email.toLowerCase().includes(searchLower)
            );
        }

        setFilteredIssues(filtered);
    }, [issues, searchTerm]);

    useEffect(() => {
        fetchIssues();
    }, [fetchIssues]);

    useEffect(() => {
        filterIssues();
    }, [filterIssues]);

    // Update URL with new parameters
    const updateURL = useCallback((newParams: Record<string, string | number>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(newParams).forEach(([key, value]) => {
            if (value && value !== 'all' && value !== '') {
                params.set(key, value.toString());
            } else {
                params.delete(key);
            }
        });

        // Always reset to page 1 when filters change (except when changing page)
        if (!newParams.page) {
            params.delete('page');
        }

        router.push(`/issues?${params.toString()}`);
    }, [router, searchParams]);

    const handleStatusChange = (newStatus: string) => {
        updateURL({ status: newStatus });
    };

    const handleSearchChange = (newSearch: string) => {
        // For frontend search, we don't need to reset pagination or make API calls
        updateURL({ search: newSearch });
    };

    const handlePageChange = (newPage: number) => {
        updateURL({ page: newPage });
    };

    const handlePageSizeChange = (newPageSize: number) => {
        updateURL({ page_size: newPageSize });
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <Navigation />
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                    <div className="container mx-auto px-4 py-8">
                        <div className="flex items-center justify-center min-h-64">
                            <LoadingSpinner size="lg" text="Loading issues..." />
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <Navigation />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-800 mb-2">
                                🎯 Issues Dashboard
                            </h1>
                            <p className="text-slate-600 text-lg font-medium">
                                Track and manage your project issues with ease
                            </p>
                        </div>
                        {hasPermission("create_issue") && (
                            <Link
                                href="/issues/new"
                                className="inline-flex items-center px-6 py-3 gradient-primary text-white font-bold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 shadow-md"
                            >
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                ✨ New Issue
                            </Link>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-slate-200">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <label htmlFor="search-issues" className="block text-sm font-bold text-slate-700 mb-2">
                                    🔍 Search Issues
                                </label>
                                <input
                                    id="search-issues"
                                    type="text"
                                    placeholder="Search by title, description, or author..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="input-field"
                                    aria-describedby="search-help"
                                />
                                <p id="search-help" className="sr-only">
                                    Search by title, description, or author email
                                </p>
                            </div>
                            <div className="sm:w-auto w-full">
                                <label htmlFor="status-filter" className="block text-sm font-bold text-slate-700 mb-2">
                                    📊 Filter Status
                                </label>
                                <select
                                    id="status-filter"
                                    value={statusFilter}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="all">🔄 All Status</option>
                                    <option value="open">🟢 Open</option>
                                    <option value="closed">🔴 Closed</option>
                                </select>
                            </div>
                            <div className="sm:w-auto w-full">
                                <label htmlFor="page-size" className="block text-sm font-bold text-slate-700 mb-2">
                                    📄 Per Page
                                </label>
                                <select
                                    id="page-size"
                                    value={pageSize}
                                    onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                                    className="input-field"
                                >
                                    <option value="5">5 items</option>
                                    <option value="10">10 items</option>
                                    <option value="20">20 items</option>
                                    <option value="50">50 items</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Error state */}
                    {error && (
                        <div className="mb-8 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-6 shadow-lg">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                        <svg
                                            className="h-6 w-6 text-red-600"
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
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-bold text-red-800">⚠️ Error</h3>
                                    <p className="text-red-700 font-medium">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Issues list */}
                    {filteredIssues.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-slate-200">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg
                                    className="h-10 w-10 text-blue-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">📋 No issues found</h3>
                            <p className="text-slate-600 font-medium text-lg mb-6">
                                {issues.length === 0
                                    ? "🚀 Get started by creating your first issue!"
                                    : "🔍 Try adjusting your search or filter criteria."
                                }
                            </p>
                            {issues.length === 0 && hasPermission("create_issue") && (
                                <div className="mt-6">
                                    <Link
                                        href="/issues/new"
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <svg
                                            className="w-4 h-4 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 4v16m8-8H4"
                                            />
                                        </svg>
                                        New Issue
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4 mb-8">
                                {filteredIssues.map((issue) => (
                                    <IssueCard key={issue.id} issue={issue} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination && (
                                <Pagination
                                    currentPage={pagination.page}
                                    totalPages={pagination.totalPages}
                                    hasNextPage={pagination.hasNextPage}
                                    hasPreviousPage={pagination.hasPreviousPage}
                                    onPageChange={handlePageChange}
                                    totalCount={pagination.totalCount}
                                    pageSize={pagination.pageSize}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}

export default function IssuesPage() {
    return (
        <Suspense fallback={
            <ProtectedRoute>
                <Navigation />
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                    <div className="container mx-auto px-4 py-8">
                        <div className="flex items-center justify-center min-h-64">
                            <LoadingSpinner size="lg" text="Loading issues..." />
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        }>
            <IssuesPageContent />
        </Suspense>
    );
}