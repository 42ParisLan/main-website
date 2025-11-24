import TournamentCard from '@/components/tournaments/admin/tournament-card';
import PublicTournamentCard from '@/components/tournaments/tournament-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PaginatedListControlled } from '@/components/ui/paginated-list';
import useQueryClient from '@/hooks/use-query-client'
import type { components } from '@/lib/api/types';
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useState } from 'react';

export const Route = createFileRoute('/tournaments/')({
	component: RouteComponent,
})

function RouteComponent() {
	const [newPage, setNewPage] = useState<number>(0);
	const [oldPage, setOldPage] = useState<number>(0);
	const client = useQueryClient();

	const {data: NewTournament, isLoading: isLoadingNew} = client.useQuery("get", "/tournaments", {
		params: {
			query: {
				page: newPage,
				status: "ongoing",
			}
		}
	})

	const {data: OldTournament, isLoading: isLoadingOld} = client.useQuery("get", "/tournaments", {
		params: {
			query: {
				page: oldPage,
				status: "finish",
			}
		}
	})

	const handleNewPageChange = useCallback((changedPage: number) => {
		setNewPage(changedPage);
	}, []);

	const handleOldPageChange = useCallback((changedPage: number) => {
		setOldPage(changedPage);
	}, []);

	return (
		<>
			<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
				<Card className="@container/card">
					<CardHeader className="flex flex-row items-center justify-between space-y-0">
						<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
							OnGoing Tournament
						</CardTitle>
					</CardHeader>
					<CardContent>
						<PaginatedListControlled<components['schemas']['LightTournament']>
							data={NewTournament}
							isLoading={isLoadingNew}
							page={newPage}
							onPageChange={handleNewPageChange}
							renderItem={(tournament) => <PublicTournamentCard tournament={tournament} />}
							getItemKey={(tournament) => tournament.id}
							itemsContainerClassName="flex flex-col gap-4"
							itemLabel="user"
							emptyMessage="No tournaments found"
						/>
					</CardContent>
				</Card>
				<Card className="@container/card">
					<CardHeader className="flex flex-row items-center justify-between space-y-0">
						<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
							Finish Tournament
						</CardTitle>
					</CardHeader>
					<CardContent>
						<PaginatedListControlled<components['schemas']['LightTournament']>
							data={OldTournament}
							isLoading={isLoadingOld}
							page={oldPage}
							onPageChange={handleOldPageChange}
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
