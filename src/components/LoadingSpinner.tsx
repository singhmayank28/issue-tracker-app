interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    text?: string;
}

export default function LoadingSpinner({
    size = 'md',
    className = '',
    text
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className="flex flex-col items-center space-y-2">
                <div
                    className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
                    role="status"
                    aria-label="Loading"
                />
                {text && (
                    <p className="text-sm text-gray-600" aria-live="polite">
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
}