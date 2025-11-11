import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VoteEdit, { VoteComponentEdit } from '@/components/votes/vote-edit';
import useQueryClient from '@/hooks/use-query-client'
import { createFileRoute, useRouter } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/votes/$voteid/')({
	component: RouteComponent,
})

function RouteComponent() {
	const { voteid } = Route.useParams();
	const client = useQueryClient();
	const router = useRouter();

	const {data: vote, error: errorVote, refetch} = client.useQuery("get", "/votes/{id}", {
		params: {
			path: {
				id: Number(voteid)
			}
		}
	})

	if (errorVote) {
		router.navigate({to: "/admin/votes"})
		return
	}

	return (
		<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
			<Card className="@container/card">
				<CardHeader>
					<CardTitle>Editing Vote</CardTitle>
				</CardHeader>
				<CardContent>
				{vote && (
					<VoteEdit vote={vote} refetchVote={refetch}/>
				)}
				</CardContent>
			</Card>
			<Card className="@container/card">
				<CardHeader>
					<CardTitle>Edit Vote Components</CardTitle>
				</CardHeader>
				<CardContent>
				{vote && (
					<VoteComponentEdit vote={vote} refetchVote={refetch} />
				)}
				</CardContent>
			</Card>
		</div>
	)
}
