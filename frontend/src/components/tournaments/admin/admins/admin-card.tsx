import type { components } from "@/lib/api/types";
import { Card, CardContent } from "@/components/ui/card";
import TournamentAdminEditModal from "./admin-edit-modal";
import { memo } from "react";

function TournamentAdminCard({admin, tournamentid, myRole, refetchTournament}: {admin: components['schemas']['LightTournamentAdmin']; tournamentid: number; myRole: components["schemas"]["LightTournamentAdmin"]["role"] | undefined; refetchTournament: () => any}) {
	return (
		<Card className="group relative overflow-hidden">
			<CardContent>
				<div className="size-full flex flex-col gap-5 items-center justify-center">
					<div className="rounded-lg aspect-square size-full overflow-hidden">
						<img 
							src={admin.user.picture ?? 'https://static.posters.cz/image/750/star-wars-see-no-stormtrooper-i101257.jpg'}
							className="object-cover size-full"
							alt={admin.user.username}
						/>
					</div>
					<div className="flex flex-col items-center">
						<h2>@{admin.user.username}</h2>
					</div>
				</div>
				<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
					<TournamentAdminEditModal myRole={myRole} admin={admin} refetchTournament={refetchTournament} tournamentid={tournamentid}/>
				</div>
			</CardContent>
		</Card>
	);
}

export default memo(TournamentAdminCard);
