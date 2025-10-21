'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navigation() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <nav className="gradient-primary shadow-lg border-b-4 border-purple-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h1 className="text-xl font-bold text-white">Issue Tracker</h1>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <span className="text-sm text-white font-medium hidden sm:block">
                            Welcome, <span className="font-bold">{user.email}</span>
                            {user.role === 'ADMIN' && (
                                <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-400 text-yellow-900 shadow-sm">
                                    ⭐ Admin
                                </span>
                            )}
                        </span>

                        {/* Mobile user info */}
                        <span className="text-sm text-white font-medium sm:hidden">
                            {user.role === 'ADMIN' && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-400 text-yellow-900 mr-2 shadow-sm">
                                    ⭐ Admin
                                </span>
                            )}
                            <span className="font-bold">{user.email.split('@')[0]}</span>
                        </span>

                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center px-4 py-2 border-2 border-white text-sm font-bold rounded-lg text-white hover:bg-white hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600 transition-all duration-200 shadow-sm"
                            aria-label="Logout"
                        >
                            <span className="hidden sm:inline">Logout</span>
                            <span className="sm:hidden">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}