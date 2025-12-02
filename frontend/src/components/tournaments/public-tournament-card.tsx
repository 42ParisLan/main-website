import type { components } from "@/lib/api/types";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";
import { IconClockHour4Filled } from "@tabler/icons-react";

function formatDate(iso?: string) {
	if (!iso) return "—";
	try {
		return new Date(iso).toLocaleString(undefined, {
			dateStyle: "short",
			timeStyle: "short",
		});
	} catch {
		return iso;
	}
}

function daysLeft(date: string | Date) {
  const end = new Date(date).getTime();
  const now = Date.now();

  const diff = end - now;

  // conversion ms → jours
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}


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
			className="border-none w-full h-full p-0 rounded-xl overflow-hidden transition-all transition-transform duration-200 hover:scale-105 "
		>
			<Link to={`/tournaments/$tournamentid`} params={{tournamentid: String(tournament.id)}} className="block w-full h-full">
				<Card className="h-full w-full flex flex-col justify-center bg-gray-900 border border-gray-800">
					<CardContent className="flex flex-col gap-8">
						<div className="flex justify-between">
							<Avatar>
								{/** Use AvatarImage if creator has an avatar url, otherwise fallback to initials */}
								{"avatar_url" in tournament.creator && tournament.creator.avatar_url ? (
								<AvatarImage src={tournament.creator.avatar_url as string} alt={creatorUsername} />
									) : (
										<AvatarFallback>{initials || "U"}</AvatarFallback>
									)}
							</Avatar>
							<div className="text-white">
								<h3 className="text-md font-medium truncate">{tournament.name}</h3>
								<p className="text-xs text-muted-foreground truncate">
									{tournament.description ?? "No description"}
								</p>
							</div>
						</div>
						{/* <div className="flex items-end gap-2">
							<Badge variant={tournament.is_visible ? "secondary" : "outline"}>
								{tournament.is_visible ? "Public" : "Private"}
							</Badge>
						</div> */}
						<div className="flex flex-row">
							<div className="text-xs text-gray-300">
								<div>
									<strong>Starts:</strong> {formatDate(tournament.tournament_start)}
								</div>
								<div className="flex">
									<IconClockHour4Filled className="h-4"/>
									<strong>Registration:</strong>
									<span className="ml-1">{daysLeft(tournament.registration_end)} days left</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</Link>
		</Button>
	);
}
