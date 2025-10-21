'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import PageLoading from './PageLoading';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                // Redirect to login if not authenticated
                router.push('/login');
                return;
            }

            if (requireAdmin && user.role !== 'ADMIN') {
                // Redirect to issues page if admin required but user is not admin
                router.push('/issues');
                return;
            }
        }
    }, [user, isLoading, requireAdmin, router]);

    // Show loading spinner while checking authentication
    if (isLoading) {
        return <PageLoading text="Verifying access..." />;
    }

    // Don't render children if not authenticated or not authorized
    if (!user || (requireAdmin && user.role !== 'ADMIN')) {
        return null;
    }

    return <>{children}</>;
}