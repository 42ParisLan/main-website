import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/tournaments/$tournamentid/teams/')({
  component: RouteComponent,
})

function RouteComponent() {
	const { tournamentid } = Route.useParams();
	return (
		<>
			<a href={`/admin/tournaments/${tournamentid}`}>Go back to tournament</a>
			<div>Hello "/admin/tournaments/{tournamentid}/teams"!</div>
		</>
	)
}
