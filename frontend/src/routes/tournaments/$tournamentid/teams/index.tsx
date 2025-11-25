import { TeamCard } from '@/components/tournaments/admin/teams-card';
import useQueryClient from '@/hooks/use-query-client'
import { createFileRoute } from '@tanstack/react-router'
import { PaginatedListControlled } from '@/components/ui/paginated-list';
import { useCallback, useState } from 'react';
import {type components} from "@/lib/api/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export const Route = createFileRoute('/tournaments/$tournamentid/teams/')({
  component: RouteComponent,
})

function RouteComponent() {
	const { tournamentid } = Route.useParams();
		const [page, setPage] = useState(0);
		const client = useQueryClient();
	
		const {data: teams, isLoading} = client.useQuery("get", "/tournaments/{id}/teams", {
			params: {
				path: {
					id: Number(tournamentid)
				},
				query: {
					page
				}
			}
		})
	
		const handlePageChange = useCallback((newPage: number) => {
			setPage(newPage)
		}, [])
	

	return (
		<>
		<Card className="">
			<CardHeader className="">
				<CardTitle className="">

				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="">

					<PaginatedListControlled<components['schemas']['LightTeam']>
						data={teams}
						page={0}
						onPageChange={handlePageChange}
						isLoading={isLoading}
						itemsContainerClassName="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5"
						renderItem={(team) => <TeamCard team={team}/>}
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
		</>
	)
}
