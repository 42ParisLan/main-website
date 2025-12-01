import { RankingEditor } from '@/components/tournaments/admin/ranking-editor'
import { TeamRankGroupCard } from '@/components/tournaments/admin/team-rank-group-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PaginatedListControlled } from '@/components/ui/paginated-list'
import { useHasRole } from '@/hooks/use-can'
import useQueryClient from '@/hooks/use-query-client'
import type { components } from '@/lib/api/types'
import { useAuth } from '@/providers/auth.provider'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useCallback, useState } from 'react'

export const Route = createFileRoute(
	'/admin/tournaments/$tournamentid/ranking/',
)({
	component: RouteComponent,
})

function RouteComponent() {
	const { tournamentid } = Route.useParams()
	const client = useQueryClient()
	const router = useRouter()
	const [pageNoRank, setPageNoRank] = useState(0)
	const [pageRank, setPageRank] = useState(0)
	const {me} = useAuth();
	const hasRole = useHasRole();

	const { data: tournament, isError: isErrorTournament } = client.useQuery(
		'get',
		'/tournaments/{id_or_slug}',
		{
			params: {
				path: {
					id_or_slug: tournamentid,
				},
			},
		},
	)

	const {
		data: rankgroups,
		refetch: refetchRankGroups,
		isError: isErrorRankGroups,
	} = client.useQuery('get', '/tournaments/{id}/rank-groups', {
		params: {
			path: {
				id: tournament?.id ?? 0,
			},
		},
		enabled: !!tournament?.id,
	})

	const {
		data: teamsNoRank,
		isLoading: isLoadingNoRank,
		refetch: refetchTeamsNoRank,
	} = client.useQuery('get', '/tournaments/{id}/teams', {
		params: {
			path: {
				id: tournament?.id ?? 0,
			},
			query: {
				page: pageNoRank,
				status: "register",
				has_rank_group: 'no',
			},
		},
		enabled: !!tournament?.id,
	})

	const {
		data: teamsRank,
		isLoading: isLoadingRank,
		refetch: refetchTeamsRank,
	} = client.useQuery('get', '/tournaments/{id}/teams', {
		params: {
			path: {
				id: tournament?.id ?? 0,
			},
			query: {
				page: pageRank,
				status: "register",
				has_rank_group: 'yes',
			},
		},
		enabled: !!tournament?.id,
	})

	const handlePageChangeNoRank = useCallback((newPage: number) => {
		setPageNoRank(newPage)
	}, [])

	const handlePageChangeRank = useCallback((newPage: number) => {
		setPageRank(newPage)
	}, [])

	if (isErrorRankGroups || isErrorTournament) {
		router.navigate({ to: '/admin/tournaments' })
		return
	}

	if (tournament) {
		let role = tournament.admins?.find((admin) => admin.user.id === me?.id)?.role
		if (!role && hasRole(['super_admin'])) {
			role = "CREATOR"
		}
		if (!role) {
			router.navigate({to: '/admin/tournaments/$tournamentid', params:{tournamentid}})
			return
		}
		return (
			<>
				<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
					<RankingEditor
						initialRanks={rankgroups ?? []}
						refetchRankGroups={refetchRankGroups}
						tournamentID={tournament?.id ?? 0}
						update={role != "ADMIN"}
					/>
					{teamsNoRank && teamsNoRank.total > 0 && (
						<Card className="@container/card">
							<CardHeader>
								<CardTitle>Teams With No Rank</CardTitle>
							</CardHeader>
							<CardContent>
								<PaginatedListControlled<components['schemas']['LightTeam']>
									data={teamsNoRank}
									page={pageNoRank}
									onPageChange={handlePageChangeNoRank}
									isLoading={isLoadingNoRank}
									itemsContainerClassName="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5"
									renderItem={(team) => (
										<TeamRankGroupCard
											team={team}
											rankgroups={rankgroups ?? []}
											refetch={[refetchTeamsNoRank, refetchTeamsRank]}
										/>
									)}
									emptyMessage="No teams without rank"
									getItemKey={(item) => item.id}
								/>
							</CardContent>
						</Card>
					)}
					<Card className="@container/card">
						<CardHeader>
							<CardTitle>Teams Rank</CardTitle>
						</CardHeader>
						<CardContent>
							<PaginatedListControlled<components['schemas']['LightTeam']>
								data={teamsRank}
								page={pageRank}
								onPageChange={handlePageChangeRank}
								isLoading={isLoadingRank}
								itemsContainerClassName="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5"
								renderItem={(team) => (
									<TeamRankGroupCard
										team={team}
										rankgroups={rankgroups ?? []}
										refetch={[refetchTeamsNoRank, refetchTeamsRank]}
									/>
								)}
								emptyMessage="No teams with rank"
								getItemKey={(item) => item.id}
							/>
						</CardContent>
					</Card>
				</div>
			</>
		)
	}
}
