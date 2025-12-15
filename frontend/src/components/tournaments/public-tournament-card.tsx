import type { components } from '@/lib/api/types';
import { Card, CardFooter } from '../ui/card';
import { Link } from '@tanstack/react-router';
import defaultTournamentImage from "@/assets/default-tournament.png"

export default function PublicTournamentCard({
	tournament,
}: {
	tournament: components['schemas']['LightTournament'];
}) {
	return (
		<Link
			to={`/tournaments/$tournamentid`}
			params={{ tournamentid: String(tournament.slug) }}
			className="block rounded-xl overflow-hidden group relative"
		>
			<Card className="p-0 w-full h-46 border-none rounded-xl overflow-hidden">
				<img
					src={tournament.image_url ?? defaultTournamentImage}
					alt={tournament.name}
					className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
				/>
				<CardFooter className="absolute bottom-0 left-0 right-0 p-2">
					<h3 className="text-lg font-bold text-white truncate">
						{tournament.name}
					</h3>
				</CardFooter>
			</Card>
		</Link>
	);
}
