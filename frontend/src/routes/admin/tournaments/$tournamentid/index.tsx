import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHasRole } from '@/hooks/use-can';
import useQueryClient from '@/hooks/use-query-client';
import { useAuth } from '@/providers/auth.provider';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import TournamentAdminList from '@/components/tournaments/admin/tournament-admin-list';

export const Route = createFileRoute('/admin/tournaments/$tournamentid/')({
  component: RouteComponent,
})

function RouteComponent() {
	const {tournamentid} = Route.useParams();
	const router = useRouter();
	const {me} = useAuth();
	const hasRole = useHasRole()

	const client = useQueryClient();

	const {data, isLoading, isError, refetch} = client.useQuery("get", "/tournaments/{id_or_slug}", {
		params:{
			path: {
				id_or_slug: tournamentid
			}
		}
	})

	if (isLoading) {
		return <div className="text-sm text-muted-foreground">Loading tournament…</div>
	}

	if (isError) {
		router.navigate({to: '/admin/tournaments'})
		return
	}

	if (data) {
		let role = data?.admins?.find((admin) => admin.user.id === me?.id)?.role
		if (!role && hasRole(['super_admin'])) {
			role = "SUPER_ADMIN"
		}
		return (
			<>
				<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
					<Card className="@container/card">
						<CardHeader>
							<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
								{data.name}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p>
								{data.teams?.length ?? 0} / {data.max_teams} teams
							</p>
						</CardContent>
					</Card>
					<TournamentAdminList tournament={data} refetchTournament={refetch}/>
				</div>
			</>
		)
	}
}
