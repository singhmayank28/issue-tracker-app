interface PaginationProps {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    onPageChange: (page: number) => void;
    totalCount: number;
    pageSize: number;
}

export default function Pagination({
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    onPageChange,
    totalCount,
    pageSize
}: PaginationProps) {
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            const start = Math.max(1, currentPage - 2);
            const end = Math.min(totalPages, start + maxVisiblePages - 1);

            if (start > 1) {
                pages.push(1);
                if (start > 2) pages.push('...');
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages) {
                if (end < totalPages - 1) pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Results info */}
                <div className="text-sm font-medium text-slate-600">
                    Showing <span className="font-bold text-slate-800">{startItem}</span> to{' '}
                    <span className="font-bold text-slate-800">{endItem}</span> of{' '}
                    <span className="font-bold text-slate-800">{totalCount}</span> results
                </div>

                {/* Pagination controls */}
                <div className="flex items-center space-x-2">
                    {/* Previous button */}
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={!hasPreviousPage}
                        className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${hasPreviousPage
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        ← Previous
                    </button>

                    {/* Page numbers */}
                    <div className="flex items-center space-x-1">
                        {getPageNumbers().map((page, index) => (
                            <button
                                key={index}
                                onClick={() => typeof page === 'number' && onPageChange(page)}
                                disabled={page === '...'}
                                className={`px-3 py-2 rounded-lg font-bold transition-all duration-200 ${page === currentPage
                                        ? 'bg-gradient-primary text-white shadow-md'
                                        : page === '...'
                                            ? 'text-slate-400 cursor-default'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    {/* Next button */}
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={!hasNextPage}
                        className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${hasNextPage
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        Next →
                    </button>
                </div>
            </div>
        </div>
    );
}