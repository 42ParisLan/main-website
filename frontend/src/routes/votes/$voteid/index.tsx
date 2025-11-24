import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useQueryClient from '@/hooks/use-query-client';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useCallback } from 'react';

export const Route = createFileRoute('/votes/$voteid/')({
  component: RouteComponent,
})

function RouteComponent() {
	const { voteid } = Route.useParams();
	const client = useQueryClient();
	const router = useRouter();

	const {data: vote, error: errorVote} = client.useQuery("get", "/votes/{id}", {
		params: {
			path: {
				id: Number(voteid)
			}
		}
	})

	const {mutate} = client.useMutation("post", "/votes/{id}/submit")

	const handleVote = useCallback((comp_id: number) => {
		mutate({
			params: {
				path: {
					id: Number(voteid)
				}
			},
			body: comp_id
		})
	}, [mutate, voteid])

	if (errorVote) {
		router.navigate({to: "/votes"})
	}

	return (
		<div>
			{vote?.components?.map((component) => (
				<Card
					key={component.id}
					onClick={() => handleVote(component.id)}
					className="cursor-pointer hover:opacity-90 transition-opacity"
					style={{
						backgroundColor : component.color
					}}
				>
					<CardHeader>
						<CardTitle>
							{component.name}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p>{component.description}</p>
						<img
							src={component.image_url ?? "https://example.com/"}
							alt={component.name}
						/>
					</CardContent>
				</Card>
			))}
		</div>
	)
}
