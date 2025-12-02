import useQueryClient from '@/hooks/use-query-client'
import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback } from 'react';
import { PaginatedListControlled } from '@/components/ui/paginated-list';
import VoteCard from '@/components/votes/vote-card';
import type { components } from '@/lib/api/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/home-page/header'
import { Footer } from '@/components/home-page/footer'

export const Route = createFileRoute('/votes/')({
	component: RouteComponent,
})

function RouteComponent() {
	const [status, setStatus] = useState<"all" | "ongoing" | "finish" | "not_started">("ongoing");
	const [page, setPage] = useState<number>(0);
	const client = useQueryClient();

	const { data, isLoading } = client.useQuery("get", "/votes", {
		params: {
			query: {
				status,
				page,
			}
		}
	})

	const handlePageChange = useCallback((newPage: number) => {
		setPage(newPage);
	}, []);

	const handleStatusChange = useCallback((value: string) => {
		setStatus(value as "all" | "ongoing" | "finish" | "not_started");
		setPage(0);
	}, []);

	return (
		<div className='min-h-screen flex flex-col dark bg-gradient-to-br from-black to-gray-800'>
			<Header/>
			<div className="flex flex-1">
				<div className="w-full p-4">
					<div className="text-white p-4">
						<Label htmlFor="status-filter" className="mb-2 block">
							Filter by Status
						</Label>
						<Select value={status} onValueChange={handleStatusChange}>
							<SelectTrigger id="status-filter" className="w-[200px]">
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Votes</SelectItem>
								<SelectItem value="ongoing">Ongoing</SelectItem>
								<SelectItem value="not_started">Not Started</SelectItem>
								<SelectItem value="finish">Finished</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<PaginatedListControlled<components['schemas']['LightVote']>
						data={data}
						isLoading={isLoading}
						page={page}
						onPageChange={handlePageChange}
						renderItem={(vote) => <VoteCard vote={vote} />}
						getItemKey={(vote) => vote.id}
						itemsContainerClassName="flex flex-col gap-4"
						itemLabel="vote"
						emptyMessage="No votes available at the moment"
						loadingComponent={<div className="text-center py-12">Loading votes...</div>}
						/>
				</div>
			</div>
			<Footer/>
		</div>
	)
}
