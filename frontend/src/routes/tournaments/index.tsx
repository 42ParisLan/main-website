import { Button } from '@/components/ui/button'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { Header } from '@/components/home-page/header'
import { useState } from 'react';
import type { components } from '@/lib/api/types';


export const Route = createFileRoute('/tournaments/')({
	component: RouteComponent,
})

// type User = components['schemas']['Tournament']

function RouteComponent() {
	// const router = useRouter();
	// const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
	//faire comme dans user-search pour trouver l'id du tournament

	// const handleTournamentSelect = (tournament: Tournament) => {
	// 	router.navigate({to: `/tournament/${tournament.id}`})
	// };

	return (
		<div>
			<Header/>
			<div className="flex justify-center min-h-screen bg-background pt-20">
				<div className="flex justify-center">
					<Button 
						type='button'
						variant='outline'
						className="min-w-[140px]"
						onClick={() => (window.location.href = "/tournaments/1")}
						>
						Rocket League
					</Button>
				</div>
			</div>
		</div>
	)
}
