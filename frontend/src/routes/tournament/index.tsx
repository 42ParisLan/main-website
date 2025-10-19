import { Button } from '@/components/ui/button'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/tournament/')({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<div className="container mx-auto px-4 py-16">
				<div className="flex flex-col items-center justify-center space-y-8 text-center">
					{/* Title */}
					<div className="space-y-4 max-w-2xl">
						<h1 className="text-5xl md:text-7xl font-bold tracking-tight">
							Tournament
						</h1>
						<p className="text-xl text-muted-foreground">
							This is the public tournament page.
							edit it in /frontend/src/routes/tournament/index.tsx
						</p>
					</div>

					{/* Admin Access Button */}
					<div className="pt-4">
						<Button asChild size="lg" variant="default">
							<Link to='/'>
								Go back to HomePage
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
