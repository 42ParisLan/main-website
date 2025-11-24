import useQueryClient from '@/hooks/use-query-client'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tournaments/$tournamentid/teams/')({
  component: RouteComponent,
})

function RouteComponent() {
	const {tournamentid} = Route.useParams();
	const client = useQueryClient();

	const {data} = client.useQuery("get", "/tournaments/{id}/teams", {
		params: {
			path: {
				id: Number(tournamentid)
			}
		}
	})

	return (
		<>
			{data?.items?.map((team) => (
				<>
					<p>{team.name}</p>
				</>
			))}
		</>
	)
}
