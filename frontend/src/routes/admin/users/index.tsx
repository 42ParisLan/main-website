import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UserCard from '@/components/users/user-card';
import useQueryClient from '@/hooks/use-query-client';
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useState } from 'react';
import { PaginatedListControlled } from '@/components/ui/paginated-list';
import type { components } from '@/lib/api/types';
import { Input } from '@/components/ui/input';

export const Route = createFileRoute('/admin/users/')({
	component: RouteComponent,
})

function RouteComponent() {
	const client = useQueryClient();
	const [page, setPage] = useState(0);
	const [limit] = useState(10);
	const [query, setQuery] = useState<string | undefined>("")

	const { data, isLoading } = client.useQuery("get", "/users", {
		params: {
			query: {
				page,
				limit,
				query : query?.trim().toLocaleLowerCase()
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
					<CardHeader className="flex flex-row items-center justify-between space-y-0 gap-4">
						<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
							Users
						</CardTitle>
						<div className="w-full max-w-sm ml-auto">
							<Input
								placeholder="Search users..."
								value={query ?? ""}
								onChange={(e) => {
									setQuery(e.target.value || undefined);
									setPage(0);
								}}
							/>
						</div>
					</CardHeader>
					<CardContent>
						<PaginatedListControlled<components['schemas']['User']>
							data={data}
							isLoading={isLoading}
							page={page}
							onPageChange={handlePageChange}
							renderItem={(user) => <UserCard user={user} />}
							getItemKey={(user) => user.id}
							itemsContainerClassName="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-5"
							itemLabel="user"
							emptyMessage="No users found"
						/>
					</CardContent>
				</Card>
			</div>
		</>
	)
}
