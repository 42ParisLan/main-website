import { TeamCard } from '@/components/tournaments/teams/team-card';
import useQueryClient from '@/hooks/use-query-client'
import { createFileRoute } from '@tanstack/react-router'
import { PaginatedListControlled } from '@/components/ui/paginated-list';
import { Input} from '@/components/ui/input';

import { useCallback, useState } from 'react';
import {type components} from "@/lib/api/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from '@/components/home-page/header'
import { Footer } from '@/components/home-page/footer'


export const Route = createFileRoute('/tournaments/$tournamentid/teams/')({
  component: RouteComponent,
})

function RouteComponent() {
	const { tournamentid } = Route.useParams();
		const [page, setPage] = useState(0);
		const client = useQueryClient();
		const [query, setQuery] = useState<string | undefined>("")
	
		const {data: teams, isLoading} = client.useQuery("get", "/tournaments/{id}/teams", {
			params: {
				path: {
					id: Number(tournamentid)
				},
				query: {
				page,
				query : query?.trim().toLocaleLowerCase()
			}
			}
		})
		const {data: tournament, error: errorTournament} = client.useQuery("get", "/tournaments/{id_or_slug}", {
			params: {
				path: {
					id_or_slug: tournamentid
				}
			}
		})
	
		const handlePageChange = useCallback((newPage: number) => {
			setPage(newPage)
		}, [])
	

	return (
		<>
		<div className="min-h-screen flex flex-col bg-black ">
			<Header/>
			<Card className="border-0 flex-1 bg-gradient-to-br from-black via-foreground to-gray-700">
				<CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 gap-4">
					<CardTitle className="text-white text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">Teams</CardTitle>
					<div className="text-gray-400 w-full max-w-sm ml-auto">
						<Input
						placeholder="Search teams..."
						value={query ?? ""}
						onChange={(e) => {
							setQuery(e.target.value || undefined);
							setPage(0);
						}}
						
						className="!ring-0 !outline-none"
						/>
				</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-5 gap-5">
						{/* <TeamCard teams={teams?.items ?? []} tournament={tournament}/> */}
						<PaginatedListControlled<components['schemas']['LightTeam']>
							data={teams}
							page={0}
							onPageChange={handlePageChange}
							isLoading={isLoading}
							itemsContainerClassName="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5"
							// renderItem={(team) => <TeamCard team={team}/>}
							renderItem={(team) => <TeamCard team={team} tournament={tournament}/>}
							emptyMessage='No Teams for the moment'
							getItemKey={(item) => item.id}
							/>
						</div>
				</CardContent>
				{/* {data?.items?.map((team) => (
					<>
					<p>{team.name}</p>
					</>
					))} */}
				</Card>
				<Footer/>
			</div>
		</>
	)
}
