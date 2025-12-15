import type { components } from "@/lib/api/types";
import { Card } from "../../ui/card";
import { Link } from '@tanstack/react-router';
import defaultTeamImage from "@/assets/default-team.png";
import defaultUserImage from "@/assets/default-user.png";

export function LightTeamCard({ team, tournamentId }: { team: components['schemas']['LightTeam'], tournamentId: string }) {
	// Group members by role (flat list for compact display)
	const members = Array.isArray(team.members) ? team.members.filter(Boolean) : [];

	return (
		<Link to="/tournaments/$tournamentid/$teamid" params={{ tournamentid: tournamentId, teamid: String(team.id) }} className="block w-full max-w-xs mx-auto">
			<Card className="w-full p-2 flex flex-col gap-2 items-center cursor-pointer hover:shadow-lg transition-shadow">
				<div className="flex flex-col items-center w-full">
					<div className="w-20 h-20 rounded-xl overflow-hidden mb-2">
						<img
							src={team.image_url ?? defaultTeamImage}
							alt={team.name}
							className="object-cover w-full h-full"
						/>
					</div>
					<h3 className="text-base font-semibold text-center truncate w-full mb-1">{team.name}</h3>
				</div>
				<div className="w-full grid grid-cols-2 gap-2">
					{members.length === 0 ? (
						<div className="italic text-center w-full col-span-2 text-xs">No members</div>
					) : (
						members.map((member, idx) => (
							<div key={idx} className="flex flex-col items-center">
								<Link to={`/users/$userid`} params={{ userid: String(member?.user.id) }}>
									<img
										src={member?.user?.picture ?? defaultUserImage}
										className="h-14 w-14 object-cover rounded-full border"
										alt={member?.user?.username}
										title={member?.user?.username}
									/>
								</Link>
								<span className="text-[11px] mt-1 truncate max-w-[60px] text-center">{member?.user?.username}</span>
							</div>
						))
					)}
				</div>
			</Card>
		</Link>
	);
}
