'use client';

import Link from 'next/link';

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

interface IssueCardProps {
    issue: Issue;
}

export default function IssueCard({ issue }: IssueCardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const truncateDescription = (text: string, maxLength: number = 150) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-200 transform hover:scale-[1.02]">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold shadow-sm ${issue.status === 'OPEN'
                            ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white'
                            : 'bg-gradient-to-r from-slate-400 to-gray-500 text-white'
                            }`}
                    >
                        {issue.status === 'OPEN' ? '🟢 OPEN' : '🔴 CLOSED'}
                    </span>
                    {issue.author.role === 'ADMIN' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 shadow-sm">
                            ⭐ Admin
                        </span>
                    )}
                </div>
                <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                    📅 {formatDate(issue.createdAt)}
                </span>
            </div>

            <Link href={`/issues/${issue.id}`} className="block group">
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-3 leading-tight">
                    {issue.title}
                </h3>
                <p className="text-slate-600 font-medium mb-4 leading-relaxed">
                    {truncateDescription(issue.description)}
                </p>
            </Link>

            <div className="flex items-center justify-between pt-4 border-t-2 border-slate-100">
                <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                    👤 {issue.author.email}
                </span>
                <div className="flex items-center space-x-4">
                    <span className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
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
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                        💬 {issue._count.comments}
                    </span>
                </div>
            </div>
        </div>
    );
}