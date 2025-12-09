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
			<div className="flex flex-col bg-black min-h-screen">
				<Card className="border-0 flex-1 bg-gradient-to-br from-black via-background to-gray-800">
					<CardHeader className="p-4 w-full flex items-center">
						<CardTitle className="text-white text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
							My team for the {tournament.name} tournament
						</CardTitle>
					</CardHeader>
					<CardContent className="gap-4 flex flex-col justify-center items-center">
						<div className="w-100">
							<TeamCard team={team} tournament={tournament}/>
						</div>
						{role == "creator" ? (
						<>
							<Button
								variant="secondary"
								asChild
							>
								<Link to={`/tournaments/$tournamentid/$teamid/edit`} params={{tournamentid, teamid}}>
									Edit Team
								</Link>
							</Button>
						</>
					) : role == "member" && (
						<Button
							variant="destructive"
						>
							Leave Team
						</Button>
					)}
					</CardContent>
				</Card>
			</div>
		)
	}
				{/* <Card>
					<CardHeader className='flex justify-between'>
						<CardTitle>
							{team.name}
						</CardTitle>
						team for tournament: "{tournament.name}"
					</CardHeader>
					<CardContent>
						{Object.entries(tournament.team_structure).map(([key, _]) => {
							const users = team.members?.filter((user) => user.role == key);
							if (users && users.length > 0)
							{
								return (
									<>
										<p>{key}</p>
										{users.map((team_member) => (
											<div key={team_member.user?.id} className="flex items-center gap-3 py-2">
												<img
													src={team_member.user?.picture ?? ''}
													alt={team_member.user?.username ?? 'team member'}
													className="w-10 h-10 rounded-full object-cover"
												/>
												<p className="text-sm">{team_member.user?.username ?? 'Unknown'}</p>
											</div>
										))}
									</>
								)
							}
						})}
					</CardContent>
					<CardFooter>
						{team.is_locked == false && (
							<>
								{role == "creator" ? (
									<>
										<Button
											variant="default"
											asChild
										>
											<Link to={`/tournaments/$tournamentid/$teamid/edit`} params={{tournamentid, teamid}}>
												Edit Team
											</Link>
										</Button>
									</>
								) : role == "member" && (
									<Button
										variant="destructive"
										onClick={performLeave}
									>
										Leave Team
									</Button>
								)}
							</>
						)}
					</CardFooter>
				</Card> */}
	

	return null
}
