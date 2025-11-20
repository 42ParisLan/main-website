import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import useQueryClient from '@/hooks/use-query-client'
import { useAuth } from '@/providers/auth.provider';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
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
			<>
				<Card>
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
								<Button
									variant="destructive"
								>
									Delete Team
								</Button>
							</>
						) : role == "member" && (
							<Button
								variant="destructive"
							>
								Leave Team
							</Button>
						)}
					</CardFooter>
				</Card>
			</>
		)
	}

	return null
}
