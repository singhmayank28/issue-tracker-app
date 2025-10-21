'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import PageLoading from '@/components/PageLoading';

export default function Home() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (user) {
                router.push('/issues');
            } else {
                router.push('/login');
            }
        }
    }, [user, isLoading, router]);

    // Show loading while checking authentication
    if (isLoading) {
        return <PageLoading text="Checking authentication..." />;
    }

    return null;
}