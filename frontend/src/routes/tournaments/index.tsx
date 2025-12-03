// import TournamentCard from '@/components/tournaments/admin/tournament-card';
import PublicTournamentCard from '@/components/tournaments/public-tournament-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PaginatedListControlled } from '@/components/ui/paginated-list';
import useQueryClient from '@/hooks/use-query-client'
import type { components } from '@/lib/api/types';
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useState } from 'react';
import { Header } from '@/components/home-page/header'
import { Footer } from '@/components/home-page/footer'

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
				limit: 3,
			}
		}
	})

	const {data: OldTournament, isLoading: isLoadingOld} = client.useQuery("get", "/tournaments", {
		params: {
			query: {
				page: oldPage,
				status: "finish",
				limit: 3,
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
			<div className="min-h-screen bg-black">
				<Header/>
					{/* <div className="py-2 bg-black min-h-screen bg-background">
						<ActiveTournaments tournaments={NewTournament?.items ?? []}/>
						<OldTournaments tournaments={NewTournament?.items ?? []}/>
					</div> */}
				<Card  style={{ fontFamily: "Orbitron" }} className=" rounded-none @container/card border-none w-full h-150 bg-gradient-to-br from-black to-gray-800">
					<CardHeader className="w-full text-center">
						<CardTitle className="text-bold text-white p-3 text-3xl">
							OnGoing Tournament
						</CardTitle>
					</CardHeader>
					<CardContent className="flex justify-center w-full h-full flex p-4 gap-4">
						<div className="w-200 h-400">
							<PaginatedListControlled<components['schemas']['LightTournament']>
							data={NewTournament}
							isLoading={isLoadingNew}
							page={newPage}
							onPageChange={handleNewPageChange}
							renderItem={(tournaments) => <PublicTournamentCard tournament={tournaments}/>}
							getItemKey={(tournament) => tournament.id}
							itemsContainerClassName="flex flex-row gap-4"
							itemLabel="user"
							emptyMessage="No tournaments found"
							/>
						</div>
					</CardContent>
				</Card >
				<Card className="@container/card rounded-none border-none w-full h-100 bg-gradient-to-tr from-black to-gray-800">
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
							renderItem={(tournament) => <PublicTournamentCard tournament={tournament} />}
							getItemKey={(tournament) => tournament.id}
							itemsContainerClassName="flex flex-row gap-4"
							itemLabel="user"
							emptyMessage="No tournaments found"
							/>
					</CardContent>
				</Card>
				<Footer/>
			</div>
		</>
	)
}
