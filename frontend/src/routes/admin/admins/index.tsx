import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import useQueryClient from '@/hooks/use-query-client'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import AdminCard from '@/components/users/admins/admin-card';
import AdminModal from '@/components/users/admins/admin-modal';
import useCan from '@/hooks/use-can'

export const Route = createFileRoute('/admin/admins/')({
	component: RouteComponent,
})

function RouteComponent() {
	const client = useQueryClient();
	const [page, setPage] = useState(0);
	const [limit] = useState(10);

	const { data: users = [] } = client.useQuery("get", "/users", {
		params: {
			query: {
				kind: "admin",
				page,
				limit,
			}
		}
	})

	const can = useCan();
	const canAddAdmin = can("post", "/user/*/kind")

	const hasNextPage = users.length === limit;
	const hasPreviousPage = page > 0;

	return (
		<>
			<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
				<Card className="@container/card">
					<CardHeader className="flex flex-row items-center justify-between space-y-0">
						<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
							Admins
						</CardTitle>
						{canAddAdmin && <AdminModal />}
					</CardHeader>
					<CardContent>
						<div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-5'>
							{users.map((user) => (
								<AdminCard key={user.id} user={user}/>
							))}
						</div>
						
						{/* Pagination Controls */}
						<div className="flex items-center justify-between mt-6 pt-6 border-t">
							<div className="text-sm text-muted-foreground">
								Page {page + 1} • Showing {users.length} admin{users.length !== 1 ? 's' : ''}
							</div>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage(p => Math.max(0, p - 1))}
									disabled={!hasPreviousPage}
								>
									<IconChevronLeft className="w-4 h-4 mr-1" />
									Previous
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage(p => p + 1)}
									disabled={!hasNextPage}
								>
									Next
									<IconChevronRight className="w-4 h-4 ml-1" />
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	)
}
