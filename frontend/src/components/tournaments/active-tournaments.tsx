import  PublicTournamentCard  from '@/components/tournaments/public-tournament-card'
import {type components} from "@/lib/api/types"


export function ActiveTournaments({tournaments}: {tournaments: components['schemas']['LightTournament'][]}) {
	return(
		<div className="w-full">
			<div className="w-full text-center mb-8">
				<h2 className="font-bold text-white text-3xl mb-2">ACTIVE TOURNAMENTS</h2>
				<p className="text-sm text-gray-400">See some active tournaments to participate</p>
			</div>
			<div className="flex flex-wrap justify-center items-center gap-6 px-4">
				{tournaments.slice(0, 3).map((tournament) => (
					<div key={tournament.id} className="flex-shrink-0 w-full sm:w-[350px] transition-transform duration-200 hover:scale-105">
						<PublicTournamentCard tournament={tournament} />
					</div>
				))}
			</div>
		</div>
	);
}