import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/tournaments/$tournamentid/')({
  component: RouteComponent,
})

function RouteComponent() {
	const { tournamentid } = Route.useParams();
	return (
		<>
			<a href='/admin/tournaments'>Go back to all tournaments</a>
			<div>Hello "/admin/tournaments/{tournamentid}/"!</div>
			<a href={`/admin/tournaments/${tournamentid}/edit`}>Edit</a>
			<a href={`/admin/tournaments/${tournamentid}/teams`}>See Teams</a>
		</>
	)
}
