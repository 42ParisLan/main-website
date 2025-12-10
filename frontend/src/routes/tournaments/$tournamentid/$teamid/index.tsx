import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useQueryClient from '@/hooks/use-query-client'
import { useAuth } from '@/providers/auth.provider';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { TeamCard } from '@/components/tournaments/teams/team-card';
import { useMemo } from 'react';

export const Route = createFileRoute('/tournaments/$tournamentid/$teamid/')({
  component: RouteComponent,
})

function RouteComponent() {
	const {tournamentid, teamid} = Route.useParams();
	const client = useQueryClient();
	const router = useRouter();
	const {me} = useAuth();

	const {data: tournament, error: errorTournament} = client.useQuery("get", "/tournaments/{id_or_slug}", {
		params: {
			path: {
				id_or_slug: tournamentid
			}
		}
	})

	const {data: team, error: errorTeam} = client.useQuery("get", "/teams/{id}", {
		params: {
			path: {
				id: Number(teamid)
			}
		}
	})

	// const {mutate : mutateLeave} = client.useMutation("post", "/teams/{id}/leave", {
	// 	onSuccess() {
	// 		toast.success("Team Successfuly Leaved")
	// 		if (tournament) {
	// 			router.navigate({
	// 				to: "/tournaments/$tournamentid",
	// 				params: {
	// 					tournamentid: tournament.slug,
	// 				},
	// 			})
	// 		}
	// 	},
	// 	onError(error) {
	// 		console.error('Failed to leave team', error)
	// 		toast.error("Failed to Leave Team")
	// 	}
	// })

	// const performLeave = useCallback(() => {
	// 	if (!team) return;
	// 	mutateLeave({
	// 		params: {
	// 			path: {
	// 				id: team.id,
	// 			},
	// 		},
	// 	});
	// }, [mutateLeave, team]);

	const role = useMemo(() => {
		if (team?.creator?.id === me.id) return 'creator'

		if (Array.isArray(team?.members) && team!.members.some((m: any) => m?.user?.id === me.id)) return 'member'

		return undefined
	}, [team?.members, team?.creator, me.id])

	if (errorTeam && !errorTournament) {
		router.navigate({to: `/tournaments/$tournamentid`, params: {tournamentid}})
		return null
	}

	if (errorTournament) {
		router.navigate({to: `/tournaments`})
		return null
	}

	if (team && tournament)
	{
		return (
			<div className="flex flex-1 dark grid grid-cols-1 gap-4 p-6 bg-gradient-to-br from-black to-gray-800">
				<TeamCard team={team} tournament={tournament}/>
				{role == "creator" ? (
				<div>
					<Button
						variant="secondary"
						asChild
					>
						<Link to={`/tournaments/$tournamentid/$teamid/edit`} params={{tournamentid, teamid}}>
							Edit Team
						</Link>
					</Button>
				</div>
				) : role == "member" && (
					<Button
						variant="destructive"
					>
						Leave Team
					</Button>
				)}
			</div>
		)
	}
	return null
}
