import TournamentCard from '@/components/tournaments/tournament-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PaginatedListControlled } from '@/components/ui/paginated-list'
import useQueryClient from '@/hooks/use-query-client'
import type { components } from '@/lib/api/types'
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useState } from 'react'

export const Route = createFileRoute('/admin/tournaments/')({
	component: RouteComponent,
})

function RouteComponent() {
	const [page, setPage] = useState<number>(0);
	const client = useQueryClient();

	const { data: tournamentsOngoing, isLoading: isLoadingOngoing } = client.useQuery("get", "/tournaments", {
		params: {
			query: {
				page,
				visible: "all",
				status: 'ongoing',
			}
		}
	})

	const { data: tournamentsFinish, isLoading: isLoadingFinish } = client.useQuery("get", "/tournaments", {
		params: {
			query: {
				page,
				visible: "all",
				status: 'finish',
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
					<CardHeader>
						<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
							Ongoing Tournaments
						</CardTitle>
					</CardHeader>
					<CardContent>
						<PaginatedListControlled<components['schemas']['Tournament']>
							data={tournamentsOngoing}
							isLoading={isLoadingOngoing}
							page={page}
							onPageChange={handlePageChange}
							renderItem={(tournament) => <TournamentCard tournament={tournament} />}
							getItemKey={(tournament) => tournament.id}
							itemsContainerClassName="flex flex-col gap-4"
							itemLabel="user"
							emptyMessage="No tournaments found"
						/>
					</CardContent>
				</Card>
				<Card className="@container/card">
					<CardHeader>
						<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
							Finished Tournaments
						</CardTitle>
					</CardHeader>
					<CardContent>
						<PaginatedListControlled<components['schemas']['Tournament']>
							data={tournamentsFinish}
							isLoading={isLoadingFinish}
							page={page}
							onPageChange={handlePageChange}
							renderItem={(tournament) => <TournamentCard tournament={tournament} />}
							getItemKey={(tournament) => tournament.id}
							itemsContainerClassName="flex flex-col gap-4"
							itemLabel="user"
							emptyMessage="No tournaments found"
						/>
					</CardContent>
				</Card>
			</div>
		</>
	)
}
