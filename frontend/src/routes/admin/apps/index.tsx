import AppSearch from '@/components/apps/app-search';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createFileRoute } from '@tanstack/react-router'
import { ChevronLeftIcon } from 'lucide-react';

export const Route = createFileRoute('/admin/apps/')({
  component: RouteComponent,
})

function RouteComponent() {
	return (
		<>
			<a
				href="/admin/apps/me"
				className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-md"
				aria-label="Go to my apps"
			>
				<ChevronLeftIcon className="w-4 h-4" />
				<span>My apps</span>
			</a>
			<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
				<Card className="@container/card">
					<CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div>
							<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
								Apps
							</CardTitle>
							<p className="mt-1 text-gray-500">You can see every app there.</p>
						</div>
					</CardHeader>
					<CardContent>
						<AppSearch />
					</CardContent>
				</Card>
			</div>
		</>
	)
}
