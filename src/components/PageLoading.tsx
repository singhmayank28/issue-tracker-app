import LoadingSpinner from './LoadingSpinner';

interface PageLoadingProps {
    text?: string;
}

export default function PageLoading({ text = 'Loading...' }: PageLoadingProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <LoadingSpinner size="lg" text={text} />
        </div>
    );
}