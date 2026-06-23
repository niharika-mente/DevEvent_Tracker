'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

/**
 * Builds the array of page items to display.
 * Always shows: first, last, current, current±1. Fills gaps with "…".
 */
function buildPageItems(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);
  pages.add(current);
  if (current - 1 >= 1) pages.add(current - 1);
  if (current + 1 <= total) pages.add(current + 1);

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: (number | '...')[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push('...');
    }
    result.push(sorted[i]);
  }

  return result;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  };

  const pageItems = buildPageItems(currentPage, totalPages);

  const btnBase =
    'flex items-center justify-center min-w-[36px] h-9 px-2 rounded-lg border text-sm font-medium transition-all duration-150 cursor-pointer select-none';

  const btnActive =
    'bg-[var(--primary)] text-black border-[var(--primary)] shadow-[0_0_12px_rgba(89,222,202,0.35)]';

  const btnInactive =
    'bg-[var(--color-dark-100)] text-[var(--color-light-100)] border-[var(--color-border-dark)] hover:border-[var(--color-blue)] hover:text-[var(--color-blue)]';

  const btnDisabled =
    'opacity-30 cursor-not-allowed bg-[var(--color-dark-100)] text-[var(--color-light-200)] border-[var(--color-border-dark)]';

  return (
    <nav
      aria-label="Events pagination"
      className="flex items-center justify-center gap-1.5 mt-12 mb-4 flex-wrap"
    >
      {/* Previous */}
      <button
        id="pagination-prev"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
        className={`${btnBase} gap-1 px-3 ${currentPage <= 1 ? btnDisabled : btnInactive}`}
      >
        <ChevronLeft size={15} />
        <span className="max-sm:hidden">Prev</span>
      </button>

      {/* Page numbers */}
      {pageItems.map((item, idx) =>
        item === '...' ? (
          <span
            key={`ellipsis-${idx}`}
            className="flex items-center justify-center min-w-[36px] h-9 text-[var(--color-light-200)] text-sm select-none"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            id={`pagination-page-${item}`}
            onClick={() => goToPage(item)}
            aria-label={`Page ${item}`}
            aria-current={item === currentPage ? 'page' : undefined}
            className={`${btnBase} ${item === currentPage ? btnActive : btnInactive}`}
          >
            {item}
          </button>
        )
      )}

      {/* Next */}
      <button
        id="pagination-next"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
        className={`${btnBase} gap-1 px-3 ${currentPage >= totalPages ? btnDisabled : btnInactive}`}
      >
        <span className="max-sm:hidden">Next</span>
        <ChevronRight size={15} />
      </button>
    </nav>
  );
}
