import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useQueryClient from '@/hooks/use-query-client'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, useMemo, useEffect, useCallback } from 'react'
import AdminCard from '@/components/users/admins/admin-card';
import AdminAddModal from '@/components/users/admins/admin-add-modal';
import useCan from '@/hooks/use-can'
import { PaginatedListControlled } from '@/components/ui/paginated-list';
import type { components } from '@/lib/api/types';

export const Route = createFileRoute('/admin/admins/')({
	component: RouteComponent,
})

function RouteComponent() {
	const client = useQueryClient();
	const router = useRouter();
	const [page, setPage] = useState(0);
	const [limit] = useState(10);

	const can = useCan();
	const canAddAdmin = useMemo(() => can("post", "/user/*/kind"), [can]);

	useEffect(() => {
		if (!canAddAdmin) {
			router.navigate({to: "/admin"})
		}
	}, [canAddAdmin, router]);

	const { data, isLoading, refetch } = client.useQuery("get", "/users", {
		params: {
			query: {
				kind: "admin",
				page,
				limit,
			}
		}
	})

	const handlePageChange = useCallback((newPage: number) => {
		setPage(newPage);
	}, []);

	return (
		<>
			<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
				<Card className="@container/card">
					<CardHeader className="flex flex-row items-center justify-between space-y-0">
						<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
							Admins
						</CardTitle>
						{canAddAdmin && <AdminAddModal refetchUsers={refetch} />}
					</CardHeader>
					<CardContent>
						<PaginatedListControlled<components['schemas']['User']>
							data={data}
							isLoading={isLoading}
							page={page}
							onPageChange={handlePageChange}
							renderItem={(user) => <AdminCard user={user} />}
							getItemKey={(user) => user.id}
							itemsContainerClassName="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-5"
							itemLabel="admin"
							emptyMessage="No admins found"
						/>
					</CardContent>
				</Card>
			</div>
		</>
	)
}
