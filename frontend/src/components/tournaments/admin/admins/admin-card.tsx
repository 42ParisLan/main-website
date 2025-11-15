import type { components } from "@/lib/api/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconTrash } from "@tabler/icons-react";
import TournamentAdminEditModal from "./admin-edit-modal";
import { memo } from "react";

function TournamentAdminCard({admin, tournamentid, modify, refetchTournament}: {admin: components['schemas']['LightTournamentAdmin']; tournamentid: number; modify: boolean; refetchTournament: () => any}) {
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
					{modify && (
						<TournamentAdminEditModal admin={admin} refetchTournament={refetchTournament} tournamentid={tournamentid}>
							<Button
								size="lg"
								className="gap-2"
							>
								<IconTrash className="w-5 h-5" />
								Edit Admin
							</Button>
						</TournamentAdminEditModal>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

export default memo(TournamentAdminCard);
