import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {type components} from "@/lib/api/types"
import { Link } from "@tanstack/react-router"
import { format } from 'date-fns'

export default function DefaultTournament({tournament}: {tournament: components['schemas']['Tournament']}) {
	return (
		<div className="*:tournament-[slot=card]:from-primary/5 *:tournament-[slot=card]:to-card dark:*:tournament-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:tournament-[slot=card]:bg-gradient-to-t *:tournament-[slot=card]:shadow-xs lg:px-6">
			<Card className="@container/card">
				<CardHeader>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{tournament.name}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<strong>Name</strong>
							<div className="text-sm">{tournament.name}</div>
						</div>
						<div>
							<strong>Slug</strong>
							<div className="text-sm">{tournament.slug}</div>
						</div>

						<div>
							<strong>Visible</strong>
							<div className="text-sm">{tournament.is_visible ? 'Yes' : 'No'}</div>
						</div>
						<div>
							<strong>State</strong>
							<div className="text-sm">{tournament.state}</div>
						</div>

						<div>
							<strong>Teams</strong>
							<div className="text-sm">{tournament.teams?.length ?? 0} / {tournament.max_teams}</div>
						</div>
						<div>
							<strong>External link</strong>
							<div className="text-sm">
								{tournament.external_links ? (
									Object.entries(tournament.external_links).map(([label, url]) => (
										<a key={label} href={url as string} target="_blank" rel="noopener noreferrer" className="underline text-primary">{label}</a>
									))
								) : (
									<span className="text-muted-foreground">—</span>
								)}
							</div>
						</div>

						<div>
							<strong>Registration</strong>
							<div className="text-sm">{tournament.registration_start ? format(new Date(tournament.registration_start), 'Pp') : '—'} — {tournament.registration_end ? format(new Date(tournament.registration_end), 'Pp') : '—'}</div>
						</div>

						<div>
							<strong>Tournament</strong>
							<div className="text-sm">{tournament.tournament_start ? format(new Date(tournament.tournament_start), 'Pp') : '—'} — {tournament.tournament_end ? format(new Date(tournament.tournament_end), 'Pp') : '—'}</div>
						</div>

						<div className="sm:col-span-2">
							<strong>Team structure</strong>
							<div className="mt-1 space-y-2">
								<div className="grid gap-2">
									{Object.entries(tournament.team_structure).map(([key, val]) => {
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
							<div className="text-sm mt-1">{tournament.description ?? <span className="text-muted-foreground">No description</span>}</div>
						</div>

						<div>
							<strong>Custom page</strong>
							<div className="text-sm">{tournament.custom_page_component ?? 'default'}</div>
						</div>

					</div>
				</CardContent>
				<CardFooter>
					<Button asChild>
						<Link to="/tournaments/$tournamentid/register" params={{tournamentid: tournament.slug}}>
							Register
						</Link>
					</Button>
				</CardFooter>
			</Card>
		</div>
	)
}
