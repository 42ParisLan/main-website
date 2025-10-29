import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { IconChalkboardTeacher } from '@tabler/icons-react'

export const Route = createFileRoute('/')({
	component: WelcomePage,
})

function WelcomePage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<div className="container mx-auto px-4 py-16">
				<div className="flex flex-col items-center justify-center space-y-8 text-center">
					{/* Logo */}
					<div className="flex justify-center">
						<IconChalkboardTeacher className="w-24 h-24 text-primary" />
					</div>

					{/* Title */}
					<div className="space-y-4 max-w-2xl">
						<h1 className="text-5xl md:text-7xl font-bold tracking-tight">
							Welcome
						</h1>
						<p className="text-xl text-muted-foreground">
							This is the public homepage. Customize this page to fit your needs.
						</p>
					</div>

					{/* Navigation Sections */}
					<div className="pt-8 space-y-8 w-full max-w-xl">
						{/* Public Pages Section */}
						<div className="space-y-4">
							<h2 className="text-2xl font-semibold tracking-tight">Public Pages</h2>
							<div className="flex flex-wrap justify-center gap-4">
								<Button asChild size="lg" variant="outline" className="min-w-[140px]">
									<Link to="/tournament">
										Tournament
									</Link>
								</Button>
							</div>
						</div>

						{/* Protected Pages Section */}
						<div className="space-y-4">
							<h2 className="text-2xl font-semibold tracking-tight">Protected Pages</h2>
							<div className="flex flex-wrap justify-center gap-4">
								<Button asChild size="lg" variant="outline" className="min-w-[140px]">
									<Link to="/votes">
										Votes
									</Link>
								</Button>
							</div>
						</div>

						{/* Admin Section */}
						<div className="space-y-4">
							<h2 className="text-2xl font-semibold tracking-tight">Admin Panel</h2>
							<div className="flex justify-center">
								<Button asChild size="lg" variant="default" className="min-w-[220px]">
									<Link to="/admin">
										<IconChalkboardTeacher className="mr-2 w-5 h-5" />
										Access Admin Console
									</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}