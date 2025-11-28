import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useQueryClient from '@/hooks/use-query-client';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useCallback } from 'react';

import { Footer } from '@/components/home-page/footer'
import { Header } from '@/components/home-page/header'

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
		<div className="min-h-screen flex flex-col dark bg-gradient-to-br from-black to-gray-800">
			<Header/>
			<div className="flex-1 flex flex-col justify-evenly items-center gap-2">
				<Card className="p-2 flex items-center w-full bg-gradient-to-br from-black to-gray-800">
					<CardHeader>
						<CardTitle>
							{vote?.title}
						</CardTitle>
					</CardHeader>
				</Card>
				<div className="flex flex-row gap-4">
					{vote?.components?.map((component) => (
						<div style={{ backgroundColor : component.color }} className="p-[4px] rounded-xl">
							<Card
							key={component.id}
							onClick={() => handleVote(component.id)}
							className="cursor-pointer hover:opacity-90 transition-opacity"
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
						</div>
						))}
					</div>
			</div>
			<Footer/>
		</div>
	)
}
