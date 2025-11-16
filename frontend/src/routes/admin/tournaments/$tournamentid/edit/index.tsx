import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/tournaments/$tournamentid/edit/')({
  component: RouteComponent,
})

function RouteComponent() {
	const { tournamentid } = Route.useParams();
	return (
		<>
			<Link to={`/admin/tournaments/$tournamentid`} params={{tournamentid: tournamentid}}>Go back to tournament</Link>
			<div>Hello "/admin/tournaments/{tournamentid}/edit"!</div>
		</>
	)
}
