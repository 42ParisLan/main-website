import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { Header } from '@/components/home-page/header'
import { useState } from 'react';
import type { components } from '@/lib/api/types';
import { ActiveTournaments } from '@/components/tournaments/active-tournaments'
import { OldTournaments } from '@/components/tournaments/past-tournaments'


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
			<div className="py-2 bg-black min-h-screen bg-background">
				<ActiveTournaments/>
				<OldTournaments/>
			</div>
		</div>
	)
}
