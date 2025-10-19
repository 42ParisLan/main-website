import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/auth.provider'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/register/')({
	component: RouteComponent,
})

function RouteComponent() {
	const {me} = useAuth();

	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<div className="container mx-auto px-4 py-16">
				<div className="flex flex-col items-center justify-center space-y-8 text-center">
					{/* Title */}
					<div className="space-y-4 max-w-2xl">
						<h1 className="text-5xl md:text-7xl font-bold tracking-tight">
							Register
						</h1>
						<h2 className='text-3xl font-semibold'>
							Welcome {me.username}
						</h2>
						<p className="text-xl text-muted-foreground">
							This is a protected page.
							edit it in /frontend/src/routes/register/index.tsx
						</p>
					</div>

					{/* Admin Access Button */}
					<div className="pt-4">
						<Button asChild size="lg" variant="default">
							<Link to="/">
								Go back to HomePage
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
