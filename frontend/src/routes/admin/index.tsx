import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/admin/')({
	component: DashboardIndex,
})

function DashboardIndex() {
	return (
		<>
			<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
				<Card className="@container/card">
					<CardHeader>
						<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
							Admin Home
						</CardTitle>
					</CardHeader>
					<CardContent>
						Welcome to the Admin Dashboard! You are now authenticated and can access all features.
					</CardContent>
				</Card>
			</div>
		</>
	)
}