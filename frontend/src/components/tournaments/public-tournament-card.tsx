import type { components } from '@/lib/api/types';
import { Card, CardFooter } from '../ui/card';
import { Link } from '@tanstack/react-router';
import defaultTournamentPicture from '@/assets/default.png';

export default function PublicTournamentCard({
	tournament,
}: {
	tournament: components['schemas']['LightTournament'];
}) {
	return (
		<Link
			to={`/tournaments/$tournamentid`}
			params={{ tournamentid: String(tournament.id) }}
			className="block rounded-xl overflow-hidden group relative"
		>
			<Card className="w-full h-48 border-none rounded-xl overflow-hidden">
				<img
					src={tournament.iamge_url ?? defaultTournamentPicture}
					alt={tournament.name}
					className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
				<CardFooter className="absolute bottom-0 left-0 right-0 p-4">
					<div>
						<h3 className="text-lg font-bold text-white truncate">
							{tournament.name}
						</h3>
						<p className="text-sm text-gray-300 truncate">
							{tournament.description ?? 'No description'}
						</p>
					</div>
				</CardFooter>
			</Card>
		</Link>
	);
}