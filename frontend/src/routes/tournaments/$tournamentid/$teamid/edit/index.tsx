import useQueryClient from '@/hooks/use-query-client';
import { useAuth } from '@/providers/auth.provider';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react';
import TeamEditForm from '@/components/tournaments/teams/team-edit-form';
import TeamActionsCard from '@/components/tournaments/teams/team-actions-card';
import TeamMembersInvitationsCard from '@/components/tournaments/team-members-invitations-card';

export const Route = createFileRoute(
	'/tournaments/$tournamentid/$teamid/edit/',
)({
	component: RouteComponent,
})

function RouteComponent() {
	const {tournamentid, teamid} = Route.useParams();
	const client = useQueryClient();
	const router = useRouter();
	const {me} = useAuth();

	const {data: team, error: errorTeam} = client.useQuery("get", "/teams/{id}", {
		params: {
			path: {
				id: Number(teamid)
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

	useEffect(() => {
		if (team?.creator?.id !== me.id) {
			router.navigate({to: "/tournaments/$tournamentid/$teamid", params: {tournamentid, teamid}})
		}
	}, [team?.creator, me.id])

	if ((errorTeam) && !errorTournament) {
		router.navigate({to: `/tournaments/$tournamentid`, params: {tournamentid}})
		return null
	}

	if (errorTournament) {
		router.navigate({to: `/tournaments`})
		return null
	}

	if (team && tournament) {
		return (
			<div className="flex-1 flex flex-col">
				<div className="flex flex-1 flex-col gap-y-6 p-4 sm:p-8 dark bg-gradient-to-br from-black to-gray-900">
					<TeamActionsCard
						team={team}
						tournament={tournament}
					/>
					<TeamEditForm
						team={team}
						tournament={tournament}
					/>
					<TeamMembersInvitationsCard
						team={team}
						tournament={tournament}
					/>
				</div>
			</div>
		)
	}
}
