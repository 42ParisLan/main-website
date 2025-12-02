
import useQueryClient from '@/hooks/use-query-client'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react';
import { Header } from '@/components/home-page/header'
import { Footer } from '@/components/home-page/footer'
import  CreateTeamCard from '@/components/tournaments/custom-pages/create-team-card'

export const Route = createFileRoute('/tournaments/$tournamentid/register/')({
  component: RouteComponent,
})

function RouteComponent() {
	const {tournamentid} = Route.useParams();
	const client = useQueryClient();
	const router = useRouter();

	
	const { data: tournament, isLoading: isLoadingTournament, isError: isErrorTournament } = client.useQuery("get", "/tournaments/{id_or_slug}", {
		params: {
			path: {
				id_or_slug: tournamentid,
			},
		},
	})

	const { data: team } = client.useQuery("get", "/tournaments/{id}/me/team", {
		params: {
			path: {
				id: tournament?.id ?? 0,
			},
		},
		enabled: !!tournament?.id,
	})

	
	useEffect(() => {
		if (isErrorTournament) {
			router.navigate({ to: "/tournaments" })
		}
	}, [isErrorTournament, router])

	useEffect(() => {
		if (team && tournament) {
			router.navigate({
				to: "/tournaments/$tournamentid/$teamid",
				params: {
					tournamentid: tournament.slug,
					teamid: String(team.id),
				},
			})
		}
	}, [team, tournament, router])
	
	
	if (isLoadingTournament) {
		return <div className="text-sm text-muted-foreground">Loading tournament…</div>
	}

	if (isErrorTournament) {
		return null
	}
	if (!tournament) {
		return <div className="text-sm text-muted-foreground">No tournament found.</div>;
	}

	return (
		
		<>
		<div>
			<Header/>
				<div className="dark bg-gradient-to-br from-black to-gray-800 p-4">
					<CreateTeamCard tournament={tournament}/>
				</div>
			<Footer/>
		</div>
			
		</>
	)
}
