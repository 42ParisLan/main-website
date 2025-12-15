import { LightTeamCard } from '@/components/tournaments/teams/light-team-card';
import useQueryClient from '@/hooks/use-query-client'
import { createFileRoute } from '@tanstack/react-router'
import { PaginatedListControlled } from '@/components/ui/paginated-list';
import { Input} from '@/components/ui/input';

import { useCallback, useState } from 'react';
import {type components} from "@/lib/api/types"


export const Route = createFileRoute('/tournaments/$tournamentid/teams/')({
  component: RouteComponent,
})

function RouteComponent() {
	const { tournamentid } = Route.useParams();
	const [page, setPage] = useState(0);
	const client = useQueryClient();
	const [query, setQuery] = useState<string | undefined>("")

	const {data: tournament} = client.useQuery("get", "/tournaments/{id_or_slug}", {
		params: {
			path: {
				id_or_slug: tournamentid
			}
		}
	})

	const { data: teams, isLoading} = client.useQuery("get", "/tournaments/{id}/teams", {
		params: {
			path: { id: tournament?.id ?? 0 },
			query: {
				page,
				"status": "register"
			}
		},
	});

	const handlePageChange = useCallback((newPage: number) => {
		setPage(newPage)
	}, [])

	if (!tournament) {
		return <div className="text-sm text-muted-foreground">No tournament found.</div>;
	}

	return (
		<div className="min-h-screen flex flex-col bg-black p-4">
			<div className="flex flex-row items-center justify-between space-y-0 gap-4 mb-6">
				<h1 className="text-white text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">Teams for {tournament.name}</h1>
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
			</div>
			<PaginatedListControlled<components['schemas']['LightTeam']>
				data={teams}
				page={0}
				onPageChange={handlePageChange}
				isLoading={isLoading}
				itemsContainerClassName="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5"
				renderItem={(team) => <LightTeamCard team={team} tournamentId={tournament.slug}/>} 
				emptyMessage='No Teams for the moment'
				getItemKey={(item) => item.id}
			/>
		</div>
	)
}
