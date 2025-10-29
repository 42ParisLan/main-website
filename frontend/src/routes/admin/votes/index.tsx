import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PaginatedListControlled } from '@/components/ui/paginated-list';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import VoteAdmin from '@/components/votes/vote-admin';
import VoteCreateModal from '@/components/votes/vote-create-modal';
import useQueryClient from '@/hooks/use-query-client';
import type { components } from '@/lib/api/types';
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useState } from 'react';

export const Route = createFileRoute('/admin/votes/')({
	component: RouteComponent,
})

function RouteComponent() {
	const [owner, setOwner] = useState<"me" | "all">("me");
	const [page, setPage] = useState<number>(0);
	const client = useQueryClient();

	const { data, isLoading } = client.useQuery("get", "/votes", {
		params: {
			query: {
				page,
				owner,
				visible: "all",
			}
		}
	})

	const handlePageChange = useCallback((newPage: number) => {
		setPage(newPage);
	}, []);

	const handleOwnerChange = useCallback((value: string) => {
		setOwner(value as "me" | "all");
		setPage(0);
	}, []);

	return (
		<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
			<Card className="@container/card">
				<CardHeader className='w-full flex items-center justify-between'>
					<CardTitle>
						Votes
					</CardTitle>
					<div className='flex gap-5'>
						<Select value={owner} onValueChange={handleOwnerChange}>
							<SelectTrigger id="status-filter" className="w-[200px]">
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="me">My Votes</SelectItem>
								<SelectItem value="all">All Votes</SelectItem>
							</SelectContent>
						</Select>
						<VoteCreateModal/>
					</div>
				</CardHeader>
				<CardContent>
					<PaginatedListControlled<components['schemas']['LightVote']>
						data={data}
						isLoading={isLoading}
						page={page}
						onPageChange={handlePageChange}
						renderItem={(vote) => <VoteAdmin vote={vote} />}
						getItemKey={(vote) => vote.id}
						itemsContainerClassName="flex flex-col gap-4"
						itemLabel='vote'
						emptyMessage="No votes available at the moment"
						loadingComponent={<div className="text-center py-12">Loading votes...</div>}
					/>
				</CardContent>
			</Card>
		</div>
	)
}
