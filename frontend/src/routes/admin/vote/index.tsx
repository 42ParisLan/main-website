import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/vote/')({
  component: RouteComponent,
})

function RouteComponent() {
	return (
		<>
			<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
				<Card className="@container/card">
					<CardHeader>
						<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
							Vote
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-5'>
							Modify /frontend/src/routes/admin/vote
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	)
}
