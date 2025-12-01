import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PaginatedListControlled } from '@/components/ui/paginated-list';
import useQueryClient from '@/hooks/use-query-client';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import {type components} from "@/lib/api/types"
import { useCallback, useState } from 'react';
import { TeamCard } from '@/components/tournaments/admin/teams-card';
import { useHasRole } from '@/hooks/use-can';
import { useAuth } from '@/providers/auth.provider';

export const Route = createFileRoute('/admin/tournaments/$tournamentid/teams/')({
  component: RouteComponent,
})

function RouteComponent() {
	const { tournamentid } = Route.useParams();
	const [pageRegistered, setPageRegistered] = useState(0);
	const [pageDraft, setPageDraft] = useState(0);
	const [pageWaitlist, setPageWaitlist] = useState(0);
	const client = useQueryClient();
	const hasRole = useHasRole();
	const {me} = useAuth();
	const router = useRouter();

	const {data: tournament, isError} = client.useQuery("get", "/tournaments/{id_or_slug}", {
		params:{
			path: {
				id_or_slug: tournamentid
			}
		}
	})

	const {
		data: teamsRegistered,
		isLoading: isLoadingRegistered,
		refetch: refetchRegistered,
	} = client.useQuery('get', '/tournaments/{id}/teams', {
		params: {
			path: {
				id: tournament?.id ?? 0,
			},
			query: {
				page: pageRegistered,
				status: 'register',
			},
		},
	})

	const {
		data: teamsDraft,
		isLoading: isLoadingDraft,
		refetch: refetchDraft,
	} = client.useQuery('get', '/tournaments/{id}/teams', {
		params: {
			path: {
				id: tournament?.id ?? 0,
			},
			query: {
				page: pageDraft,
				status: 'draft',
			},
		},
	})

	const {
		data: teamsWaitlist,
		isLoading: isLoadingWaitlist,
		refetch: refetchWaitlist,
	} = client.useQuery('get', '/tournaments/{id}/teams', {
		params: {
			path: {
				id: tournament?.id ?? 0,
			},
			query: {
				page: pageWaitlist,
				status: 'waitlist',
			},
		},
	})

	const handlePageChangeRegistered = useCallback((newPage: number) => {
		setPageRegistered(newPage)
	}, [])

	const handlePageChangeDraft = useCallback((newPage: number) => {
		setPageDraft(newPage)
	}, [])

	const handlePageChangeWaitlist = useCallback((newPage: number) => {
		setPageWaitlist(newPage)
	}, [])

	if (isError) {
		router.navigate({ to: '/admin/tournaments' })
		return
	}

	const role = tournament?.admins?.find(
		(admin) => admin.user.id === me?.id,
	)?.role
	const isSuperAdmin = hasRole(['super_admin'])
	const effectiveRole = role ?? (isSuperAdmin ? 'CREATOR' : undefined)

	const canUpdate =
		effectiveRole !== undefined &&
		(!tournament?.tournament_end ||
			new Date(tournament.tournament_end).getTime() > Date.now())

	return (
		<>
			<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
				<Card className="@container/card">
					<CardHeader>
						<CardTitle>
							Registered Teams {teamsRegistered?.total} / {tournament?.max_teams}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<PaginatedListControlled<components['schemas']['LightTeam']>
							data={teamsRegistered}
							page={pageRegistered}
							onPageChange={handlePageChangeRegistered}
							isLoading={isLoadingRegistered}
							itemsContainerClassName="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5"
							renderItem={(team) => (
								<TeamCard
									team={team}
									update={canUpdate}
									refetch={refetchRegistered}
								/>
							)}
							emptyMessage="No registered teams"
							getItemKey={(item) => item.id}
						/>
					</CardContent>
				</Card>

				<Card className="@container/card">
					<CardHeader>
						<CardTitle>Waitlist Teams {teamsWaitlist?.total}</CardTitle>
					</CardHeader>
					<CardContent>
						<PaginatedListControlled<components['schemas']['LightTeam']>
							data={teamsWaitlist}
							page={pageWaitlist}
							onPageChange={handlePageChangeWaitlist}
							isLoading={isLoadingWaitlist}
							itemsContainerClassName="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5"
							renderItem={(team) => (
								<TeamCard
									team={team}
									update={canUpdate}
									refetch={refetchWaitlist}
								/>
							)}
							emptyMessage="No waitlisted teams"
							getItemKey={(item) => item.id}
						/>
					</CardContent>
				</Card>

				<Card className="@container/card">
					<CardHeader>
						<CardTitle>Draft Teams</CardTitle>
					</CardHeader>
					<CardContent>
						<PaginatedListControlled<components['schemas']['LightTeam']>
							data={teamsDraft}
							page={pageDraft}
							onPageChange={handlePageChangeDraft}
							isLoading={isLoadingDraft}
							itemsContainerClassName="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5"
							renderItem={(team) => (
								<TeamCard
									team={team}
									update={canUpdate}
									refetch={refetchDraft}
								/>
							)}
							emptyMessage="No draft teams"
							getItemKey={(item) => item.id}
						/>
					</CardContent>
				</Card>
			</div>
		</>
	)
}
