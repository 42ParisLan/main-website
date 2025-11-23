import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHasRole } from '@/hooks/use-can';
import useQueryClient from '@/hooks/use-query-client';
import { useAuth } from '@/providers/auth.provider';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import TournamentAdminList from '@/components/tournaments/admin/tournament-admin-list';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns'
import { Link } from '@tanstack/react-router'

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
			role = "CREATOR"
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
							{/* tournament image if available */}
							{data.iamge_url ? (
								<div className="mb-4">
									<img src={data.iamge_url} alt={`${data.name} cover`} className="w-48 h-32 rounded-md object-cover" />
								</div>
							) : null}
							<div className="flex gap-2 mb-4">
								{(role == "SUPER_ADMIN" || role == "CREATOR") && (
									<Button asChild size="sm">
										<Link to={"/admin/tournaments/$tournamentid/edit"} params={{tournamentid: String(data.slug)}}>Edit</Link>
									</Button>
								)}
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<strong>Name</strong>
									<div className="text-sm">{data.name}</div>
								</div>
								<div>
									<strong>Slug</strong>
									<div className="text-sm">{data.slug}</div>
								</div>

								<div>
									<strong>Visible</strong>
									<div className="text-sm">{data.is_visible ? 'Yes' : 'No'}</div>
								</div>

								<div>
									<strong>Teams</strong>
									<div className="text-sm">{data.teams?.length ?? 0} / {data.max_teams}</div>
								</div>
								<div>
									<strong>External link</strong>
									<div className='flex gap-2'>
										{data.external_links ? (
											Object.entries(data.external_links).map(([key, value]) => (
												<Button asChild key={key}>
													<a href={String(value)} target='_blank' rel='noopener noreferrer' className='underline text-primary'>
														{key}
													</a>
												</Button>
											))
										) : (
											<span className="text-muted-foreground">—</span>
										)}
									</div>
								</div>

								<div>
									<strong>Registration</strong>
									<div className="text-sm">{data.registration_start ? format(new Date(data.registration_start), 'Pp') : '—'} — {data.registration_end ? format(new Date(data.registration_end), 'Pp') : '—'}</div>
								</div>

								<div>
									<strong>Tournament</strong>
									<div className="text-sm">{data.tournament_start ? format(new Date(data.tournament_start), 'Pp') : '—'} — {data.tournament_end ? format(new Date(data.tournament_end), 'Pp') : '—'}</div>
								</div>

								<div className="sm:col-span-2">
									<strong>Team structure</strong>
									<div className="mt-1 space-y-2">
										<div className="grid gap-2">
											{Object.entries(data.team_structure).map(([key, val]) => {
												const display = val.min === val.max ? String(val.min) : `${val.min} - ${val.max}`
												return (
													<div key={key} className="flex items-center justify-between rounded-md p-2 bg-muted text-sm">
														<span className="font-medium">{key}</span>
														<span className="text-sm">{display}</span>
													</div>
												)
											})}
										</div>
									</div>
								</div>

								<div className="sm:col-span-2">
									<strong>Description</strong>
									<div className="text-sm mt-1">{data.description ?? <span className="text-muted-foreground">No description</span>}</div>
								</div>

								<div>
									<strong>Custom page</strong>
									<div className="text-sm">{data.custom_page_component ?? 'default'}</div>
								</div>
							</div>
						</CardContent>
					</Card>
					<TournamentAdminList tournament={data} refetchTournament={refetch}/>
				</div>
			</>
		)
	}
}
