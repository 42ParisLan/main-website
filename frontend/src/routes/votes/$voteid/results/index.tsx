import useQueryClient from '@/hooks/use-query-client'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/votes/$voteid/results/')({
  component: RouteComponent,
})

function RouteComponent() {
	const {voteid} = Route.useParams();
	const client = useQueryClient();

	const {data, error} = client.useQuery("get", "/votes/{id}/results", {
		params: {
			path: {
				id: Number(voteid)
			}
		}
	});

	if (error) {
		<p>You can't get the access</p>
	}

	return (
		<>
			<p>Total Votes: {data?.total_votes}</p>
			{data?.results?.map((result) => (
				<p>{result.name} : {result.votes}</p>
			))}
		</>
	)
}
