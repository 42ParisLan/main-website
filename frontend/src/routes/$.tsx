import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { IconError404 } from '@tabler/icons-react';

export const Route = createFileRoute('/$')({
  component: NotFoundComponent,
})

function NotFoundComponent() {
	return (
		<div className="h-full flex items-center justify-center px-4">
			<Card className="w-full max-w-md">
				<CardContent className="flex flex-col items-center text-center space-y-6 p-8">
					{/* 404 Icon */}
					<IconError404 className="w-24 h-24 text-error" stroke={2}/>

					{/* Error Code */}
					<div className="space-y-2">
						<h2 className="text-2xl font-semibold">Page Not Found</h2>
					</div>

					{/* Error Message */}
					<div className="space-y-2">
						<p className="text-muted-foreground max-w-sm">
							Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or the URL might be incorrect.
						</p>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-3 w-full">
						<Button asChild className="flex-1">
							<Link to="/">
								Go Home
							</Link>
						</Button>
						<Button variant="outline" onClick={() => window.history.back()} className="flex-1">
							Go Back
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
