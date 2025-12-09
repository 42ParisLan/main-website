import skeletonDance from '@/assets/skeleton-dance.gif';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export default function ErrorPage({ error }: { error: string }) {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
			<div className="text-center">
				<img
					src={skeletonDance}
					alt="Error"
					className="w-48 h-48 mx-auto"
				/>
				<br />
				<h1 className="text-3xl font-bold text-destructive">
					Whoops! Something went wrong.
				</h1>
				<p className="text-muted-foreground mt-2">{error}</p>
				<Button asChild className="mt-6">
					<Link to="/">Go back to Home</Link>
				</Button>
			</div>
		</div>
	);
}