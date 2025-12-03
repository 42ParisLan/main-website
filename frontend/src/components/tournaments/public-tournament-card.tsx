import type { components } from "@/lib/api/types";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";

export default function PublicTournamentCard({
	tournament,
}: {
	tournament: components["schemas"]["LightTournament"];
}) {
	const creatorUsername = tournament.creator?.username ?? "unknown";

	const initials = creatorUsername
		.split(" ")
		.map((s) => s[0]?.toUpperCase())
		.slice(0, 2)
		.join("");

	return (
		<Button
			asChild
			className=" min-h-[180px] min-w-[250px] max-h-[180px] max-w-[250px] border-none w-full h-full p-0 rounded-xl overflow-hidden transition-all transition-transform duration-200 hover:scale-105 "
		>
			<Link to={`/tournaments/$tournamentid`} params={{tournamentid: String(tournament.id)}} className="block w-full h-full">
				<Card className="h-full w-full flex flex-col  bg-gray-900 border border-gray-800">
					<CardContent className="flex flex-col p-4">
						<div className="flex flex-row p-2 gap-2 ">
							<Avatar>
								{/** Use AvatarImage if creator has an avatar url, otherwise fallback to initials */}
								{"avatar_url" in tournament.creator && tournament.creator.avatar_url ? (
								<AvatarImage src={tournament.creator.avatar_url as string} alt={creatorUsername} />
									) : (
										<AvatarFallback>{initials || "U"}</AvatarFallback>
									)}
							</Avatar>
							<div className="text-white min-w-0">
								<h3 className="text-md font-medium truncate">{tournament.name}</h3>
							</div>
						</div>
						<div className="p-4">
							<p className="text-xs text-muted-foreground truncate">
								{tournament.description ?? "No description"}
							</p>

						</div>
						{/* <div className="flex items-end gap-2">
							<Badge variant={tournament.is_visible ? "secondary" : "outline"}>
								{tournament.is_visible ? "Public" : "Private"}
							</Badge>
						</div> */}
					</CardContent>
				</Card>
			</Link>
		</Button>
	);
}
