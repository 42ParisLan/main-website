/**
 * Reusable pagination component for displaying paginated data.
 * Matches the Go backend Response[T] struct structure.
 * 
 * Two versions available:
 * - PaginatedList: Manages its own page state internally
 * - PaginatedListControlled: Receives page state from parent (use when you need to sync with URL params or API calls)
 */

import { useState, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

interface PaginatedResponse<T> {
	items?: T[] | null;
	page?: number;
	total_pages?: number;
	limit?: number;
	total?: number;
}

interface PaginatedListProps<T> {
	data: PaginatedResponse<T> | undefined;
	isLoading: boolean;
	renderItem: (item: T) => ReactNode;
	getItemKey: (item: T) => string | number;
	itemsContainerClassName?: string;
	emptyMessage?: string;
	loadingComponent?: ReactNode;
	itemLabel?: string; // e.g., "admin", "user", "item"
}

export function PaginatedList<T>({
	data,
	isLoading,
	renderItem,
	getItemKey,
	itemsContainerClassName = 'grid grid-cols-1 gap-4',
	emptyMessage = 'No items found',
	loadingComponent = <div>Loading...</div>,
	itemLabel = 'item',
}: PaginatedListProps<T>) {
	const [page, setPage] = useState(0);

	const items = useMemo(() => data?.items ?? [], [data?.items]);
	const totalPages = useMemo(() => data?.total_pages ?? 1, [data?.total_pages]);
	const total = useMemo(() => data?.total ?? 0, [data?.total]);
	const currentPage = useMemo(() => data?.page ?? page, [data?.page, page]);

	const hasNextPage = useMemo(() => currentPage < totalPages - 1, [currentPage, totalPages]);
	const hasPreviousPage = useMemo(() => currentPage > 0, [currentPage]);

	const handlePreviousPage = useCallback(() => {
		setPage(p => Math.max(0, p - 1));
	}, []);

	const handleNextPage = useCallback(() => {
		setPage(p => p + 1);
	}, []);

	const pluralLabel = useMemo(() => {
		return total !== 1 ? `${itemLabel}s` : itemLabel;
	}, [total, itemLabel]);

	if (isLoading) {
		return <>{loadingComponent}</>;
	}

	if (items.length === 0) {
		return <div className="text-center text-muted-foreground py-8">{emptyMessage}</div>;
	}

	return (
		<>
			<div className={itemsContainerClassName}>
				{items.map((item) => (
					<div key={getItemKey(item)}>
						{renderItem(item)}
					</div>
				))}
			</div>

			{/* Pagination Controls */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between mt-6 pt-6 border-t">
					<div className="text-sm text-muted-foreground">
						Page {currentPage + 1} of {totalPages} • Showing {items.length} of {total} {pluralLabel}
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handlePreviousPage}
							disabled={!hasPreviousPage}
						>
							<IconChevronLeft className="w-4 h-4 mr-1" />
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleNextPage}
							disabled={!hasNextPage}
						>
							Next
							<IconChevronRight className="w-4 h-4 ml-1" />
						</Button>
					</div>
				</div>
			)}
		</>
	);
}

interface PaginatedListControlledProps<T> extends Omit<PaginatedListProps<T>, 'data'> {
	data: PaginatedResponse<T> | undefined;
	page: number;
	onPageChange: (page: number) => void;
}

export function PaginatedListControlled<T>({
	data,
	isLoading,
	renderItem,
	getItemKey,
	page,
	onPageChange,
	itemsContainerClassName = 'grid grid-cols-1 gap-4',
	emptyMessage = 'No items found',
	loadingComponent = <div>Loading...</div>,
	itemLabel = 'item',
}: PaginatedListControlledProps<T>) {
	const items = useMemo(() => data?.items ?? [], [data?.items]);
	const totalPages = useMemo(() => data?.total_pages ?? 1, [data?.total_pages]);
	const total = useMemo(() => data?.total ?? 0, [data?.total]);

	const hasNextPage = useMemo(() => page < totalPages - 1, [page, totalPages]);
	const hasPreviousPage = useMemo(() => page > 0, [page]);

	const handlePreviousPage = useCallback(() => {
		onPageChange(Math.max(0, page - 1));
	}, [page, onPageChange]);

	const handleNextPage = useCallback(() => {
		onPageChange(page + 1);
	}, [page, onPageChange]);

	const pluralLabel = useMemo(() => {
		return total !== 1 ? `${itemLabel}s` : itemLabel;
	}, [total, itemLabel]);

	if (isLoading) {
		return <>{loadingComponent}</>;
	}

	if (items.length === 0) {
		return <div className="text-center text-muted-foreground py-8">{emptyMessage}</div>;
	}

	return (
		<>
			<div className={itemsContainerClassName}>
				{items.map((item) => (
					<div key={getItemKey(item)}>
						{renderItem(item)}
					</div>
				))}
			</div>

			{/* Pagination Controls */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between mt-6 pt-6 border-t">
					<div className="text-sm text-muted-foreground">
						Page {page + 1} of {totalPages} • Showing {items.length} of {total} {pluralLabel}
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handlePreviousPage}
							disabled={!hasPreviousPage}
						>
							<IconChevronLeft className="w-4 h-4 mr-1" />
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleNextPage}
							disabled={!hasNextPage}
						>
							Next
							<IconChevronRight className="w-4 h-4 ml-1" />
						</Button>
					</div>
				</div>
			)}
		</>
	);
}
