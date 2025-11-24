import TournamentCreate from '@/components/tournaments/admin/tournament-create'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/tournaments/create/')({
  component: RouteComponent,
})

function RouteComponent() {
	return (
		<>
			<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
				<Card className="@container/card">
					<CardHeader>
						<CardTitle>
							Create New Tournament
						</CardTitle>
					</CardHeader>
					<CardContent>
						<TournamentCreate/>
					</CardContent>
				</Card>
			</div>
		</>
	)
}
